import { Component, ElementRef, HostListener } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';

/**SERVICIOS */
import { WebViewService } from '../../services/orquestador/webviews.service';

/**MENSAJE DE ALERTA */
import Swal from 'sweetalert2';

@Component({
  selector: 'app-crear-editar-webview',
  templateUrl: './crear-editar-webview.component.html',
  styleUrls: ['./crear-editar-webview.component.css']
})
export class CrearEditarWebviewComponent {

  public redireccionesWebView: any[];

  formAgregarWebView: FormGroup;

  public buscando: boolean;
  public mostrarLoaderPagina: boolean;

  public nombreWebview: string;
  public principalWebview: number;
  public agregarMenuWebview: number;
  public iconoMenuWebview: string;
  public iconoMenuCabecera: string;
  public primerTituloMenuWebView: string;
  public segundoTituloMenuWebView: string;

  public iconUrl: string | ArrayBuffer | null = null;
  public iconUrlCabecera: string | ArrayBuffer | null = null;
  errorMessage: string | null = null;
  allowedTypes = ['image/x-icon', 'image/png', 'image/svg+xml'];
  allowedExtensions = ['ico', 'png', 'svg'];

  public redireccionesList: any[];
  public trackingList: any[];
  public nombreProducto: string | null;
  public idProducto: number;
  public  idWebView: number;
  token: string | null = '';
  public maquetaServicios: any[]; 
  public serviciosList: any[];
  public filteredServiciosList: any[] = [];
  isDropdownOpen = false;
  selectedOptions: any[] = []; 
  public searchTerm: string = '';
  selectedOptionWebviews: string = ''; 
  opcionesWebviews: { value: number, label: string } [] = [];
  
  /*----*/
  trackeoselectedOption: string = ''
  trackeoOpciones = [
    { value: 'Impression', label:'Impression' }, 
    { value: 'Custom', label:'Custom' }, 
    { value: 'Activation', label:'Activation' }
  ];
  /*----*/

  constructor(

    private fb: FormBuilder,
    private eRef: ElementRef,
    private _wService: WebViewService,
    private route: ActivatedRoute,
    private router: Router
    
  ) {

    this.redireccionesWebView = [];

    this.nombreProducto = '';
    this.idProducto = 0;
    this.idWebView = 0;
    this.maquetaServicios = [];
    this.serviciosList = [];

    this.redireccionesList = [];
    this.trackingList = [];

    this.buscando = false;
    this.mostrarLoaderPagina = false;

    this.formAgregarWebView = this.fb.group({
      nombreAgregarWebView: ['', [Validators.required, Validators.pattern(_wService.regexStringConEspacio)]],
      principalAgregarWebView: [false],
      menuAgregarWebView: [false],
      iconoMenuAgregarWebView: [null],
      primerTituloMenuAgregarWebView: ['', [Validators.pattern(_wService.regexStringConEspacio)]],
      segundoTituloMenuAgregarWebView: ['', [Validators.pattern(_wService.regexStringConEspacio)]]
    });

    this.nombreWebview = '';
    this.principalWebview = 0;
    this.agregarMenuWebview = 0;
    this.iconoMenuWebview = '';
    this.iconoMenuCabecera = '';
    this.primerTituloMenuWebView = '';
    this.segundoTituloMenuWebView = '';
    
  }

  get nombreAgregarWebView () { return this.formAgregarWebView.get('nombreAgregarWebView'); }
  get principalAgregarWebView () { return this.formAgregarWebView.get('principalAgregarWebView'); }
  get menuAgregarWebView () { return this.formAgregarWebView.get('menuAgregarWebView'); }
  get iconoMenuAgregarWebView () { return this.formAgregarWebView.get('iconoMenuAgregarWebView'); }
  get primerTituloMenuAgregarWebView () { return this.formAgregarWebView.get('primerTituloMenuAgregarWebView'); }
  get segundoTituloMenuAgregarWebView () { return this.formAgregarWebView.get('segundoTituloMenuAgregarWebView'); }

