import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-personaje-modal',
  templateUrl: './personaje-modal.component.html',
  styleUrls: ['./personaje-modal.component.scss'],
})
export class PersonajeModalComponent  implements OnInit {

  @Input() character: any;

  constructor( private modalController: ModalController ) {}

  ngOnInit(): void {}

  dismiss() {
    this.modalController.dismiss();
  }
}
