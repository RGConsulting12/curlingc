import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { getChallenge, levels } from './curriculum';
import {
  ACTIVE_PROFILE_KEY,
  ProfileProgress,
  STORAGE_KEY,
  UserProfile,
} from './models';

function newId(): string {
  return crypto.randomUUID();
}

function defaultProgress(): ProfileProgress {
  const firstChallengeId = levels[0]!.challenges[0]!.id;
  return {
    completedChallengeIds: [],
    currentChallengeId: firstChallengeId,
    hintsUsed: {},
    attempts: {},
  };
}

function createProfile(displayName: string): UserProfile {
  return {
    id: newId(),
    displayName,
    createdAt: new Date().toISOString(),
    progress: defaultProgress(),
  };
}

@Injectable({ providedIn: 'root' })
export class ProfileService {
  private readonly profilesSubject = new BehaviorSubject<UserProfile[]>(
    this.loadProfiles(),
  );
  private readonly activeIdSubject = new BehaviorSubject<string | null>(
    this.loadActiveId(),
  );

  readonly profiles$ = this.profilesSubject.asObservable();
  readonly activeProfile$ = new BehaviorSubject<UserProfile | null>(
    this.resolveActiveProfile(),
  );

  private loadProfiles(): UserProfile[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        return [];
      }
      const parsed = JSON.parse(raw) as UserProfile[];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  private loadActiveId(): string | null {
    return localStorage.getItem(ACTIVE_PROFILE_KEY);
  }

  private persistProfiles(profiles: UserProfile[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profiles));
    this.profilesSubject.next(profiles);
  }

  private persistActiveId(id: string): void {
    localStorage.setItem(ACTIVE_PROFILE_KEY, id);
    this.activeIdSubject.next(id);
  }

  private resolveActiveProfile(): UserProfile | null {
    const profiles = this.profilesSubject.value;
    const activeId = this.activeIdSubject.value;
    if (!profiles.length) {
      return null;
    }
    return profiles.find((profile) => profile.id === activeId) ?? profiles[0]!;
  }

  private emitActive(): void {
    this.activeProfile$.next(this.resolveActiveProfile());
  }

  ensureProfile(displayName = 'Learner'): UserProfile {
    let profiles = this.profilesSubject.value;
    if (!profiles.length) {
      const profile = createProfile(displayName);
      profiles = [profile];
      this.persistProfiles(profiles);
      this.persistActiveId(profile.id);
    } else if (!this.activeIdSubject.value) {
      this.persistActiveId(profiles[0]!.id);
    }
    const active = this.resolveActiveProfile()!;
    this.emitActive();
    return active;
  }

  createProfile(displayName: string): UserProfile {
    const profile = createProfile(displayName.trim() || 'Learner');
    const profiles = [...this.profilesSubject.value, profile];
    this.persistProfiles(profiles);
    this.persistActiveId(profile.id);
    this.emitActive();
    return profile;
  }

  switchProfile(id: string): void {
    if (!this.profilesSubject.value.some((profile) => profile.id === id)) {
      return;
    }
    this.persistActiveId(id);
    this.emitActive();
  }

  private updateActive(mutator: (profile: UserProfile) => UserProfile): void {
    const active = this.resolveActiveProfile();
    if (!active) {
      return;
    }
    const profiles = this.profilesSubject.value.map((profile) =>
      profile.id === active.id ? mutator(profile) : profile,
    );
    this.persistProfiles(profiles);
    this.emitActive();
  }

  recordAttempt(challengeId: string): void {
    this.updateActive((profile) => ({
      ...profile,
      progress: {
        ...profile.progress,
        attempts: {
          ...profile.progress.attempts,
          [challengeId]: (profile.progress.attempts[challengeId] ?? 0) + 1,
        },
      },
    }));
  }

  useHint(challengeId: string): void {
    this.updateActive((profile) => ({
      ...profile,
      progress: {
        ...profile.progress,
        hintsUsed: {
          ...profile.progress.hintsUsed,
          [challengeId]: (profile.progress.hintsUsed[challengeId] ?? 0) + 1,
        },
      },
    }));
  }

  completeChallenge(challengeId: string): void {
    this.updateActive((profile) => {
      const completed = profile.progress.completedChallengeIds.includes(challengeId)
        ? profile.progress.completedChallengeIds
        : [...profile.progress.completedChallengeIds, challengeId];

      const flat = levels.flatMap((level) => level.challenges);
      const index = flat.findIndex((challenge) => challenge.id === challengeId);
      const nextChallengeId =
        index >= 0 && index < flat.length - 1
          ? flat[index + 1]!.id
          : challengeId;

      return {
        ...profile,
        progress: {
          ...profile.progress,
          completedChallengeIds: completed,
          currentChallengeId: nextChallengeId,
        },
      };
    });
  }

  setCurrentChallenge(challengeId: string): void {
    if (!getChallenge(challengeId)) {
      return;
    }
    this.updateActive((profile) => ({
      ...profile,
      progress: {
        ...profile.progress,
        currentChallengeId: challengeId,
      },
    }));
  }
}