  ngOnInit(): void {

    this.mostrarLoaderPagina = true;
    this.nombreProducto = sessionStorage.getItem('nombreProducto') ?? '';
    this.token = sessionStorage.getItem('tokenOrquestador') ?? '';

    this.getServicios();
   

    //this.getIdWebView();
    
    this.formAgregarWebView.get('menuAgregarWebView')?.valueChanges.subscribe((valor) => {
      if (!valor) {
        this.formAgregarWebView.get('iconoMenuAgregarWebView')?.reset();
        this.iconUrl = null;
        this.iconUrlCabecera = null;
        this.iconoMenuWebview = '';
        this.iconoMenuCabecera = '';
        this.formAgregarWebView.get('primerTituloMenuAgregarWebView')?.reset();
        this.formAgregarWebView.get('segundoTituloMenuAgregarWebView')?.reset();
      }
    });

  }

  getIdWebView () {

    this.route.params.subscribe(params => {

      this.idWebView = params['nombreWebView'];

      if(this.idWebView) {

        this._wService.getWebView( this.idWebView, this.token || '' ).subscribe( 
      
          response => {

            console.log('response Webview',response);

            this.nombreAgregarWebView?.setValue(response.WebView.Cabecera.W_Webview);
            this.principalAgregarWebView?.setValue(response.WebView.Cabecera.W_Es_Principal);
            this.menuAgregarWebView?.setValue(response.WebView.Cabecera.W_Menu);
            this.primerTituloMenuAgregarWebView?.setValue(response.WebView.Cabecera.W_TextoCabecera);
            this.segundoTituloMenuAgregarWebView?.setValue(response.WebView.Cabecera.W_TextoMarcadoCabecera);

            const servicioW = response?.WebView?.Servicios || [];
            const redireccionesW = response?.WebView?.Redirecciones || [];


            // Cargar los servicios obtenidos de la consulta y seleccionarlos en el select de servicios y mostrar sus datos
            servicioW.forEach(( sW: any ) => {

              this.selectOption({ 
                Descripcion: '',
                Nombre: sW.MoneyThor,
                parameters: {},
                properties: sW.properties 
              })

            });

            // Muestra los nombres seleccionados en el select
            this.redireccionesWebView = redireccionesW;

            // Se juntan 2 arreglos en uno solo haciendo match por medio de la clase/ID de las redirecciones
            const combinacionRediWList = this.redireccionesList.map(itemList => {
              const match = redireccionesW.find((itemW: any) => itemW.Clase === itemList.clase);
              
              return {
                ...itemList,  
                Webview: match ? match.Webview : null,
                Id: match ? match.Id : null
              };
            });

            // Se itera la funcion agregar... insertando los datos necesarios obtenidos del arreglo combinado
            combinacionRediWList.forEach(item => {
              this.agregarWebViewPrecargado(item.Webview, item.nombre, item.servicio);
            });


            if(response?.WebView?.Cabecera?.W_Icono ) {
              this.iconUrl = `${response.WebView.Cabecera.W_Icono}`;
              this.iconoMenuWebview = `${response.WebView.Cabecera.W_Icono}`;
              console.log("url menu ", this.iconUrl );
              console.log("url menu ", this.iconoMenuWebview );
            }


            if( response?.WebView?.Cabecera?.W_IconCabecera){
              this.iconoMenuCabecera = `${response.WebView.Cabecera.W_IconCabecera}`;
              this.iconUrlCabecera = `${response.WebView.Cabecera.W_IconCabecera}`;
              console.log("url menu cabecera", this.iconoMenuCabecera );
              console.log("url menu cabecera", this.iconUrlCabecera );
            }



            this.mostrarLoaderPagina = false;

          }, 
          error => {

            console.log("Error ", error.error.Mensaje);
            this.mostrarLoaderPagina = false;

          }
          
        )
        
      }else {
        this.mostrarLoaderPagina = false;
      }

    })

  }

  getParameters( object: any ): string {

    //console.log(typeof(object)) 

    let parametros: string[] = [];
    for (const key in object) {
      if (Object.prototype.hasOwnProperty.call(object, key)) {
        parametros.push(key);
      }
    }
    return parametros.join(',');

  }
 
  agregarWebView(e: any, rnombre: any, rservicio: any ): void {

    this.redireccionesList.map(( rL: any ) => {
      if(rnombre == rL.nombre && rservicio == rL.servicio) {
        rL.webview = e.target.value;
      }
      return rL;
    })

  }

  agregarWebViewPrecargado(webview: any, rnombre: any, rservicio: any ): void {

    this.redireccionesList.map(( rL: any ) => {
      if(rnombre == rL.nombre && rservicio == rL.servicio) {
        rL.webview = webview;
      }
      return rL;
    })

  }

