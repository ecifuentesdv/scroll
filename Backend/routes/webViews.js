const { Router } = require('express');
const router = Router();
const { check, body } = require('express-validator');

//Constructor
const { getDetalleWebView, getServiciosMoneyThor, agregarWebView, getWebviewProducto, encryptCIF,
        updateWebview, createToken,  deleteWebview,sendTrackEvents, getLink,
        getWebViewOrquestador, requestMoneyThor, requestTipMoneyThor, createUserPass
      } = require('../controllers/WebView');

      

//Validaciones
const { existeWebview, validateJWTWebview, validateJWT, customLimiter, validate, 
        getCustomer, validText, validAN, validatePrincipal, validateNombre, validateMenu, 
        validateServices, validateRedirections, validateTracking, validateOrderServices, 
        validateIcon, validateRedireccionesClass, validateTrackingIdElemento, isAdmin

      } = require('../middlewares');




//Obtener el detalle de las webview
router.post('/Detalles/:WebView', [
   customLimiter,
   validateJWTWebview,
], getDetalleWebView);




//Obtener el detalle de las webview
router.get('/Orquestador/Detalles/:WebView', [
   customLimiter,
   validateJWT,
], getWebViewOrquestador);




//Obtener los servicios filtrador por producto
router.get('/Servicios/:Producto', [
   customLimiter,
   validateJWT
], getServiciosMoneyThor)




//Agregar webview
router.post('/',[
   customLimiter,
   validateJWT,
   check('Nombre', 'El nombre es requerido.').not().isEmpty(),
   check('Nombre').custom(validText),
   check('Producto', 'El producto al cual pertenece el webview es requerido').notEmpty(),
   check('Producto', 'El producto no es valido').isNumeric(),
   check('Descripcion').custom(validAN),
   check('Principal', "El parametro 'Principal' para validar si el el webview principal, es requerido").notEmpty(),
   check('Principal', 'el parametro Principal no es valido.').isNumeric(),
   check('AgregarMenu', "El parametro 'AgregarMenu' para validar si el el webview ira en el menu, es requerido.").notEmpty(),
   check('AgregarMenu', 'el parametro AgregarMenu no es valido.').isNumeric(),
   body('Icono').custom(validateIcon),
   body('TextoCabecera').custom(validateIcon),
   body('TextoMarcadoCabecera').custom(validateIcon),
   check('TextoCabecera').custom(validAN),
   check('TextoMarcadoCabecera').custom(validAN),

   validateServices,
   validateRedirections,
   validateTracking,
   validateOrderServices,
   validateNombre,
   validateMenu,
   validatePrincipal,
   validate,
   validateRedireccionesClass,
   validateTrackingIdElemento,
], agregarWebView);




//Editar las webview
router.put('/:WebView',[
   customLimiter,
   validateJWT,
   existeWebview,
   check('Nombre', 'El nombre es requerido.').not().isEmpty(),
   check('Nombre').custom(validText),
   check('Producto', 'El producto al cual pertenece el webview es requerido').notEmpty(),
   check('Producto', 'El producto no es valido').isNumeric(),
   check('Descripcion').custom(validAN),
   check('Principal', "El parametro 'Principal' para validar si el el webview principal, es requerido").notEmpty(),
   check('Principal', 'el parametro Principal no es valido.').isNumeric(),
   check('AgregarMenu', "El parametro 'AgregarMenu' para validar si el el webview ira en el menu, es requerido.").notEmpty(),
   check('AgregarMenu', 'el parametro AgregarMenu no es valido.').isNumeric(),
   body('Icono').custom(validateIcon),
   body('TextoCabecera').custom(validateIcon),
   body('TextoMarcadoCabecera').custom(validateIcon),
   check('Icono', 'El parametro Icono se espera en formato base64').isBase64(),
   check('IconoCabecera', 'El parametro IconoCabecera se espera en formato base64').isBase64(),
   check('TextoCabecera').custom(validAN),
   check('TextoMarcadoCabecera').custom(validAN),
   validateServices,
   validateRedirections,
   validateTracking,
   validateOrderServices,
   validateNombre,
   validateMenu,
   validatePrincipal,
], updateWebview);




//Eliminar las webview
router.delete('/:WebView', [
   customLimiter,
   validateJWT,
   isAdmin(true),
   existeWebview
], deleteWebview)




//Obtener las webview por producto
router.get('/:Producto',[
   customLimiter,
   validateJWT
], getWebviewProducto);





//Crear token para navegar entre las vistas
router.post('/Login/:IdProducto', [
   customLimiter,
   check('CIF', 'El CIF del cliente es requerido.').not().isEmpty(),
   getCustomer,
   validate,
], createToken);



//Obtener link de los productos
router.get('/Link/:IdProducto', [
   customLimiter,
   validateJWT,
], getLink )





//Consumir servicios de moneythor
router.post('/Services/MoneyThor', [
   customLimiter,
   validateJWTWebview,
   check('Type', 'El tipo de metodo es requerido.').not().isEmpty(),
   check('Parameters', 'El contenido requerido por la API es requerido.').not().isEmpty(),
   check('API', 'Por favor enviar el API a consumir de MoneyThor.').not().isEmpty(),
   validate
], requestMoneyThor);


//Encriptar CIF
router.post('/Encrypt/CIF',[
      customLimiter,
      validateJWT,
      isAdmin(true),
      check('CIF', 'El CIF del cliente es requerido').not().isEmpty(),
      validate
   ], encryptCIF)

//Consumir tips de moneythor
router.post('/Tips/MoneyThor', [
   customLimiter,
   validateJWTWebview,
   check('Type', 'El tipo de metodo es requerido.').not().isEmpty(),
   check('Parameters', 'El contenido requerido por la API es requerido.').not().isEmpty(),
   check('API', 'Por favor enviar el API a consumir de MoneyThor.').not().isEmpty(),
   validate
], requestTipMoneyThor);




// trackevents
router.post('/Trackevents',[
   customLimiter,
   validateJWTWebview,
], sendTrackEvents);  



/*
//Generar credenciales
router.post('/Generate/Credentials', [
   customLimiter,
   validateJWT,
   isAdmin(true),
   validate
], createUserPass)*/



//Obtener la url del angular
router.get('/html/moneythor', [], async ( req, resp ) => {
   const puppeteer = require('puppeteer');
   const browser = await puppeteer.launch();
   const page = await browser.newPage();
   await page.goto('http://localhost/webview/001AXEL/13/eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c3VhcmlvIjoiJDJhJDEwJHpVSy82eUhFbEVIdzJ2ZW4xOUJqa2VxcFUuOFdZb3ZkU1hYL3FXQkFGVDJGS29wZkUxMXZtIiwicm9sIjoiJDJhJDEwJHpVSy82eUhFbEVIdzJ2ZW4xOUJqa2VDUmVMTUQ4SGZjeWs1b280aHREYlliaExrTk1uM3FDIiwiaWF0IjoxNzQzNjIwMzUwLCJleHAiOjE3NDM2MjM2NTB9.6mM2OBY-RHUPMEMTdCLhZbZfRlbx-0rz77lN682yFJs', { waitUntil: 'networkidle0' }); // Espera a que Angular termine de renderizar
   const html = await page.content(); // HTML completo renderizado
   await browser.close();
   return resp.send( html );


})



module.exports = router;