import { Component, EventEmitter, Output } from '@angular/core';
import { AuthServiceService } from 'src/app/services/auth-service.service';
import { ToastController } from '@ionic/angular';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  @Output() switchToRegister = new EventEmitter<void>();

  email: string = '';
  contrasenia: string = '';

  constructor(
    private authService: AuthServiceService,
    private toastController: ToastController,
    private router: Router
  ) { }

  emitSwitchToRegister() {
    this.switchToRegister.emit();
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

  onLogin() {
    this.authService.login(this.email, this.contrasenia).subscribe(
      loggedIn => {
        if (loggedIn) {
          this.presentToast('Inicio de sesión exitoso', 'success');
          this.router.navigate(['/tabs']);
        } else {
          this.presentToast('Credenciales inválidas', 'danger');
        }
      },
      error => {
        this.presentToast('Error al intentar iniciar sesión', 'danger');
      }
    );
  }
}
