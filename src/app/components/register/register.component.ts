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
    private router: Router // Inyectar Router
  ) {}

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

    const numIntercambios = 0; // Valor predeterminado
    const numCapturados = 0; // Valor predeterminado

    // Envía los datos al servicio de registro
    this.authService.register(this.nombre, this.apellido, this.email, this.contrasenia, numIntercambios, numCapturados).subscribe(
      response => {
        this.presentToast('Registro exitoso', 'success');
        this.router.navigate(['/tabs']); // Redirige a las tabs después del registro
      },
      error => {
        const errorMessage = error.error?.error || 'Error al registrarse'; 
        this.presentToast(errorMessage, 'danger');
      }
    );
  }
}
