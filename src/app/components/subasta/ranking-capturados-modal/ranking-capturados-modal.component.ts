import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { AuthServiceService } from 'src/app/services/auth-service.service';

@Component({
  selector: 'app-ranking-capturados-modal',
  templateUrl: './ranking-capturados-modal.component.html',
  styleUrls: ['./ranking-capturados-modal.component.scss'],
})
export class RankingCapturadosModalComponent implements OnInit {

  ranking: any[] = [];

  constructor(
    private authService: AuthServiceService,
    private modalController: ModalController
  ) { }

  ngOnInit(): void {
    this.loadRanking();
  }

  private loadRanking(): void {
    this.authService.getRankingCapturados().subscribe({
      next: (data) => {
        this.ranking = data;
      },
      error: (err) => console.error('Error al cargar el ranking de capturados:', err),
    });
  }

  closeModal(): void {
    this.modalController.dismiss();
  }

}
