import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { CharactersServiceService } from 'src/app/services/characters-service.service';
import { FavoritesServiceService } from 'src/app/services/favorites-service.service';
import { PersonajeModalComponent } from '../personaje-modal/personaje-modal.component';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss'],
})
export class SearchComponent implements OnInit {

  searchTerm: string = '';
  characters: any[] = [];
  favoritesList: any[] = []; // Lista de favoritos reactiva
  toastMessage: string = '';
  isToastOpen: boolean = false;

  constructor(
    private charcaterService: CharactersServiceService,
    private modalController: ModalController,
    private favoritesService: FavoritesServiceService
  ) { }

  ngOnInit(): void {
    // Suscribirse a los cambios en los favoritos
    this.favoritesService.favorites$.subscribe({
      next: (favorites) => {
        this.favoritesList = favorites;
      },
      error: (err) => {
        console.error('Error loading favorites:', err);
        this.toastMessage = 'Error loading favorites.';
        this.showToast();
      },
    });

    // Cargar favoritos iniciales desde la API
    this.favoritesService.loadFavorites();
  }

  onSearch(): void {
    if (this.searchTerm.trim().length === 0) {
      this.characters = [];
      return;
    }

    this.charcaterService.searchCharacters(this.searchTerm).subscribe({
      next: (data: any) => {
        this.characters = data.results;
      },
      error: (error) => {
        console.error('Error fetching characters:', error);
        this.toastMessage = `Error fetching characters: '${error.error?.error || 'Unknown error'}'`;
        this.showToast();
        this.characters = [];
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

  // Verificar si un personaje es favorito
  isFavorite(character: any): boolean {
    return this.favoritesList.some((fav) => fav.idPersonaje === character.id);
  }

  // Alternar entre agregar o eliminar de favoritos
  toggleFavorite(character: any): void {
    if (this.isFavorite(character)) {
      // Eliminar de favoritos
      const favorite = this.favoritesList.find((fav) => fav.idPersonaje === character.id);
      if (favorite) {
        this.favoritesService.deleteFavorito(favorite.id).subscribe({
          next: () => {
            this.toastMessage = `${character.name} removed from favorites`;
            this.showToast();
          },
          error: (err) => {
            console.error('Error removing favorite:', err);
            this.toastMessage = 'Error removing favorite.';
            this.showToast();
          },
        });
      }
    } else {
      // Agregar a favoritos
      const user = localStorage.getItem('user');
      const currentUser = user ? JSON.parse(user) : null;

      if (!currentUser || !currentUser.id) {
        this.toastMessage = 'Error: Usuario no autenticado.';
        this.showToast();
        return;
      }

      const newFavorite = { idUsuario: currentUser.id, idPersonaje: character.id };
      this.favoritesService.saveFavorito(newFavorite).subscribe({
        next: () => {
          this.toastMessage = `${character.name} added to favorites`;
          this.showToast();
        },
        error: (err) => {
          console.error('Error adding favorite:', err);
          this.toastMessage = 'Error adding favorite.';
          this.showToast();
        },
      });
    }
  }

  private showToast(): void {
    this.isToastOpen = true;
    setTimeout(() => {
      this.isToastOpen = false;
    }, 3000);
  }
}