  crearWebview () {

    this.mostrarLoaderPagina = true;
    this.getIdProducto();
    this.nombreWebview = this.formAgregarWebView.value.nombreAgregarWebView;
    this.principalWebview = this.formAgregarWebView.value.principalAgregarWebView ? 1 : 0;
    this.agregarMenuWebview = this.formAgregarWebView.value.menuAgregarWebView ? 1 : 0;
    this.primerTituloMenuWebView = this.formAgregarWebView.value.primerTituloMenuAgregarWebView;
    this.segundoTituloMenuWebView = this.formAgregarWebView.value.segundoTituloMenuAgregarWebView;

    if (!this.formAgregarWebView.invalid) {

      if (this.selectedOptions.length){
        
        let contadorServicio = 0;
        const serviciosList = this.selectedOptions.map(( s:any ) =>{
          return {
            "Nombre": s.Nombre,
            "Moneythor": s.Nombre,
            "Orden": contadorServicio++,
            "Parametros": this.getParameters( s.parameters )
          }
        })

        const redireccionesList = this.redireccionesList.map (( r:any ) => {
          return {
            "Clase": r.clase, 
            "Webview": r.webview 
          }
        })

        const trackingList = this.trackingList.map(( t: any ) => {
          return {
            "Id_Elemento": t.clase, 
            "Elemento": t.tipo.toLowerCase()
          }
        })   

        if (this.redireccionesList.some(r => !r.webview || r.webview.trim() == '')) {

          this.mostrarLoaderPagina = false;

          Swal.fire({
            title: 'Error',
            text: 'Por favor, seleccione la redirección de todas las redirecciones',
            icon: 'error',
            confirmButtonText: 'OK',
            confirmButtonColor: "#003865"
          });
        } else {       

          if (this.agregarMenuWebview === 1 && (!this.iconoMenuCabecera || !this.iconoMenuWebview || !this.primerTituloMenuWebView.trim() || !this.segundoTituloMenuWebView.trim())) {

            this.mostrarLoaderPagina = false;

            Swal.fire({
              title: 'Error',
              text: 'Por favor, cargue un icono y/o ingrese los títulos del encabezado para el menú.',
              icon: 'error',
              confirmButtonText: 'OK',
              confirmButtonColor: "#003865"
            });
            
          } else {

            const dataRequest = {
              "Nombre": this.nombreWebview,
              "Producto": Number(this.idProducto),
              "Descripcion": "",
              "Principal": this.principalWebview,
              "AgregarMenu": this.agregarMenuWebview,
              "Icono": this.iconoMenuWebview,
              "IconoCabecera": this.iconoMenuCabecera,
              "TextoCabecera": this.primerTituloMenuWebView,
              "TextoMarcadoCabecera": this.segundoTituloMenuWebView,
              "Servicios": serviciosList,
              "Redirecciones": redireccionesList,
              "Tracking": trackingList
            }

            console.log("Data request save ", dataRequest );

            this._wService.CreateWebView(dataRequest, this.token || '').subscribe(
              
              response => {
  
                this.mostrarLoaderPagina = false;
                this.router.navigate([`/orquestador/webviews/${this.idProducto}`]);
  
                Swal.fire({
                  title: 'WebView guardada',
                  text: 'Se guardó la webview correctamente',
                  icon: 'success',
                  confirmButtonText: 'OK',
                  confirmButtonColor: "#003865"
                });
  
              },
              error => {
  
                this.mostrarLoaderPagina = false;
                console.log("Error ", error.error.Mensaje);
      
                /*
                let mensaje = '';
                if(error.status === 409) mensaje = 'El correo ya existe';
                if(error.status === 400) mensaje = 'Por favor verifique los datos ingresados';
                if(error.status === 500 || ( error.status !== 409 && error.status !== 400 )) mensaje = 'Ocurrio un error al crear el usuario';
                */
      
                Swal.fire({
                  title: 'Error',
                  //text: mensaje,
                  text: error.error.Mensaje,
                  icon: 'error',
                  confirmButtonText: 'OK',
                  confirmButtonColor: "#003865"
                });

              }

            )

          }

        }

      } else {

        this.mostrarLoaderPagina = false;

        Swal.fire({
          title: 'Error',
          text: 'Por favor, seleccione al menos un servicio',
          icon: 'error',
          confirmButtonText: 'OK',
          confirmButtonColor: "#003865"
        });
      }
    } else {

      this.mostrarLoaderPagina = false;
      
      Swal.fire({
        title: 'Error',
        text: 'Ingrese correctamente los datos',
        icon: 'error',
        confirmButtonText: 'OK',
        confirmButtonColor: "#003865"
      });
      
    }

  }

