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
  searchTerm = ''; // Nuevo: término de búsqueda
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

  // Cargar personajes desde la API con paginación
  private loadCharacters(event?: InfiniteScrollCustomEvent): void {
    if (this.isLoading || this.searchTerm.trim()) return; // Evitar recargar durante búsqueda

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

  // Buscar personajes
  onSearch(event: any): void {
    const query = event.target.value.trim();
    this.searchTerm = query;

    if (!query) {
      this.characters = []; // Reiniciar personajes si no hay término de búsqueda
      this.currentPage = 1; // Reiniciar paginación
      this.loadCharacters(); // Recargar todos los personajes
      return;
    }

    this.charactersService.searchCharacters(query).subscribe({
      next: (data) => {
        this.characters = data.results;
      },
      error: (err) => {
        console.error('Error searching characters:', err);
        this.showToast('Error searching characters.');
        this.characters = [];
      },
    });
  }

  // Suscribirse a los cambios en la lista de favoritos
  private subscribeToFavorites(): void {
    const currentUser = this.getCurrentUser();
    if (!currentUser || !currentUser.id) {
      console.error('Usuario no autenticado.');
      return;
    }

    this.favoritesService.favorites$.subscribe({
      next: (favorites) => {
        // Filtrar los favoritos solo para el usuario actual
        this.favoritesList = favorites.filter((fav) => fav.idUsuario === currentUser.id);
      },
      error: (err) => {
        console.error('Error loading favorites:', err);
        this.showToast('Error loading favorites.');
      },
    });
  }

  private getCurrentUser(): any {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
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
        this.showToast(`${character.name} agregado a favoritos.`);
        this.favoritesService.loadFavorites(); // Refrescar la lista de favoritos
      },
      error: (err) => {
        console.error('Error agregando a favoritos:', err);
        this.showToast('Error al agregar a favoritos.');
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
