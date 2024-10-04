import { Component, OnInit } from '@angular/core';
import { Barcode, BarcodeScanner } from '@capacitor-mlkit/barcode-scanning';
import { AlertController } from '@ionic/angular';
import { FoundServiceService } from 'src/app/services/found-service.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-scan-code',
  templateUrl: './scan-code.component.html',
  styleUrls: ['./scan-code.component.scss'],
})
export class ScanCodeComponent implements OnInit {
  characters: any[] = [];
  isSupported = false;
  barcodes: Barcode[] = [];

  constructor(
    private alertController: AlertController,
    private foundService: FoundServiceService,
    private http: HttpClient // Importamos HttpClient
  ) {}

  ngOnInit() {
    BarcodeScanner.isSupported().then((result) => {
      this.isSupported = result.supported;
    });

    this.foundService.found$.subscribe(found => {
      this.characters = found;
    });
  }

  async scan(): Promise<void> {
    const granted = await this.requestPermissions();
    if (!granted) {
      this.presentAlert();
      return;
    }
    
    try {
      const { barcodes } = await BarcodeScanner.scan();
      if (barcodes.length > 0) {
        // Suponiendo que el código QR contiene la URL del endpoint
        const qrCodeData = barcodes[0].rawValue;
        this.fetchCharacterData(qrCodeData);
      }
    } catch (error) {
      console.error("Error scanning:", error);
      const alert = await this.alertController.create({
        header: 'Error',
        message: 'No se pudo abrir la cámara.',
        buttons: ['OK'],
      });
      await alert.present();
    }
  }

  async requestPermissions(): Promise<boolean> {
    const { camera } = await BarcodeScanner.requestPermissions();
    return camera === 'granted' || camera === 'limited';
  }

  async presentAlert(): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Permission denied',
      message: 'Please grant camera permission to use the barcode scanner.',
      buttons: ['OK'],
    });
    await alert.present();
  }

  // Método para obtener los datos del personaje desde el endpoint
  private fetchCharacterData(endpoint: string): void {
    this.http.get(endpoint).subscribe(
      (character: any) => {
        // Guardamos el personaje en el localStorage
        this.foundService.addFound(character);
        const alert = this.alertController.create({
          header: 'Character Found',
          message: `Se encontró al personaje: ${character.name}`,
          buttons: ['OK'],
        });
        alert.then(a => a.present());
      },
      (error) => {
        console.error("Error fetching character data:", error);
        this.alertController.create({
          header: 'Error',
          message: 'No se pudo obtener los datos del personaje.',
          buttons: ['OK'],
        }).then(a => a.present());
      }
    );
  }
}
