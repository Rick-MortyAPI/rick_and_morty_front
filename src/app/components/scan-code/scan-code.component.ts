import { Component, OnInit } from '@angular/core';
import { Barcode, BarcodeScanner } from '@capacitor-mlkit/barcode-scanning';
import { AlertController, ModalController, ToastController } from '@ionic/angular';
import { FoundServiceService } from 'src/app/services/found-service.service';
import { HttpClient } from '@angular/common/http';
import { Geolocation } from '@capacitor/geolocation';
import { PersonajeModalComponent } from '../personaje-modal/personaje-modal.component';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Observable } from 'rxjs';
import { CharactersServiceService } from 'src/app/services/characters-service.service';
import { CapturadoService } from '../../services/capturado.service';


@Component({
  selector: 'app-scan-code',
  templateUrl: './scan-code.component.html',
  styleUrls: ['./scan-code.component.scss'],
})
export class ScanCodeComponent implements OnInit {

  private readonly baseUrl = 'https://rickandmortyapi.com/api/character';
  characters: any[] = [];
  capturados:  { [id: number]: any } = {};
  isSupported = false;
  barcodes: Barcode[] = [];
  location: { latitude: number; longitude: number } | undefined;
  mapUrl: SafeResourceUrl | undefined;

  constructor(
    private alertController: AlertController,
    private foundService: FoundServiceService,
    private modalController: ModalController,
    private http: HttpClient,
    private sanitizer: DomSanitizer,
    private characterServ: CharactersServiceService,
    private capturadoSer: CapturadoService,
    private toastController: ToastController,
  ) {}

  ngOnInit() {
    
    BarcodeScanner.isSupported().then((result) => {
      this.isSupported = result.supported;
    });
    
    this.foundService.found$.subscribe((found) => {
      this.characters = found;
  
      // Carga los datos de cada personaje al inicializar
      this.characters.forEach((character) => {
        this.getPersonajes(character.idPersonaje);
      });
    });
    
  }

  getPersonajes(id: number): void {
    // Verifica si ya cargaste los datos para evitar múltiples solicitudes
    if (!this.capturados[id]) {
      this.characterServ.getCharacterById(id).subscribe({
        next: (character) => {
          this.capturados[id] = character; // Almacena los datos del personaje
        },
        error: (err) => {
          console.error(`Error loading character details for ID ${id}:`, err);
        },
      });
    }
  }

  getMapUrl(character: any): SafeResourceUrl {

    const lng = character.longitud;
    const lat = character.latitud;
    const bbox = `${lng},${lat},${lng},${lat}`;
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

        const user = JSON.parse(localStorage.getItem('user') || '{}');
        await this.getLocation();

        const captura = {
          "latitud": this.location?.latitude,
          "longitud": this.location?.longitude,
          "idPersonaje": character.id,
          "idUsuario": user.id
        };

        this.capturadoSer.addCapturado(captura).subscribe(
          response => {
            console.log('Captura realizada:', response);
            this.presentToast(`${character.name} capturado correctamente!`, 'success');
          },
          error => {
            console.log(error);
            this.presentToast('Error al capturar personaje', 'danger');
          }
        );

        this.foundService.addFound(character);

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

  async presentToast(message: string, color: string) {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      color,
      position: 'top'
    });
    await toast.present();
  }
}
