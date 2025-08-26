const {  response, request  } = require('express');


const { getServices, getServicesDetalle, getApisMoneyThor, trackEvents, getTipsMoneythor } = require('../middlewares')

const WebView = require('../models/WebView');
const webview = new WebView();


const Producto = require('../models/Producto');
const producto = new Producto();

const bcryptjs = require('bcryptjs');
const JWT = require('jsonwebtoken');

const Config = require('../config/config');
const cnf = new Config();



const Sesion = require('../models/sesiones');

const Log = require('../models/logs')
const log = new Log();

const { notificationCredentialsCreated } = require("../config/static/plantillasCorreo");
const { EnviarAlerta } = require('../config/mailer');

const getClaveToken  = require('../helpers/claveAleatoria');

const Encript = require('../helpers/cif');




//Encriptar CIF del cliente
const encryptCIF = async( req = request, res = response ) => {

    console.log("Is desarrollo ", cnf.isDesarrollo );
    

    
    const { CIF } = req.body;

    const ecpt = new Encript(CIF);
    const cifEncript = ecpt.encrypt();
    return res.status(200).json({"CIF": cifEncript})
}




//Obtener link del producto
const getLink = async( req = request, res = response ) => {

    const claveRedis = await getClaveToken();
    const CIF = cnf.customerConfig;

    const encript = new Encript(CIF);
    const codigoCliente  = encript.encrypt();
    console.log("Codigo cliente ", codigoCliente );

    const { IdProducto } = req.params;

    


    try {
        
            //Obtener la ip del cliente
            //const ipCliente = ( req.headers['x-forwarded-for'] ) ? req.headers['x-forwarded-for'] : await cnf.getIp( req.ip );
            const ipCliente = await cnf.getIp( req.ip );
            console.log("ipCliente Link", ipCliente);



            const sesion = new Sesion();
            sesion.idSesion = CIF;
            sesion.data = {};
            sesion.data.idClient = ipCliente;
            await sesion.deleteSesion(); //Si ya existe una sesion se eliminara


                
            //Cifrar datos que se almacenaran en el token
            const salt = bcryptjs.genSaltSync(10);
            const ip = bcryptjs.hashSync( ipCliente, salt );
            const cif = bcryptjs.hashSync( CIF, salt );
            const token = JWT.sign({ "usuario" : cif, "rol": ip }, claveRedis.clave, { expiresIn: cnf.tiempoTokenWebview});
            
            //Agregar el token a redis (cache)
            sesion.data.token = token;
            sesion.data = JSON.stringify(sesion.data);
            await sesion.addSesion();


            
            //obtener la webview principal del id del producto 
            webview.idProducto = IdProducto;
            const detalles = await webview.getPrincipal();
            if( !(detalles?.recordset?.length ) ) return res.status(404).json({'Mensaje':`El producto con el id ${IdProducto} no contiene una webview principal`})
                
            //Obtener los tips como los servicios principales
            getServicios(CIF, IdProducto);
            getTips(CIF);
            return res.status(200).json({ URL: `${cnf.hostFront}/${encodeURIComponent(codigoCliente)}/${detalles.recordset[0].Id_webview}/${token}` })
        
            
        } catch (error) {
            console.log(error);
            return res.status(500).json({"Mensaje": error.message});
        }
}






//Crear usuario y contraseña
const createUserPass = async( req = request, res= response ) => {

    const User  = req.userLogin
    const salt = bcryptjs.genSaltSync(10);
    const usuario = bcryptjs.hashSync( cnf.userBanco, salt );
    const contrasenia = bcryptjs.hashSync( cnf.passBanco, salt );


    const mensaje =  notificationCredentialsCreated(User.user, User.lastname, usuario, contrasenia);
    const result = await EnviarAlerta( mensaje, 'Generación de Nuevas Credenciales para Consumo de Servicios Moneythor', User.email );

    if( !result ) return res.status(500).json( {"Mensaje":"Ocurrio un error al enviar el correo electrónico con las nuevas credenciales"} );

    const idLogin = User.id;
    log.idUser = idLogin;
    log.nombre = 'Credenciales generadas';
    log.descripcion = `El usuario con ID: ${idLogin} y el correo ${User.email} ha creado nuevas credenciales para consumir los servicios de moneythor.`
    log.addLog()

    return res.status(200).json({"Mensaje":`Se a enviado un correo al usuario con el correo: '${User.email}', con las nuevas credenciales`});

}








