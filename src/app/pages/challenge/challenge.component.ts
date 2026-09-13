import { AsyncPipe } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { map } from 'rxjs';
import { ChallengeRunnerService } from '../../core/challenge-runner.service';
import { getChallenge, nextChallenge, tierLabel } from '../../core/curriculum';
import { Challenge } from '../../core/models';
import { ProfileService } from '../../core/profile.service';

@Component({
  selector: 'app-challenge',
  imports: [AsyncPipe, FormsModule, RouterLink],
  templateUrl: './challenge.component.html',
  styleUrl: './challenge.component.scss',
})
export class ChallengeComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly runner = inject(ChallengeRunnerService);
  private readonly profiles = inject(ProfileService);

  command = '';
  feedback = '';
  responsePreview = '';
  hintIndex = 0;

  readonly challenge$ = this.route.paramMap.pipe(
    map((params) => getChallenge(params.get('id') ?? '')),
  );
  readonly activeProfile$ = this.profiles.activeProfile$;
  readonly tierLabel = tierLabel;

  ngOnInit(): void {
    this.profiles.ensureProfile();
    this.route.paramMap
      .pipe(map((params) => params.get('id') ?? ''))
      .subscribe((id) => {
        this.hintIndex = 0;
        this.feedback = '';
        this.responsePreview = '';
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

  async submit(challenge: Challenge): Promise<void> {
    this.profiles.recordAttempt(challenge.id);
    this.feedback = '';
    this.responsePreview = '';

    const validation = this.runner.validate(this.command, challenge);
    if (!validation.ok) {
      this.feedback = validation.message;
      return;
    }

    const result = await this.runner.execute(validation.parsed, challenge);
    if (result.preview) {
      this.responsePreview = result.preview;
    }

    if (result.ok) {
      this.feedback = 'Nice curl. Challenge complete.';
      this.profiles.completeChallenge(challenge.id);
      return;
    }

    this.feedback = result.message;
  }

  nextId(challengeId: string): string | null {
    return nextChallenge(challengeId)?.id ?? null;
  }
}
