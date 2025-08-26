const cron = require('node-cron');
const Sesion = require('../models/sesiones');



//Eliminar las sesiones que han vencido
function clearSesion(){
    try {
        
        cron.schedule('*/5 * * * * ', async()=> {
            console.log("Eliminado sesiones...");
            const sesion = new Sesion();
            await sesion.deleteAllSesions();
        })
    } catch (error) {
            console.log("Error al eliminar las sesiones ", error);
    }
}

//Eliminar la clave del token
function deleteKey(){
    try {
        
        cron.schedule('0 22 * * * ', async() => {
            const sesion = new Sesion();
            console.log("Eliminando clave del token");
            await sesion.eliminarClave();
        })
    } catch (error) {
        console.log("Error al eliminar la clave del token ", error);    
    }
}

module.exports = {
    clearSesion,
    deleteKey
}