//Crear Token para consumir Webview
const createToken = async( req = request, res = response ) => {

    const claveRedis = await getClaveToken();
    const {name: CIF} = req.Customer;
    const { CIF:codigoCliente } = req.body;


    const { IdProducto } = req.params;
    let { authorization:credentials } = req.headers;
    credentials = credentials.split(' ');
    
    
    //Validar el usuario y contraseña
    if( credentials?.[1] ){
        credentials = credentials[1].split(':');
        const usuario = credentials[0];
        const pass = credentials[1];
        

        if( bcryptjs.compareSync(cnf.userBanco, usuario  ) &&  bcryptjs.compareSync(cnf.passBanco , pass) ){

            try {
                
                    //Obtener la ip del cliente
                    //const IpCustomer = ( req.headers['x-forwarded-for'] ) ?  req.headers['x-forwarded-for']  : await cnf.getIp( req.ip );
                    const IpCustomer =  await cnf.getIp( req.ip );

                    console.log("IP SS", IpCustomer);


                    const sesion = new Sesion();
                    sesion.idSesion = CIF;
                    sesion.data = {};
                    sesion.data.idClient = IpCustomer;
                    await sesion.deleteSesion(); //Si ya existe una sesion se eliminara


                        
                    //Cifrar datos que se almacenaran en el token
                    const salt = bcryptjs.genSaltSync(10);
                    const ip = bcryptjs.hashSync( IpCustomer, salt );
                    const cif = bcryptjs.hashSync( CIF, salt );
                    const token = JWT.sign({ "usuario" : cif, "rol": ip }, claveRedis.clave, { expiresIn: cnf.tiempoTokenWebview});
                    
                    //Guardamos la informacion de la sesion
                    sesion.data.token = token;
                    sesion.data = JSON.stringify(sesion.data);
                    await sesion.addSesion();

                    
                    //obtener la webview principal del id del producto 
                    webview.idProducto = IdProducto;
                    const detalles = await webview.getPrincipal();
                    if( !(detalles?.recordset?.length ) ) return res.status(404).json({'Mensaje':`El producto con el id ${IdProducto} no contiene una webview principal`, Codigo: 404})
                        

                    //Obtener los tips como los servicios principales
                    getServicios(CIF, IdProducto);
                    getTips(CIF);
                    return res.status(200).json({  custumer: codigoCliente, token: token, direccion: `${cnf.hostFront}/${encodeURIComponent(codigoCliente)}/${detalles.recordset[0].Id_webview}/${token}`, Codigo: 200 })

                    
                    
                } catch (error) {
                    console.log(error);
                    return res.status(500).json({"Mensaje": error.message, Codigo: 500});
                }
            }
        } 

        return res.status(401).json({"Mensaje":"Usuario no autorizado", Codigo: 401})
}





