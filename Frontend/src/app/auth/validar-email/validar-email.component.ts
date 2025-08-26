import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

/**SERVICIOS */
import { AuthService } from '../../services/auth/auth.service';

/**MENSAJE DE ALERTA */
import Swal from 'sweetalert2';

@Component({
  selector: 'app-validar-email',
  templateUrl: './validar-email.component.html',
  styleUrl: './validar-email.component.css'
})
export class ValidarEmailComponent implements OnInit {

  validEmail: FormGroup;
  public buscando: boolean;
  public submitted: boolean;
  
  constructor (

    private fb: FormBuilder,
    private _snackBar: MatSnackBar, 
    private route: Router,
    private _pService: AuthService

  ) {  

    this.buscando = false;
    this.submitted = false;

    this.validEmail = this.fb.group({
      correo: ['', [Validators.required, Validators.email, Validators.minLength(8), Validators.maxLength(30) ]],
    });

  }

  get correo () { return this.validEmail.get('correo'); }

  onSubmit() : void {

    this.buscando = true;
    this.submitted = true;

    if (!this.validEmail.invalid) {
      
      const objectForSend = { Email: this.validEmail.value.correo };

      this._pService.ValidarCorreo(objectForSend).subscribe(

        response => {

          this.buscando = false;
          
          //this._snackBar.open("Enviamos un mensaje a su correo electrónico, ingrese a su bandeja y podrá seguir los pasos para cambiar contraseña.", "Cerrar");
          Swal.fire({
            title: 'Correo enviado',
            text: 'Enviamos un mensaje a su correo electrónico, ingrese a su bandeja y podrá seguir los pasos para cambiar contraseña.',
            icon: 'success',
            confirmButtonText: 'OK',
            confirmButtonColor: "#003865" 
          });

          this.route.navigate(['login']);
          this.buscando = false;

        },
        error => {

          this.buscando = false;

          const mensaje = ( error.status == 400 || error.status == 404 ) ? 'Correo electrónico incorrecto.' : 'Ocurrió un error al intentar enviar el correo.';
          Swal.fire({
            title: 'Error',
            text: mensaje,
            icon: 'error',
            confirmButtonText: 'Cerrar',
            confirmButtonColor: "#003865"
          });

          //this._snackBar.open("Correo electrónico incorrecto.", "Cerrar");

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

  ngOnInit(): void {
    
  }

}
