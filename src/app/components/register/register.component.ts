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
  isRegistering: boolean = false;


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
    if (this.isRegistering) return; // Si ya se está procesando, no hacer nada
  
    if (!this.nombre || !this.apellido || !this.email || !this.contrasenia) {
      this.presentToast('Por favor, completa todos los campos.', 'danger');
      return; // Detener la ejecución si hay campos vacíos
    }
  
    this.isRegistering = true; // Bloquear mientras se procesa el registro
  
    this.authService.register(this.nombre, this.apellido, this.email, this.contrasenia).subscribe(
      registered => {
        this.isRegistering = false; // Liberar el bloqueo
  
        if (registered) {
          this.presentToast('Registro exitoso', 'success');
          this.router.navigate(['/tabs']); // Redirige a las tabs
        } else {
          this.presentToast('El usuario ya existe o hubo un problema.', 'danger');
        }
      },
      error => {
        this.isRegistering = false; // Liberar el bloqueo incluso si ocurre un error
        this.presentToast('Error al registrarse. Inténtalo de nuevo.', 'danger');
        console.error('Error en registro:', error);
      }
    );
  }
}
