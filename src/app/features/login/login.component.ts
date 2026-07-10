import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { UserRole } from '../../core/models/app-user.model';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html'
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  /** Which tab is selected. A UX aid only — the real role always comes from Firestore. */
  selectedRole: UserRole = 'employee';

  loading = false;
  errorMessage = '';

  form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  selectTab(role: UserRole): void {
    this.selectedRole = role;
    this.errorMessage = '';
  }

  async submit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading = true;
    this.errorMessage = '';
    const { email, password } = this.form.getRawValue();

    try {
      await this.authService.login(email, password);

      // Confirm the signed-in account's real role (from Firestore) matches the
      // tab the person picked. If not, sign them back out and explain why,
      // rather than silently dropping them onto the wrong dashboard.
      const appUser = await firstValueFrom(this.authService.appUser$);

      if (!appUser) {
        this.errorMessage = 'This account has no profile set up yet. Contact your admin.';
        await this.authService.logout();
        return;
      }

      if (appUser.role !== this.selectedRole) {
        const actual = appUser.role === 'manager' ? 'Manager' : 'Employee';
        this.errorMessage = `This account is registered as a ${appUser.role}. Switch to the "${actual}" tab and sign in again.`;
        await this.authService.logout();
        return;
      }

      this.router.navigate(['/']);
    } catch {
      this.errorMessage = 'Sign-in failed. Check the email and password and try again.';
    } finally {
      this.loading = false;
    }
  }
}