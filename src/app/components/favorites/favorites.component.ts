import { Component, OnInit } from '@angular/core';
import { PersonajeModalComponent } from '../personaje-modal/personaje-modal.component';
import { ModalController } from '@ionic/angular';
import { FavoritesServiceService } from 'src/app/services/favorites-service.service';
import { CharactersServiceService } from 'src/app/services/characters-service.service';

@Component({
  selector: 'app-favorites',
  templateUrl: './favorites.component.html',
  styleUrls: ['./favorites.component.scss'],
})
export class FavoritesComponent implements OnInit {
  characters: any[] = [];
  toastMessage: string = '';
  isToastOpen: boolean = false;

  constructor(
    private modalController: ModalController,
    private favoritesService: FavoritesServiceService,
    private charactersService: CharactersServiceService
  ) { }

  ngOnInit(): void {
    this.loadFavorites();
  }

  private loadFavorites(): void {
    this.favoritesService.favorites$.subscribe({
      next: (favorites) => {
        const characterDetails$ = favorites.map((favorite) =>
          this.charactersService
            .getCharacterByUrl(`https://rickandmortyapi.com/api/character/${favorite.idPersonaje}`)
            .toPromise()
        );

        Promise.all(characterDetails$)
          .then((characters) => {
            this.characters = characters.map((character, index) => ({
              ...character,
              idFavorito: favorites[index].id,
            }));
          })
          .catch((err) => {
            console.error('Error fetching character details:', err);
          });
      },
      error: (err) => {
        this.showToast('Error loading favorites. Please try again later.');
        console.error(err);
      },
    });
    this.favoritesService.loadFavorites(); // Cargar favoritos al inicializar
  }

  isFavorite(character: any): boolean {
    return this.characters.some((fav) => fav.id === character.id);
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
        this.favoritesService.loadFavorites(); // Refrescar la lista de favoritos
      },
      error: (err) => {
        console.error('Error adding favorite:', err);
        this.showToast('Error adding favorite.');
      },
    });
  }

  private removeFavorite(character: any): void {
    const favorite = this.characters.find((fav) => fav.id === character.id);
    if (!favorite) return;

    this.favoritesService.deleteFavorito(favorite.idFavorito).subscribe({
      next: () => {
        this.showToast(`${character.name} removed from favorites.`);
        this.favoritesService.loadFavorites(); // Refrescar la lista de favoritos
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

  private showToast(message: string = ''): void {
    if (message) this.toastMessage = message;
    this.isToastOpen = true;
    setTimeout(() => {
      this.isToastOpen = false;
    }, 3000);
  }
}
