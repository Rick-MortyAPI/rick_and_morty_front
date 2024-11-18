import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, catchError, throwError, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FavoritesServiceService {
  private readonly API_URL = 'http://localhost:3000/api/favoritos';

  private favoritesSubject = new BehaviorSubject<any[]>([]);
  public favorites$ = this.favoritesSubject.asObservable();

  constructor(private http: HttpClient) { }

  // Cargar todos los favoritos desde la API
  loadFavorites(): void {
    this.http.get<any[]>(`${this.API_URL}/getAll`).pipe(
      catchError(this.handleError)
    ).subscribe({
      next: (favorites) => this.favoritesSubject.next(favorites),
      error: (err) => console.error('Error loading favorites:', err),
    });
  }

  // Guardar un nuevo favorito
  saveFavorito(favorito: { idUsuario: number; idPersonaje: number }): Observable<any> {
    return this.http.post<any>(`${this.API_URL}/create`, favorito).pipe(
      tap(() => this.loadFavorites()), // Refrescar favoritos después de agregar
      catchError(this.handleError)
    );
  }

  // Eliminar un favorito por su ID
  deleteFavorito(id: number): Observable<any> {
    return this.http.delete<any>(`${this.API_URL}/delete/${id}`).pipe(
      tap(() => this.loadFavorites()), // Refrescar favoritos después de eliminar
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    const errorMessage = error.error instanceof ErrorEvent
      ? `Error del cliente: ${error.error.message}`
      : `Error del servidor: ${error.status} - ${error.message}`;
    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}
