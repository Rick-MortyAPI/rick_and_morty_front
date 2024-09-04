import { Component, OnInit } from '@angular/core';
import { LocationsServiceService } from '../../services/locations-service.service';
import { CharactersServiceService } from 'src/app/services/characters-service.service';
import { InfiniteScrollCustomEvent } from '@ionic/angular';

@Component({
  selector: 'app-lugares',
  templateUrl: './lugares.component.html',
  styleUrls: ['./lugares.component.scss'],
})
export class LugaresComponent implements OnInit {

  lugaresList: any[] = []; // Lista de lugares
  residentesList: { [key: string]: any[] } = {}; // Diccionario para los residentes por lugar
  loading: boolean = true; // Estado de carga
  currentPage: number = 1;

  constructor(
    private _locationService: LocationsServiceService,
    private _rickyMortyService: CharactersServiceService
  ) {}

  ngOnInit() {
    this.getAllLocations(); // Obtener todas las localizaciones al iniciar el componente
  }

  // Obtener todas las localizaciones
  getAllLocations() {
    this._locationService.getLocationsByPage(this.currentPage).subscribe(
      data => {
        this.lugaresList = [...this.lugaresList, ...data]; // Añadir las localizaciones nuevas
        this.lugaresList.forEach(lugar => {
          this.obtenerResidentes(lugar);
        });
        this.loading = false;
      },
      error => {
        console.error('Error fetching locations:', error);
        this.loading = false;
      }
    );
  }

  // Obtener los residentes de cada lugar
  obtenerResidentes(lugar: any) {
    const residents = lugar.residents;
    this.residentesList[lugar.id] = []; // Inicializar la lista de residentes para el lugar

    residents.forEach((url: string) => {
      this._rickyMortyService.getCharacterByUrl(url)
        .subscribe(
          data => {
            this.residentesList[lugar.id].push(data); // Añadir el residente a la lista
          },
          error => {
            console.error(`Error fetching resident from ${url}:`, error);
          }
        );
    });
  }

  onIonInfinite(event: InfiniteScrollCustomEvent) {
    this.currentPage++; // Incrementar el número de página para la siguiente carga
    this.getAllLocations();
    event.target.complete(); // Marcar el infinite scroll como completado
  }
  
}
