import { Component, OnInit, ElementRef, HostListener } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors, FormArray } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

/**SERVICIOS */
import { ProductoService } from '../../services/orquestador/producto.service';

/**MODELOS */
import { Producto } from '../../models/orquestador/Producto';
import { SafeResourceUrl } from '@angular/platform-browser';

/**MENSAJE DE ALERTA */
import Swal from 'sweetalert2';

@Component({
  selector: 'app-productos',
  templateUrl: './productos.component.html',
  styleUrl: './productos.component.css'
})

export class ProductosComponent implements OnInit {

  formEliminarProducto: FormGroup;
  formEditarProducto: FormGroup;
  formLinkProducto: FormGroup;

  public modalVisibleEliminar: boolean;
  public productoSeleccionado: any;
  public buscando: boolean;
  public mostrarLoaderPagina: boolean;
  public nombreProducto: string;
  public nomenclaturaProducto: string;
  mostrarDiv: boolean = false;
  public productos:Producto[] = [];
  public producto: Producto;
  token: string | null = '';
  public idEditProducto: number;
  rolOrquestador: string | null = '';

  public detectarClicFuera: boolean;
  public modalVisibleLink: boolean;
  public idProductoLink: number;
  public link:string;
  public linkCopiado: boolean;

  public valido: boolean = false;
  public mensaje: string;
  public tipoPeticion: string;

  constructor(

    private fb: FormBuilder,
    private _pService: ProductoService,
    private eRef: ElementRef,
    private _router: Router

  ){

    this.modalVisibleEliminar = false;
    this.productoSeleccionado = null;
    this.productos = [];
    this.producto = new Producto(0,'','','','','','');
    this.buscando = false;
    this.mostrarLoaderPagina = false;
    this.detectarClicFuera = false;
    this.modalVisibleLink = false;
    this.idProductoLink = 0;
    this.link = '';
    this.mensaje = '';
    this.tipoPeticion = '';

    this.formEliminarProducto = this.fb.group({
      nombreEliminarProducto: ['', [Validators.required, Validators.pattern(_pService.regexStringConEspacio), Validators.maxLength(25)]]
    });

    this.formLinkProducto = this.fb.group({
      nombreLinkProducto: ['', [Validators.required]]
    })

    this.formEditarProducto = this.fb.group({  
      items: this.fb.array([])
    });

    this.addItem();
    this.nombreProducto = '';
    this.nomenclaturaProducto = '';
    this.idEditProducto = 0;
    this.linkCopiado = false;
    
  }

  get nombreEliminarProducto () { return this.formEliminarProducto.get('nombreEliminarProducto'); }
  get nombreLinkProducto () { return this.formLinkProducto.get('nombreEliminarProducto'); }
  get nombreEditarProducto () { return this.formEditarProducto.get('nombreEditarProducto'); }
  get nomenclaturaEditarProducto () { return this.formEditarProducto.get('nomenclaturaEditarProducto'); }

  get items(): FormArray { return this.formEditarProducto.get('items') as FormArray; }

  addItem(): void {

    const newItem = this.fb.group({
      nombreEditarProducto: ['', [Validators.required, Validators.pattern(this._pService.regexStringConEspacio), Validators.maxLength(25)]],
      nomenclaturaEditarProducto: ['', [Validators.required, Validators.pattern(this._pService.regexStringConEspacio), Validators.maxLength(3)]]
    });

    this.items.push(newItem);

  }

  removeItem(index: number): void {

    this.items.removeAt(index);

  }




  getErrorMessage(index: number, field: string, tocado:any): string | null {

    const control = this.items.at(index).get(field);
    
    if (this.idEditProducto == -1) {


      if (control?.hasError('required')) return 'Este campo es obligatorio';
      if (control?.hasError('pattern')) return 'Ingrese solo letras y espacios';
      if (control?.hasError('maxlength')) return 'Tamaño máximo superado';
      
    } else if (!((index+1) == this.items.controls.length)) {

      if (control?.hasError('required')) return 'Este campo es obligatorio';
      if (control?.hasError('pattern')) return 'Ingrese solo letras y espacios';
      if (control?.hasError('maxlength')) return 'Tamaño máximo superado';
      
    }
  
    return null;

  }





  ngOnInit(): void {
  
    this.idEditProducto = 0;
    this.mostrarLoaderPagina = true;
    this.token = sessionStorage.getItem('tokenOrquestador') ?? '';
    this.rolOrquestador = sessionStorage.getItem('rolOrquestador') ?? '';
    this.listaProductos();

  }





  esAdministrador(): boolean {
    return this.rolOrquestador === 'ADMINISTRADOR';
  }




  /* Revisar si aun se usa */
  alternarDiv(index: number, tamano: number): void {

    let validacion = ((index+1) == tamano);
    console.log("Val ", validacion);

    if (validacion) {
      this.mostrarDiv = !this.mostrarDiv;
    }

  }





