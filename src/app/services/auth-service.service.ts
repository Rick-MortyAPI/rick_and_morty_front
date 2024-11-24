import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthServiceService {
  private isAuthenticated = new BehaviorSubject<boolean>(this.checkLocalStorage());
  private readonly API_URL: string = "https://rick-and-morty-back-7o08.onrender.com/api/usuarios";
  private currentUser: any = null;

  constructor(private http: HttpClient) { }

  // Método para iniciar sesión
  login(email: string, contrasenia: string): Observable<boolean> {
    return this.http.get<{ email: string, contrasenia: string }[]>(`${this.API_URL}/getAll`).pipe(
      map(users => {
        // Buscar usuario con email y contraseña coincidentes
        const user = users.find(u => u.email === email && u.contrasenia === contrasenia);
        if (user) {
          // Guardar el usuario en localStorage
          localStorage.setItem('user', JSON.stringify(user));

          // Actualizar el estado de autenticación
          this.currentUser = user;
          this.isAuthenticated.next(true);
          return true; // Autenticación exitosa
        } else {
          return false; // Credenciales incorrectas
        }
      }),
      catchError(error => {
        console.error('Error durante el inicio de sesión:', error);
        return of(false); // Manejo de errores
      })
    );
  }

  // Método para registrar un nuevo usuario
  register(nombre: string, apellido: string, email: string, contrasenia: string): Observable<boolean> {

    const newUser = { nombre, apellido, email, contrasenia, numIntercambios: 0, numCapturados: 0 };

    return this.http.post<any>(`${this.API_URL}/create`, newUser).pipe(
      tap(response => {
        localStorage.setItem('user', JSON.stringify(response));
        this.isAuthenticated.next(true);
      }),
      map(response => true),
      catchError(error => {
        console.error('Error al registrar:', error);
        if (error.status === 409) {
          console.warn('Usuario ya existe.');
        }
        return of(false);
      })
    );
  }

  getRankingIntercambios(): Observable<any[]> {
    return this.http.get<any[]>(`${this.API_URL}/ranking/intercambios`);
  }

  // Obtener ranking por capturados
  getRankingCapturados(): Observable<any[]> {
    return this.http.get<any[]>(`${this.API_URL}/ranking/capturados`);
  }


  // Método para cerrar sesión
  logout(): void {
    localStorage.removeItem('user'); // Eliminar el usuario de localStorage
    this.currentUser = null; // Limpiar el usuario autenticado
    this.isAuthenticated.next(false); // Actualizar el estado de autenticación
  }

  // Verificar si el usuario está autenticado
  isLoggedIn(): Observable<boolean> {
    return this.isAuthenticated.asObservable();
  }

  // Obtener el usuario actual desde el localStorage
  getCurrentUser(): any {
    if (!this.currentUser) {
      const user = localStorage.getItem('user');
      this.currentUser = user ? JSON.parse(user) : null;
    }
    return this.currentUser;
  }

  // Verificar si hay un usuario en localStorage
  public checkLocalStorage(): boolean {
    const user = localStorage.getItem('user');
    return !!user;
  }
}
