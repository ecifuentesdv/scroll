import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router, ActivatedRoute, Params } from "@angular/router";

/**SERVICIOS */
import { AuthService } from '../../services/auth/auth.service';

/**MENSAJE DE ALERTA */
import Swal from 'sweetalert2';

@Component({
  selector: 'app-cambiar-pass',
  templateUrl: './cambiar-pass.component.html',
  styleUrl: './cambiar-pass.component.css'
})
export class CambiarPassComponent implements OnInit {

  public buscando: boolean;
  public submitted: boolean;
  login: FormGroup;
  public status: string;
  public token: any;
  public realPass: any;
  public confirmPassword: any;
  public showSubmit = false;

  constructor(

    private fb: FormBuilder,
    private _snackBar: MatSnackBar,
    private router: Router,
    private route: ActivatedRoute,
    private _pService: AuthService

  ) {

    this.buscando = false;
    this.submitted = false;

    this.login = this.fb.group({
      password: ['', [Validators.required, Validators.pattern(_pService.regexContrase_a)]],
      comfirmPassword: ['', [Validators.required, Validators.pattern(_pService.regexContrase_a)]]
    }),

    this.status = '';

  }

  get password () { return this.login.get('password'); }
  get comfirmPassword () { return this.login.get('comfirmPassword'); }

  verifyToken(token: any): void {

    const objectForSend = { token }

  }

  confirmPass(event: any): void {

    this.confirmPassword = event.target.value
    this.login.value.comfirmPassword = event.target.value

    if ( this.realPass && this.confirmPassword) {
        this.showSubmit = true;
    } else {
        this.showSubmit = false;
    }

  }

  onSubmit(): void {

    this.buscando = true;
    this.submitted = true;
    const pass = this.login.value.password;
    const confirmPassowrd = this.login.value.comfirmPassword;

    if(!this.login.invalid) {

      if (pass == confirmPassowrd) {

        const objectForSend = {
          Token: this.token,
          Password: pass
        }

        this._pService.CambiarPassword(objectForSend).subscribe(

          response => {

            //this._snackBar.open("Contraseña cambiada correctamente", "Cerrar");

            Swal.fire({
              title: 'Cambio de contraseña',
              text: 'Se ha cambiado la contraseña correctamente.',
              icon: 'success',
              confirmButtonText: 'OK',
              confirmButtonColor: "#003865"
            });

            this.router.navigate(['login']);
            this.buscando = false;
            this.submitted = false;

          },
          error => {

            console.log(error);
            this.buscando = false;
            this.submitted = false;

            const mensaje = ( error.status == 400) ? 'No se cambió la contraseña porque no cumple con los requisitos.' : 'Ocurrió un error al intentar cambiar la contraseña.';
            Swal.fire({
              title: 'Error',
              text: mensaje,
              icon: 'error',
              confirmButtonText: 'Cerrar',
              confirmButtonColor: "#003865"
            });

            //this._snackBar.open(mensaje, "Cerrar");

            }
          )

      } else {

        this.buscando = false;
        this.submitted = false;

        //this._snackBar.open("Las contraseñas no son iguales", "Cerrar");
        Swal.fire({
          title: 'Cambio de contraseña',
          text: 'Las contraseñas no son iguales.',
          icon: 'success',
          confirmButtonText: 'OK',
          confirmButtonColor: "#003865"
        });

      }

    } else {
      
      this.buscando = false;
      this.submitted = false;

      //this._snackBar.open("Contraseña no valida, la contraseña debe de tener por lo mendos un digito, una minúscula, una mayúscula y un caracter especial (!@#$%^&*()_+?¿'-/), entre 8 y 16 caracteres.", "Cerrar");
      Swal.fire({
        title: 'Cambio de contraseña',
        text: "Contraseña no valida, la contraseña debe de tener por lo mendos un digito, una minúscula, una mayúscula y un caracter especial (!@#$%^&*()_+?¿'-/), entre 8 y 16 caracteres.",
        icon: 'success',
        confirmButtonText: 'OK',
        confirmButtonColor: "#003865"
      });

    }
    
  }

  ngOnInit(): void {

      this.route.params.subscribe(params => {
          let token = params['token'];
          this.token = token;
      });

      this.verifyToken(this.token);
      
  }

}
