import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth';
import { filter, firstValueFrom } from 'rxjs';

// Usage: canActivate: [authGuard('student')]
export function authGuard(requiredRole: 'student' | 'instructor' | 'admin'): CanActivateFn {
  return async () => {
    const authService = inject(AuthService);
    const router      = inject(Router);

    // ✅ Wait until Firebase auth state is known (handles page reload)
    await firstValueFrom(authService.authReady$.pipe(filter(ready => ready)));

    // Not logged in → go to login
    if (!authService.isLoggedIn()) {
      router.navigate(['/login']);
      return false;
    }

    const userRole = authService.getRole();
    const uid      = authService.getUserProfile()?.uid;

    // Correct role → allow
    if (userRole === requiredRole) {
      return true;
    }

    // Wrong role → redirect to their own dashboard
    if (userRole && uid) {
      router.navigate([`/${userRole}/${uid}/dashboard`]);
    } else {
      router.navigate(['/login']);
    }

    return false;
  };
}