import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { AuthService } from './services/auth';
import { filter, firstValueFrom } from 'rxjs';

// This runs BEFORE any component loads
// Waits for Firebase auth to be ready
export const authResolver: ResolveFn<void> = async () => {
  const authService = inject(AuthService);
  await firstValueFrom(
    authService.authReady$.pipe(filter(ready => ready === true))
  );
};