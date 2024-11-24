import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { AuthServiceService } from 'src/app/services/auth-service.service';
import { SubastaService } from 'src/app/services/subasta.service';

@Component({
  selector: 'app-ranking-intercambios-modal',
  templateUrl: './ranking-intercambios-modal.component.html',
  styleUrls: ['./ranking-intercambios-modal.component.scss'],
})
export class RankingIntercambiosModalComponent implements OnInit {
  ranking: any[] = [];

  constructor(
    private authService: AuthServiceService,
    private modalController: ModalController
  ) { }

  ngOnInit(): void {
    this.loadRanking();
  }

  private loadRanking(): void {
    this.authService.getRankingIntercambios().subscribe({
      next: (data) => {
        this.ranking = data;
      },
      error: (err) => console.error('Error al cargar el ranking de intercambios:', err),
    });
  }

  closeModal(): void {
    this.modalController.dismiss();
  }
}
