import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { PersonajeModalComponent } from 'src/app/components/personaje-modal/personaje-modal.component';
import { CharactersServiceService } from 'src/app/services/characters-service.service';
import { FavoritesServiceService } from 'src/app/services/favorites-service.service';

@Component({
  selector: 'app-pagina1',
  templateUrl: './pagina1.page.html',
  styleUrls: ['./pagina1.page.scss'],
})
export class Pagina1Page implements OnInit {

  constructor() {}

  ngOnInit() {
  }

}
