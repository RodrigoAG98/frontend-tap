import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Product } from '../models/product.model';

@Injectable({
  providedIn: 'root'
})

export class DepartmentService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8000/api/users';

  getDepartments(): Observable<Product[]> {
    return this.http.get<Product[]>(this.apiUrl);
  }

  createDepartment(deparment: Product): Observable<Product> {
    return this.http.post<Product>(this.apiUrl, deparment);
  }

  updateDepartment(id: string, deparment: Partial<Product>): Observable<Product> {
    return this.http.put<Product>(`${this.apiUrl}/${id}`, deparment);
  }

  deleteDepartment(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}