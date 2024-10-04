import { Component, OnInit } from '@angular/core';
import { Barcode, BarcodeScanner } from '@capacitor-mlkit/barcode-scanning';
import { AlertController } from '@ionic/angular';
import { FoundServiceService } from 'src/app/services/found-service.service';
import { HttpClient } from '@angular/common/http';
import { Geolocation } from '@capacitor/geolocation'; // Asegúrate de importar Geolocation

@Component({
  selector: 'app-scan-code',
  templateUrl: './scan-code.component.html',
  styleUrls: ['./scan-code.component.scss'],
})
export class ScanCodeComponent implements OnInit {
  characters: any[] = [];
  isSupported = false;
  barcodes: Barcode[] = [];
  location: { latitude: number; longitude: number } | undefined; // Definimos la propiedad location

  constructor(
    private alertController: AlertController,
    private foundService: FoundServiceService,
    private http: HttpClient
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
      async (character: any) => {
        // Verificamos si el personaje ya está almacenado
        if (this.foundService.isFound(character.id)) {
          this.alertController.create({
            header: 'Personaje ya existe',
            message: 'El personaje ya está en tu lista.',
            buttons: ['OK'],
          }).then(alert => alert.present());
          return; // Salimos del método si el personaje ya existe
        }

        // Obtenemos la ubicación del personaje
        await this.getLocation();

        // Asignamos la ubicación al personaje
        character.ubicacion = {
          lat: this.location?.latitude,
          lng: this.location?.longitude
        };

        // Si el personaje no existe, lo guardamos
        this.foundService.addFound(character);
        this.alertController.create({
          header: 'Character Found',
          message: `Se encontró al personaje: ${character.name}`,
          buttons: ['OK'],
        }).then(alert => alert.present());
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
}
