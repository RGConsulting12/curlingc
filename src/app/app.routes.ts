import { Routes } from '@angular/router';
import { ChallengeComponent } from './pages/challenge/challenge.component';
import { HomeComponent } from './pages/home/home.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'challenge/:id', component: ChallengeComponent },
  { path: '**', redirectTo: '' },
];
