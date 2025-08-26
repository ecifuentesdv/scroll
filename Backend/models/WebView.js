const Core = require('./core');

module.exports = class WebView extends Core {

    constructor(idWebview, estatus, nombre, agregarMenu, idProducto, descripcion, principal, servicios, traquing, redirecciones, create, updated, icono, iconoCabecera, textoCabecera, textoMarcadoCabecera   ){
        super('Webview', 'Id_webview');
        this.idWebview = idWebview;
        this.estatus = estatus;
        this.nombre = nombre;
        this.agregarMenu = agregarMenu;
        this.idProducto = idProducto;
        this.descripcion = descripcion;
        this.principal = principal;
        this.servicios = servicios;
        this.traquing = traquing;
        this.redirecciones = redirecciones;
        this.create = create;
        this.updated = updated;
        this.icono = icono;
        this.iconoCabecera = iconoCabecera;
        this.textoCabecera = textoCabecera;
        this.textoMarcadoCabecera = textoMarcadoCabecera;
        this.table = 'Webview';
        this.idTable = 'Id_webview';
    }


    //Obtener la informacion detallada del webview
    async getDetalles(){
        return (this.idWebview) ? 
            await super.executeQuery(`SELECT * FROM GetWebview('${this.idWebview}');`) :
            []
    }

    //Agregar nueva webview
    async AgregarWebview(){
        return super.executeQuery(`EXEC [dbo].AddWebview 
                        @Nombre         = '${this.nombre}',  
                        @Id_Producto    = ${this.idProducto}, 
                        @Descripcion    = '${this.descripcion}', 
                        @Principal      = '${this.principal}', 
                        @Icono          = '${this.icono}',
                        @Agregar_menu   = '${this.agregarMenu}',
                        @Servicios      = N'${this.servicios}', 
                        @Trackings      = N'${this.traquing}', 
                        @Redirecciones  = N'${this.redirecciones}',
                        @IconoCabecera  =  '${this.iconoCabecera}',
	                    @TextoCabecera  = '${this.textoCabecera}',
	                    @TextoMarcadoCabecera = '${this.textoMarcadoCabecera}'` 
                    );
    }




    //Obtener WebView por producto
    async getWebviewProducto(){
        return super.executeQuery(`SELECT * FROM GetWebviews(${this.idProducto}) ORDER BY Id DESC;`);
    }



    //Obtener las WebView que pertenecen al menu 
    async getWebViewsMenu(){
        return super.executeQuery(`SELECT * FROM GetWebviews(${this.idProducto}) WHERE Menu = '${this.agregarMenu}'`);
    }
    


    //Obtener la webview principal
    async getWebViewPrincipal(){
        return super.executeQuery(`SELECT * from GetWebviews(${this.idProducto}) WHERE Principal = 1;`);
    }


    async getPrincipal(){
        return super.executeQuery(`select Id_webview from Webview WHERE Principal = 1 AND id_Producto = ${this.idProducto};`);
    }


    //Obtener la webview principal
    async getWebViewNombre(){
        return super.executeQuery(`SELECT TOP 1 Nombre, Id_webview FROM [dbo].Webview WHERE Nombre = '${this.nombre}';`);
    }

    //eliminar
    async Eliminar(id){
        return await this.executeQuery(`DELETE FROM [dbo].Webview WHERE Id_webview = ${id};`);
    }

    //Editar webview
    async EditarWebview(){        
        return super.executeQuery(`EXEC [dbo].UpdateWebview
            @Id_WebView     = ${this.idWebview},
            @Nombre         = '${this.nombre}',  
            @Id_Producto    = ${this.idProducto}, 
            @Descripcion    = '${this.descripcion}', 
            @Principal      = '${this.principal}', 
            @Agregar_menu   = ${this.agregarMenu},
            @Icono          = '${this.icono}',
            @Servicios      = N'${this.servicios}', 
            @Trackings      = N'${this.traquing}', 
            @Redirecciones  = N'${this.redirecciones}',
            @createDate     =  '${this.create}',
            @IconoCabecera  =  '${this.iconoCabecera}',
	        @TextoCabecera  = '${this.textoCabecera}',
	        @TextoMarcadoCabecera = '${this.textoMarcadoCabecera}'`
        );
    }



} 