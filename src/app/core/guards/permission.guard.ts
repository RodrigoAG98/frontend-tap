import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const permissionGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Extrae el permiso requerido definido en la configuración de la ruta
  const requiredPermission = route.data?.['permission'] as string | undefined;
  // Si la ruta no requiere un permiso específico o si el usuario lo tiene, permite el paso
  if (!requiredPermission || authService.hasPermission(requiredPermission)) {
    return true;
  }

  // Si no tiene el permiso, redirige a una página de acceso denegado o al dashboard
  return router.createUrlTree(['/access']);
};