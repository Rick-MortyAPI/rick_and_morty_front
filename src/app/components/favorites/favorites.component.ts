import { Component, OnInit } from '@angular/core';
import { PersonajeModalComponent } from '../personaje-modal/personaje-modal.component';
import { ModalController } from '@ionic/angular';
import { FavoritesServiceService } from 'src/app/services/favorites-service.service';
import { CharactersServiceService } from 'src/app/services/characters-service.service';
import { CapturadoService } from 'src/app/services/capturado.service';

@Component({
  selector: 'app-favorites',
  templateUrl: './favorites.component.html',
  styleUrls: ['./favorites.component.scss'],
})
export class FavoritesComponent implements OnInit {
  viewMode: 'favorites' | 'capturados' = 'favorites'; // Modo de visualización actual
  favorites: any[] = [];
  capturados: any[] = [];
  toastMessage = '';
  isToastOpen = false;

  constructor(
    private favoritesService: FavoritesServiceService,
    private charactersService: CharactersServiceService,
    private capturadoService: CapturadoService,
    private modalController: ModalController
  ) { }

  ngOnInit(): void {
    this.loadFavorites();
    this.loadCapturados();
  }

  private loadFavorites(): void {
    const currentUser = this.getCurrentUser();
    if (!currentUser) return;

    this.favoritesService.favorites$.subscribe({
      next: (favorites) => {
        const userFavorites = favorites.filter((fav) => fav.idUsuario === currentUser.id);
        const details$ = userFavorites.map((fav) =>
          this.charactersService.getCharacterById(fav.idPersonaje).toPromise()
        );

        Promise.all(details$)
          .then((characters) => {
            this.favorites = characters.map((char, idx) => ({
              ...char,
              idFavorito: userFavorites[idx].id,
            }));
          })
          .catch((err) => console.error('Error loading favorite details:', err));
      },
      error: (err) => console.error('Error loading favorites:', err),
    });

    this.favoritesService.loadFavorites();
  }

  private loadCapturados(): void {
    const currentUser = this.getCurrentUser();
    if (!currentUser) return;

    this.capturadoService.getCapturadosByUser(currentUser.id).subscribe({
      next: (capturados) => {
        const grouped = this.groupCapturados(capturados);
        const details$ = grouped.map((group) =>
          this.charactersService.getCharacterById(group.idPersonaje).toPromise().then((char) => ({
            ...char,
            quantity: group.quantity,
          }))
        );

        Promise.all(details$)
          .then((results) => {
            this.capturados = results; // Actualizar la lista de capturados
          })
          .catch((err) => console.error('Error loading capturados details:', err));
      },
      error: (err) => console.error('Error loading capturados:', err),
    });
  }

  async reloadCapturados(): Promise<void> {
    this.loadCapturados();
    this.showToast('Lista de capturados actualizada.');
  }

  async openCharacterModal(character: any): Promise<void> {
    const modal = await this.modalController.create({
      component: PersonajeModalComponent,
      componentProps: { character },
    });
    await modal.present();
  }

  toggleFavorite(favorite: any): void {
    this.favoritesService.deleteFavorito(favorite.idFavorito).subscribe({
      next: () => {
        this.favorites = this.favorites.filter((fav) => fav.idFavorito !== favorite.idFavorito);
        this.showToast(`${favorite.name} eliminado de favoritos.`);
      },
      error: (err) => console.error('Error removing favorite:', err),
    });
  }

  private groupCapturados(capturados: any[]): any[] {
    return capturados.reduce((acc: any[], curr) => {
      const existing = acc.find((item) => item.idPersonaje === curr.idPersonaje);
      if (existing) {
        existing.quantity++;
      } else {
        acc.push({ idPersonaje: curr.idPersonaje, quantity: 1 });
      }
      return acc;
    }, []);
  }

  private getCurrentUser(): any {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  private showToast(message: string): void {
    this.toastMessage = message;
    this.isToastOpen = true;
    setTimeout(() => {
      this.isToastOpen = false;
    }, 3000);
  }
}
