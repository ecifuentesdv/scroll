import { Component, ElementRef, OnInit, ViewChild, HostListener, AfterViewInit, Renderer2 } from '@angular/core';
import { ActivatedRoute, Router } from "@angular/router";
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

/**SERVICIOS */
import { WebViewService } from '../../services/orquestador/webviews.service';


@Component({
  selector: 'app-webview',
  templateUrl: './webview.component.html',
  styleUrl: './webview.component.css'
})
export class WebviewComponent implements OnInit, AfterViewInit{

  /**/public mostrarLoaderPagina: boolean;

  public webview:any;
  public idWebview: number;
  public vistas: any[];
  public parametros:any;
  private token: string;
  private CIF: string;
  public eventos: string[];
  public mostrarModalTip:boolean;
  public errorServicio:boolean;
  public errorServicioToken:boolean;
  public htmlContent: {
    Id:string
    Maqueta:SafeHtml
  }[];

  public showModalMensaje:boolean;
  public ModalMensaje:string;
  public ModalTitulo:string;
  public AlturaWebview:number;

  /**/public webviewCabeceraTexto: any;
  /**/public webviewCabeceraMarcadoTexto: any;

  @ViewChild('contWebView') contWebView!: ElementRef;
  @ViewChild('menuWebview') menuWebview!: ElementRef;
  @ViewChild('contTips') contTips!: ElementRef;

  /**/@ViewChild('encabezadoWebview') encabezadoWebview !: ElementRef;
  /**/@ViewChild('encabezadoImagenWebview') encabezadoImagenWebview !: ElementRef;

  constructor(

    private _wService: WebViewService,
    private route: ActivatedRoute,
    private router: Router,
    private sanitizer: DomSanitizer,
    private renderer: Renderer2

  ){

    /**/this.mostrarLoaderPagina = false;
    this.idWebview = 0;
    this.vistas = [];
    this.htmlContent = [];
    this.parametros = {};
    this.token = '';
    this.eventos = [];
    this.mostrarModalTip = false;
    this.errorServicio = false;
    this.errorServicioToken = false;
    this.CIF = '';
    this.showModalMensaje = false;
    this.ModalMensaje = '';
    this.ModalTitulo = '';
    this.AlturaWebview = 0;
    /**/this.webviewCabeceraTexto = '';
    /**/this.webviewCabeceraMarcadoTexto = '';

    //Funciones utilizadas mos los servicios de moneythor
  (window as any).requestMoneythor = this.requestMoneythor.bind(this);
  (window as any).showLoader = this.showLoader.bind(this);
  (window as any).ejecutarScripts = this.ejecutarScripts.bind(this);
  (window as any).mostrarTip = this.mostrarTip.bind(this);
  (window as any).ocultarTip = this.ocultarTip.bind(this);
  (window as any).redirectOutside = this.redirectOutside.bind(this);
  (window as any).ngShowModal = this.ngShowModal.bind(this);
  (window as any).redimensionar = this.redimensionar.bind(this);

  }


  //FUNCION que muestra y oculta los mensajes del modal de mensajes
  ngShowModal(tipo:string, titulo:string, mensaje:string){
    if( tipo == 'Mostrar' &&  ( titulo && mensaje )){
      this.showModalMensaje = ( tipo == 'Mostrar' );
      console.log("MODAL ", this.showModalMensaje);
      this.ModalMensaje = mensaje;
      this.ModalTitulo = titulo;

      console.log("Hacer scroll", document.documentElement );
      this.scrollArribaSuave();
    }else {
      this.showModalMensaje = false;
    }
  }



scrollArribaSuave(): void {
  const encabezado:any = document.getElementById('encabezado-webview')
  encabezado.scrollTo({ top: 0, behavior: 'smooth' });
}




//Funcion para redimensionar
redimensionar():void {

    setTimeout(() => {

      //this.AlturaWebview = document?.documentElement?.scrollHeight || 0;
      //this.AlturaWebview = document?.body?.scrollHeight || 0;
      this.AlturaWebview = document.documentElement.scrollHeight ;
      let alturaBody = document.body.scrollHeight;
      let alturaIframe = alturaBody + 100;
      console.log("alturas ", this.AlturaWebview , alturaIframe);
      //this.AlturaWebview += 50;
     window.parent.postMessage({ Altura : `${alturaIframe}px`, Type: "REDIMENSIONAR" }, '*');
    }, 10);

  }




//FUNCION PARA DETECTAR SI EL TIP FUE VISTO
/* ngAfterViewInit(): void {

    const mutationObserver = new MutationObserver((mutationList)=> {
      mutationList.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if(node.nodeType === 1 ){
            this.detectarElementos();
          }
        })
      })
    });

    const contWebview:any = document.querySelector('.cont-webviews');
    mutationObserver.observe(contWebview, { childList: true, subtree: true });
  //  this.detectarElementos(contWebview); //Detectar elementos iniciales si ya hay contenido

  } */
ngAfterViewInit(): void {
  const contWebview: any = document.querySelector('.cont-webviews');

  const resizeObserver = new ResizeObserver(() => {
    this.detectarElementos();
    this.redimensionar(); // 🔥 recalcula cada vez que cambia la altura real
  });

  resizeObserver.observe(contWebview);
}







