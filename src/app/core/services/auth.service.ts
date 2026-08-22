import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private API_URL = 'http://localhost:8000/api';

  login(credentials: { user: string; password: string }) {
    return this.http.post<{ token: string }>(`${this.API_URL}/login`, credentials);
  }

  requestPasswordReset(email: string) {
    return this.http.post(`${this.API_URL}/forgot-password`, { email });
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