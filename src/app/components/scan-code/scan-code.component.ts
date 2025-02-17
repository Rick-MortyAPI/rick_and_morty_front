import { Component, OnInit } from '@angular/core';
import { Barcode, BarcodeScanner } from '@capacitor-mlkit/barcode-scanning';
import { AlertController, ModalController, ToastController } from '@ionic/angular';
import { FoundServiceService } from 'src/app/services/found-service.service';
import { HttpClient } from '@angular/common/http';
import { Geolocation } from '@capacitor/geolocation';
import { PersonajeModalComponent } from '../personaje-modal/personaje-modal.component';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { CharactersServiceService } from 'src/app/services/characters-service.service';
import { CapturadoService } from '../../services/capturado.service';


@Component({
  selector: 'app-scan-code',
  templateUrl: './scan-code.component.html',
  styleUrls: ['./scan-code.component.scss'],
})
export class ScanCodeComponent implements OnInit {

  characters: any[] = [];
  capturados:  { [id: number]: any } = {};
  isSupported = false;
  barcodes: Barcode[] = [];
  mapUrl: SafeResourceUrl | undefined;

  constructor(
    private alertController: AlertController,
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
    
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    this.capturadoSer.getCapturadosByUser(user.id).subscribe((capturados) => {
      this.characters = capturados;

      // Cargar detalles de los personajes si es necesario
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
        
        const position = await Geolocation.getCurrentPosition(); 

        const captura = {
          latitud: position.coords.latitude,
          longitud: position.coords.longitude,
          idPersonaje: character.id,
          idUsuario: user.id,
        };

        this.capturadoSer.addCapturado(captura).subscribe(
          () => {
            this.presentToast(`${character.name} capturado correctamente!`, 'success');

            // Recargar capturados desde el backend
            this.capturadoSer.loadCapturados();

            // Actualizar la lista local
            this.capturadoSer.getCapturadosByUser(user.id).subscribe((capturados) => {
              this.characters = capturados;

              // Opcional: cargar detalles de los personajes
              this.characters.forEach((char) => this.getPersonajes(char.idPersonaje));
            });
          },
          (error) => {
            console.error('Error al capturar personaje:', error);
            this.presentToast('Error al capturar personaje', 'danger');
          }
        );
      },
      (error) => {
        console.error('Error fetching character data:', error);
        this.alertController.create({
          header: 'Error',
          message: 'No se pudo obtener los datos del personaje.',
          buttons: ['OK'],
        }).then((alert) => alert.present());
      }
    );
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
