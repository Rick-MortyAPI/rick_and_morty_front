import { Component, OnInit } from '@angular/core';
import { PersonajeModalComponent } from '../personaje-modal/personaje-modal.component';
import { ModalController } from '@ionic/angular';
import { FavoritesServiceService } from 'src/app/services/favorites-service.service';

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
    private favoritesService: FavoritesServiceService
  ) {}

  ngOnInit() {
    this.favoritesService.favorites$.subscribe(favorites => {
      this.characters = favorites;
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
    }

    this.isToastOpen = true;

    setTimeout(() => {
      this.isToastOpen = false;
    }, 3000);
  }
}
