import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { Router } from '@angular/router';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  templateUrl: './app.component.html'
})
export class AppComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  readonly appUser$ = this.authService.appUser$;

  async signOut(): Promise<void> {
    await this.authService.logout();
    this.router.navigate(['/login']);
  }
}
