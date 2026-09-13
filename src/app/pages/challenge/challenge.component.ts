import { AsyncPipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { map } from 'rxjs';
import { getChallenge, nextChallenge } from '../../core/curriculum';
import { parseCurlCommand, pathFromUrl } from '../../core/curl-parser';
import { ProfileService } from '../../core/profile.service';

@Component({
  selector: 'app-challenge',
  imports: [AsyncPipe, FormsModule, RouterLink],
  templateUrl: './challenge.component.html',
  styleUrl: './challenge.component.scss',
})
export class ChallengeComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly http = inject(HttpClient);
  private readonly profiles = inject(ProfileService);

  command = '';
  feedback = '';
  responsePreview = '';
  hintIndex = 0;

  readonly challenge$ = this.route.paramMap.pipe(
    map((params) => getChallenge(params.get('id') ?? '')),
  );
  readonly activeProfile$ = this.profiles.activeProfile$;

  ngOnInit(): void {
    this.profiles.ensureProfile();
    this.route.paramMap
      .pipe(map((params) => params.get('id') ?? ''))
      .subscribe((id) => {
        if (id) {
          this.profiles.setCurrentChallenge(id);
        }
      });
  }

  showHint(challengeId: string, hints: string[]): void {
    if (this.hintIndex < hints.length) {
      this.profiles.useHint(challengeId);
      this.hintIndex += 1;
    }
  }

  visibleHints(hints: string[]): string[] {
    return hints.slice(0, this.hintIndex);
  }

  submit(
    challengeId: string,
    targetPath: string,
    expectedMethod: string,
    requiredHeaders?: Record<string, string>,
  ): void {
    this.profiles.recordAttempt(challengeId);
    this.feedback = '';
    this.responsePreview = '';

    const parsed = parseCurlCommand(this.command);
    if (!parsed) {
      this.feedback = 'Could not parse that command. Start with curl and a URL.';
      return;
    }

    const path = pathFromUrl(parsed.url);
    if (!path) {
      this.feedback = 'URL looks invalid.';
      return;
    }

    if (parsed.method !== expectedMethod) {
      this.feedback = `Expected HTTP ${expectedMethod}, got ${parsed.method}.`;
      return;
    }

    if (path !== targetPath) {
      this.feedback = `Expected path ${targetPath}, got ${path}.`;
      return;
    }

    if (requiredHeaders) {
      for (const [name, expected] of Object.entries(requiredHeaders)) {
        const actual = parsed.headers[name.toLowerCase()];
        if (!actual || !actual.includes(expected)) {
          this.feedback = `Missing or incorrect header: ${name}`;
          return;
        }
      }
    }

    const headers: Record<string, string> = {};
    for (const [key, value] of Object.entries(parsed.headers)) {
      headers[key] = value;
    }

    this.http
      .request(parsed.method, targetPath, {
        headers,
        responseType: 'text',
        observe: 'response',
      })
      .subscribe({
        next: (response) => {
          this.responsePreview = [
            `HTTP/${response.status} ${response.statusText}`,
            ...Object.entries(response.headers).map(([k, v]) => `${k}: ${v}`),
            '',
            response.body ?? '',
          ].join('\n');

          if (response.ok) {
            this.feedback = 'Nice curl. Challenge complete.';
            this.profiles.completeChallenge(challengeId);
          } else {
            this.feedback = `Request reached the server but status was ${response.status}.`;
          }
        },
        error: () => {
          this.feedback = 'Request failed. Check the path and try again.';
        },
      });
  }

  nextId(challengeId: string): string | null {
    return nextChallenge(challengeId)?.id ?? null;
  }
}
