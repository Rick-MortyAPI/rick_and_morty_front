import { Component, OnInit } from '@angular/core';
import { Barcode, BarcodeScanner } from '@capacitor-mlkit/barcode-scanning';
import { AlertController, ModalController } from '@ionic/angular';
import { FoundServiceService } from 'src/app/services/found-service.service';
import { HttpClient } from '@angular/common/http';
import { Geolocation } from '@capacitor/geolocation';
import { PersonajeModalComponent } from '../personaje-modal/personaje-modal.component';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';


@Component({
  selector: 'app-scan-code',
  templateUrl: './scan-code.component.html',
  styleUrls: ['./scan-code.component.scss'],
})
export class ScanCodeComponent implements OnInit {
  characters: any[] = [];
  isSupported = false;
  barcodes: Barcode[] = [];
  location: { latitude: number; longitude: number } | undefined;
  mapUrl: SafeResourceUrl | undefined;

  constructor(
    private alertController: AlertController,
    private foundService: FoundServiceService,
    private modalController: ModalController,
    private http: HttpClient,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit() {
    
    BarcodeScanner.isSupported().then((result) => {
      this.isSupported = result.supported;
    });
    
    this.foundService.found$.subscribe(found => {
      this.characters = found;
    });
    
  }

  getMapUrl(character: any): SafeResourceUrl {
    const lng = character.ubicacion.lng;
    const lat = character.ubicacion.lat;
    const bbox = `${lng - 0.01},${lat - 0.01},${lng + 0.01},${lat + 0.01}`;
    const url = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat},${lng}`;
    
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
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


  private fetchCharacterData(endpoint: string): void {

    this.http.get(endpoint).subscribe(
      async (character: any) => {

        if (this.foundService.isFound(character.id)) {
          const alert = await this.alertController.create({
            header: 'Personaje ya encontrado',
            message: 'El personaje ya está en tu lista.',
            buttons: ['OK'],
          });
          await alert.present();
          return;
        }

        await this.getLocation();

        character.ubicacion = {
          lat: this.location?.latitude,
          lng: this.location?.longitude
        };

        this.foundService.addFound(character);

        const successAlert = await this.alertController.create({
          header: 'Personaje Encontrado',
          message: `Se encontró al personaje: ${character.name}`,
          buttons: ['OK'],
        });

        await successAlert.present();

      },
      (error) => {
        console.error("Error fetching character data:", error);
        this.alertController.create({
          header: 'Error',
          message: 'No se pudo obtener los datos del personaje.',
          buttons: ['OK'],
        }).then(alert => alert.present());
      }
    );
  }

  private async getLocation(): Promise<void> {
    try {
      const position = await Geolocation.getCurrentPosition(); 
      this.location = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude
      };
    } catch (error) {
      console.error("Error getting location:", error);
      this.location = undefined;
    }
  }

  async openCharacterModal(character: any) {
    const modal = await this.modalController.create({
      component: PersonajeModalComponent,
      componentProps: {
        character: character
      }
    });
    return await modal.present();
  }
}
