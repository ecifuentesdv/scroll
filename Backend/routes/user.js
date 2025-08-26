const { Router } = require('express');
const router = Router();

const { check } = require('express-validator');


//constructor
const { getAll, getEmail, addUser, UpdateUser, DeleteUser} = require('../controllers/user');

//middlewares
const { validateEmail, isAdmin, validateJWT, validateEmailBody, customLimiter, validate, validText, validRol } = require('../middlewares/index')

//Obtener todos los usuarios
router.get('/',[
    customLimiter,
    validateJWT,
    isAdmin(true)
], getAll);



//Eliminar al usuario
router.delete('/:email', [
    customLimiter,
    validateJWT,
    isAdmin(true),
    validateEmail
], DeleteUser);



//Obtener los usuarios por correo
router.get('/Buscar/Email/:email', [
    customLimiter
 ], getEmail);



//Editar la informacion del usuario
router.put('/:email', [
    customLimiter,
    validateJWT,
    validateEmail,
    check('Nombre', 'El nombre es requerido').notEmpty(),
    check('Nombre').custom(validText),
    check('Apellido', 'El apellido es requerido').notEmpty(),
    check('Apellido').custom(validText),
    check('Rol', 'Rol no valido').isAlpha(),
    check('Rol').custom( validRol ),
    validate
], UpdateUser);



//Agregar usuario
router.post('/', [
    customLimiter,
    validateJWT,
    isAdmin(true),
    check('Email', 'El correo electrónico es requerido.').not().isEmpty(),
    check('Email', "Correo electrónico no valido.").isEmail(),
    validateEmailBody(false),
    check('Password', 'La contraseña es requerida.').not().isEmpty(),
    check('Password', 'El contraseña debe de ser entre 8 y 30 caracteres').isLength({min: 8, max: 30}),
    check('Password', "La contraseña debe de tener al menos un digito, una caracter especial y una mayuscula.").matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+?¿\'-/])[A-Za-z\d!@#$%^&*()_+?¿\'-/]{8,}$/),
    check('Nombre', 'El nombre es requerido').notEmpty(),
    check('Nombre').custom(validText),
    check('Apellido', 'El apellido es requerido').notEmpty(),
    check('Apellido').custom(validText),
    check('Rol', 'Rol no valido').isAlpha(),
    check('Rol').custom( validRol ),
    validate
], addUser)

module.exports = router;