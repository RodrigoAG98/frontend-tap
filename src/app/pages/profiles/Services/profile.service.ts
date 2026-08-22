import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Profile } from '../models/profile.model';

@Injectable({
  providedIn: 'root'
})

export class DepartmentService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8000/api/users';

  getDepartments(): Observable<Profile[]> {
    return this.http.get<Profile[]>(this.apiUrl);
  }

  createDepartment(deparment: Profile): Observable<Profile> {
    return this.http.post<Profile>(this.apiUrl, deparment);
  }

  updateDepartment(id: string, deparment: Partial<Profile>): Observable<Profile> {
    return this.http.put<Profile>(`${this.apiUrl}/${id}`, deparment);
  }

  deleteDepartment(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}