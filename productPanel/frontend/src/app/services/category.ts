import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private api = `${environment.apiUrl}/categories`;

  constructor(private http: HttpClient) {}

  getAll() {
    return this.http.get<any[]>(this.api);
  }

  create(data: { name: string }) {
    return this.http.post<any>(this.api, data);
  }

  update(id: number, data: { name: string }) {
    return this.http.put<any>(`${this.api}/${id}`, data);
  }

  delete(id: number) {
    return this.http.delete<any>(`${this.api}/${id}`);
  }
}
