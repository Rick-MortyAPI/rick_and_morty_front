import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { SubastaService } from 'src/app/services/subasta.service';
import { CreateSubastaModalComponent } from './create-subasta-modal/create-subasta-modal.component';
import { SubastaModalComponent } from './subasta-modal/subasta-modal.component';
import { CharactersServiceService } from 'src/app/services/characters-service.service';

@Component({
  selector: 'app-subasta',
  templateUrl: './subasta.component.html',
  styleUrls: ['./subasta.component.scss'],
})
export class SubastaComponent implements OnInit {
  subastas: any[] = [];
  currentUser: any = null;

  constructor(
    private subastaService: SubastaService,
    private modalController: ModalController,
    private characterService: CharactersServiceService
  ) { }

  ngOnInit(): void {
    this.loadCurrentUser();
    this.loadSubastas();
  }

  /**
   * Cargar el usuario autenticado desde localStorage
   */
  private loadCurrentUser(): void {
    const user = localStorage.getItem('user');
    this.currentUser = user ? JSON.parse(user) : null;
  }

  /**
   * Cargar subastas desde la API y completar detalles del personaje
   */
  loadSubastas(): void {
    this.subastaService.getAllSubastas().subscribe({
      next: (data) => {
        this.subastas = data;

        // Cargar información adicional del personaje para cada subasta
        this.subastas.forEach((subasta) => {
          // Asignar información del usuario directamente
          subasta.usuario = `${subasta.capturado.usuario.nombre} ${subasta.capturado.usuario.apellido}`;

          // Obtener detalles del personaje
          this.characterService.getCharacterById(subasta.capturado.idPersonaje).subscribe({
            next: (character) => {
              subasta.personajeName = character.name;
              subasta.personajeImage = character.image;
            },
            error: (err) => {
              console.error(`Error loading character details for ID ${subasta.capturado.idPersonaje}:`, err);
              subasta.personajeName = 'Desconocido';
              subasta.personajeImage = 'assets/placeholder.png'; // Imagen predeterminada
            },
          });
        });
      },
      error: (err) => console.error('Error loading subastas:', err),
    });
  }

  /**
   * Verificar si la subasta pertenece al usuario actual
   * @param subasta Subasta a verificar
   * @returns boolean
   */
  isOwnSubasta(subasta: any): boolean {
    return this.currentUser && this.currentUser.id === subasta.capturado.usuario.id;
  }

  /**
   * Abrir modal para crear una nueva subasta
   */
  async openCreateSubastaModal(): Promise<void> {
    const modal = await this.modalController.create({
      component: CreateSubastaModalComponent,
    });

    modal.onDidDismiss().then(() => this.loadSubastas());
    await modal.present();
  }

  /**
   * Abrir modal para confirmar una subasta
   * @param subasta Subasta seleccionada
   */
  async openSubastaModal(subasta: any): Promise<void> {
    const modal = await this.modalController.create({
      component: SubastaModalComponent,
      componentProps: { subasta },
    });

    modal.onDidDismiss().then(() => this.loadSubastas());
    await modal.present();
  }
}
