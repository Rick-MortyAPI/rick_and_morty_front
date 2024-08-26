import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LocationsServiceService {

  private apiUrlLocations: string = 'https://rickandmortyapi.com/api/location';

  constructor( private http: HttpClient ) { }

  getLocationsByPage(page: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrlLocations}?page=${page}`).pipe(
      map(response => response.results)
    );
  }

}
