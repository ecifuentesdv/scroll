import { Component, OnInit, ElementRef, HostListener } from '@angular/core';
import { ActivatedRoute, Router } from "@angular/router";

/**SERVICIOS */
import { WebViewService } from '../../services/orquestador/webviews.service';

/**MODELOS */
import { WebView } from '../../models/orquestador/WebView';

/* Mensajes de alerta */
import Swal from 'sweetalert2';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-webviews',
  templateUrl: './webviews.component.html',
  styleUrl: './webviews.component.css'
})
export class WebviewsComponent implements OnInit{

  formEliminarWebview: FormGroup;

  public modalVisibleEliminar: boolean;

  public webviewSeleccionado: any;
  public buscando: boolean;
  public mostrarLoaderPagina: boolean;
  public nombreWebview: string;
  public webviews:WebView[] = [];
  public webview: WebView;
  public idProducto:number;

  webviewsFiltrados: any[] = [];
  filtro: boolean = false;

  token: string | null = '';
  rolOrquestador: string | null = '';

  public sessionNombreProducto: string;
  public sessionNomenclaturaProducto: string;

  public detectarClicFuera: boolean;

  constructor(

    private fb: FormBuilder,
    private _wService: WebViewService,
    private eRef: ElementRef,
    private route: ActivatedRoute,
    private router: Router,

  ){
    this.modalVisibleEliminar = false;
    this.webviewSeleccionado = null;
    this.buscando = false;
    this.mostrarLoaderPagina = false;
    this.detectarClicFuera = false;


    this.formEliminarWebview = this.fb.group({
      nombreEliminarWebview: ['', [Validators.required, Validators.pattern(_wService.regexStringConEspacio)]]
    });

    this.nombreWebview = '';
    this.webviews = [];
    this.webview = new WebView(0,'','',0,'',0,'','')
    this.idProducto = 0;

    this.sessionNombreProducto = '';
    this.sessionNomenclaturaProducto = '';
  }

  get nombreEliminarWebview () { return this.formEliminarWebview.get('nombreEliminarWebview'); }

  ngOnInit() {
    this.obtenerNombreNomenclatura();
    this.mostrarLoaderPagina = true;
    this.token = sessionStorage.getItem('tokenOrquestador') ?? '';
    this.rolOrquestador = sessionStorage.getItem('rolOrquestador') ?? '';
    this.listaWebViews();
  }

  esAdministrador(): boolean {
    return this.rolOrquestador === 'ADMINISTRADOR';
  }

  obtenerNombreNomenclatura () {
    this.sessionNombreProducto = sessionStorage.getItem('nombreProducto') || '-';
    this.sessionNomenclaturaProducto = sessionStorage.getItem('nomenclaturaProdcuto') || '-';
  }


    //Evitar que peguen el nombre para eliminar el producto
    onPaste(event: ClipboardEvent) {
      event.preventDefault();
    }

    
  listaWebViews () : void {

    this.getIdProducto();
    
    this._wService.getAll(  this.idProducto, this.token || '' ).subscribe( 
      
      
      response => {

        this.webviews = [];

        if(!response.WebViews || response.WebViews.length === 0) {
          Swal.fire({
            title: this.sessionNombreProducto,
            text: 'El producto no contiene WebViews',
            icon: 'info',
            confirmButtonText: 'OK',
            confirmButtonColor: "#003865"
          });
        } else {
          response.WebViews.forEach((w:WebView) => {

            this.webviews.push( new WebView (w.Id, w.Nombre, w.Menu, w.Producto, w.Descripcion, w.Principal, w.Create, w.Update))
            
          })

        }

        this.mostrarLoaderPagina = false;

      }, error => {

        console.log("Error ", error);

    })

  }

  getIdProducto():void{
    this.route.params.subscribe(params => {
      this.idProducto = params['idProducto'];
    })
  }

  eliminarWebview ( idWebview: any ) : void {

    this.buscando = true;
    this.nombreWebview = this.formEliminarWebview.value.nombreEliminarWebview;

    if ( this.nombreWebview === this.webviewSeleccionado.Nombre ) {

      if ( !this.formEliminarWebview.invalid ) {

        this._wService.DeleteWebview(this.token || '', idWebview).subscribe(
    
          response => {

            this.cerrarModalEliminar();
            this.listaWebViews();

            this.buscando = false;
    
            Swal.fire({
              title: 'WebView eliminada',
              text: 'Se eliminó la webview correctamente',
              icon: 'success',
              confirmButtonText: 'OK',
              confirmButtonColor: "#003865"
            });
          },
          error => {

            console.log("Error: ", error.error.Mensaje);
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
        text: 'El nombre ingresado es incorrecto, Por favor respetar mayusculas.',
        icon: 'error',
        confirmButtonText: 'OK',
        confirmButtonColor: "#003865"
      });

    }
    
  }

  filtrarWebviews(event: Event): void {
    const filtroLower = (event.target as HTMLInputElement).value.toLowerCase();
    this.filtro = filtroLower.length > 0;  
    this.webviewsFiltrados = this.webviews.filter(webview => {
      const principalTexto = webview.Principal == 1 ? "PRINCIPAL" : "-";
      
      return webview.Id.toString().toLowerCase().includes(filtroLower) ||
             webview.Nombre.toLowerCase().includes(filtroLower) ||
             principalTexto.toLowerCase().includes(filtroLower) ||
             webview.Create.toLowerCase().includes(filtroLower) ||
             webview.Update.toLowerCase().includes(filtroLower);
    });
  }

  abrirModalEliminar(webview: any) { 
    this.webviewSeleccionado = webview;
    this.modalVisibleEliminar = true;
    setTimeout(() => {
        this.detectarClicFuera = true; 
    }, 100);
  }
  cerrarModalEliminar() { 
    this.modalVisibleEliminar = false;

    this.formEliminarWebview.reset();
    this.formEliminarWebview.markAsPristine(); 
    this.formEliminarWebview.markAsUntouched(); 
    this.formEliminarWebview.updateValueAndValidity({ emitEvent: false });

    this.detectarClicFuera = false;
  }
  @HostListener('document:click', ['$event'])
  clickOutside(event: Event) {
    if (!this.detectarClicFuera) return;
    const modalContent = this.eRef.nativeElement.querySelector('.modal-contenido-eliminar-webview');
    if (this.modalVisibleEliminar && modalContent && !modalContent.contains(event.target)) {
      this.cerrarModalEliminar();
    }
  }

}