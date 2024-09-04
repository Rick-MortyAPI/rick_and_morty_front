import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from 'src/environments/environment.prod';

@Injectable({
  providedIn: 'root'
})
export class LocationsServiceService {

  private apiUrlLocations: string = `${ environment.URL_RK }/location`;

  constructor( private http: HttpClient ) { }

  getLocationsByPage(page: number) {
    return this.http.get<any>(`${this.apiUrlLocations}?page=${page}`).pipe(
      map(response => response.results)
    );
  }

}
