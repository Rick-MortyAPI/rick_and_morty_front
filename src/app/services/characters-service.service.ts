import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CharactersServiceService {

  private apiUrlCharacters: string = 'https://rickandmortyapi.com/api/character';

  constructor( private http: HttpClient ) { }

  getCharactersByPage(page: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrlCharacters}?page=${page}`).pipe(
      map(response => response.results)
    );
  }

  searchCharacters(name: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrlCharacters}/?name=${name}`);
  }
  
}
