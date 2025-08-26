const { response, request } = require('express');


const Log = require('../models/logs'); 
const log = new Log();


// Obtener todos los logs
const getAll = async (req = request, res = response) => {

        const todos = await log.getAllLogs();
        if (!todos) return res.status(500).json({ "Mensaje": "Ocurrió un error al intentar obtener todos los logs" });

        return res.status(200).json({ "Logs": todos.recordset });
    };


    
// Agregar un nuevo log
const addLog = async (req = request, res = response) => {
    const { idUser, nombre, descripcion } = req.body;
    log.idUser = idUser;
    log.nombre = nombre;
    log.descripcion = descripcion;
    const addLogResult  = await log.addLog();
        if (addLogResult?.rowsAffected?.length > 0) {
            return res.status(200).json({ "Mensaje": "Log agregado correctamente" });
        }
        return res.status(500).json({ "Mensaje": "Ocurrió un error al intentar agregar el log" });
    };
    
    

// Eliminar un log
const deleteLog = async (req = request, res = response) => {
    const { id } = req.params;
    const result = await log.Eliminar(id);

    if ( result?.rowsAffected?.[0] > 0) {
        return res.status(200).json({ "Mensaje": "Log eliminado correctamente" });
    } else {
        return res.status(404).json({ "Mensaje": "No se encontró el log para eliminar" });
    }
};

module.exports = { 
    getAll,
    addLog,
    deleteLog
};