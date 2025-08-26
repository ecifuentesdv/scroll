const Config = require('../config/config');
const cnf = new Config();

const Sesion = require('../models/sesiones');


const getClaveToken = async() => {
    try {
        

        const sesion = new Sesion();
        sesion.idSesion = 'claveTokenCliente';
        const claveSesion = await sesion.getSesion();
        const clave = claveAleatoria();
        const fechaActual = getFecha();
        const data = { Fecha: fechaActual, Clave: clave }
        sesion.data = JSON.stringify( data );

        if( claveSesion && claveSesion.recordset.length > 0 ){

            const dataClave = JSON.parse(claveSesion.recordset[0].Data);

            if( dataClave.Fecha == fechaActual ){
                return { error: false, clave: dataClave.Clave }
            }else {
                await sesion.updateSesion();
                return { error: false, clave: data.Clave }

            }

        }else {
            await sesion.addSesion();
            return { error: false, clave: data.Clave }
        }


    } catch (error) {
        console.log("error ", error);
        return { error: true, clave: cnf.claveTokenWebview}
    }
}





//Obtener la fecha en curso
function getFecha(){
    const fechaActual = new Date();
    const dia = String(fechaActual.getDate()).padStart(2, '0'); 
    const mes = String(fechaActual.getMonth() + 1).padStart(2, '0');
    const año = fechaActual.getFullYear();
    return `${dia}/${mes}/${año}`;
}



//Formar clave aletoria
function claveAleatoria(){
    const caracteres = cnf.claveTokenWebview.split('');
    for (let i = caracteres.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [caracteres[i], caracteres[j]] = [caracteres[j], caracteres[i]];
    }
    return caracteres.join('');
}



module.exports = getClaveToken;