import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthServiceService } from 'src/app/services/auth-service.service';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss']
})
export class TabsPage {

  nombre: string;
  
  constructor(
    private authService: AuthServiceService,
    private router: Router
  ) { 
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    this.nombre = user.nombre || 'Usuario'; 
  }

  logout() {
    this.authService.logout(); // Llama al método de logout en el servicio
    this.router.navigate(['/']); // Redirige a la página de inicio
  }

}
