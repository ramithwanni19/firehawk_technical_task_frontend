import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = async (route, state) => { // 1. Added async
  const authService = inject(AuthService);
  const router = inject(Router);

  const loggedIn = await authService.isLoggedIn(); 

  if (loggedIn) {
    return true; 
  } else {
    router.navigate(['/login']); 
    return false;
  }
};