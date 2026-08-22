import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../../../models/user.model';

@Injectable({
  providedIn: 'root'
})

export class UserService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8000/api/users';

  getUsers(search?: string): Observable<User[]> {
    let params = new HttpParams();
    // Si se pasa un filtro, se adjunta a la consulta
    if (search && search.trim() !== '') {
      params = params.set('search', search.trim());
    }
    return this.http.get<User[]>(this.apiUrl, { params });
  }

  createUser(deparment: User): Observable<string> {
    return this.http.post<string>(this.apiUrl, deparment);
  }

  updateUser(id: string, deparment: Partial<User>): Observable<string> {
    return this.http.put<string>(`${this.apiUrl}/${id}`, deparment);
  }

  deleteUser(id: string): Observable<string> {
    return this.http.delete<string>(`${this.apiUrl}/${id}`);
  }

  exportExcel(): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/export`, {
      responseType: 'blob'
    });
  }

  exportPdf(): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/pdf`, {
      responseType: 'blob'
    });
  }
}