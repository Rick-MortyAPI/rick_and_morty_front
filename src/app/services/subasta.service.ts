import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class SubastaService {
  private readonly API_URL = 'https://rick-and-morty-back-7o08.onrender.com/api/subastas';
  private subastasSubject = new BehaviorSubject<any[]>([]);

  constructor(private http: HttpClient) { }

  // Observable para las subastas
  get subastas$(): Observable<any[]> {
    return this.subastasSubject.asObservable();
  }

  // Cargar subastas desde la API
  loadSubastas(): void {
    this.http.get<any[]>(`${this.API_URL}/getAll`).pipe(
      tap((subastas) => this.subastasSubject.next(subastas))
    ).subscribe({
      error: (err) => console.error('Error al cargar subastas:', err),
    });
  }

  // Crear una nueva subasta y recargar subastas
  createSubasta(subasta: any): Observable<any> {
    return this.http.post<any>(`${this.API_URL}/create`, subasta).pipe(
      tap(() => this.loadSubastas()) // Recargar subastas después de crear
    );
  }

  // Confirmar una subasta y recargar subastas
  confirmSubasta(data: any): Observable<any> {
    return this.http.post<any>(`${this.API_URL}/confirm`, data).pipe(
      tap(() => this.loadSubastas()) // Recargar subastas después de confirmar
    );
  }
}
