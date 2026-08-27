import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private apiUrl = environment.apiUrl;
  userPermissions = signal<string[]>([]);

  setPermissions(permissions: string[]): void {
    this.userPermissions.set(permissions);
    localStorage.setItem('permissions', JSON.stringify(permissions));
  }

  hasPermission(permission: string): boolean {
    return this.userPermissions().includes(permission);
  }

  login(credentials: { user: string; password: string }) {
    return this.http.post<{ token: string }>(`${this.apiUrl}/login`, credentials);
  }

  requestPasswordReset(email: string) {
    return this.http.post(`${this.apiUrl}/forgot-password`, { email });
  }

  setToken(token: string) {
    localStorage.setItem('auth_token', token);
  }

  logout() {
    localStorage.removeItem('auth_token');
    this.router.navigate(['/auth/login']);
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('auth_token');
  }
}