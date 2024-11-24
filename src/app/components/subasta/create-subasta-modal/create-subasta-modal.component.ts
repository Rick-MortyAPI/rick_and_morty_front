import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { forkJoin, map } from 'rxjs';
import { CapturadoService } from 'src/app/services/capturado.service';
import { CharactersServiceService } from 'src/app/services/characters-service.service';
import { SubastaService } from 'src/app/services/subasta.service';

@Component({
  selector: 'app-create-subasta-modal',
  templateUrl: './create-subasta-modal.component.html',
  styleUrls: ['./create-subasta-modal.component.scss'],
})
export class CreateSubastaModalComponent implements OnInit {
  personajesCapturados: any[] = [];
  personajesSubastadosIds: number[] = [];
  subasta: any = {
    idCapturado: null,
    horaInicial: '',
    horaFinal: '',
  };

  constructor(
    private modalController: ModalController,
    private subastaService: SubastaService,
    private capturadoService: CapturadoService,
    private charactersService: CharactersServiceService
  ) { }

  ngOnInit(): void {
    this.initializeSubastaDates();
    this.loadPersonajesCapturados();
    this.loadSubastados();
  }

  /**
   * Inicializar las fechas de la subasta
   */
  private initializeSubastaDates(): void {
    const now = new Date();
    const later = new Date(now);
    later.setHours(now.getHours() + 24);

    this.subasta.horaInicial = now.toISOString();
    this.subasta.horaFinal = later.toISOString();
  }

  /**
   * Cargar personajes capturados del usuario
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
        if (!capturados || capturados.length === 0) {
          console.warn('No se encontraron personajes capturados para el usuario.');
          this.personajesCapturados = [];
          return;
        }

        // Solicitar los detalles de cada personaje capturado
        const capturadosRequests = capturados.map((capturado: any) =>
          this.charactersService.getCharacterById(capturado.idPersonaje).pipe(
            map((character) => ({
              id: capturado.id,
              nombrePersonaje: character.name || 'Desconocido',
              imagen: character.image || 'assets/placeholder.png',
            }))
          )
        );

        // Ejecuta todas las solicitudes en paralelo
        forkJoin(capturadosRequests).subscribe({
          next: (results) => {
            this.personajesCapturados = results;
            console.log('Personajes capturados cargados:', this.personajesCapturados);
          },
          error: (err) => {
            console.error('Error al cargar los detalles de los personajes:', err);
          },
        });
      },
      error: (err) => {
        console.error('Error al cargar capturados:', err);
      },
    });
  }


  /**
   * Cargar IDs de personajes ya subastados con estado "Disponible"
   */
  private loadSubastados(): void {
    this.subastaService.subastas$.subscribe({
      next: (subastas) => {
        // Filtrar subastas con estado "Disponible"
        this.personajesSubastadosIds = subastas
          .filter((subasta) => subasta.estado === 'Disponible')
          .map((subasta) => subasta.idCapturado);
      },
      error: (err) => console.error('Error loading subastas:', err),
    });
  }

  /**
   * Verificar si un personaje ya está subastado con estado "Disponible"
   */
  isSubastado(capturadoId: number): boolean {
    return this.personajesSubastadosIds.includes(capturadoId);
  }

  /**
   * Crear una nueva subasta
   */
  createSubasta(): void {
    if (!this.subasta.idCapturado) {
      console.error('Error: Faltan datos para crear la subasta.');
      return;
    }

    this.subastaService.createSubasta(this.subasta).subscribe({
      next: () => {
        console.log('Subasta creada exitosamente.');
        this.closeModal(true);
      },
      error: (err) => console.error('Error creando subasta:', err),
    });
  }

  /**
   * Cerrar el modal
   */
  closeModal(data: any = null): void {
    this.modalController.dismiss(data);
  }
}
