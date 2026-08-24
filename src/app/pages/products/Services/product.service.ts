import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Product } from '../../../models/product.model';

@Injectable({
  providedIn: 'root'
})

export class ProductService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8000/api/products';

  getProducts(search?: string): Observable<Product[]> {
    let params = new HttpParams();
    // Si se pasa un filtro, se adjunta a la consulta
    if (search && search.trim() !== '') {
      params = params.set('search', search.trim());
    }
    return this.http.get<Product[]>(this.apiUrl, { params });
  }
    
  createProduct(product: Product): Observable<string> {
    return this.http.post<string>(this.apiUrl, product);
  }
    
  updateProduct(id: string, product: Partial<Product>): Observable<string> {
    return this.http.put<string>(`${this.apiUrl}/${id}`, product);
  }
      
  deleteProduct(id: string): Observable<string> {
    return this.http.delete<string>(`${this.apiUrl}/${id}`);
  }
    
  exportExcel(search?: string): Observable<Blob> {
    let params = new HttpParams();
    // Si se pasa un filtro, se adjunta a la consulta
    if (search && search.trim() !== '') {
      params = params.set('search', search.trim());
    }
    return this.http.get(`${this.apiUrl}/export`, {
      params, 
      responseType: 'blob'
    });
  }
    
  exportPdf(search?: string): Observable<Blob> {
    let params = new HttpParams();
    // Si se pasa un filtro, se adjunta a la consulta
    if (search && search.trim() !== '') {
      params = params.set('search', search.trim());
    }
    return this.http.get(`${this.apiUrl}/pdf`, {
      params,
      responseType: 'blob'
    });
  }
}