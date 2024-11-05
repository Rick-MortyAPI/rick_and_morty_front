import { CanActivateFn } from '@angular/router';
import { AuthServiceService } from '../services/auth-service.service';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthServiceService);
  const router = inject(Router);

  // Verifica si el usuario está autenticado
  return authService.isLoggedIn().pipe(
    tap(isAuthenticated => {
      if (!isAuthenticated) {
        router.navigate(['/']); // Redirige a la página de inicio si no está autenticado
      }
    })
  );
};
