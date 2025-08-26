const { Router } = require('express');
const router = Router();
const { check } = require('express-validator');

//Constructor
const { login, verificarToken, cerrarSesion, verifyEmail, ChangePassword } = require('../controllers/auth');

//Middlewares
const { customLimiter, validate,validateEmailBody, validateJWT, noExisteEmail } = require('../middlewares/index')


//Login
router.post('/Login', [
    customLimiter,
    check('Email', 'El correo electrónico es requerido.').not().isEmpty(),
    check('Email', "Correo electrónico no valido.").isEmail(),
    check('Password', 'La contraseña es requerida.').not().isEmpty(),
    check('Password', 'El password debe de ser entre 8 y 30 caracteres').isLength({min: 8, max: 30}),
    check('Password', "La contraseña debe de tener al menos un digito, una caracter especial y una mayuscula.").matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+?¿\'-/])[A-Za-z\d!@#$%^&*()_+?¿\'-/]{8,}$/),
    validateEmailBody(true),
    validate
], login);



//Validar el token
router.post('/Token', [
    customLimiter,
], verificarToken );



//Cerrar sesion
router.post('/CerrarSesion', [
    customLimiter,
    validateJWT
], cerrarSesion );


//Validar Correo
router.post('/ValidarCorreo', [
    customLimiter,
    check("Email","EL Email es requerido").not().isEmpty(),
    check("Email", "Email no valido").isEmail(),
    noExisteEmail(true),
    validate
], verifyEmail);


//Cambiar contraseña
router.post('/CambiarContrasenia', [
    customLimiter,
    check("Password", "La Password es requerida").not().isEmpty(),
    check('Password', 'El password debe de ser entre 8 y 30 caracteres').isLength({min: 8, max: 30}),
    check('Password', "La contraseña debe de tener al menos un digito, una caracter especial y una mayuscula.").matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+?¿\'-/])[A-Za-z\d!@#$%^&*()_+?¿\'-/]{8,}$/),
    check("Token", "El token es requerido").not().isEmpty(),
], ChangePassword);

module.exports = router;