  editarWebview () {

    this.mostrarLoaderPagina = true;
    this.getIdProducto();
    this.nombreWebview = this.formAgregarWebView.value.nombreAgregarWebView;
    this.principalWebview = this.formAgregarWebView.value.principalAgregarWebView ? 1 : 0;
    this.agregarMenuWebview = this.formAgregarWebView.value.menuAgregarWebView ? 1 : 0;
    this.primerTituloMenuWebView = this.formAgregarWebView.value.primerTituloMenuAgregarWebView;
    this.segundoTituloMenuWebView = this.formAgregarWebView.value.segundoTituloMenuAgregarWebView;

    console.log('this.agregarMenuWebview',this.agregarMenuWebview);
    console.log('this.iconoMenuWebview',this.iconoMenuWebview);
    console.log('this.iconoMenuCabecera',this.iconoMenuCabecera);
    console.log('this.primerTituloMenuWebView',this.primerTituloMenuWebView);
    console.log('this.segundoTituloMenuWebView',this.segundoTituloMenuWebView);

    if (!this.formAgregarWebView.invalid) {

      if (this.selectedOptions.length){
        
        let contadorServicio = 0;
        //Agregar los servicios de moneythor
        const serviciosList = this.selectedOptions.map(( s:any ) =>{
          return {
            "Nombre": s.Nombre,
            "Moneythor": s.Nombre,
            "Orden": contadorServicio++,
            "Parametros": this.getParameters( s.parameters )
          }
        })

        // Agregar las redirecciones
        const redireccionesList = this.redireccionesList.map (( r:any ) => {
          return {
            "Clase": r.clase, 
            "Webview": r.webview 
          }
        })

        //Agregar los tracking de los servicios
        const trackingList = this.trackingList.map(( t: any ) => {
          return {
            "Id_Elemento": t.clase, 
            "Elemento": t.tipo.toLowerCase()
          }
        })  


        
        if (this.redireccionesList.some(r => !r.webview || r.webview.trim() == '')) {
          this.mostrarLoaderPagina = false;
          Swal.fire({
            title: 'Error',
            text: 'Por favor, seleccione la redirección de todas las redirecciones',
            icon: 'error',
            confirmButtonText: 'OK',
            confirmButtonColor: "#003865"
          });
        } else {
       

          if (this.agregarMenuWebview === 1 && (!this.iconoMenuCabecera || !this.iconoMenuWebview || !this.primerTituloMenuWebView.trim() || !this.segundoTituloMenuWebView.trim())) {

            this.mostrarLoaderPagina = false;

            Swal.fire({
              title: 'Error',
              //text: 'Por favor, cargue un icono para el menú.',
              text: 'Por favor, cargue un icono y/o ingrese los títulos del encabezado para el menú.',
              icon: 'error',
              confirmButtonText: 'OK',
              confirmButtonColor: "#003865"
            });

          } else {

            const dataRequest = {
              "Nombre": this.nombreWebview,
              "Producto": Number(this.idProducto),
              "Descripcion": "",
              "Principal": this.principalWebview,
              "AgregarMenu": this.agregarMenuWebview,
              "Icono": this.iconoMenuWebview,
              "IconoCabecera": this.iconoMenuCabecera,
              "TextoCabecera": this.primerTituloMenuWebView,
              "TextoMarcadoCabecera": this.segundoTituloMenuWebView,
              "Servicios": serviciosList,
              "Redirecciones": redireccionesList,
              "Tracking": trackingList
            }

            console.log("Edit request ", dataRequest);
            
            this._wService.EditWebView(dataRequest, this.token || '', this.idWebView).subscribe(
              
              response => {
  
                this.mostrarLoaderPagina = false;
                this.router.navigate([`/orquestador/webviews/${this.idProducto}`]);
  
                Swal.fire({
                  title: 'WebView editada',
                  text: 'Se editó la webview correctamente',
                  icon: 'success',
                  confirmButtonText: 'OK',
                  confirmButtonColor: "#003865"
                });
  
              },

              error => {
  
                this.mostrarLoaderPagina = false;
                console.log("Error ", error.error.Mensaje);
      
                /*
                let mensaje = '';
                if(error.status === 409) mensaje = 'El correo ya existe';
                if(error.status === 400) mensaje = 'Por favor verifique los datos ingresados';
                if(error.status === 500 || ( error.status !== 409 && error.status !== 400 )) mensaje = 'Ocurrio un error al crear el usuario';
                */
      
                Swal.fire({
                  title: 'Error',
                  text: error.error.Mensaje,
                  icon: 'error',
                  confirmButtonText: 'OK',
                  confirmButtonColor: "#003865"
                });

              }

            )

          }

        }

      } else {

        this.mostrarLoaderPagina = false;
        Swal.fire({
          title: 'Error',
          text: 'Por favor, seleccione al menos un servicio',
          icon: 'error',
          confirmButtonText: 'OK',
          confirmButtonColor: "#003865"
        });
      }
    } else {
      
      this.mostrarLoaderPagina = false;
      Swal.fire({
        title: 'Error',
        text: 'Ingrese correctamente los datos',
        icon: 'error',
        confirmButtonText: 'OK',
        confirmButtonColor: "#003865"
      });
      
    }

  }

