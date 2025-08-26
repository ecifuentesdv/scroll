import { Component, OnInit, ElementRef, HostListener } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';

/**SERVICIOS */
import { UserService } from '../../services/users/users.service';

/**MENSAJE DE ALERTA */
import Swal from 'sweetalert2';

export function passwordMatchValidator(group: FormGroup): ValidationErrors | null {
  const contrasena = group.get('contrasenaCrearUsuario');
  const contrasenaVerificar = group.get('contrasenaVerificarCrearUsuario');

  if (contrasena && contrasenaVerificar && contrasena.value !== contrasenaVerificar.value) {
    return { notEqual: true };  
  }
  return null; 
}

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrl: './main.component.css'
})

export class MainComponent implements OnInit {

  formCrearUsuario: FormGroup;
  formEditarUsuario: FormGroup;

  public modalVisibleEliminar: boolean;
  public modalVisibleCrear: boolean;
  public modalVisibleEditar: boolean;
  public usuarioSeleccionado: any;
  public buscando: boolean;
  public mostrarLoaderPagina: boolean;
  public nombreUsuario: string;
  public apellidoUsuario: string;
  public correoUsuario: string;
  public rolUsuario: string;
  public contrasenaUsuario: string;
  public verificarcontrasenaUsuario: string;
  usuarios: any[] = [];
  usuariosFiltrados: any[] = [];
  filtro: boolean = false;
  token: string | null = '';
  public detectarClicFuera: boolean;

  constructor(

    private fb: FormBuilder,
    private eRef: ElementRef,
    private _pService: UserService
    
  ) {

    this.modalVisibleEliminar = false;
    this.modalVisibleCrear = false;
    this.modalVisibleEditar = false;
    this.usuarioSeleccionado = null;
    this.buscando = false;
    this.mostrarLoaderPagina = false;
    this.detectarClicFuera = false;

    this.formCrearUsuario = this.fb.group({
      nombreCrearUsuario: ['', [Validators.required, Validators.pattern(_pService.regexStringConEspacio)]],
      apellidoCrearUsuario: ['', [Validators.required, Validators.pattern(_pService.regexStringConEspacio)]],
      correoCrearUsuario: ['', [Validators.required, Validators.email, Validators.minLength(8), Validators.maxLength(30) ]],
      rolCrearUsuario: ['', [Validators.required]],
      contrasenaCrearUsuario: ['', [Validators.required, Validators.pattern(_pService.regexContrase_a)]],
      contrasenaVerificarCrearUsuario: ['', [Validators.required, Validators.pattern(_pService.regexContrase_a)]]
    }, {
      validators: passwordMatchValidator
    });

    this.formEditarUsuario = this.fb.group({
      nombreEditarUsuario: ['', [Validators.required, Validators.pattern(_pService.regexStringConEspacio)]],
      apellidoEditarUsuario: ['', [Validators.required, Validators.pattern(_pService.regexStringConEspacio)]],
      correoEditarUsuario: ['', [Validators.required, Validators.email]],
      rolEditarUsuario: ['', [Validators.required]]
      //contrasenaEditarUsuario: ['', [Validators.required, Validators.pattern(_pService.regexContrase_a)]],
      //contrasenaVerificarEditarUsuario: ['', [Validators.required, Validators.pattern(_pService.regexContrase_a)]]
    /*}, {
      validators: passwordMatchValidator*/
    });

    this.nombreUsuario = '';
    this.apellidoUsuario = '';
    this.correoUsuario = '';
    this.rolUsuario = '';
    this.contrasenaUsuario = '';
    this.verificarcontrasenaUsuario = '';

  }

  get nombreCrearUsuario () { return this.formCrearUsuario.get('nombreCrearUsuario'); }
  get apellidoCrearUsuario () { return this.formCrearUsuario.get('apellidoCrearUsuario'); }
  get correoCrearUsuario () { return this.formCrearUsuario.get('correoCrearUsuario'); }
  //get rolCrearUsuario  () { return this.formCrearUsuario.get('rolCrearUsuario')?.setValue(''); }
  get rolCrearUsuario  () { return this.formCrearUsuario.get('rolCrearUsuario'); }
  get contrasenaCrearUsuario () { return this.formCrearUsuario.get('contrasenaCrearUsuario'); }
  get contrasenaVerificarCrearUsuario () { return this.formCrearUsuario.get('contrasenaVerificarCrearUsuario'); }

  get nombreEditarUsuario () { return this.formEditarUsuario.get('nombreEditarUsuario'); }
  get apellidoEditarUsuario () { return this.formEditarUsuario.get('apellidoEditarUsuario'); }
  get correoEditarUsuario () { return this.formEditarUsuario.get('correoEditarUsuario'); }
  get rolEditarUsuario  () { return this.formEditarUsuario.get('rolEditarUsuario'); }
  //get contrasenaEditarUsuario () { return this.formEditarUsuario.get('contrasenaEditarUsuario'); }
  //get contrasenaVerificarEditarUsuario () { return this.formEditarUsuario.get('contrasenaVerificarEditarUsuario'); }

