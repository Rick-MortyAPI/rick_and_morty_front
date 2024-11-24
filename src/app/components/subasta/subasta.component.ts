import { Component, OnInit } from '@angular/core';
import { ModalController, ToastController } from '@ionic/angular';
import { SubastaService } from 'src/app/services/subasta.service';
import { CharactersServiceService } from 'src/app/services/characters-service.service';
import { CreateSubastaModalComponent } from './create-subasta-modal/create-subasta-modal.component';
import { RankingCapturadosModalComponent } from './ranking-capturados-modal/ranking-capturados-modal.component';
import { RankingIntercambiosModalComponent } from './ranking-intercambios-modal/ranking-intercambios-modal.component';
import { HistorialSubastasModalComponent } from './historial-subastas-modal/historial-subastas-modal.component';
import { SubastaModalComponent } from './subasta-modal/subasta-modal.component';
import { CapturadoService } from 'src/app/services/capturado.service';

@Component({
  selector: 'app-subasta',
  templateUrl: './subasta.component.html',
  styleUrls: ['./subasta.component.scss'],
})
export class SubastaComponent implements OnInit {
  subastas: any[] = [];
  availableSubastas: any[] = [];
  currentUser: any = null;

  constructor(
    private subastaService: SubastaService,
    private capturadoService: CapturadoService,
    private modalController: ModalController,
    private characterService: CharactersServiceService,
    private toastController: ToastController // Importar ToastController
  ) { }

  ngOnInit(): void {
    this.loadCurrentUser();
    this.subastaService.subastas$.subscribe({
      next: (data) => {
        this.subastas = data;
        this.filterAvailableSubastas();
        this.loadCharacterDetails();
      },
      error: (err) => console.error('Error en la suscripción a subastas:', err),
    });

    this.reloadSubastas();
  }

  private loadCurrentUser(): void {
    const user = localStorage.getItem('user');
    this.currentUser = user ? JSON.parse(user) : null;
  }

  async reloadSubastas(): Promise<void> {
    this.subastaService.loadSubastas();
    this.filterAvailableSubastas();
    await this.showToast('Subastas recargadas con éxito'); // Mostrar el toast
  }

  private async showToast(message: string): Promise<void> {
    const toast = await this.toastController.create({
      message,
      duration: 2000, // Duración del toast en milisegundos
      position: 'bottom', // Posición del toast
      color: 'success', // Color del toast
    });
    await toast.present();
  }

  private loadCharacterDetails(): void {
    this.subastas.forEach((subasta) => {
      subasta.usuario = `${subasta.capturado.usuario.nombre} ${subasta.capturado.usuario.apellido}`;
      this.characterService.getCharacterById(subasta.capturado.idPersonaje).subscribe({
        next: (character) => {
          subasta.personajeName = character.name;
          subasta.personajeImage = character.image;
        },
        error: (err) => {
          console.error(`Error loading character details for ID ${subasta.capturado.idPersonaje}:`, err);
          subasta.personajeName = 'Desconocido';
          subasta.personajeImage = 'assets/placeholder.png';
        },
      });
    });
  }

  private filterAvailableSubastas(): void {
    this.availableSubastas = this.subastas.filter(
      (subasta) => subasta.estado === 'Disponible'
    );
  }

  async openCreateSubastaModal(): Promise<void> {
    const modal = await this.modalController.create({
      component: CreateSubastaModalComponent,
    });

    modal.onDidDismiss().then(() => this.reloadSubastas());
    await modal.present();
  }

  async openSubastaModal(subasta: any): Promise<void> {
    const modal = await this.modalController.create({
      component: SubastaModalComponent,
      componentProps: { subasta },
    });

    modal.onDidDismiss().then((result) => {
      if (result.data && result.data.intercambioRealizado) {
        this.reloadSubastas(); // Recargar subastas
        this.updateCapturados(); // Actualizar capturados
      }
    });

    await modal.present();
  }

  private updateCapturados(): void {
    this.capturadoService.loadCapturados(); // Llama al método para recargar los capturados
  }

  async openRankingIntercambios(): Promise<void> {
    const modal = await this.modalController.create({
      component: RankingIntercambiosModalComponent,
    });

    await modal.present();
  }

  async openRankingCapturados(): Promise<void> {
    const modal = await this.modalController.create({
      component: RankingCapturadosModalComponent,
    });

    await modal.present();
  }

  async openHistorialSubastas(): Promise<void> {
    const modal = await this.modalController.create({
      component: HistorialSubastasModalComponent,
      componentProps: { historialSubastas: this.subastas.filter((s) => s.estado === 'Completado') },
    });

    await modal.present();
  }

  trackBySubasta(index: number, subasta: any): number {
    return subasta.id;
  }

  isOwnSubasta(subasta: any): boolean {
    return this.currentUser && subasta.capturado.usuario.id === this.currentUser.id;
  }
}
