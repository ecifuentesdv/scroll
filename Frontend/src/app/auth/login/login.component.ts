import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

/**SERVICIOS */
import { AuthService } from '../../services/auth/auth.service';

/**MENSAJE DE ALERTA */
import Swal from 'sweetalert2';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {

  login: FormGroup;
  public buscando: boolean;
  public submitted: boolean;
  public usuarioLogin: string;
  public passwordLogin: string;

  constructor(

    private fb: FormBuilder,
    private _pService: AuthService,
    private router: Router

  ) {

    this.buscando = false;
    this.submitted = false;

    this.login = this.fb.group({
      usuario: ['', [Validators.required, Validators.email, Validators.minLength(8), Validators.maxLength(30)]],
      password: ['', [Validators.required, Validators.pattern(_pService.regexContrase_a)]]
    });

    this.usuarioLogin = '';
    this.passwordLogin = '';

  }

  get usuario () { return this.login.get('usuario'); }
  get password () { return this.login.get('password'); }

  ngOnInit(): void {

    sessionStorage.removeItem('tokenOrquestador');
    sessionStorage.removeItem('usuarioOrquestador');
    sessionStorage.removeItem('rolOrquestador');
    sessionStorage.removeItem('nombreProducto');
    sessionStorage.removeItem('nomenclaturaProdcuto');

    this._pService.estadoSession.subscribe((e: any) => {

      if (e === '') return

      Swal.fire({
        title: 'Error',
        text: e,
        icon: 'error',
        confirmButtonText: 'OK',
        confirmButtonColor: "#003865"
      });
      
    })

  }

  ingresar () {

    this.submitted = true;
    this.buscando = true;
    this.usuarioLogin = this.login.value.usuario;
    this.passwordLogin = this.login.value.password;

    if(!this.login.invalid) {

      const dataRequest = {
        "Email": this.usuarioLogin,
        "Password": this.passwordLogin
      }

      this._pService.Login(dataRequest).subscribe( 

        response => {
          
          sessionStorage.setItem('tokenOrquestador', response.token);
          sessionStorage.setItem('usuarioOrquestador', response.user);
          sessionStorage.setItem('rolOrquestador', response.rol);

          this.router.navigate(['/orquestador']);
          this.buscando = false;
          this.submitted = false;
          
        },
        error => {

          sessionStorage.removeItem('tokenOrquestador');
          sessionStorage.removeItem('usuarioOrquestador');
          sessionStorage.removeItem('rolOrquestador');
          sessionStorage.removeItem('nombreProducto');
          sessionStorage.removeItem('nomenclaturaProdcuto');
          sessionStorage.removeItem('IP');

          this.buscando = false;
          this.submitted = false;
          let mensaje = 'Ocurrió un error al intentar ingresar.';
          if( error.status == 400 || error.status == 404 ) mensaje = 'Usuario y contraseña incorrectos.';
          if( error.status == 403 || error.status == 401 ) mensaje = 'Usuario no autorizado.';
          if( error.status == 409 ) mensaje = 'Sesión duplicada, cierre la sesion que se encuentra abierta o espere un lapso de 10 minutos.';
          if( error.status == 429  ) mensaje = 'Limite de peticiones alcansado.';
          
          Swal.fire({
            title: 'Error',
            text: mensaje,
            icon: 'error',
            confirmButtonText: 'OK',
            confirmButtonColor: "#003865"
          });

        }
        
      );

    } else {

      this.buscando = false;
      this.submitted = false;

      Swal.fire({
        title: 'Error',
        text: 'Ingrese correctamente los datos.',
        icon: 'error',
        confirmButtonText: 'OK',
        confirmButtonColor: "#003865"
      });

    }

  }
  
}

