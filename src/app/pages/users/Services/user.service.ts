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

  createUser(user: User, imageFile: File | null): Observable<string> {
    const formData = new FormData();

    // Adjuntar campos de texto
    formData.append('user', user.user);
    formData.append('name', user.name);
    formData.append('telephone', user.telephone ?? '');
    
    // Adjuntar arreglo de perfiles si existe
    if (user.profiles) {
      user.profiles.forEach((profileId: string) => {
        formData.append('profiles[]', profileId.toString());
      });
    }

    // Adjuntar la imagen si fue seleccionada
    if (imageFile) {
      formData.append('foto', imageFile, imageFile.name);
    }

    return this.http.post<string>(this.apiUrl, formData);
  }

  updateUser(id: string, user: Partial<User>, imageFile: File | null): Observable<string> {
    const formData = new FormData();

    // Adjuntar campos de texto
    formData.append('user', user.user ?? '');
    formData.append('name', user.name ?? '');
    formData.append('telephone', user.telephone ?? '');
    
    // Adjuntar arreglo de perfiles si existe
    if (user.profiles) {
      user.profiles.forEach((profileId: string) => {
        formData.append('profiles[]', profileId.toString());
      });
    }

    // Adjuntar la imagen si fue seleccionada
    if (imageFile) {
      formData.append('foto', imageFile, imageFile.name);
    }
    return this.http.post<string>(`${this.apiUrl}/${id}`, formData);
  }

  avatarUser(id: string): Observable<string> {
    return this.http.get<string>(`${this.apiUrl}/${id}/avatar`);
  }
  
  deleteUser(id: string): Observable<string> {
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