  getIdProducto () {
    this.route.params.subscribe(params => {
      this.idProducto = params['idProducto'];
    })
  }

  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  checkedSelectServicio(nombre: string): boolean {
    if (!this.selectedOptions || this.selectedOptions.length === 0) {
      return false;
    }

    return this.selectedOptions.some(optionS => 
      optionS.Nombre.toLowerCase() === nombre.toLowerCase()
    );
  }

  selectOption(option: any) {

    console.log("seleccionar ", option);
      
    const index = this.selectedOptions.find(( opt: any ) => opt.Nombre == option.Nombre);
    const index2 = this.filteredServiciosList.filter(( opt: any ) => opt.Nombre == option.Nombre);

    if (index) {

      this.selectedOptions = this.selectedOptions.filter(( opt: any ) => opt.Nombre != option.Nombre);
      this.redireccionesList = this.redireccionesList.filter (( rdi: any ) => rdi.servicio != option.Nombre);
      this.trackingList = this.trackingList.filter (( tck: any ) => tck.servicio != option.Nombre);

    } else {

      const maqueta = this.maquetaServicios.filter(( maqop: any ) => maqop.servicio == option.Nombre );

      if (maqueta.length) {

        const htmlString = maqueta[0].mapeta;
        const nuevasClases = this.obtenerClasesDesdeHTML(htmlString);

        // Verificamos si alguna de estas clases ya existe en redireccionesList
        const claseRepetida = nuevasClases.some((nuevaClase) =>
          this.redireccionesList.some((rdi) => rdi.clase === nuevaClase)
        );

        if (claseRepetida) {

          Swal.fire({
            title: 'Error',
            //text: `No se puede agregar porque la clase que contiene el ${option.Nombre} ya existe en redirecciones`,
            text: `El ID de redirección para el servicio ${option.Nombre} ya existe.`,
            icon: 'error',
            confirmButtonText: 'OK',
            confirmButtonColor: "#003865"
          });

          return; 

        } else {

          this.selectedOptions.push(index2[0]);

        }

        this.extractElements(htmlString, option.Nombre);

      }

    }

  }

  obtenerClasesDesdeHTML(htmlString: string): string[] {

    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlString, "text/html"); 
    const redirectElements = doc.querySelectorAll(".redirect");

