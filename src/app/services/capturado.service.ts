import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CapturadoService {

  private readonly API_URL = 'https://rick-and-morty-back-7o08.onrender.com/api/capturados';

  constructor(private http: HttpClient) { }

  getAllCapturados(): Observable<any[]> {
    return this.http.get<any[]>(`${this.API_URL}/getAll`);
  }

  getCapturadosByUser(userId: number): Observable<any[]> {
    return this.getAllCapturados().pipe(
      map((capturados) => capturados.filter((capturado) => capturado.idUsuario === userId))
    );
  }

  getCapturadoById(id: number): Observable<any> {
    return this.http.get<any>(`${this.API_URL}/get/${id}`);
  }

  addCapturado(capturado: any): Observable<any> {
    return this.http.post<any>(`${this.API_URL}/create`, capturado);
  }
}
