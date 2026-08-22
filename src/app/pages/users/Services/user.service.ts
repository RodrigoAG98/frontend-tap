import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../../../models/user.model';

@Injectable({
  providedIn: 'root'
})

export class UserService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8000/api/users';

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.apiUrl);
  }

  createUser(deparment: User): Observable<User> {
    return this.http.post<User>(this.apiUrl, deparment);
  }

  updateUser(id: string, deparment: Partial<User>): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${id}`, deparment);
  }

  deleteUser(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}