import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private api = `${environment.apiUrl}/products`;

  constructor(private http: HttpClient) {}

  getAll(filters: any = {}) {
    let params = new HttpParams();
    Object.keys(filters).forEach(key => {
      if (filters[key]) params = params.set(key, filters[key]);
    });
    return this.http.get<any>(this.api, { params });
  }

  getOne(id: number) {
    return this.http.get<any>(`${this.api}/${id}`);
  }

  create(data: FormData) {
    return this.http.post<any>(this.api, data);
  }

  update(id: number, data: FormData) {
    return this.http.put<any>(`${this.api}/${id}`, data);
  }

  delete(id: number) {
    return this.http.delete<any>(`${this.api}/${id}`);
  }

  bulkUpload(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<any>(`${this.api}/bulk-upload`, formData);
  }

  downloadCSV() {
    return this.http.get(`${this.api}/download/csv`, { responseType: 'blob' });
  }

  downloadExcel() {
    return this.http.get(`${this.api}/download/excel`, { responseType: 'blob' });
  }
}