  ngOnInit(): void {

    this.mostrarLoaderPagina = true;
    this.token = sessionStorage.getItem('tokenOrquestador');
    this.listaUsuarios();
    this.formEditarUsuario.get('correoEditarUsuario')?.disable();

  }

  listaUsuarios () : void {

    this._pService.ObtenerListaUsuarios(this.token || '').subscribe(

      (response:any) => {

        this.usuarios = response.Usuarios;
        this.mostrarLoaderPagina = false;

      },
      error => {

        console.log("Error: ", error);
        this.mostrarLoaderPagina = false;

        const mensaje = ( error.status == 401) ? 'Token vencido' : 'Ocurrió un error al intentar cargar los datos'; 
        Swal.fire({
          title: 'Error',
          text: mensaje,
          icon: 'error',
          confirmButtonText: 'OK',
          confirmButtonColor: "#003865"
        });

      }
    );
  }

  eliminarUsuario(correoEliminarUsuario: any) : void {

    this.buscando = true;

    this._pService.DeleteUsuario(this.token || '', correoEliminarUsuario).subscribe(

      response => {
        this.cerrarModalEliminar();
        this.listaUsuarios();

        this.buscando = false;

        Swal.fire({
          title: 'Usuario eliminado',
          text: 'Se eliminó el usuario correctamente',
          icon: 'success',
          confirmButtonText: 'OK',
          confirmButtonColor: "#003865"
        });
      },
      error => {
        console.log("Error: ", error);
        this.buscando = false;

        /*
        const mensaje = ( error.status == 401) ? 'Token vencido' : 'Ocurrió un error al intentar eliminar los datos';
        */
        Swal.fire({
          title: 'Error',
          //text: mensaje,
          text: 'Ocurrió un error al intentar eliminar los datos',
          icon: 'error',
          confirmButtonText: 'OK',
          confirmButtonColor: "#003865"
        });
        
      }

    );

  }

  editarUsuario(correoEditarUsuario: any) : void {

    this.buscando = true;

    this.nombreUsuario = this.formEditarUsuario.value.nombreEditarUsuario;
    this.apellidoUsuario = this.formEditarUsuario.value.apellidoEditarUsuario;
    //this.correoUsuario = this.formEditarUsuario.value.correoEditarUsuario;
    this.rolUsuario = this.formEditarUsuario.value.rolEditarUsuario;
    //this.contrasenaUsuario = this.formEditarUsuario.value.contrasenaEditarUsuario;
    //this.verificarcontrasenaUsuario = this.formEditarUsuario.value.contrasenaVerificarEditarUsuario; 

    if (!this.formEditarUsuario.invalid)  {

      const dataRequest = {
        "Nombre": this.nombreUsuario,
        "Apellido": this.apellidoUsuario,
        //"Email": this.correoUsuario,
        //"Password": this.contrasenaUsuario,
        "Rol": this.rolUsuario
      }

      this._pService.EditUsuario(dataRequest, this.token || '', correoEditarUsuario).subscribe (
        response => {

          this.cerrarModalEditar();
          this.listaUsuarios(); 
          this.buscando = false;

          Swal.fire({
            title: 'Usuario editado',
            text: 'Se editó el usuario correctamente',
            icon: 'success',
            confirmButtonText: 'OK',
            confirmButtonColor: "#003865"
          });

        },
        error => {

          console.log("Error ", error);
          this.buscando = false;
  
          //const mensaje = ( error.status == 400 || error.status == 404 ) ? 'Usuario y contraseña incorrectos' : 'Ocurrió un error al intentar crear el usuario';
          Swal.fire({
            title: 'Error',
            //text: mensaje,
            text: error,
            icon: 'error',
            confirmButtonText: 'OK',
            confirmButtonColor: "#003865"
          });
  
        }

      );


    } else { 

      this.buscando = false;

      Swal.fire({
        title: 'Error',
        text: 'Ingrese correctamente los datos',
        icon: 'error',
        confirmButtonText: 'OK',
        confirmButtonColor: "#003865"
      });
    }
  }
 
