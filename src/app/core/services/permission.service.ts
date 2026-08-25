import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Permission } from '../../models/permission.model';

@Injectable({ providedIn: 'root' })

export class PermissionService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8000/api/permissions';

  getPermissions(): Observable<Permission[]> {
    return this.http.get<Permission[]>(this.apiUrl);
  }
}