import { Component } from '@angular/core';
import { filter } from 'rxjs/operators';

import { Router, NavigationEnd } from '@angular/router';

/**SERVICIOS */
import { AuthService } from '../../services/auth/auth.service';

/**MENSAJE DE ALERTA */
import Swal from 'sweetalert2';


@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {

  
  public currentRoute: string;
  private token: string | null;
  public isAdministrador:boolean;
  public rolOrquestador: string | null;
  public mostrarMenu:boolean;
  public deshabilitar:boolean;
  constructor(

    private router: Router,
    private _aService: AuthService

  ) {
    this.currentRoute =  '';
    this. token = '';
    this.isAdministrador = false;
    this.rolOrquestador = '';
    this.mostrarMenu= false;
    this.deshabilitar = false;

    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.currentRoute = this.router.url;
      });

  }


  ngOnInit(): void {
    this.rolOrquestador = sessionStorage.getItem('rolOrquestador') ?? '';
    this.token = sessionStorage.getItem('tokenOrquestador');

  }

  ngdeshabilitar(){
    this.deshabilitar = true;
    setTimeout(() => {
      this.deshabilitar = false;
    }, 1000);
  }


  getClasesPagina(btn:string): string {
    return ( this.currentRoute.endsWith(btn) ) ? 'activado' : '';
  }

  mostrarOcultarMenu(){
    this.mostrarMenu = !this.mostrarMenu;
  }

  mostrarOcultar(){
    return ( this.mostrarMenu ) ? 'mostrar' : 'ocultar'
  }


esAdministrador(): boolean {
  return this.rolOrquestador === 'ADMINISTRADOR';
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
        this.router.navigate(['/login']);

        Swal.fire({
          title: 'Sesión finalizada',
          text: 'Se ha cerrado la sesión correctamente.',
          icon: 'success',
          confirmButtonText: 'OK',
          confirmButtonColor: "#003865"
        });

      }

    );


      
  }
}
