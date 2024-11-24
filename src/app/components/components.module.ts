import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PersonajesComponent } from './personajes/personajes.component';
import { LugaresComponent } from './lugares/lugares.component';
import { IonicModule } from '@ionic/angular';
import { FavoritesComponent } from './favorites/favorites.component';
import { PersonajeModalComponent } from './personaje-modal/personaje-modal.component';
import { FormsModule } from '@angular/forms';
import { ScanCodeComponent } from './scan-code/scan-code.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { SubastaComponent } from './subasta/subasta.component';
import { CreateSubastaModalComponent } from './subasta/create-subasta-modal/create-subasta-modal.component';
import { SubastaModalComponent } from './subasta/subasta-modal/subasta-modal.component';
import { RankingCapturadosModalComponent } from './subasta/ranking-capturados-modal/ranking-capturados-modal.component';
import { RankingIntercambiosModalComponent } from './subasta/ranking-intercambios-modal/ranking-intercambios-modal.component';
import { HistorialSubastasModalComponent } from './subasta/historial-subastas-modal/historial-subastas-modal.component';


@NgModule({
  declarations: [ 
    PersonajesComponent,
    LugaresComponent,
    FavoritesComponent,
    PersonajeModalComponent,
    SubastaComponent,
    CreateSubastaModalComponent,
    SubastaModalComponent,
    ScanCodeComponent,
    LoginComponent,
    RegisterComponent,
    RankingCapturadosModalComponent,
    RankingIntercambiosModalComponent,
    HistorialSubastasModalComponent
  ],
  imports: [
    CommonModule,
    IonicModule.forRoot(),
    FormsModule
  ],
  exports: [
    PersonajesComponent,
    LugaresComponent,
    FavoritesComponent,
    PersonajeModalComponent,
    CreateSubastaModalComponent,
    SubastaModalComponent,
    SubastaComponent,
    ScanCodeComponent,
    LoginComponent,
    RegisterComponent,
    RankingCapturadosModalComponent,
    RankingIntercambiosModalComponent,
    HistorialSubastasModalComponent
  ]
})
export class ComponentsModule { }
