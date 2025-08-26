const { request, response, next} = require('express');
const axios = require('axios');

const WebView = require('../models/WebView');
const webview = new WebView();


const Config = require('../config/config');
const cnf = new Config();

const { getServices } = require('./moneyThor');
const { validAN, validNumber } = require('./validations')


const Encriptar = require('../helpers/cif');


const existeWebview =  async ( req, res, next )=> {
    const { WebView: idWebview } = req.params;
    if( !idWebview ) return res.status(400).json({"Mensaje":"No se pudo obtener el id de la webview"});

    const getData = await webview.getId(idWebview);
    if(!getData)                  return res.status(500).json({"Mensaje":"Ocurrio un error al intentar obtener la informacion de la webview"});
    if(!getData.recordset.length) return res.status(404).json({"Mensaje":"No se encontro una webview con el id " + idWebview});

    req.dataWebview = getData.recordset[0];
    next();

};



//Validar si el nuevo nombre ya existe en las base de datos
const validateNombre = async( req, res, next ) => {
    const { Nombre } = req.body;
    if( Nombre ){
        webview.nombre = Nombre;
        const existePrincipal = await webview.getWebViewNombre();
        const dataWebview = req.dataWebview;
        if( ( !dataWebview && (!existePrincipal || existePrincipal.recordset.length > 0 ) ) ||
                ( (existePrincipal && existePrincipal.recordset.length ) && existePrincipal.recordset[0].Id_webview != dataWebview.Id_webview) )
                    return res.status(409).json({"Mensaje":`Ya existe una webview con el nombre '${Nombre}';` });

        next();

    }else {
        next();
    }
}



//Validar si la webview pertenece al menu, no contenga parametros y validar si esisten los servicios en moneythor
const validateMenu = async( req, res, next ) => {

    const { AgregarMenu, Servicios } = req.body;
    if( Servicios && Servicios.length > 0  ){

        const CIF = cnf.customerConfig;
        const services = await getServices(CIF);
        if( services.error ) return res.status(500).json({"Mensaje":"Ocurrio un error al intentar obtener los servicios de MoneyThor"});

        let tienenParametros = [];
        const noExisteWebview = [];
        Servicios.forEach( s => {
            const widget = services.payload.filter( w => w.name == s.Nombre );
            if( widget.length ){
                const properties = widget[0]?.schema?.request?.properties || {};
                if( Object.keys(properties).length > 0 ){
                    tienenParametros.push( { "Servicio": s.Nombre, "Parametros": properties } );
                }
            }else {
                noExisteWebview.push( s );
            }
        });


        if( AgregarMenu == 1 &&  tienenParametros.length ) return res.status(409).json({"Mensaje": "Esta webview no puede estar en el menu ya que contiene servicios que necesitan parametros", Servicios: tienenParametros});
        if( noExisteWebview.length ) return res.status(404).json({"Mensaje": "Algunos servicios enviados no existen en MoneyThor", Servicios: noExisteWebview});

        next();
   
    }else {
        console.log("no pasa");
        next();
    }
}



//Verificar si no existe una webview principal para el producto 
const validatePrincipal = async( req, res, next ) => {
    const { Producto, Principal } = req.body;
    const { WebView: idWebview } = req.params;

    if( Producto && Principal ){
        webview.idProducto = Producto;
        const existePrincipal = await webview.getWebViewPrincipal();
        if( !existePrincipal || ( existePrincipal.recordset.length > 0 && ( existePrincipal.recordset[0].Id != idWebview ) ) ) return res.status(409).json({"Mensaje":`El producto con el id '${Producto}' ya tiene una webview principal.` });
        next();

    }else {
        next();
    }
}



//Validar los atributos de los servicios
const validateServices = async( req, res, next ) => {
    const { Servicios } = req.body;
    if( Servicios?.length ){
        

        let errores = await Promise.all( Servicios.map( async (s) => {
            try {
               await validAN(s.Nombre);
               await validAN(s.Moneythor);
               await validNumber(s.Orden);
               await validAN(s.Parametros);
            } catch (error) {
                return error.message;
            }
        }));

        errores = errores.filter( e => e );
        if( errores.length ) return res.status(400).json({'Mensaje': 'La información enviada para agregar las webview no es correcta', "Errores": errores});
        next();

    }else {
        next();
    }
}



