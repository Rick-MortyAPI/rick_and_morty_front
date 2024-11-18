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
  favoritesList: any[] = []; // Lista reactiva de favoritos
  loading = true;
  currentPage = 1;
  isToastOpen = false;
  toastMessage = '';

  constructor(
    private _locationService: LocationsServiceService,
    private _rickyMortyService: CharactersServiceService,
    private modalController: ModalController,
    private favoritesService: FavoritesServiceService
  ) {}

  ngOnInit(): void {
    this.getAllLocations();
    this.subscribeToFavorites();
    this.favoritesService.loadFavorites(); // Cargar favoritos iniciales
  }

  getAllLocations(): void {
    this._locationService.getLocationsByPage(this.currentPage).subscribe({
      next: (data) => {
        this.lugaresList = [...this.lugaresList, ...data];
        this.lugaresList.forEach((lugar) => this.obtenerResidentes(lugar));
        this.loading = false;
      },
      error: (err) => {
        console.error('Error fetching locations:', err);
        this.loading = false;
      },
    });
  }

  obtenerResidentes(lugar: any): void {
    const residents = lugar.residents;
    this.residentesList[lugar.id] = [];

    residents.forEach((url: string) => {
      this._rickyMortyService.getCharacterByUrl(url).subscribe({
        next: (data) => {
          this.residentesList[lugar.id].push(data);
        },
        error: (err) => {
          console.error(`Error fetching resident from ${url}:`, err);
        },
      });
    });
  }

  // Suscribirse a los cambios en la lista de favoritos
  private subscribeToFavorites(): void {
    this.favoritesService.favorites$.subscribe({
      next: (favorites) => {
        this.favoritesList = favorites;
      },
      error: (err) => {
        console.error('Error loading favorites:', err);
        this.showToast('Error loading favorites.');
      },
    });
  }

  isFavorite(character: any): boolean {
    return this.favoritesList.some((fav) => fav.idPersonaje === character.id);
  }

  toggleFavorite(character: any): void {
    const user = localStorage.getItem('user');
    const currentUser = user ? JSON.parse(user) : null;

    if (!currentUser || !currentUser.id) {
      this.showToast('Error: Usuario no autenticado.');
      return;
    }

    const usuarioId = currentUser.id;

    if (this.isFavorite(character)) {
      this.removeFavorite(character);
    } else {
      this.addFavorite(character, usuarioId);
    }
  }

  private addFavorite(character: any, usuarioId: number): void {
    const newFavorite = { idPersonaje: character.id, idUsuario: usuarioId };

    this.favoritesService.saveFavorito(newFavorite).subscribe({
      next: () => {
        this.toastMessage = `${character.name} added to favorites.`;
        this.showToast(this.toastMessage);
      },
      error: (err) => {
        console.error('Error adding favorite:', err);
        this.showToast('Error adding favorite.');
      },
    });
  }

  private removeFavorite(character: any): void {
    const favorite = this.favoritesList.find((fav) => fav.idPersonaje === character.id);
    if (!favorite) return;

    this.favoritesService.deleteFavorito(favorite.id).subscribe({
      next: () => {
        this.toastMessage = `${character.name} removed from favorites.`;
        this.showToast(this.toastMessage);
      },
      error: (err) => {
        console.error('Error removing favorite:', err);
        this.showToast('Error removing favorite.');
      },
    });
  }

  async openCharacterModal(character: any): Promise<void> {
    const modal = await this.modalController.create({
      component: PersonajeModalComponent,
      componentProps: { character },
    });
    await modal.present();
  }

  private showToast(message: string): void {
    this.toastMessage = message;
    this.isToastOpen = true;
    setTimeout(() => {
      this.isToastOpen = false;
    }, 3000);
  }

  onIonInfinite(event: InfiniteScrollCustomEvent): void {
    this.currentPage++;
    this.getAllLocations();
    event.target.complete();
  }
  
}
