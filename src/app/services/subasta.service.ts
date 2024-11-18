import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SubastaService {
  private readonly API_URL = 'http://localhost:3000/api/subastas';

  constructor(private http: HttpClient) { }

  getAllSubastas(): Observable<any[]> {
    return this.http.get<any[]>(`${this.API_URL}/getAll`);
  }

  getSubastaById(id: number): Observable<any> {
    return this.http.get<any>(`${this.API_URL}/getById/${id}`);
  }

  createSubasta(subasta: any): Observable<any> {
    return this.http.post<any>(`${this.API_URL}/create`, subasta);
  }

  updateSubasta(subasta: any): Observable<any> {
    return this.http.put<any>(`${this.API_URL}/update`, subasta);
  }

  deleteSubasta(id: number): Observable<any> {
    return this.http.delete<any>(`${this.API_URL}/delete/${id}`);
  }

  confirmSubasta(data: any): Observable<any> {
    return this.http.post<any>(`${this.API_URL}/confirm`, data);
  }
}
