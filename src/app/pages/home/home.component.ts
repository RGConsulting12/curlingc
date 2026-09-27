import { AsyncPipe } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { allChallenges, levels, levelsForCategory } from '../../core/curriculum';
import { CATEGORY_LABELS, CATEGORY_ORDER, ChallengeCategory } from '../../core/models';
import { ProfileService } from '../../core/profile.service';
import { RedirectionWalkthroughComponent } from '../../components/redirection-walkthrough/redirection-walkthrough.component';

@Component({
  selector: 'app-home',
  imports: [AsyncPipe, RouterLink, RedirectionWalkthroughComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit {
  private readonly profiles = inject(ProfileService);

  readonly levels = levels;
  readonly categories = CATEGORY_ORDER;
  readonly categoryLabels = CATEGORY_LABELS;
  readonly totalChallenges = allChallenges.length;
  readonly activeProfile$ = this.profiles.activeProfile$;
  readonly profiles$ = this.profiles.profiles$;
  activeCategory: ChallengeCategory = 'curl';

  ngOnInit(): void {
    this.profiles.ensureProfile();
  }

  createProfile(name: string): void {
    this.profiles.createProfile(name);
  }

  switchProfile(id: string): void {
    this.profiles.switchProfile(id);
  }

  selectCategory(category: ChallengeCategory): void {
    this.activeCategory = category;
  }

  visibleLevels(category: ChallengeCategory) {
    return levelsForCategory(category);
  }

  isCompleted(profile: { progress: { completedChallengeIds: string[] } }, id: string): boolean {
    return profile.progress.completedChallengeIds.includes(id);
  }

  completedInCategory(
    profile: { progress: { completedChallengeIds: string[] } },
    category: ChallengeCategory,
  ): number {
    const ids = new Set(levelsForCategory(category).flatMap((level) => level.challenges.map((c) => c.id)));
    return profile.progress.completedChallengeIds.filter((id) => ids.has(id)).length;
  }

  totalInCategory(category: ChallengeCategory): number {
    return levelsForCategory(category).reduce((sum, level) => sum + level.challenges.length, 0);
  }

  isCliCategory(category: ChallengeCategory): boolean {
    return category !== 'curl';
  }
}
