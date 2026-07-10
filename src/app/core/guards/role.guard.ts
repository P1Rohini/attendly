import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map, take } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { UserRole } from '../models/app-user.model';

/** Factory: only allow the route if appUser.role matches `role`. */
export function roleGuard(role: UserRole): CanActivateFn {
  return () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    return authService.appUser$.pipe(
      take(1),
      map((appUser) => {
        if (appUser?.role === role) {
          return true;
        }
        // Signed in but wrong role (or profile still loading/missing) -> send home,
        // which redirects based on their actual role.
        return router.createUrlTree(['/']);
      })
    );
  };
}