    return Array.from(redirectElements)
        .map((r: any) => r.getAttribute("data-idredireccion"))
        .filter((clase) => clase); 

  }

  getSelectedOptions(): string {

    return 'Seleccione servicios de MoneyThor';

  }

  @HostListener('document:click', ['$event'])
  clickOutside(event: Event) {
    const dropdown = this.eRef.nativeElement.querySelector('.div-multi-select-opcion');

    if (this.isDropdownOpen && dropdown && !dropdown.contains(event.target)) {
      this.isDropdownOpen = false;
    }
  }
    
  getWebViews( ) : void {
  
    this.getIdProducto();
    
    this._wService.getAll( this.idProducto, this.token || '' ).subscribe( 
      
      response => {

        this.getIdWebView(); 
        if(!response.WebViews || response.WebViews.length === 0) {

          console.log('El producto no contiene servicios de MoneyThor');

        } else {

          this. opcionesWebviews = response.WebViews.map(( wv: any ) => ({
            value: wv.Id,
            label: wv.Nombre
          }))

        }
      }, error => {
        console.log("Error ", error);
        this.mostrarLoaderPagina = false;
    })   

  }

  getServicios( ) : void {

    this.getIdProducto();

    this._wService.getServiceProduct( this.idProducto, this.token || '').subscribe ( 
      response => {

        this.serviciosList = response.Servicios;
        this.filteredServiciosList = [...this.serviciosList];
        this.maquetaServicios = response.Maquetas.data;
        //this.mostrarLoaderPagina = false;
        this.getWebViews();
      }, error => {
        
        console.log("Error ", error);
        this.mostrarLoaderPagina = false;

    })
    
  }

  extractElements(htmlString: string, service: string) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlString, "text/html"); 

    const redirectElements = doc.querySelectorAll(".redirect");
    const trackingElements = doc.querySelectorAll(".tracking");




    //Agregar las redicecciones
   redirectElements.forEach( (r: any) => {

    this.redireccionesList.push({
      nombre: r.getAttribute('data-nombre'),
      clase: r.getAttribute('data-idredireccion'),
      tipo: r.tagName,
      servicio: service
    })

   })


   //Agregar los trackeos
   if(htmlString.includes(`window.requestMoneythor`) && htmlString.includes(`"API": "tip"`)){
        this.trackingList.push({ nombre: service, clase: 'trackingVista', tipo: 'tip',  servicio: service, trackeo: 'Vista'})
        this.trackingList.push({ nombre: service, clase: 'trackingInteraccion', tipo: 'tip',  servicio: service, trackeo: 'interaccion'})
   }


  /* trackingElements.forEach( (t: any) => {

    const parametroTracking = t.getAttribute('data-parametrostracking');
    let action = 'No tiene trackeo';

    if (parametroTracking) {
      try {
          const trackingData = JSON.parse(parametroTracking);
          action = trackingData.events?.[0]?.action || 'No definido';
      } catch (error) {
          console.error('Error al parsear JSON:', error);
      }
    }

    this.trackingList.push({
      nombre: t.getAttribute('data-nombre'),
      clase: t.getAttribute('data-idtracking'),
      tipo: t.tagName, 
      servicio: service,
      trackeo: action
    })

   })*/
   
  }

  filtrarServicios(event: Event): void {

    const filtroLower = (event.target as HTMLInputElement).value.toLowerCase();

    this.filteredServiciosList = this.serviciosList.filter(option =>
      option.Nombre.toLowerCase().includes(filtroLower)
    );
  }

  //Selecccionar menu 
  onFileSelected(event: Event, tipo:string): void {

    this.errorMessage = null; 
    const input = event.target as HTMLInputElement;

    if (input.files && input.files.length > 0) {
      
      const file = input.files[0];
      const fileType = file.type;
      const fileExtension = file.name.split('.').pop()?.toLowerCase();

      if (!this.allowedTypes.includes(fileType) || !this.allowedExtensions.includes(fileExtension || '')) {

        this.errorMessage = 'Formato no válido, solo se permiten .ico, .png y .svg.';
        console.log('errorMessage',this.errorMessage);
        Swal.fire({
          title: 'Error',
          text: this.errorMessage,
          icon: 'error',
          confirmButtonText: 'OK',
          confirmButtonColor: "#003865"
        });
        
        return;
      }

      // Validar tamaño (Opcional)
      if (file.size > 500 * 1024) { // 500 KB máximo

        this.errorMessage = 'El archivo es demasiado grande, máximo 500KB.';
        console.log('errorMessage',this.errorMessage);
        Swal.fire({
          title: 'Error',
          text: this.errorMessage,
          icon: 'error',
          confirmButtonText: 'OK',
          confirmButtonColor: "#003865"
        });

        return;
      }

      console.log("TIPOS ", tipo );

      // Leer archivo si es válido
      const reader = new FileReader();
      reader.onload = () => {
        if( tipo == 'menu'){

          this.iconUrl = reader.result;
          this.iconoMenuWebview = reader.result as string;
        }else {
          this.iconUrlCabecera = reader.result;
          this.iconoMenuCabecera = reader.result as string;
        }

        console.log("URL Icono", this.iconUrl);        
        console.log("URL Cabecera", this.iconoMenuCabecera);        
        console.log("Iciono ", this.iconoMenuWebview);
        console.log("Cabecera ", this.iconoMenuCabecera);


      };
      reader.readAsDataURL(file);
    }
  }

}

