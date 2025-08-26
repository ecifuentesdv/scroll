const { Router } = require('express');
const router = Router();
const { check } = require('express-validator');

const { getAll, addProducto, deleteProducto, updateProducto } = require('../controllers/productos');

const {  isAdmin, validateJWT, customLimiter, existeProducto, validate, validText, validAN, noExisteNombreProducto, noExisteNomenclaturaProducto } = require('../middlewares/index')


//Obtener todos los productos
router.get('/',[
    customLimiter,
    validateJWT
], getAll);


//Agregar producto
router.post('/',[
    customLimiter,
    validateJWT,
    isAdmin(true),
    check('Nombre', 'El nombre es requerido').notEmpty(),
    check('Nombre').custom(validText),
    check('Nomenclatura', 'El apellido es requerido').notEmpty(),
    check('Nomenclatura').custom(validText),
    check('Descripcion').custom(validAN),
    noExisteNombreProducto(false),
    noExisteNomenclaturaProducto(false),
    validate
], addProducto );



//Editar producto
router.put('/:IdProducto', [
    customLimiter,
    validateJWT,
    isAdmin(true),
    existeProducto,
    check('Nombre', 'El nombre es requerido').notEmpty(),
    check('Nombre').custom(validText),
    check('Nomenclatura', 'El apellido es requerido').notEmpty(),
    check('Nomenclatura').custom(validText),
    check('Descripcion').custom(validAN),
    noExisteNombreProducto(false),
    noExisteNomenclaturaProducto(false),
    validate
], updateProducto)


//Eliminar producto
router.delete('/:IdProducto',[
    customLimiter,
    validateJWT,
    isAdmin(true),
    existeProducto
], deleteProducto)

module.exports = router;