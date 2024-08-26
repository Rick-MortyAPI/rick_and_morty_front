import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PersonajesComponent } from './personajes/personajes.component';
import { LugaresComponent } from './lugares/lugares.component';
import { IonicModule } from '@ionic/angular';
import { FavoritesComponent } from './favorites/favorites.component';
import { PersonajeModalComponent } from './personaje-modal/personaje-modal.component';


@NgModule({
  declarations: [ 
    PersonajesComponent,
    LugaresComponent,
    FavoritesComponent,
    PersonajeModalComponent
  ],
  imports: [
    CommonModule,
    IonicModule,
  ],
  exports: [
    PersonajesComponent,
    LugaresComponent,
    FavoritesComponent,
    PersonajeModalComponent
  ]
})
export class ComponentsModule { }
