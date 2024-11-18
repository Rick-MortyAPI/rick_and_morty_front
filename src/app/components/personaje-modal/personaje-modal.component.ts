import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-personaje-modal',
  templateUrl: './personaje-modal.component.html',
  styleUrls: ['./personaje-modal.component.scss'],
})
export class PersonajeModalComponent {

  @Input() character: any;

  constructor( private modalController: ModalController ) {}

  dismiss() {
    this.modalController.dismiss();
  }
}
