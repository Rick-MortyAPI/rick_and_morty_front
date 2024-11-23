import { Component, EventEmitter, Output } from '@angular/core';
import { AuthServiceService } from 'src/app/services/auth-service.service';
import { ToastController } from '@ionic/angular';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent {
  @Output() switchToLogin = new EventEmitter<void>();

  nombre: string = '';
  apellido: string = '';
  email: string = '';
  contrasenia: string = '';

  constructor(
    private authService: AuthServiceService,
    private toastController: ToastController,
    private router: Router
  ) { }

  emitSwitchToLogin() {
    this.switchToLogin.emit();
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

  onRegister() {
    if (!this.nombre || !this.apellido || !this.email || !this.contrasenia) {
      this.presentToast('Por favor, completa todos los campos.', 'danger');
      return; // Detener la ejecución si hay campos vacíos
    }

    this.authService.register(this.nombre, this.apellido, this.email, this.contrasenia).subscribe(
      registered => {
        console.log('Valor recibido en registered:', registered);
        if (registered) {
          this.presentToast('Registro exitoso', 'success');
          this.router.navigate(['/tabs']); // Redirige a las tabs
        } else {
          this.presentToast('Uusario ya existente', 'danger');
          console.log("Mierda")
        }
      },
      error => {
        this.presentToast(error.error, 'danger');
      }
    );
  }
}
