module.exports = class Config {

    constructor(){
        this.isDesarrollo = process.env.DESARROLLO; 
        this.port     = process.env.PORT || 3030;
        this.origenes = this.getArray(process.env.ORIGENES);
        this.metodos  = this.getArray(process.env.METHODS);

        //Coneccion a la base de datos
        this.connectionConf =  {
            user:     process.env.USERDB,
            password:     process.env.PASSWORDDB,
            server:   process.env.HOSTDB,
            database: process.env.DATABASEDB,
            port: 1433,
            options: {
                encrypt: false
            }
        }

        //Ruta de la ubicacion del frontend
        this.pathFrontend = process.env.PATH_FRONTEND;

        //Validar el estado del desarrollo
        this.desarrollo = process.env.DESARROLLO;

        //Host del front
        this.hostFront = process.env.HOSTFRONT;

        //Clave token
        this.claveToken = process.env.CLAVE_TOKEN;

        //Clave del token para ver los webview
        this.claveTokenWebview = process.env.CLAVE_TOKEN_WEBVIEW;

        //Tiempo de vida del token
        this.tiempoToken = process.env.TIEMPO_VIDA_TOKEN;

        //Tiempo de vida del token que se utiliza para ver los webview
        this.tiempoTokenWebview = process.env.TIEMPO_VIDA_TOKE_WEBVIEW;

        //Tiempo restante para actualizar el token
        this.tiempoActualizarToken = parseInt(process.env.TIEMPO_TOKEN_UPDATE);

        //Tiempo que duran las sesiones
        this.tiempoSesion = process.env.TIEMPO_SESION;


        //Tiempo del token para validar correo
        this.tiempoTokenCorreo = process.env.TIEMPO_TOKENCORREO;

        //Host para el envio de correos
        this.hostEmail = process.env.HOST_EMAIL;
        
        //Limite de peticiones
        this.tiempoBloqueado       = process.env.WINDOW_DURATION_IN_MINUTES;
        this.cantidadPeticiones    = process.env.MAX_WINDOW_REQUEST_COUNT;
        this.tiempoEntrePeticiones = process.env.WINDOW_LOG_DURATION_IN_MINUTES;

        //Lista negra
        this.tiempoBloqueadoBL       = process.env.BLACK_WINDOW_DURATION_IN_MINUTES;
        this.cantidadPeticionesBL    = process.env.BLACK_MAX_WINDOW_REQUEST_COUNT;
        this.tiempoEntrePeticionesBL = process.env.BLACK_WINDOW_LOG_DURATION_IN_MINUTES;

        //roles validos
        this.rolesValidos = ['USUARIO','ADMINISTRADOR'];

        //configuracion del envio de correos
        this.confEmail = {
            host: process.env.HOSTEMAIL,
            port: 465,
            secure: true, // true for 465, false for other ports
            auth: {
                user: process.env.USEREMAIL, // generated ethereal user
                pass: process.env.PASSEMAIL
            }
        }

        //Del correo que se enviara la notificacion
        this.fromEmail = process.env.USEREMAIL;
        
        
        //Credenciales para consumir los servicios de moneythor
        this.passBanco = process.env.PASSWORD_BANCO;
        this.userBanco = process.env.USER_BANCO;
        
        //Llaves para encriptar el cif del cliente
        this.llaveCif = process.env.CLAVE_CIF
        this.ivCif = process.env.IV_CIF

        //Codigo del cliente que es utilizado para consumir servicios de MoneyThor
        this.customerConfig = process.env.CIF_CLIENTE_CONFIG

        //Validar solo peticiones HTTPS
        this.https = ( process.env.SOLO_HTTPS == 'true' );

        //Total de novedades y recomendaciones
        this.totalNovedades = process.env.TOTAL_NOVEDADES;
        this.totalRecomendaciones = process.env.TOTAL_RECOMENDACIONES;

        //Configuracion de cabeceras
        this.headerConfig = process.env.HEADER_CONFIG;

        //Cabeceras ocultas
        this.removeHeader = process.env.HEADER_REMOVE;

        //Validar el origen del token
        this.validarOrigen = ( process.env.ORIGEN == 'true') 

        //Se esta utilizando un proxy
        this.confiarProxy = ( process.env.PROXY == 'true' )

        //Agregar usuario de prueba
        this.customerTest = ( process.env.CUSTOMER_TEST == 'true');


        //Envio de correos atravez del sistema de banco
        this.emailMailes = ( process.env.MAILER == 'true' );
        this.hostEmailBanco = process.env.EMAIL_HOST;
        this.soapAction = process.env.EMAIL_SOAP_ACTION;
        this.emailOrigen = process.env.EMAIL_ORIGEN;


        

        //##########################
        //          MGM

        this.servicioName = process.env.NOMBRE_SERVICIO;

    }



    //Configuracion de las cabeceras
    configHeaders = (req, res, next)=>{
        if(!res ) return false;

        try {

            //Agregar reglas para las cabeceras
            const headers = JSON.parse(this.headerConfig);

            for (const key in headers) {
                if (Object.prototype.hasOwnProperty.call(headers, key)) {
                    res.header( key, headers[key])
                }
            }

            //Ocultar cabeceras
            const remove = (this.removeHeader) ? this.removeHeader.split(',') : [];

            remove.forEach( header => {
                res.removeHeader(header)
            })

            next();            
            
        } catch (error) {
            console.log("No se pudieron configurar las cabeceras ", error.message);
            return false;
        }
    }

    getArray(cadena, separador=','){
        return cadena.split(separador);
    }

    getIp = async(ip)=>{
        const ipTemp = ip.split(':');
        const ipO = ipTemp[( ipTemp.length -1 )];
        return ( ipO == 1) ? '127.0.0.1' : ipO  
    }

    //Agregar cliente de prueba
    agregarCliente = async() => {

        console.log("Agregando cliente de prueba...");
        
        const { getApisMoneyThor } = require('../middlewares/index');
        await this.eliminarClienteAnterior(getApisMoneyThor);
        const agregarCliente = await this.agregarClientePrueba( getApisMoneyThor, {
            "source": {
                "name": "BI"
            },
            "customer": {
                "name": "cliente_banco_moneythor",
                "custom_fields": []
            }
        });

        const categorias = await this.getCategorias(getApisMoneyThor);
        const mapJSON = this.getJSONCustomerMoneyThor(categorias);
        console.log("JSON ", JSON.stringify(mapJSON));
        if( agregarCliente ) await this.agregarClientePrueba(getApisMoneyThor, mapJSON)

    }


    agregarClientePrueba = async(getApisMoneyThor, customerConfig) => {
        console.log("Agregando a MoneyThor cliente de prueba" );
        try {
            const response = await getApisMoneyThor('POST', customerConfig, 'syncbackendtransactions', '');
            return ( response?.header?.success == true )
        } catch (error) {
            console.log("ERROR no se pudo agregar el cliente de configuracion", error);
            return false;
        }
    }


    eliminarClienteAnterior = async(getApisMoneyThor)=>{
        console.log("Limpiando informacion del cliente de prueba...");
        try {
            await getApisMoneyThor('POST', {"customer": { "name": this.customerConfig } }, 'customer/delete', this.customerConfig);
            return true;
        } catch (error) {
            console.log("ERROR ocurrio un error al intentar eliminar la inforamcion anterior cliente de prueba: ", error.message);
            return false;
        }
    }



    mapCategorias = (categorias) => {
        let count = 0;
        return categorias.map((c)=> {
            const locales = c.locales.filter((e) => e.language == 'es' );
            count++;
            return {
                "currency": "GTQ",
                "amount": count * 1000,
                "description": ( locales[0] ) ? locales[0].label : c.category,
                "date": `${this.getFecha()}`,
                "movement": "debit",
                "extraction": `${this.getFecha()}T01:00:00.000-0600`,
                "custom_fields": [
                    {
                        "name": "transaction_id",
                        "value": this.customerConfig + "-" + count
                    },
                    {
                        "name": "transaction_type",
                        "value": "debit"
                    },
                    {
                        "name": "merchant_code",
                        "value": count
                    },
                    {
                        "name": "merchant_name",
                        "value": ( locales[0] ) ? locales[0].label : c.category
                    },
                    {
                        "name": "org_currency",
                        "value": "GTQ"
                    },
                    {
                        "name": "custom_description",
                        "value": `#${c.category}`
                    },
                    {
                        "name": "moneda",
                        "value": "Quetzales"
                    },
                    {
                        "name": "categoria_transaccion",
                        "value": "CONSUMOS"
                    },
                    {
                        "name": "tarjeta",
                        "value": "CREDITO"
                    },
                    {
                        "name": "cuenta_corporativa",
                        "value": "1111111111"
                    }
                ]
            }
        });
    }



    getFecha = () => {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0'); // Los meses van de 0 a 11
        const day = String(today.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }



    getCategorias = async(getApisMoneyThor) => {
        console.log("Obteniendo categorias...");
        try {
            const response = await getApisMoneyThor('POST', {}, 'getcategories', this.customerConfig);
            let data = response.payload
            const categoriasPadre = data.filter( (c) => !c.parent);
            return categoriasPadre;
        } catch (error) {
            console.log("ERROR no se pudo obtener las categorias ", error.message);
            return [];
        }
    }




    getJSONCustomerMoneyThor = (categorias)=> {

        return {
            "source": {
                "name": "BI"
            },
            "customer": {
                "name": this.customerConfig,
                "custom_fields": [
                    {
                        "name": "birth_date",
                        "value": "2000-01-01"
                    },
                    {
                        "name": "full_name",
                        "value": "Cliente Banco Configuracion Moneythor"
                    },
                    {
                        "name": "instalacion",
                        "value": 123123123
                    }
                ]
            },        
            "account": { 
                "number": "1111111111-GTQ",
                "currency": "GTQ",
                "type": "MONETARIAS",
                "balance": 10000,
                "custom_fields": [
                    {
                        "name": "acc_type",
                        "value": "GTQ"
                    },
                    {
                        "name": "codigo_moneda",
                        "value": "2"
                    },
                    {
                        "name": "moneda",
                        "value": "Quetzales"
                    }
                ]
            },
            "transactions": this.mapCategorias(categorias)
        }
    }
}