  listaProductos () : void {

    this.productos = [];

    this._pService.getAll(this.token || '').subscribe( response => {

      response.Productos.forEach( (p:Producto) => {

        this.productos.push(
          new Producto(p.Id, p.Nombre, p.Descripcion, p.Estatus, p.Nomenclatura, p.Update, p.Create)
        )
        
      });

      this.items.clear();
      this.productos.push(
        new Producto(-1,'','','','','','')
      )
      
      this.productos.forEach(p => {

        this.items.push(this.fb.group({
          nombreEditarProducto: [p.Nombre, [Validators.required, Validators.pattern(this._pService.regexStringConEspacio), Validators.maxLength(25)]],
          nomenclaturaEditarProducto: [p.Nomenclatura, [Validators.required, Validators.pattern(this._pService.regexStringConEspacio), Validators.maxLength(3)]]
        }));

      });

        this.mostrarLoaderPagina = false;

      
    }, error => {

      console.log("Error ", error);
      const mensaje = ( error.status == 401) ? 'Token vencido' : 'Ocurrió un error al intentar cargar los datos';
              
      Swal.fire({
        title: 'Error',
        text: mensaje,
        icon: 'error',
        confirmButtonText: 'OK',
        confirmButtonColor: "#003865"
      });

    })

  }




