const express = require('express');
const useragent = require('express-useragent');

const cors = require('cors');

const path = require("path");

const Config = require('../config/config');
const cnf = new Config();

const { clearSesion, deleteKey } = require('../cronjobs/cronjobs');


console.log("Validar ", cnf.validarOrigen );

module.exports = class Server {

    constructor(){
        this.app = express();
        this.port = cnf.port; 
        
        //CORS
        this.confCors = ( cnf.isDesarrollo != 'true' ) ? {
                origin: cnf.origenes, 
                methods: cnf.metodos
            }: {}

        //middleware
        this.middlewares();

        //rutas
        this.routes();

        
    }

    middlewares(){
        this.app.disable('X-Powered-By'); 
        this.app.disable('Server');

        

        console.log("EN DESARROLLO ", cnf.isDesarrollo);
        console.log("headers 1", this.headerConfig);
        console.log("header h", this.removeHeader);
        

        //Configuaracion de cabeceras
        this.app.use((req, res, next ) => cnf.configHeaders(req, res, next))

        //Configuracion de los cors
        this.app.use( cors( this.confCors ) );

        //Permitir solo peticines https
        if( cnf.https ) {
            this.app.use(( req, res, next ) => {
                console.log("req.secure ", req.secure );
                console.log("headers ", req.headers );
                if (req.secure || req.headers['x-forwarded-proto'] === 'https') {
                    return next();
                }else {
                    res.status(403).json({ "Mensaje": "Solo se permiten peticiones HTTPS"})
                }
            })
        }



        //Tipo de datos de entrada
        //this.app.use(express.json());
        this.app.use(express.json({ limit: '50mb' }));

        
        //Directorio público
        this.app.use( express.static(path.join(__dirname, "../../Frontend/dist/orquestador/browser" )));

        //Verificar el dispositovo del origen de la peticion
        this.app.use( useragent.express());

        console.log("proxy ", cnf.confiarProxy );

        //Obtener la ip de la peticion del cliente
        this.app.set('trust proxy', cnf.confiarProxy );

        //Agregar cliente de configuracion
        if( cnf.customerTest ) cnf.agregarCliente();

        //Eliminar las sesiones
        clearSesion();

        //Eliminar la clave del token
        deleteKey();
        
    }

    

    routes(){
        this.app.use('/api/Integrador', require('../routes'));
        this.app.get("*",(req, res) => {
            res.sendFile(path.join(__dirname, "../../Frontend/dist/orquestador/browser/index.html" ));
        })
    }

    listen(){
        this.app.listen( this.port, () => {
            console.log(`Servidor corriendo en el puerto: '${this.port}'`);
        });
    }
}