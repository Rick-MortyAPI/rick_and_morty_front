import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { CapturadoService } from 'src/app/services/capturado.service';
import { CharactersServiceService } from 'src/app/services/characters-service.service';
import { SubastaService } from 'src/app/services/subasta.service';

@Component({
  selector: 'app-subasta-modal',
  templateUrl: './subasta-modal.component.html',
  styleUrls: ['./subasta-modal.component.scss'],
})
export class SubastaModalComponent implements OnInit {

  @Input() subasta: any; // Subasta actual
  personajesCapturados: any[] = []; // Lista de personajes capturados disponibles
  selectedPersonaje: any = null; // Personaje seleccionado para el intercambio

  constructor(
    private modalController: ModalController,
    private subastaService: SubastaService,
    private capturadoService: CapturadoService,
    private characterService: CharactersServiceService
  ) { }

  ngOnInit(): void {
    this.loadSubastaDetails();
    this.loadPersonajesCapturados();
  }

  /**
   * Cargar los detalles del personaje de la subasta.
   */
  private loadSubastaDetails(): void {
    this.characterService.getCharacterById(this.subasta.capturado.idPersonaje).subscribe({
      next: (character) => {
        this.subasta.personajeNombre = character.name;
        this.subasta.personajeImagen = character.image;
      },
      error: (err) => {
        console.error('Error loading subasta character details:', err);
        this.subasta.personajeNombre = 'Desconocido';
        this.subasta.personajeImagen = 'assets/placeholder.png'; // Imagen predeterminada
      },
    });
  }

  /**
   * Cargar los personajes capturados del usuario actual.
   */
  private loadPersonajesCapturados(): void {
    const user = localStorage.getItem('user');
    const currentUser = user ? JSON.parse(user) : null;

    if (!currentUser || !currentUser.id) {
      console.error('Error: Usuario no autenticado.');
      return;
    }

    this.capturadoService.getCapturadosByUser(currentUser.id).subscribe({
      next: (capturados) => {
        const capturadosWithDetails = capturados.map((capturado: any) =>
          this.characterService.getCharacterById(capturado.idPersonaje).toPromise().then((character) => ({
            id: capturado.id,
            idUsuario: capturado.idUsuario,
            nombre: character.name,
            imagen: character.image,
          }))
        );

        Promise.all(capturadosWithDetails)
          .then((results) => {
            this.personajesCapturados = results;
          })
          .catch((err) => console.error('Error loading character details:', err));
      },
      error: (err) => console.error('Error loading capturados:', err),
    });
  }

  /**
   * Seleccionar un personaje para el intercambio.
   * @param personaje Personaje seleccionado
   */
  selectPersonaje(personaje: any): void {
    this.selectedPersonaje = personaje;
  }

  /**
   * Confirmar el intercambio con el personaje seleccionado.
   */
  confirmExchange(): void {
    if (!this.selectedPersonaje) {
      console.error('Error: No se ha seleccionado un personaje para el intercambio.');
      return;
    }

    const exchangeData = {
      subastaId: this.subasta.id,
      userId: this.selectedPersonaje.idUsuario,
      idPersonajeIntercambio: this.selectedPersonaje.id,
    };

    this.subastaService.confirmSubasta(exchangeData).subscribe({
      next: () => {
        console.log('Intercambio confirmado.');
        this.modalController.dismiss({ success: true });
      },
      error: (err) => {
        console.error('Error confirming exchange:', err);
      },
    });
  }

  /**
   * Cerrar el modal.
   */
  dismiss(): void {
    this.modalController.dismiss();
  }

}