  crearProducto (i: number) {

    const formSubmit = this.items.at(i);
    this.buscando = true;
    this.nombreProducto = formSubmit.value.nombreEditarProducto;
    this.nomenclaturaProducto = formSubmit.value.nomenclaturaEditarProducto;
      
    if (!formSubmit.invalid)  {

      const dataRequest = {
        "Nombre": this.nombreProducto,
        "Nomenclatura": this.nomenclaturaProducto,
        "Descripcion": ''
      }
      console.log('dataRequest', dataRequest);

      this._pService.CreateProducto(dataRequest, this.token || '').subscribe (

        response => {

          this.listaProductos(); 
          this.idEditProducto = 0;
          this.buscando = false;

          Swal.fire({
            title: 'Producto creado',
            text: 'Se creó el producto correctamente',
            icon: 'success',
            confirmButtonText: 'OK',
            confirmButtonColor: "#003865"
          });

        },
        error => {

          console.log("Error ", error);
          this.buscando = false;
          const mensaje = ( error.status == 400 ) ? 'Porfavor validar los datos enviados' : error.error.Mensaje || 'Ocurrio un error al intentar agregar el producto';
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




  eliminarProducto(idEliminarProducto: any) : void {
  
    this.buscando = true;
    this.nombreProducto = this.formEliminarProducto.value.nombreEliminarProducto;

    if ( this.nombreProducto === this.productoSeleccionado.Nombre ) {

      //console.log('iguales');

      if (!this.formEliminarProducto.invalid) {

        this._pService.DeleteProducto(this.token || '', idEliminarProducto).subscribe(
  
          response => {

            this.cerrarModalEliminar();
            this.listaProductos();
            this.buscando = false;
    
            Swal.fire({
              title: 'Producto eliminado',
              text: 'Se eliminó el producto correctamente',
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
    } else {

      this.buscando = false;

      Swal.fire({
        title: 'Error',
        text: 'El nombre ingresado es incorrecto, por favor respetar mayusculas.',
        icon: 'error',
        confirmButtonText: 'OK',
        confirmButtonColor: "#003865"
      }); 
    }

  }

  //Evitar que peguen el nombre para eliminar el producto
  onPaste(event: ClipboardEvent) {
    event.preventDefault();
  }

  idCapture (idProducto: number) {

    this.idEditProducto = idProducto;
    console.log('idEditProducto', this.idEditProducto);

  }

  editarProducto(idEditarProducto: number, i: number) : void { 

    const formSubmit = this.items.at(i);
    
    this.buscando = true;

    this.nombreProducto = formSubmit.value.nombreEditarProducto;
    this.nomenclaturaProducto = formSubmit.value.nomenclaturaEditarProducto;

    if (!formSubmit.invalid) {

      const dataRequest = {
        "Nombre": this.nombreProducto,
        "Nomenclatura": this.nomenclaturaProducto,
        "Descripcion": ''
      }

      console.log('dataRequest', dataRequest);
      
      this._pService.EditProducto(dataRequest, this.token || '', idEditarProducto).subscribe (
        response => {
          this.listaProductos(); 
          this.idEditProducto = 0;
          this.buscando = false;

          Swal.fire({
            title: 'Producto editado',
            text: 'Se editó el producto correctamente',
            icon: 'success',
            confirmButtonText: 'OK',
            confirmButtonColor: "#003865"
          });  
        },
        error => {

          console.log("Error ", error);

          this.buscando = false;
          const mensaje = ( error.status == 400 ) ? 'Porfavor validar los datos enviados' : error.error.Mensaje || 'Ocurrio un error al intentar agregar el producto';
  
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



  //Copiar en portapapeles el link del producto
  async copiarLink(){
    if( !this.link) return
    try {
      await navigator.clipboard.writeText(this.link);
      this.linkCopiado = true;
    } catch (err) {
      console.error('Error al copiar texto: ', err);
    }
  }


  //Obtener la url del producto
  getURL(tipo:string, id:number){
    if( !id ) return;
    this.idProductoLink = id;
    this.link = '';
    this.linkCopiado = false;
    this.modalVisibleLink = true;
    this.tipoPeticion = tipo;
    this.mensaje = ( tipo == 'link' ) ? 'Para consumir los servicios de MoneyThor, es necesario contar con un CIF de cliente. Por esta razón, el sistema utiliza un cliente específico que se registra en MoneyThor durante el proceso de instalación. Este cliente incluye el CIF "cliente_banco_moneythor". Para que los servicios se visualicen correctamente, es fundamental que este cliente tenga registrada en MoneyThor toda la información requerida por los servicios que conforman el producto.' :
                                         'Las credenciales generadas serán enviadas al correo electrónico del usuario que haya iniciado sesión. Estas credenciales ya se encuentran encriptadas y se utilizan para autenticarse a través del servicio de autenticación de MoneyThor. Al consumir dicha API, se obtiene una URL que permite la navegación entre las distintas vistas del navegador. Cabe destacar que las credenciales no se almacenan en ningún lugar y no existe un límite en la cantidad de veces que pueden ser generadas.';
    setTimeout(() => {
      this.detectarClicFuera = true; 
    }, 100);
  }



  //Obtener el link de los porductos
  getSubmitLink(){
    this.mostrarLoaderPagina = true;

    if( this.tipoPeticion == 'link'){

      this._pService.getURL(this.token, this.idProductoLink).subscribe( response => {
        console.log("Response ", response);
        this.link = response.URL;
        this.mostrarLoaderPagina = false;
      }, error => {
        console.log("Error ", error);
        
        const mensaje = error.error.Mensaje
        
        Swal.fire({
          title: 'Error',
          text: mensaje,
        icon: 'error',
        confirmButtonText: 'OK',
        confirmButtonColor: "#003865"
      });
      this.mostrarLoaderPagina = false;
      this.detectarClicFuera = false;
      this.modalVisibleLink = false;
    })

  }else {
    this._pService.generateCredentials(this.token).subscribe( response => {
      Swal.fire({
        title: '¡Credenciales Generadas!',
        text: 'Se han enviado a tu correo las nuevas credenciales',
        icon: 'success',
        confirmButtonText: 'OK',
        confirmButtonColor: "#003865"
      });

      this.mostrarLoaderPagina = false;
      this.detectarClicFuera = false;
      this.modalVisibleLink = false;

    }, error => {
      const mensaje = error.error.Mensaje
      Swal.fire({
          title: 'Error',
          text: mensaje,
        icon: 'error',
        confirmButtonText: 'OK',
        confirmButtonColor: "#003865"
      });
      this.mostrarLoaderPagina = false;
      this.detectarClicFuera = false;
      this.modalVisibleLink = false;
    })
  }

}




  ingresarWebview(id: number, nombre:string, nomenclatura:string) {
    this.mostrarLoaderPagina = true;
    sessionStorage.setItem('nombreProducto', nombre);
    sessionStorage.setItem('nomenclaturaProdcuto', nomenclatura);

    this._router.navigate([ `orquestador/webviews/${id}` ]);

  }

  abrirModalEliminar(producto:any) { 
    this.productoSeleccionado = producto;
    this.modalVisibleEliminar = true;

    setTimeout(() => {
      this.detectarClicFuera = true; 
    }, 100);
  }

  cerrarModalEliminar() { 
    this.modalVisibleEliminar = false; 

    this.formEliminarProducto.reset();
    this.formEliminarProducto.markAsPristine(); 
    this.formEliminarProducto.markAsUntouched(); 
    this.formEliminarProducto.updateValueAndValidity({ emitEvent: false });

    this.detectarClicFuera = false;
  }

  cerrarModalLink(){
    this.modalVisibleLink = false;
    this.formLinkProducto.reset();
    this.formLinkProducto.markAsPristine();
    this.formLinkProducto.markAllAsTouched();
    this.idProductoLink = 0;
    this.detectarClicFuera = false;

  }

  @HostListener('document:click', ['$event'])
  clickOutside(event: Event) {


    if (!this.detectarClicFuera) return;
    const modalContentEliminar = this.eRef.nativeElement.querySelector('.modal-contenido-eliminar-producto');
    const modalContentLink = this.eRef.nativeElement.querySelector('.modal-contenido-editar-producto');
    
    if ( this.modalVisibleEliminar  && modalContentEliminar && !modalContentEliminar.contains(event.target)) {
      this.cerrarModalEliminar();
    }
    
    if (this.modalVisibleLink && modalContentLink && !modalContentLink.contains(event.target)) {
      this.cerrarModalLink();
      
    }
  }

}


