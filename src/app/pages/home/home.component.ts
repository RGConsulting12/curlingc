import { AsyncPipe } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { allChallenges, levels } from '../../core/curriculum';
import { ProfileService } from '../../core/profile.service';

@Component({
  selector: 'app-home',
  imports: [AsyncPipe, RouterLink],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit {
  private readonly profiles = inject(ProfileService);

  readonly levels = levels;
  readonly totalChallenges = allChallenges.length;
  readonly activeProfile$ = this.profiles.activeProfile$;
  readonly profiles$ = this.profiles.profiles$;

  ngOnInit(): void {
    this.profiles.ensureProfile();
  }

  createProfile(name: string): void {
    this.profiles.createProfile(name);
  }

  switchProfile(id: string): void {
    this.profiles.switchProfile(id);
  }

  isCompleted(profile: { progress: { completedChallengeIds: string[] } }, id: string): boolean {
    return profile.progress.completedChallengeIds.includes(id);
  }
}
