import { Component, OnInit } from '@angular/core';
import { InfiniteScrollCustomEvent, ModalController } from '@ionic/angular';
import { PersonajeModalComponent } from '../personaje-modal/personaje-modal.component';
import { FavoritesServiceService } from 'src/app/services/favorites-service.service';
import { CharactersServiceService } from '../../services/characters-service.service';

@Component({
  selector: 'app-personajes',
  templateUrl: './personajes.component.html',
  styleUrls: ['./personajes.component.scss'],
})
export class PersonajesComponent implements OnInit {

  characters: any[] = [];
  favoritesList: any[] = [];
  currentPage = 1;
  isLoading = false;
  toastMessage = '';
  isToastOpen = false;

  constructor(
    private charactersService: CharactersServiceService,
    private modalController: ModalController,
    private favoritesService: FavoritesServiceService
  ) { }

  ngOnInit(): void {
    this.loadCharacters();
    this.subscribeToFavorites();
    this.favoritesService.loadFavorites(); // Cargar favoritos desde la API
  }

  private loadCharacters(event?: InfiniteScrollCustomEvent): void {
    if (this.isLoading) return;

    this.isLoading = true;

    this.charactersService.getCharactersByPage(this.currentPage).subscribe({
      next: (data) => {
        this.characters = [...this.characters, ...data];
        this.currentPage++;
        this.isLoading = false;
        if (event) event.target.complete();
      },
      error: (err) => {
        console.error('Error fetching characters:', err);
        this.isLoading = false;
        if (event) event.target.complete();
      },
    });
  }

  private subscribeToFavorites(): void {
    this.favoritesService.favorites$.subscribe({
      next: (favorites) => (this.favoritesList = favorites),
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
        this.showToast(`${character.name} added to favorites.`);
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
        this.showToast(`${character.name} removed from favorites.`);
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
    this.loadCharacters(event);
  }

}
