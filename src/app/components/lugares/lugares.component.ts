import { Component, OnInit } from '@angular/core';
import { LocationsServiceService } from '../../services/locations-service.service';
import { CharactersServiceService } from 'src/app/services/characters-service.service';
import { InfiniteScrollCustomEvent, ModalController } from '@ionic/angular';
import { PersonajeModalComponent } from '../personaje-modal/personaje-modal.component';
import { FavoritesServiceService } from 'src/app/services/favorites-service.service';

@Component({
  selector: 'app-lugares',
  templateUrl: './lugares.component.html',
  styleUrls: ['./lugares.component.scss'],
})
export class LugaresComponent implements OnInit {

  lugaresList: any[] = [];
  residentesList: { [key: string]: any[] } = {}; 
  loading: boolean = true;
  currentPage: number = 1;
  isToastOpen: boolean = false;
  toastMessage: string = '';

  constructor(
    private _locationService: LocationsServiceService,
    private _rickyMortyService: CharactersServiceService,
    private modalController: ModalController,
    private favoritesService: FavoritesServiceService
  ) {}

  ngOnInit() {
    this.getAllLocations();
  }

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


  obtenerResidentes(lugar: any) {
    const residents = lugar.residents;
    this.residentesList[lugar.id] = []; 

    residents.forEach((url: string) => {
      this._rickyMortyService.getCharacterByUrl(url)
        .subscribe(
          data => {
            this.residentesList[lugar.id].push(data);
          },
          error => {
            console.error(`Error fetching resident from ${url}:`, error);
          }
        );
    });
  }

  async openCharacterModal(character: any) {
    const modal = await this.modalController.create({
      component: PersonajeModalComponent,
      componentProps: {
        character: character
      }
    });
    return await modal.present();
  }

  isFavorite(character: any): boolean {
    return this.favoritesService.isFavorite(character);
  }

  toggleFavorite(character: any) {

    if (this.isFavorite(character)) {
      this.favoritesService.removeFavorite(character);
      this.toastMessage = `${character.name} removed from favorites`;
    } else {
      this.favoritesService.addFavorite(character);
      this.toastMessage = `${character.name} added to favorites`;
    }

    this.isToastOpen = true;

    setTimeout(() => {
      this.isToastOpen = false;
    }, 3000);

  }

  onIonInfinite(event: InfiniteScrollCustomEvent) {
    this.currentPage++;
    this.getAllLocations();
    event.target.complete();
  }
  
}