  crearUsuario () {

    this.buscando = true;

    this.nombreUsuario = this.formCrearUsuario.value.nombreCrearUsuario;
    this.apellidoUsuario = this.formCrearUsuario.value.apellidoCrearUsuario;
    this.correoUsuario = this.formCrearUsuario.value.correoCrearUsuario;
    this.rolUsuario = this.formCrearUsuario.value.rolCrearUsuario;
    this.contrasenaUsuario = this.formCrearUsuario.value.contrasenaCrearUsuario;
    this.verificarcontrasenaUsuario = this.formCrearUsuario.value.contrasenaVerificarCrearUsuario; 

    if (!this.formCrearUsuario.invalid)  {

      const dataRequest = {
        "Nombre": this.nombreUsuario,
        "Apellido": this.apellidoUsuario,
        "Email": this.correoUsuario,
        "Password": this.contrasenaUsuario,
        "Rol": this.rolUsuario
      }

      this._pService.CreateUsuario(dataRequest, this.token || '').subscribe (

        response => {

          this.cerrarModalCrear();
          this.listaUsuarios(); 
          this.buscando = false;

          Swal.fire({
            title: 'Usuario creado',
            text: 'Se creó el usuario correctamente',
            icon: 'success',
            confirmButtonText: 'OK',
            confirmButtonColor: "#003865"
          }); 

        },
        error => {

          console.log("Error ", error);
          this.buscando = false;
  
          let mensaje = '';
          if(error.status === 409) mensaje = 'El correo ya existe';
          if(error.status === 400) mensaje = 'Por favor verifique los datos ingresados';
          if(error.status === 500 || ( error.status !== 409 && error.status !== 400 )) mensaje = 'Ocurrio un error al crear el usuario';
  
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

      Swal.fire({
        title: 'Error',
        text: 'Ingrese correctamente los datos',
        icon: 'error',
        confirmButtonText: 'OK',
        confirmButtonColor: "#003865"
      });

    }

  }

  filtrarUsuarios(event: Event): void {

    const filtroLower = (event.target as HTMLInputElement).value.toLowerCase();
    this.filtro = filtroLower.length > 0;  
    this.usuariosFiltrados = this.usuarios.filter(usuario => 
      usuario.Nombre.toLowerCase().includes(filtroLower) ||
      usuario.Apellido.toLowerCase().includes(filtroLower) ||
      usuario.Correo.toLowerCase().includes(filtroLower) ||
      usuario.Rol.toLowerCase().includes(filtroLower)
    );

  }

  abrirModalEliminar(usuario:any) { 

    this.usuarioSeleccionado = usuario;
    this.modalVisibleEliminar = true;
    setTimeout(() => {
      this.detectarClicFuera = true; 
    }, 100);

  }
  cerrarModalEliminar() { 

    this.modalVisibleEliminar = false;
    this.detectarClicFuera = false; 

  }

  abrirModalCrear() { 

    this.modalVisibleCrear = true;
    this.formCrearUsuario.reset({ rolCrearUsuario: '' });
    setTimeout(() => {
        this.detectarClicFuera = true; 
    }, 100);

  }
  cerrarModalCrear() { 

    this.modalVisibleCrear = false;

    this.formCrearUsuario.reset();
    this.formCrearUsuario.markAsPristine(); 
    this.formCrearUsuario.markAsUntouched(); 
    this.formCrearUsuario.updateValueAndValidity({ emitEvent: false });

    this.detectarClicFuera = false; 
  }

  abrirModalEditar(usuario:any) { 
    this.usuarioSeleccionado = usuario;
    this.modalVisibleEditar = true; 

    this.formEditarUsuario.patchValue({
      nombreEditarUsuario: usuario.Nombre,
      apellidoEditarUsuario: usuario.Apellido,
      correoEditarUsuario: usuario.Correo,
      rolEditarUsuario: usuario.Rol
    });

    setTimeout(() => {
      this.detectarClicFuera = true; 
    }, 100);
  }
  cerrarModalEditar() { 

    this.modalVisibleEditar = false; 

    this.formEditarUsuario.reset();
    this.formEditarUsuario.markAsPristine(); 
    this.formEditarUsuario.markAsUntouched(); 
    this.formEditarUsuario.updateValueAndValidity({ emitEvent: false });

    this.detectarClicFuera = false;

  }

  @HostListener('document:click', ['$event'])
  clickOutside(event: Event) {
    if (!this.detectarClicFuera) return;

    const modalEliminar = this.eRef.nativeElement.querySelector('.modal-contenido-eliminar-usuario');
    const modalCrear = this.eRef.nativeElement.querySelector('.modal-contenido-crear-usuario');
    const modalEditar = this.eRef.nativeElement.querySelector('.modal-contenido-editar-usuario');

    if (this.modalVisibleEliminar && modalEliminar && !modalEliminar.contains(event.target)) {
      this.cerrarModalEliminar();
    }

    if (this.modalVisibleCrear && modalCrear && !modalCrear.contains(event.target)) {
      this.cerrarModalCrear();
    }

    if (this.modalVisibleEditar && modalEditar && !modalEditar.contains(event.target)) {
      this.cerrarModalEditar();
    }

  }

}