//Obtener los servicios del cliente
const getServicios = async( cif, producto ) => {

     //Obtener los webviews pertenecientes al producto que estaran agregadas en el menu
    webview.idProducto = producto;
    webview.agregarMenu = 1;
    let GetWebviews = await webview.getWebViewsMenu();
    if( GetWebviews?.recordset?.length){

        const detalles = [];
        GetWebviews.recordset.forEach( d => {
            detalles.push( mapDataWebview( d.Id ) )
        });

        //Obtener el detalle de las Webview de sqlserver
        const dataWebView = await Promise.all( detalles ).then( response => {
            const data =  response.filter( r => !r.error );
            return { error: false, data }
        }).catch( error => {
            console.log("error ", error);
            return { error: true, data: [] }
        });  
        

        if( !dataWebView.error ){

            //Obtener los servicios desde moneythor
            const getDetalleServicios = [];
            dataWebView.data.forEach( w => {
                getDetalleServicios.push( getServicesHTML(w.data.Servicios, [], cif, 'creartoken' ) );
            })


            const sesion = new Sesion();
            sesion.idSesion = `${cif}-servicios`;
            await sesion.deleteSesion(); //Eliminar los servicios de la sesion anterior



            //Controlar las respuestas de las peticiones hacia moneythor
            const dataWebviews = await Promise.all( getDetalleServicios ).then( response => {
                let servicios = [];
                response.forEach( r => {
                    servicios = [ ...servicios, ...r.data ]
                });

                return { error: false, data: servicios}

            }).catch( error => {
                console.log("Error ", error );
                return { error: true, data: [] }

            })


            //Agregar los servicios a la sesion
            if( !dataWebviews.error){
                sesion.data = {};
                sesion.data = JSON.stringify({
                    idClient: cif,
                    servicios: dataWebviews.data
                });
                sesion.data = sesion.data.replace(/'/g, "''");
                await sesion.addSesion();
            }

           
        }
    }
}





//Obtener todos los tips del cliente
const getTips = async( cif ) => {
    const dataRequest = {
        "type": "regexp",
        "match": ".*",
        "status": "live"
    }
    const servicios = await getApisMoneyThor("POST", dataRequest, 'gettipsbypattern', cif);
    if( servicios?.header?.success ){
        
        let serviciosData = servicios?.payload?.tips || [];

        serviciosData = orderTips(serviciosData);
        const exitResponse = [];
        for (const s of serviciosData) {
            try {
                const r = await getTipsMoneythor(cif, {
                key: s.tip_key,
                name: s.title,
                status: s.status,
                origin: s.origin
                });

                if (r.success && !(!r?.data?.success && r?.data?.mensaje)) {
                r.tip.html = r.data;
                delete r.data;
                exitResponse.push({ tip: r.tip });
                }
            } catch (err) {
                console.error("Error en petición individual:", err);
                // Puedes decidir si quieres continuar o detener aquí.
            }
        }

        const data = { error: false, data: exitResponse };


        const sesion = new Sesion();
        sesion.idSesion = `${cif}-tips`;
        await sesion.deleteSesion(); //Eliminar los servicios de la sesion anterior

        //Guardar la sesion
        sesion.data = JSON.stringify({
            idClient: cif,
            tips: data.data
        });
        sesion.data = sesion.data.replace(/'/g, "''");
        await sesion.addSesion();
    }
}



//Ordenar TIs
function orderTips( tips = [] ){


    //Filtar tipo de tip
    let recomendaciones = tips.filter((t) => t.title.startsWith('VentaCruzada_'));
    let novedades = tips.filter((t) => t.title.startsWith('TIP_'));

    //Ordenar de acuerdo a la fecha
    recomendaciones = recomendaciones.sort((a,b) => new Date(a.creation) - new Date(b.creation));
    novedades = novedades.sort((a,b) => new Date(a.creation) - new Date(b.creation));

    //Limitar a solo un tip por titulo
    recomendaciones = recomendaciones.filter((r, index, self ) => self.findIndex((t) => t.title === r.title) === index);
    novedades = novedades.filter((r, index, self ) => self.findIndex((t) => t.title === r.title) === index);

    //Limitar la cantidad de tips y novedades a mostrar
    const totalNoveades        = ( cnf.totalNovedades)       ? parseInt(cnf.totalNovedades)       : 4;
    const totalRecomendaciones = ( cnf.totalRecomendaciones) ? parseInt(cnf.totalRecomendaciones) : 4;
    novedades       = novedades.slice( 0, totalNoveades );
    recomendaciones = recomendaciones.slice( 0, totalRecomendaciones );


    //Ordenar de acuerdo a la prioridad
    recomendaciones = recomendaciones.sort((a,b) => a.priority - b.creation);
    novedades = novedades.sort((a,b) => a.priority - b.priority);

    return [ ...recomendaciones, ...novedades ]

}


//Editar webview
const updateWebview = async( req = request, res = response ) =>{

    const { Nombre, Producto: Id_Producto, Descripcion, Principal, AgregarMenu, Icono, Servicios, Redirecciones, Tracking, IconoCabecera, TextoCabecera, TextoMarcadoCabecera } = req.body;
    const dataWebView = req.dataWebview;

    webview.idWebview            = dataWebView.Id_webview;
    webview.nombre               = Nombre;
    webview.idProducto           = Id_Producto;
    webview.descripcion          = Descripcion;
    webview.principal            = Principal;
    webview.icono                = Icono;
    webview.agregarMenu          = AgregarMenu;
    webview.servicios            = JSON.stringify(Servicios);
    webview.traquing             = JSON.stringify(Tracking);
    webview.redirecciones        = JSON.stringify(Redirecciones);
    webview.create               = formatDate(dataWebView.Create_date);
    webview.iconoCabecera        = IconoCabecera;
    webview.textoCabecera        = TextoCabecera;
    webview.textoMarcadoCabecera = TextoMarcadoCabecera;


    const editarWebview = await webview.EditarWebview();
    if( !editarWebview ) return res.status(500).json({"Mensaje":"Ocurrio un error al intentar editar la webview"})
    
    delete webview.table;
    delete webview.id;
    const userLogin = req.userLogin;
    const idLogin = userLogin.id;
    log.idUser = idLogin;
    log.nombre = 'Webview Actualizada';
    log.descripcion = `El usuario con ID: ${idLogin} y el correo ${userLogin.email} ha actualizado el Webview con el id ${dataWebView.Id_webview}`
    log.addLog()
    return res.status(200).json({
        "Mensaje": "Se actualizo con exito la  webview"
    })
    
}






//Eliminar webview
const deleteWebview = async( req = request, res = response ) => {

    const dataWebView = req.dataWebview;
    webview.idWebview = dataWebView.Id_webview;
    const deleteWebview = await webview.Eliminar(webview.idWebview);
    if( !deleteWebview || deleteWebview.rowsAffected.length <= 0 ) return res.status(500).json({"Mensaje": "Ocurrio un error al intentar eliminar la webview con el id" + webview.idWebview });
    
    
    const userLogin = req.userLogin;
    const idLogin = userLogin.id;
    log.idUser = idLogin;
    log.nombre = 'Webview Eliminada';
    log.descripcion = `El usuario con ID: ${idLogin} y el correo ${userLogin.email} ha eliminado el Webview con el id ${dataWebView.Id_webview}.`
    log.addLog()
    return res.status(200).json({"Mensaje":"Se elimino correctamento la WebView y todos los recursos asociados a ella"})
    

}







//Obtener los webview por producto
const getWebviewProducto = async( req = request, res = response ) => {
    const { Producto: idProducto } = req.params;
    if( !idProducto ) return res.status(400).json({"Mensaje":"No se pudo obtener el id del proyecto"});

    webview.idProducto = idProducto;
    const GetWebviews = await webview.getWebviewProducto();
    if( !GetWebviews) return res.status(500).json({"Mensaje":"Ocurrio un error al intentar obtener las webview pertenecientes al producto solicitado"})

    return res.status(200).json({
        "WebViews": GetWebviews.recordset
    })

}







//Agregar Webview junto con sus servicios, tracking y redirecciones
const agregarWebView = async( req = request, res = response ) => {

    const { Nombre, Producto: Id_Producto, Descripcion, Principal, AgregarMenu,Icono, Servicios, Redirecciones, Tracking, IconoCabecera, TextoCabecera, TextoMarcadoCabecera } = req.body;
    webview.nombre               = Nombre;
    webview.idProducto           = Id_Producto;
    webview.descripcion          = Descripcion;
    webview.principal            = Principal;
    webview.agregarMenu          = AgregarMenu;
    webview.icono                = Icono;
    webview.servicios            = JSON.stringify(Servicios);
    webview.traquing             = JSON.stringify(Tracking);
    webview.redirecciones        = JSON.stringify(Redirecciones);
    webview.iconoCabecera        = IconoCabecera;
    webview.textoCabecera        = TextoCabecera;
    webview.textoMarcadoCabecera = TextoMarcadoCabecera;

    const addWebview = await webview.AgregarWebview();
    if( !addWebview ) return res.status(500).json({"Mensaje":"Ocurrio un error al intentar agregar la webview"})

    if( addWebview?.recordset[0]?.IdWebView ) webview.idWebview = addWebview.recordset[0].IdWebView;

    delete webview.table;
    delete webview.id;
    const userLogin = req.userLogin;
    const idLogin = userLogin.id;
    log.idUser = idLogin;
    log.nombre = 'Webview Agregada';
    log.descripcion = `El usuario con ID: ${idLogin} y el correo ${userLogin.email} ha agregado un Webview`
    log.addLog()
    return res.status(200).json({
        "Mensaje": "Se agrego con exito la nueva webview"
    })

}







//Obtener los servicios desde moneythor
const getServiciosMoneyThor = async( req = request, res = response ) => {

    //Cif del cliente utilizada para extraer informacion de moneythor
    const CIF = cnf.customerConfig;

    
    const { Producto: idProducto } = req.params;
    if( !idProducto ) return res.status(400).json({"Mensaje":"No se pudo obtener el id del proyecto"});
    
//Obtener el producto por id
    producto.idProducto = idProducto;
    const data = await producto.getId(idProducto);
    if( !data || data.recordset.length <= 0 ) return res.status(500).json({"Mensaje":"Ocurrio un error al intentar obtener la información del producto"});
    const dataProducto = data.recordsets[0];

//Obtener todos los servicios desde Moneythor
    const serviciosMoneyThor = await getServices(CIF);
    if( serviciosMoneyThor.error  ) return res.status(500).json({"Mensaje":"Ocurrio un error al intentar obtener los servicios de MoneyThor"});

    const nomenclatura = dataProducto[0].Nomenclatura;


    const servicesMap = [];
    serviciosMoneyThor.payload.forEach( s => {

        const json = {};

        //Filtrar los servicios que concuerden con la nomenclatura del producto
        if(s.name.toLowerCase().startsWith(nomenclatura.toLowerCase())){

            json.Nombre = s.name;
            json.Descripcion = s.description;
            json.properties = s.schema?.request?.properties || {};

            if( Object.keys(json.properties).length > 0 ){ 
                const parameters = {};
                for (const key in json.properties) {
                    if (Object.prototype.hasOwnProperty.call(json.properties, key)) {
                        const valor = ( json.properties[key].type == 'number' ) ? 0 : '';
                        parameters[`${key}`] = valor
                    }
                }
                json.parameters = parameters;
            }else {
                json.parameters = {};
            }
            
            servicesMap.push(json)
        } 
    });



    const arrayRequest = [];
    servicesMap.forEach( (s) => {
        const dataSend = {
            "name": s.Nombre,
            "format": "html",
            "parameters": s.parameters
          }
          arrayRequest.push( getServicesDetalle(cnf.customerConfig, dataSend) )
    });


    const getHTML = await Promise.all( arrayRequest ).then( resp => {
        const data = [];
        resp.forEach( c=> {
            if( c.error ) {
                data.push({ "servicio": c.Servicio, error: true, mensaje: c.mensaje })
            }else {
                data.push({ servicio: c.Servicio, mapeta: c.Maqueta });
            }
        });

        return { error: false, data: data}


    }).catch( error => {
        console.log("Error ", error);
        return { error: true, mensaje: error.message }
    });



    return res.status(200).json({"Mensaje": dataProducto, Servicios: servicesMap, Maquetas: getHTML });
}






//Obtener el detalle de los webview
const getDetalleWebView = async( req = request, res = response ) => {

    let { CIF }  = req;
    const newToken = req.newToken;

    const { WebView: idWebView } = req.params;
    if( !idWebView ) return res.status(400).json({"Mensaje":"No se pudo obtener el id del WebView", Codigo: 400, newToken: newToken} );

    //Obtener el dispositivo de origen
    let dispositivoOrigen = ( req.useragent.isMobile || req.useragent.isTablet ) ? 'mobile' : 'desktop';

    //Obtener los parametros de la peticion
    const { Parametros: parametros } = req.body;

    let json = await mapDataWebview(idWebView);
    if( json.error ) return res.status(500).json({"Mensaje":"Ocurrio un error al intentar obtener la información del webview", Codigo: 500, newToken: newToken });


    const parametrosService = json.parametros;
    json = json.data;


    //Validar parametros requeridos por los servicios
    const parametrosValidos = validarParametros(parametros, json.Servicios, parametrosService);
    if( parametrosValidos.Cantidad <= 0 ){ 

        
        //Obtener los webviews pertenecientes al producto que estaran agregadas en el menu
        webview.idProducto = json.Cabecera.W_Producto;
        webview.agregarMenu = 1;
        let GetWebviews = await webview.getWebViewsMenu();
        if( !GetWebviews) return res.status(500).json({"Mensaje":"Ocurrio un error al intentar obtener las webview pertenecientes al producto solicitado", Codigo: 500, newToken: newToken})
        GetWebviews = GetWebviews.recordset.map( m=> {
            return { 
                Id: m.Id, 
                Nombre: m.Nombre, 
                Icono: ( m.Icono ) ? m.Icono : ''
             } } );




        //Obtener los servicios desde moneythor
        const servicios = await getServicesHTML(json.Servicios, parametros, CIF);

        //Validar si existe el servicio en la sesion, de no ser asi, se agrega
        if( !servicios.existeSesion ){
            const sesion = new Sesion();
            sesion.idSesion = `${CIF}-servicios`;
            const dataServicios = await sesion.getSesion();
            if( dataServicios ){
                const dataServicio = servicios.data[0];
                let dataSesion = ( dataServicios.recordset.length ) ? JSON.parse(dataServicios?.recordset[0].Data) : {};
                dataSesion = dataSesion.servicios?.length ? dataSesion.servicios : [];


                dataSesion.push(dataServicio);
                sesion.data = JSON.stringify({
                    idClient: CIF,
                    servicios: dataSesion
                });
                sesion.data = sesion.data.replace(/'/g, "''");

                await sesion.deleteSesion(); 
                await sesion.addSesion();
            }
        }
    

        return res.status(200).json({ Dispositivo: dispositivoOrigen, WebView: json, MoneyThor: servicios, Menu: GetWebviews, Codigo: 200, newToken: newToken }  );

    } 
    return res.status(400).json({ "Mensaje":"Algunos servicios necesitan parametros, los cuales no se enviaron", Info: parametrosValidos, Codigo: 400, newToken: newToken })
}







const getWebViewOrquestador = async( req = request, res = response ) => {

    const { WebView: idWebView } = req.params;
    if( !idWebView ) return res.status(400).json({"Mensaje":"No se pudo obtener el id del WebView"});

    let json = await mapDataWebview(idWebView);
    if( json.error ) return res.status(500).json({"Mensaje":"Ocurrio un error al intentar obtener la información del webview"});
    json = json.data;

    return res.status(200).json({ WebView: json } );
}







//Validar parametros
const validarParametros = (data, servicios, parametrosServicios )=>{
    if( !servicios.length ) return { Cantidad: 0 };

    const parametrosNoenviados = [];
    servicios.forEach( s => {
        if( s.Parametros ){
            const parametrosServicios = s.Parametros.split(',');
            parametrosServicios.forEach( p => {
                if( !data[p] ){ 
                    parametrosNoenviados.push({ "Parametro": p, "Servicio": s.MoneyThor});
                }
            })
        }
    });


    return {
        Cantidad: parametrosNoenviados.length,
        Parametros: parametrosNoenviados,
        ParametrosRequeridos: parametrosServicios
      } 
}






//Obtener le html de los servicios de moneythor
const getServicesHTML = async( servicios, parametros, cliente, origen) => {



    try {
        
        
        //Obtener los servicios de la sesion
        const sesion = new Sesion();
        sesion.idSesion = `${cliente}-servicios`;
        const getData = await sesion.getSesion();
        let existeSesion = false;
        const serviciosRedis = ( getData && getData.recordset.length > 0 ) ? JSON.parse( getData.recordset[0].Data ) : [];
        
        
        //Se filtra entre servicios        
        let serviciosRedisFiltrados = [];
        const requestArray = [];
        servicios.forEach( s => {

            //Validar que el servicio este habilitado
            if( s.Estatus == 1) {
                
                //Agregar parametros a la peticion
                const Parametros = {};
                if( s.Parametros ){ 
                    s.Parametros.split(',').forEach( p => Parametros[p] = parametros[p]);
                } 

                //Validar si los servicios existe en cache
                const srv = (serviciosRedis?.servicios?.length) ? serviciosRedis.servicios.filter( sr => sr.Servicio == s.MoneyThor ) : [];
                if( origen != 'creartoken' && srv.length){
                    serviciosRedisFiltrados.push( srv );
                    existeSesion = true;
                }else{

                    
                    //Array de promesas, para obtener los servicios desde moneythor
                    requestArray.push( 
                        getServicesDetalle( cliente, { 
                            "name": s.MoneyThor,
                            "format": "html",
                            "parameters": Parametros
                        })
                    )
                }
            }
        
        });
    
        let data = await Promise.all( requestArray ).then( response => { 
            return { 
                error: false,
                data: response
            }
        }).catch( error => { 
            console.log("error ", error.message);
            return { 
                error: true,
                data: []
            }
        })
    
        if( !data.error ){
            serviciosRedisFiltrados = serviciosRedisFiltrados.flat();
            data = [...data.data, ...serviciosRedisFiltrados];
            return ( origen ) ? { error: false, data } : { error: false, data, existeSesion }
        }
        
        return ( origen ) ? { error: true, data: []} : { error: true, data: [], existeSesion: true}

    } catch (error) {
        console.log("Error ", error);
        return ( origen ) ? { error: true, data: []} : { error: true, data: [], existeSesion: true}

    }
 }






 //Formatear la fecha
 const formatDate = ( date )=> {
    if( !date ) return ''
    const fecha = new Date(date);
    const año = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, '0'); // Los meses van de 0 a 11
    const dia = String(fecha.getDate()).padStart(2, '0');
    const horas = String(fecha.getHours()).padStart(2, '0');
    const minutos = String(fecha.getMinutes()).padStart(2, '0');
    const segundos = String(fecha.getSeconds()).padStart(2, '0');
    return `${año}-${mes}-${dia} ${horas}:${minutos}:${segundos}`;
 }
 






 const sendTrackEvents = async (req, res) => {

    const data = req.body;
    let { CIF }  = req;


    const result = await trackEvents(CIF, data);
    if (result.error) {
        return res.status(500).json(result);
    }
    return res.status(200).json(result) 
     
};







//Dar formato a las webview pertenecientes a un producto
const mapDataWebview = async( idWebView ) => {
    
    webview.idWebview = idWebView;
    const detalles = await webview.getDetalles();
    if( !detalles || detalles.recordset.length <= 0) return { error: true, code: 500, "Mensaje":"Ocurrio un error al intentar obtener la información del webview"};


    const json = {};
    json.Servicios = [];
    json.Tracking = [];
    json.Redirecciones = [];
    const parametrosService = [];
    detalles.recordsets[0].forEach( w => {
        const servicio = {};
        const tracking = {};
        const redirecciones = {};
        const cabecera = {};

        for (const key in w) {
            if (Object.prototype.hasOwnProperty.call(w, key)) {

                if( key.startsWith("W_") ){
                    cabecera[key] = (w[key])  ? w[key] : '';
                    
                }else if( key.startsWith("S_") ){
                    const newKey = key.replace(/S_/g,'');
                    if(w[key]) servicio[newKey] = w[key];
                    if( newKey == 'Parametros' && w[key]) parametrosService.push(w[key]);


                }else if( key.startsWith("T_") ){
                    const newKey = key.replace(/T_/g,'');
                    if(w[key]) tracking[newKey] = w[key]

                }else if( key.startsWith("R_") ){
                    const newKey = key.replace(/R_/g,'');
                    if(w[key]) redirecciones[newKey] = w[key]
                }
            }
        }


        json.Cabecera = cabecera;
        if( !json.Servicios.find(     s => servicio.Id == s.Id ) )      json.Servicios.push(servicio);
        if( !json.Tracking.find(      t => tracking.Id == t.Id ) )      json.Tracking.push(tracking);
        if( !json.Redirecciones.find( t => redirecciones.Id == t.Id ) ) json.Redirecciones.push(redirecciones);
    });

    return { error: false, data: json, parametros: parametrosService};
}







//Consumir servicios de moneythor
const requestMoneyThor = async( req= request, res= response) => {
    
    const newToken = req.newToken;
    console.log("NEW ", newToken);

    const sesion = new Sesion();
    const { Type:Tipo, Parameters:Data, API:Api, Modulo  } = req.body;
    let { CIF }  = req;
    const response = await getApisMoneyThor(Tipo, Data, Api, CIF );
    console.log("Respuesta moneythor ", response);


    if( Modulo == 'Tips') {

        //Obtener los tips de la sesion
        sesion.idSesion = `${CIF}-tips`;
        const gettips = await sesion.getSesion();
        const tips = ( gettips && gettips.recordset.length > 0  ) ? JSON.parse(gettips.recordset[0].Data) : [];
        
        console.log("TIPS ", tips );


        if( tips ) return res.status(200).json({ data: tips.tips, newToken: newToken})
        return res.status(500).json({"Mensaje": "Ocurrio un error al hacer la solicitud a MoneyThor", newToken: newToken })

    }else {


        //Eliminar informacion de las vistas de la sesion
        const sesion = new Sesion()
        sesion.idSesion = `${CIF}-servicios`;
        await sesion.deleteSesion();


        if( response?.header?.success ) return res.status(200).json({ data: response, newToken: newToken })
        return res.status(500).json({"Mensaje": "Ocurrio un error al hacer la solicitud a MoneyThor", errorMoneyThor: response.mensaje, newToken: newToken })
    }
}






//Consumir Tips de moneythor tanto en formato JSON, como en formato HTML
const requestTipMoneyThor = async( req= request, res= response) => {

    const newToken = req.newToken;
    console.log("NEW ", newToken);

    let { CIF }  = req;
    console.log("HEADERS ", CIF );    
    console.log( "TIPO ", Tipo, Data, Api, CIF );
    


    return res.status(500).json({"Mensaje": "Ocurrio un error al hacer la solicitud a MoneyThor", errorMoneyThor: response.mensaje, newToken: newToken })
    
   
   }






module.exports = {
    getDetalleWebView,
    getServiciosMoneyThor,
    agregarWebView,
    getWebviewProducto,
    updateWebview,
    createToken,
    deleteWebview,
    sendTrackEvents, 
    getWebViewOrquestador,
    requestMoneyThor,
    requestTipMoneyThor,
    createUserPass,
    getLink,
    encryptCIF

}