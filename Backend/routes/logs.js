const { Router } = require('express');
const router = Router();

const { check } = require('express-validator');

// Controladores
const { getAll,  addLog, deleteLog } = require('../controllers/logs');

// Middlewares
const { validateJWT, isAdmin, validate, customLimiter } = require('../middlewares/index');

// Obtener todos los logs
router.get('/', [
    customLimiter,
    validateJWT,
    isAdmin(true) 
], getAll);

// Eliminar un log por su id
router.delete('/:id', [
    customLimiter,
    validateJWT,
    isAdmin(true) 
], deleteLog);

module.exports = router;