  //Detectar individualmente los elementos
  detectarElementos() {

    // Seleccionar elementos dinámicos
    const elementos = document.querySelectorAll('.tip');
    elementos.forEach((element) => {
      if (!(element as HTMLElement).dataset['observed']) {
        (element as HTMLElement).dataset['observed'] = 'true';

        // Detectar visibilidad con IntersectionObserver
        const observer = new IntersectionObserver((entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              console.log("se a visto el tip ");
              const idTracking = element.getAttribute('data-idtracking');
              this.trackingMoneyThor(idTracking, 'impression')
              observer.disconnect();

            }
          });
        });

        observer.observe(element);


        // Detectar la activacion del
        this.renderer.listen(element, 'click', () => {
          console.log("click en tip");
          const idTracking = element.getAttribute('data-idtracking');
         this.trackingMoneyThor(idTracking, 'activation');

        });
      }
    });
  }





  //Enviar el tracking a MoneyThor
  trackingMoneyThor(idTracking:string|null, action:string){
    const dataRequest =  {
      "events": [ {
        "category": "tip",
        "action": action,
        "label": idTracking

    } ]}


    console.log("TRACKING ", dataRequest);
    console.log("TRACKING ", this.token);

    //Enviar el traking a MoneyThor
    this._wService.setTracking( this.CIF, this.token, dataRequest ).subscribe( response => {
    }, error => {
      console.log("error ", error );
    })
  }





  ngOnInit(): void {

    //Redimencionar
    window.parent.postMessage({ Altura: `100vh`, Type: "REDIMENSIONAR" }, '*');


    /**/this.mostrarLoaderPagina = true;

    this.getIdWebView();
    this.getParametros();

    const dataRequest = (  Object.keys(this.parametros).length > 0 ) ?
      { "Parametros": this.parametros } :
      { "Parametros": {} }

      console.log("Parametrosssss", this.parametros);
      this._wService.getDetalleOrquestador(this.idWebview, dataRequest, this.token, this.CIF ).subscribe( response => {

        //Actualizar el token
        this.token = response.newToken;


        sessionStorage.setItem('dispositivoOrquestador', response?.Dispositivo)
        this.webviewCabeceraTexto = response.WebView.Cabecera.W_TextoCabecera;
        this.webviewCabeceraMarcadoTexto = response.WebView.Cabecera.W_TextoMarcadoCabecera;
        const iconCabecera = response?.WebView?.Cabecera?.W_IconCabecera || ''
        //para mostrar el menu
        const mostrarMenu = response?.WebView?.Cabecera?.W_MostrarMenu || 0;
        if(mostrarMenu == 1){
        this.generarMenu(response.Menu, this.idWebview, /**/this.webviewCabeceraTexto, this.webviewCabeceraMarcadoTexto, iconCabecera);
        }

        this.vistas = response.MoneyThor.data;

        this.vistas.forEach( (v:any)=> {
          if(v.Maqueta ){

            const contentWebview = document.createElement('div');
            contentWebview.id = v.Servicio;
            contentWebview.classList.add('webview', v.Servicio.replace(/\s+/g, '_'));

            if(  typeof(v.Maqueta) == 'string' ) {
              contentWebview.innerHTML = v.Maqueta;
            }else {
              contentWebview.append(this.createErrorServicio())
              this.ngShowModal('Mostrar', 'Advertencia', 'Ops, parece que no todo salio bien, porfavor intentalo más tarde.')
            }
            this.contWebView.nativeElement.appendChild(contentWebview);
          }
        });

        setTimeout(()=> {
          this.ejecutarScripts();
          this.agregarRedirecciones(response.WebView.Redirecciones);
          this.agregarEvento( response.WebView.Tracking);
        }, 1000 )

      setTimeout(() => {
        this.mostrarLoaderPagina = false;
      }, 4000);

      },
    error => {

      /**/this.mostrarLoaderPagina = false;

      console.log("Ocurrio un error", error);
      console.log("Ocurrio un error", error.status);
      let mensaje = '';
      if( error.status == '401' || error.status == '403' ){
        mensaje = 'Se ha cerrado tu sesión por inactividad';
        this.errorServicioToken = true;
        this.errorServicio = false;
      }else {
        this.errorServicio = true;
        this.errorServicioToken = false;
        mensaje = 'Ocurrio un error, por favor intentar más tarde';
      }

      this.ngShowModal('Mostrar', 'Se cerro la sesión', mensaje);



      if( error.error.newToken ){
        //Actualizar menu
        this.updateMenu(error.error.newToken);
      }


    })

  }





  //Funcion para mostrar el contenido del tip (descripcion)
  mostrarTip(cont:string){
    if( !cont ) return
    this.contTips.nativeElement.innerHTML=cont;
    const padreModalTips = this.contTips?.nativeElement?.parentElement?.parentElement || '';
    if( padreModalTips ){
       if(!padreModalTips.classList.contains('modalTips') ) padreModalTips.classList.add('modalTips');
       if(padreModalTips.classList.contains('ocultar') ) padreModalTips.classList.remove('ocultar');
    }
    setTimeout(() => {
      // Alternativa si redimensionar no está definido globalmente
      const contenedor = document.getElementsByClassName('contBodyTips')[0];
      const altura = contenedor?.scrollHeight;

      console.log("Altura del documento ", altura);
      window.parent.postMessage({ Altura : `${altura}px`, Type: "REDIMENSIONAR" }, '*');

    }, 200);
  }



  //Funcion para ocultar el contenido del tip
  ocultarTip(){

    const padreModalTips = this.contTips?.nativeElement?.parentElement?.parentElement || '';
    if( padreModalTips ){
       if(padreModalTips.classList.contains('modalTips') ) padreModalTips.classList.remove('modalTips');
       if(!padreModalTips.classList.contains('ocultar') ) padreModalTips.classList.add('ocultar');
    }
  //  return ( this.mostrarModalTip ) ? 'modalTips' : 'ocultar';
  this.redimensionar();
  }


  //Funcion para cambiar de clase el modal del consejo del tips
  mostrarOcultarModal(){
     return ( this.mostrarModalTip ) ? 'modalTips' : 'ocultar'
  }





  //Funcion para mostror u ocultar el loader
  showLoader(tipo:boolean):void{
    this.mostrarLoaderPagina = tipo;
  }




  //Funcion para consumir las APIS desde moneythor
  requestMoneythor(parametros:any, successFunction: Function, errorFunction: Function){
    this._wService.requestMoneyThor( parametros, this.token, this.CIF ).subscribe( response => {
      console.log("Desde MoneyThor ", response);

      //Actualizar menu
      this.updateMenu(response.newToken);

      //Ejecutar funcion de exito del lado del orquestadot
      successFunction(response);

    }, error => {
      console.log("Error ", error.message);
      this.updateMenu(error.error.newToken);
      errorFunction(error);
    });
  }


  //Actualizar token del menu
  updateMenu(token:string|null):void{
    if( token ){
      this.token = token;
      const menu = document.querySelectorAll('.menu-webview .menu li a');

      menu.forEach( (a) => {
        let href:any = a.getAttribute('href');
        href = href?.split('/');
        href[ href.length-1] = token;
        href = href.join('/');
        a.setAttribute('href', href);
      });

      console.log("Menu actualizado");
    }
  }


  //Redirigir afuera del iframe/Webview
