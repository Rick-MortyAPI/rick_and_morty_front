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
  currentPage: number = 1;
  isLoading: boolean = false;
  toastMessage: string = '';
  isToastOpen: boolean = false;

  constructor( 
    private charactersServiceService: CharactersServiceService,
    private modalController: ModalController,
    private favoritesService: FavoritesServiceService
  ) {}

  ngOnInit(): void {
    this.loadCharacters();
  }

  loadCharacters(event?: InfiniteScrollCustomEvent) {
    if (this.isLoading) return;
    this.isLoading = true;

    this.charactersServiceService.getCharactersByPage(this.currentPage).subscribe(
      (data) => {
        this.characters = [...this.characters, ...data];
        this.currentPage++;
        this.isLoading = false;
        if (event) {
          event.target.complete();
        }
      },
      (error) => {
        console.error('Error fetching characters:', error);
        this.isLoading = false;
        if (event) {
          event.target.complete();
        }
      }
    );
  }

  onIonInfinite(event: InfiniteScrollCustomEvent) {
    this.loadCharacters(event);
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
  
}
