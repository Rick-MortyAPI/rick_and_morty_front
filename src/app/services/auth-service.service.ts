import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthServiceService {
  private isAuthenticated = new BehaviorSubject<boolean>(false);
  private readonly API_URL: string = "http://localhost:3000/api/usuarios";

  constructor(private http: HttpClient) { }

  // Método para iniciar sesión
  login(email: string, contrasenia: string): Observable<boolean> {
    const storedUser = JSON.parse(localStorage.getItem('user') || '{}');

    if (storedUser.email === email && storedUser.contrasenia === contrasenia) {
      this.isAuthenticated.next(true);
      return of(true);
    } else {
      return of(false);
    }
  }

  // Método para registrar un nuevo usuario en la API
  register(nombre: string, apellido: string, email: string, contrasenia: string, numIntercambios: number = 0, numCapturados: number = 0): Observable<any> {
    const newUser = { 
      nombre, 
      apellido, 
      email, 
      contrasenia, 
      numIntercambios, 
      numCapturados 
    };

    // Realiza una solicitud POST a la API para registrar al nuevo usuario
    return this.http.post(`${this.API_URL}/create`, newUser).pipe(
      tap((response: any) => {
        // Guarda el usuario en localStorage
        localStorage.setItem('user', JSON.stringify(newUser)); // Guarda el nuevo usuario
        if (response.token) {
          localStorage.setItem('token', response.token);
          this.isAuthenticated.next(true);
        }
      }),
      catchError(error => {
        console.error('Error durante el registro:', error);
        return of(null); // Manejo de errores
      })
    );
  }

  // Verifica si el usuario está autenticado
  verifyUser(email: string): Observable<boolean> {
    return this.http.post<boolean>(`${this.API_URL}/verify`, { email }).pipe(
      catchError(() => of(false)) // Devuelve false si hay un error
    );
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user'); 
    this.isAuthenticated.next(false);
  }

  isLoggedIn(): Observable<boolean> {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return of(!!user.email); // Devuelve true si hay un email en localStorage
  }
}
