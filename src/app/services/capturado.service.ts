import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, map, Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CapturadoService {
  private readonly API_URL = 'https://rick-and-morty-back-7o08.onrender.com/api/capturados';

  private capturadosSubject = new BehaviorSubject<any[]>([]);
  public capturados$ = this.capturadosSubject.asObservable();

  constructor(private http: HttpClient) { }

  loadCapturados(): void {
    this.http.get<any[]>(`${this.API_URL}/getAll`)
      .pipe(
        tap((capturados) => this.capturadosSubject.next(capturados))
      )
      .subscribe({
        error: (err) => console.error('Error loading capturados:', err)
      });
  }

  getCapturadosByUser(userId: number): Observable<any[]> {
    return this.capturados$.pipe(
      map((capturados) => capturados.filter((capturado) => capturado.idUsuario === userId))
    );
  }

  addCapturado(capturado: any): Observable<any> {
    return this.http.post<any>(`${this.API_URL}/create`, capturado).pipe(
      tap(() => this.loadCapturados())
    );
  }

  deleteCapturado(id: number): Observable<any> {
    return this.http.delete<any>(`${this.API_URL}/delete/${id}`).pipe(
      tap(() => this.loadCapturados())
    );
  }
}
