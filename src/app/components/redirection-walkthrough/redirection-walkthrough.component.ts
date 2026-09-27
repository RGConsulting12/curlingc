import { Component, Input } from '@angular/core';
import {
  redirectionExamples,
  redirectionIntro,
  RedirectionExample,
} from '../../core/redirection-walkthrough';

@Component({
  selector: 'app-redirection-walkthrough',
  templateUrl: './redirection-walkthrough.component.html',
  styleUrl: './redirection-walkthrough.component.scss',
})
export class RedirectionWalkthroughComponent {
  @Input() compact = false;

  readonly intro = redirectionIntro;
  readonly examples: RedirectionExample[] = redirectionExamples;
}
