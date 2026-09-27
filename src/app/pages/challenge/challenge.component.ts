import { AsyncPipe } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { map } from 'rxjs';
import { ChallengeRunnerService } from '../../core/challenge-runner.service';
import { getChallenge, nextChallenge, tierLabel } from '../../core/curriculum';
import { labApiUrl, LAB_BASE_URL } from '../../core/lab-url';
import { normalizeCurlQuotes } from '../../core/normalize-curl-input';
import { CATEGORY_LABELS, Challenge } from '../../core/models';
import { ProfileService } from '../../core/profile.service';
import { ShellChallengeRunnerService } from '../../core/shell-challenge-runner.service';
import { PipelineStageResult } from '../../core/shell/shell-simulator';
import { RedirectionWalkthroughComponent } from '../../components/redirection-walkthrough/redirection-walkthrough.component';

@Component({
  selector: 'app-challenge',
  imports: [AsyncPipe, FormsModule, RouterLink, RedirectionWalkthroughComponent],
  templateUrl: './challenge.component.html',
  styleUrl: './challenge.component.scss',
})
export class ChallengeComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly runner = inject(ChallengeRunnerService);
  private readonly shellRunner = inject(ShellChallengeRunnerService);
  private readonly profiles = inject(ProfileService);

  command = '';
  feedback = '';
  responsePreview = '';
  pipelineStages: PipelineStageResult[] = [];
  hintIndex = 0;
  showHelp = false;
  showRedirection = false;
  quotesAutoFixed = false;

  readonly challenge$ = this.route.paramMap.pipe(
    map((params) => getChallenge(params.get('id') ?? '')),
  );
  readonly activeProfile$ = this.profiles.activeProfile$;
  readonly tierLabel = tierLabel;
  readonly categoryLabels = CATEGORY_LABELS;
  readonly labBaseUrl = LAB_BASE_URL;
  readonly curlPlaceholder = `curl -s ${labApiUrl('/api/hello')}`;
  readonly shellPlaceholder = 'grep portal-a latency.csv';

  ngOnInit(): void {
    this.profiles.ensureProfile();
    this.route.paramMap
      .pipe(map((params) => params.get('id') ?? ''))
      .subscribe((id) => {
        this.hintIndex = 0;
        this.showHelp = false;
        this.showRedirection = false;
        this.quotesAutoFixed = false;
        this.feedback = '';
        this.responsePreview = '';
        this.pipelineStages = [];
        if (id) {
          this.profiles.setCurrentChallenge(id);
        }
      });
  }

  isShell(challenge: Challenge): boolean {
    return challenge.kind === 'shell';
  }

  commandLabel(challenge: Challenge): string {
    return this.isShell(challenge) ? 'Your shell command' : 'Your curl command';
  }

  commandPlaceholder(challenge: Challenge): string {
    return this.isShell(challenge) ? this.shellPlaceholder : this.curlPlaceholder;
  }

  successMessage(challenge: Challenge): string {
    return this.isShell(challenge) ? 'Nice work. Challenge complete.' : 'Nice curl. Challenge complete.';
  }

  showHint(challengeId: string, hints: string[]): void {
    if (this.hintIndex < hints.length) {
      this.profiles.useHint(challengeId);
      this.hintIndex += 1;
    }
  }

  toggleHelp(): void {
    this.showHelp = !this.showHelp;
  }

  toggleRedirection(): void {
    this.showRedirection = !this.showRedirection;
  }

  visibleHints(hints: string[]): string[] {
    return hints.slice(0, this.hintIndex);
  }

  updateCommand(value: string, challenge: Challenge): void {
    if (this.isShell(challenge)) {
      this.quotesAutoFixed = false;
      this.command = value;
      return;
    }
    const normalized = normalizeCurlQuotes(value);
    this.quotesAutoFixed = normalized !== value;
    this.command = normalized;
  }

  async submit(challenge: Challenge): Promise<void> {
    this.profiles.recordAttempt(challenge.id);
    this.feedback = '';
    this.responsePreview = '';
    this.pipelineStages = [];

    if (this.isShell(challenge)) {
      const result = this.shellRunner.validate(this.command, challenge);
      if (result.stages?.length) {
        this.pipelineStages = result.stages;
      }
      if (result.stdout !== undefined) {
        this.responsePreview = result.stdout;
      }
      if (result.ok) {
        this.feedback = this.successMessage(challenge);
        this.profiles.completeChallenge(challenge.id);
        return;
      }
      this.feedback = result.message;
      return;
    }

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
      this.feedback = this.successMessage(challenge);
      this.profiles.completeChallenge(challenge.id);
      return;
    }

    this.feedback = result.message;
  }

  nextId(challengeId: string): string | null {
    return nextChallenge(challengeId)?.id ?? null;
  }

  isComplete(feedback: string): boolean {
    return feedback.includes('complete');
  }

  showPipeline(challenge: Challenge): boolean {
    return Boolean(
      challenge.shell?.showPipeline ||
        (this.pipelineStages.length > 1 && this.isShell(challenge)),
    );
  }
}
