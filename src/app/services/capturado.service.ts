import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CapturadoService {

  private readonly API_URL = 'http://localhost:3000/api/capturados';

  constructor(private http: HttpClient) { }

  getAllCapturados(): Observable<any[]> {
    return this.http.get<any[]>(`${this.API_URL}/getAll`);
  }

  getCapturadosByUser(userId: number): Observable<any[]> {
    return this.getAllCapturados().pipe(
      map((capturados) => capturados.filter((capturado) => capturado.idUsuario === userId))
    );
  }
}
