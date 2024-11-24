import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, map, Observable, of, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CapturadoService {
  private readonly API_URL = 'https://rick-and-morty-back-7o08.onrender.com/api/capturados';

  private capturadosSubject = new BehaviorSubject<any[]>([]);
  public capturados$ = this.capturadosSubject.asObservable();

  constructor(private http: HttpClient) {
  }

  // Cargar todos los capturados desde la API
  loadCapturados(): void {
    this.http.get<any[]>(`${this.API_URL}/getAll`).pipe(
      tap((capturados) => {
        console.log('Capturados actualizados:', capturados);
        this.capturadosSubject.next(capturados); // Notifica a los suscriptores
      }),
      catchError((err) => {
        console.error('Error al cargar capturados:', err);
        return of([]); // Manejo de errores
      })
    ).subscribe();
  }


  // Obtener capturados filtrados por el usuario
  getCapturadosByUser(userId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.API_URL}/getAll`).pipe(
      map((capturados) => {
        console.log('Todos los capturados:', capturados);
        return capturados.filter((capturado) => capturado.idUsuario === userId);
      }),
      catchError((error) => {
        console.error('Error al obtener capturados:', error);
        return of([]);
      })
    );
  }


  // Añadir un nuevo capturado
  addCapturado(capturado: any): Observable<any> {
    return this.http.post<any>(`${this.API_URL}/create`, capturado).pipe(
      tap(() => this.loadCapturados()) // Recargar capturados después de crear uno
    );
  }

  // Eliminar un capturado
  deleteCapturado(id: number): Observable<any> {
    return this.http.delete<any>(`${this.API_URL}/delete/${id}`).pipe(
      tap(() => this.loadCapturados()) // Recargar capturados después de eliminar uno
    );
  }
}