redirectOutside(urlDesktop: string, urlMobil: string) {
  const dispositivo = sessionStorage.getItem('tokenOrquestador') ?? 'desktop';
  const url = ( dispositivo == 'mobile' ) ? urlMobil : urlDesktop;

  console.log("DISPOSITIVO ", dispositivo);
  console.log("URL ", url);

  window.parent.postMessage(
    {
      type: 'REDIRECT_REQUEST',
      redirectTo: url

    }, '*' );
  }





  //Ejectuar los script que vienen en las webview
  ejecutarScripts(elemento:string = 'cont-webviews') {

    console.log("ELEMENTO ", elemento );

    const contenedor:any = document.getElementById(elemento);
    const scripts = ( contenedor ) ?
        contenedor.querySelectorAll('script') :
        document.querySelectorAll('script');




    scripts.forEach((oldScript:any) => {
      const newScript = document.createElement('script');
      newScript.text = oldScript.innerText;
      contenedor.appendChild(newScript);
      oldScript.remove();
    });
  }






/* PABLO */
generarMenu(data: any[], id: number, /**/cabeceraTexto:any, cabeceraMarcadoTexto: any, iconoCabecera: string): void {

  const menuElement: HTMLElement = this.menuWebview.nativeElement;
  menuElement.innerHTML = ''; // Limpia el menú antes de regenerarlo

  /**/const encabezadoElement: HTMLElement = this.encabezadoWebview.nativeElement;
  /**/encabezadoElement.innerHTML = '';

  /**/const encabezadoImagenElement: HTMLElement = this.encabezadoImagenWebview.nativeElement;
  /**/encabezadoImagenElement.innerHTML = '';
    console.log("data ", data);
  data.forEach((m: any) => {

    const li: HTMLLIElement = document.createElement('li');

    const img: HTMLImageElement = document.createElement('img');
    img.src = m.Icono;
    img.alt = "";
    img.width = 20;
    img.height = 20;

    const a: HTMLAnchorElement = document.createElement('a');
    a.href = `webview/${encodeURIComponent(this.CIF)}/${m.Id}/${this.token}`;
    a.id = `${m.Id}`;
    a.className = `item-menu ${m.Nombre.replace(/ /g, '_')}`;
    a.textContent = m.Nombre;

    if (m.Id == id) {

      /**/const p: HTMLParagraphElement = document.createElement('p');
      /**/p.textContent = cabeceraTexto || '-';

      /**/const h2: HTMLHeadingElement = document.createElement('h2');
      /**/h2.textContent = cabeceraMarcadoTexto || '-';

      /**/encabezadoElement.appendChild(p);
      /**/encabezadoElement.appendChild(h2);

      /**/const imgEncabezado: HTMLImageElement = document.createElement('img');
      /**/imgEncabezado.src = (iconoCabecera) ? iconoCabecera : m.Icono;
      /**/imgEncabezado.alt = "";
      /**/imgEncabezado.width = 80;
      /**/imgEncabezado.height = 80;

      /**/encabezadoImagenElement.appendChild(imgEncabezado);

      li.classList.add('activado');

    }

    a.addEventListener('click', (event: MouseEvent) => {

      event.preventDefault();

      document.querySelectorAll('.menu li').forEach((el) => el.classList.remove('activado'));

      li.classList.add('activado');

      window.location.href = a.href;

    });

    li.appendChild(img);
    li.appendChild(a);

    menuElement.appendChild(li);

  });

  const encabezado:any = document.querySelector('.encabezado');
  const menuWebview:any = document.querySelector('.menu-webview');
  if(encabezado ) {
    encabezado.style.display='flex';
  menuWebview.style.display='block';

  }
}
/* FIN PABLO */










  //Se obtienen los id, de los elementos que se requiere trackiar
  agregarEvento(trakings:any[]){

    trakings.forEach((t:any) => {
      this.eventos.push(t.IdElemento || '');
    });
  }





  //Se editan y generan redirecciones
  agregarRedirecciones(redirecciones:any[]){

   redirecciones.forEach((r:any) => {

     const redireccion = this.contWebView.nativeElement.querySelector(`[data-idredireccion='${r.Clase}']`);
     if( redireccion ){

       const parametros = redireccion.getAttribute("data-parametros");
       if( parametros ){
         const params = new URLSearchParams(JSON.parse( parametros)).toString();
         redireccion.setAttribute('href',`webview/${this.CIF}/${r.Webview}/${this.token}?${params}`);
        }else {
          redireccion.setAttribute('href',`webview/${this.CIF}/${r.Webview}/${this.token}`);
        }
      }
   });
  }




  //Obteer los parametros de la url y enviarlos a los servicios
  getParametros(){
    this.route.queryParams.subscribe( params => {
      this.parametros = { ...params}
    })
  }




//Obtener los parametros que son necesarios para llamar al webview
  getIdWebView():void{
    this.route.params.subscribe(params => {
      this.idWebview = params['idWebview'];
      this.token = params['token'];
      this.CIF = params['customer'];
      sessionStorage.setItem('tokenorquestador', this.token);
      sessionStorage.setItem('customerorquestador', this.CIF);
    })
  }




  //Generar pantalla de servicio error
  createErrorServicio() {
    const divContenido = document.createElement('div');
    const divError = document.createElement('div');
    //const img = document.createElement('img');

    divContenido.classList.add('contenido-servicio')
    divError.classList.add('error-servicio')
    //img.src='/assets/img/err';
    //divError.append(img);
    divContenido.append(divError);
    return divContenido;
  }




}


