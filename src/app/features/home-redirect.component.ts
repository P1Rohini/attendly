import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { catchError, of, take, timeout } from 'rxjs';
import { AuthService } from '../core/services/auth.service';

@Component({
  selector: 'app-home-redirect',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container" style="max-width: 420px; padding-top: 60px;">
      <div class="card" *ngIf="!errorMessage">
        <p class="muted" style="margin: 0;">Loading your dashboard…</p>
      </div>
      <div class="card" *ngIf="errorMessage">
        <h2 style="margin-bottom: 8px;">Couldn't load your dashboard</h2>
        <p class="error" style="margin-top: 0;">{{ errorMessage }}</p>
        <button class="btn" (click)="retry()">Try again</button>
        <button class="btn secondary" style="margin-left: 8px;" (click)="signOutAndReturn()">Sign out</button>
      </div>
    </div>
  `
})
export class HomeRedirectComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);

  errorMessage = '';

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.errorMessage = '';
    this.authService.appUser$
      .pipe(
        take(1),
        timeout(10000),
        catchError(() => of('__error__' as const))
      )
      .subscribe((appUser) => {
        if (appUser === '__error__') {
          this.errorMessage =
            'We could not load your profile. This can happen if Firestore permissions or your profile document are misconfigured. Contact your admin, or try again.';
          return;
        }
        if (!appUser) {
          this.errorMessage = 'No profile is set up for this account yet. Contact your admin.';
          return;
        }
        if (appUser.role === 'manager') {
          this.router.navigate(['/manager']);
        } else {
          this.router.navigate(['/employee']);
        }
      });
  }

  retry(): void {
    this.load();
  }

  async signOutAndReturn(): Promise<void> {
    await this.authService.logout();
    this.router.navigate(['/login']);
  }
}