//Validar el orden de los servicios
const validateOrderServices = async( req, res, next ) => {
    const { Servicios } = req.body;
    if( Servicios?.length ){

        const orden = [];
        let errores = false;
        Servicios.forEach( s => {
            const exist = orden.find( srv => srv == s.Orden );
            if( !exist ){
                orden.push( s.Orden );
            } else {
                errores = true;
            }
        })
        if( errores ) return res.status(409).json({'Mensaje': 'El orden de las webview no es correcto'});
        next();

    }else {
        next();
    }
}


//Validar redirecciones
const validateRedirections = async( req, res, next ) => {
    const { Redirecciones } = req.body;
    if( Redirecciones?.length ){
        

        let errores = await Promise.all( Redirecciones.map( async (r) => {
            try {
               await validAN(r.Clase);
               await validAN(r.Webview);
            } catch (error) {
                return error.message;
            }
        }));

        errores = errores.filter( e => e );
        if( errores.length ) return res.status(400).json({'Mensaje': 'La información enviada para agregar las redirecciones no es correcta', "Errores": errores});
        next();

    }else {
        next();
    }
}



//Validar informacion para el tracking
const validateTracking = async( req, res, next ) => {
    const { Tracking } = req.body;
    if( Tracking?.length ){
        

        let errores = await Promise.all( Tracking.map( async (t) => {
            try {
               await validAN(t.Id_Elemento);
               await validAN(t.Elemento);
            } catch (error) {
                return error.message;
            }
        }));

        errores = errores.filter( e => e );
        if( errores.length ) return res.status(400).json({'Mensaje': 'La información enviada para agregar el tracking no es correcta', "Errores": errores});
        next();

    }else {
        next();
    }
}





//OBtener la informacion del cliente por el CIF
const getCustomer = async( req = request, res = response, next ) => {
    let  CIF = (req.body.CIF ) ? req.body.CIF: req.params.CIF;
    if( CIF ){

        
        try {
            
            //desencriptar
            const encript = new Encriptar('', CIF);
            CIF = encript.decrypt();
            console.log("CIF ", CIF);

            if(CIF){

                const response = await axios({
                    method: 'POST',
                    url: `${process.env.URLMONEYTHOR}/fpm/api/v5/searchcustomer`,
                    data: {
                        "name" : CIF
                    },
                    headers: {
                    "Content-Type": "application/json"
                    }
                })
                
    
                const { payload: InfCustomer } = response.data;
                if( !InfCustomer.name ){
                    return res.status(404).json({"Mensaje":"No se enctontro en MoneyThor un cliente con el CIF "+ CIF });
                }else {
                    req.Customer = InfCustomer;
                    next();
                }

            }else {
                return res.status(403).json({"Mensaje": "Usuario no authorizado"})
            }



        } catch (error) {
            console.log("Ocurrio un error al intentar obtener la informacion del cliente", error);
            return res.status(500).json({ "Mensaje":"Ocurrio un error al intentar obtener la informacion del cliente desde moneythor"} );
        }
    }else {
        next();
    }

} 

const validateIcon = async (value, { req }) => {
    if (req.body.AgregarMenu === 1 && !value) {
        throw new Error('Si la Webview estará en el menú por favor enviar los parametros: Icono, TextoCabecera, TextoMarcadoCabecera');
    }
    return true;
 }

 
 const validateRedireccionesClass = async (req, res, next) => {
    const { Redirecciones } = req.body;

    if (Redirecciones?.length) {
        const clases = Redirecciones.map(r => r.Clase);
        const clasesUnicas = [...new Set(clases)];

        if (clases.length !== clasesUnicas.length) {
            return res.status(409).json({
                "Mensaje": "Las clases de 'Redirecciones' no pueden repetirse."
            });
        }
    }

    next();
};

const validateTrackingIdElemento = (req, res, next) => {
    const { Tracking } = req.body;

    if ( Tracking?.length ) {
        const ids = Tracking.map(t => t.Id_Elemento);
        const idsUnicos = [...new Set(ids)];

        if (ids.length !== idsUnicos.length) {
            return res.status(409).json({
                "Mensaje": "Los 'Id_Elemento' de 'Tracking' no pueden repetirse."
            });
        }
    }

    next();
};

module.exports = {
    existeWebview,
    getCustomer,
    validatePrincipal,
    validateNombre,
    validateMenu,
    validateServices,
    validateRedirections,
    validateTracking,
    validateOrderServices,
    validateIcon,
    validateRedireccionesClass,
    validateTrackingIdElemento
}