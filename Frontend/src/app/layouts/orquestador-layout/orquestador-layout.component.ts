import { Component } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

/**SERVICIOS */
import { AuthService } from '../../services/auth/auth.service';

/**MENSAJE DE ALERTA */
import Swal from 'sweetalert2';

@Component({
  selector: 'app-orquestador-layout',
  templateUrl: './orquestador-layout.component.html',
  styleUrls: ['./orquestador-layout.component.css']
})
export class OrquestadorLayoutComponent {

  currentRoute: string = '';
  token: string | null = '';
  rolOrquestador: string | null = '';

  constructor(

    private router: Router,
    private _aService: AuthService

  ) {

    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.currentRoute = this.router.url;
      });

  }

  ngOnInit(): void {

    this.token = sessionStorage.getItem('tokenOrquestador') ?? '';
    this.rolOrquestador = sessionStorage.getItem('rolOrquestador') ?? '';

  }

  esAdministrador(): boolean {
    return this.rolOrquestador === 'ADMINISTRADOR';
  }

  getClasesPagina(): { fondo1: string, fondo2: string, footer: string } {


    if (this.currentRoute === '/orquestador') {
      return { fondo1: 'fondo-1', fondo2: 'fondo-2', footer: 'footer' };
    } else if ( this.currentRoute.startsWith('/orquestador/webviews') || this.currentRoute.startsWith('/orquestador/logs') ) {
      return { fondo1: 'sin-fondo', fondo2: 'sin-fondo', footer: 'footer'};
    } else if (this.currentRoute.startsWith('/orquestador/crear_editar')) {
      return { fondo1: 'sin-fondo', fondo2: 'sin-fondo', footer: 'footer-static'};
    }

    return { fondo1: '', fondo2: '', footer: '' };
    
  }

  cerrarSesion(): void {

    this._aService.outSession(this.token || '').subscribe(

      response => {

        sessionStorage.removeItem("tokenOrquestador");
        sessionStorage.removeItem("usuarioOrquestador");
        sessionStorage.removeItem("rolOrquestador");
        sessionStorage.removeItem("nombreProducto");
        sessionStorage.removeItem("nomenclaturaProdcuto");

        this.router.navigate(['/login']);

        Swal.fire({
          title: 'Sesión finalizada',
          text: 'Se ha cerrado la sesión correctamente.',
          icon: 'success',
          confirmButtonText: 'OK',
          confirmButtonColor: "#003865"
        });

      },
      error => {


        console.log("Error: ", error);
        Swal.fire({
          title: 'Error',
          text: error.error.Mensaje,
          icon: 'error',
          confirmButtonText: 'OK',
          confirmButtonColor: "#003865"
        });

      }

    );
     
  }

}


