import { trigger, transition, style, animate, keyframes } from '@angular/animations';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthServiceService } from 'src/app/services/auth-service.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  animations: [
    trigger('fadeAnimation', [
      transition(':enter', [
        style({ opacity: 0 }),  // Estado inicial
        animate('200ms ease-in', style({ opacity: 1 }))  // Estado final
      ]),
      transition(':leave', [
        animate('200ms ease-out', style({ opacity: 0 }))  // Estado de salida
      ])
    ])
  ]
})
export class HomePage implements OnInit {
  

  isLogin: boolean = true;

  constructor(
    private authService: AuthServiceService, 
    private router: Router) 
    { }

  ngOnInit() {
    this.authService.isLoggedIn().subscribe(isAuthenticated => {
      if (isAuthenticated) {
        // Si está autenticado, redirige a las tabs
        this.router.navigate(['/tabs']);
      }
    });
  }

  toggleForm() {
    this.isLogin = !this.isLogin;
  }

}
