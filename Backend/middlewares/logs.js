const { request, response, next } = require('express');
const Log = require('../models/logs');
const log = new Log();

// Validar ID del log, que viene como parámetro
const validateLogId = async (req = request, res = response, next) => {
    const { id } = req.params;
    if (id) {
        const logEntry = await getLogDB(id);
        if (!logEntry) return res.status(404).json({ "Mensaje": `No se encontró un log con el ID '${id}'` });
        req.Log = logEntry;
        next();
    } else {
        return res.status(400).json({ "Mensaje": "No se pudo obtener el ID del log" });
    }
};

// Validar que el rol sea administrador para consumir el API
const isAdmin = (rol) => {
    return async (req = request, res = response, next) => {
        const User = req.userLogin;
        if (User.Rol === 'ADMINISTRADOR') {
            next();
        } else {
            return res.status(403).json({ "Mensaje": "Usuario sin permisos para realizar esta acción" });
        }
    };
};

// Validar si existe el log enviado en el body
const noExisteLog = (tipo) => {
    return async (req = request, res = response, next) => {
        const { id } = req.body;
        if (id) {
            const logEntry = await getLogDB(id);
            if (!logEntry && tipo) return res.status(404).json({ "Mensaje": `No se encontró un log con el ID '${id}'` });
            if (logEntry && !tipo) return res.status(404).json({ "Mensaje": `Ya existe un log con el ID '${id}'` });
            if (tipo) req.Log = logEntry;
            next();
        } else {
            next();
        }
    };
};

// Validar log contra la DB
const getLogDB = async (id) => {
    log.idLog = id;
    const infoLog = await log.getLogById(id);
    if (!infoLog || infoLog.recordset.length <= 0) return false;
    return infoLog.recordset[0];
};

module.exports = {
    validateLogId,
    isAdmin,
    noExisteLog
};