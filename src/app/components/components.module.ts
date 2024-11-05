import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PersonajesComponent } from './personajes/personajes.component';
import { LugaresComponent } from './lugares/lugares.component';
import { IonicModule } from '@ionic/angular';
import { FavoritesComponent } from './favorites/favorites.component';
import { PersonajeModalComponent } from './personaje-modal/personaje-modal.component';
import { SearchComponent } from './search/search.component';
import { FormsModule } from '@angular/forms';
import { ScanCodeComponent } from './scan-code/scan-code.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';


@NgModule({
  declarations: [ 
    PersonajesComponent,
    LugaresComponent,
    FavoritesComponent,
    PersonajeModalComponent,
    SearchComponent,
    ScanCodeComponent,
    LoginComponent,
    RegisterComponent
  ],
  imports: [
    CommonModule,
    IonicModule,
    FormsModule
  ],
  exports: [
    PersonajesComponent,
    LugaresComponent,
    FavoritesComponent,
    PersonajeModalComponent,
    SearchComponent,
    ScanCodeComponent,
    LoginComponent,
    RegisterComponent
  ]
})
export class ComponentsModule { }
