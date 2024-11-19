import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from 'src/environments/environment.prod';

@Injectable({
  providedIn: 'root'
})
export class CharactersServiceService {

  private apiUrlCharacters: string = `${environment.URL_RK}/character`;

  constructor(
    private http: HttpClient
  ) { }

  getCharactersByPage(page: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrlCharacters}?page=${page}`).pipe(
      map(response => response.results)
    );
  }

  getCharacterByUrl(url: string): Observable<any> {
    return this.http.get<any>(url); // Devolver el Observable de la respuesta HTTP
  }

  getCharacterById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrlCharacters}/${id}`);
  }


  searchCharacters(name: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrlCharacters}/?name=${name}`);
  }

}
