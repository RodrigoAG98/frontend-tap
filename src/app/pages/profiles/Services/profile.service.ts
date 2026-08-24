import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Profile } from '../../../models/profile.model';

@Injectable({
  providedIn: 'root'
})

export class ProfileService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8000/api/profiles';
  
  getProfiles(search?: string): Observable<Profile[]> {
    let params = new HttpParams();
    // Si se pasa un filtro, se adjunta a la consulta
    if (search && search.trim() !== '') {
      params = params.set('search', search.trim());
    }
    return this.http.get<Profile[]>(this.apiUrl, { params });
  }
  
  createProfile(profile: Profile): Observable<string> {
    return this.http.post<string>(this.apiUrl, profile);
  }
  
  updateProfile(id: string, profile: Partial<Profile>): Observable<string> {
    return this.http.post<string>(`${this.apiUrl}/${id}`, profile);
  }
    
  deleteProfile(id: string): Observable<string> {
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