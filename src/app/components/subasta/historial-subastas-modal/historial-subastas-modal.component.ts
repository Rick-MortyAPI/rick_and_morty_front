import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-historial-subastas-modal',
  templateUrl: './historial-subastas-modal.component.html',
  styleUrls: ['./historial-subastas-modal.component.scss'],
})
export class HistorialSubastasModalComponent {

  @Input() historialSubastas: any[] = [];

  constructor(private modalController: ModalController) { }

  closeModal(): void {
    this.modalController.dismiss();
  }
}
