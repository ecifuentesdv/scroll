const axios = require('axios');
const https = require("https");


const agent = new https.Agent({ keepAlive: true, maxSockets: 50 });



//Obtener el detalle de los servicios
const getServicesDetalle = async(clienteId, parametros ) => { 
    try {


        const response = await axios({
            method: 'POST',
            url: `${process.env.URLMONEYTHOR}/fpm/api/v5/service`,
            data: parametros,
            httpsAgent: agent,
            headers: {
                "Content-Type": "application/json",
                "customer": clienteId
            }
        });

        return  { 
            "Servicio": parametros.name,
            "Maqueta": response.data
        } 
        
    } catch (error) {
        console.log("Error al traer el servicio desde Moneythor ", error);
        return {
            error: true,
            mensaje: error.message
         }
    }
}



//Obtener el listado de los servicios
const getServices = async(clienteId) => { 
    try {

        const response = await axios({
            method: 'POST',
            url: `${process.env.URLMONEYTHOR}/fpm/api/v5/getservices`,
            data: {
                "include_schema": true
              },
            httpsAgent: agent,
            headers: {
                "Content-Type": "application/json",
                "customer": clienteId
            }
        });

        return  response.data        
        
    } catch (error) {
        console.log("Error al traer el servicio desde Moneythor ", error);
        return {
            error: true,
            mensaje: error.message
         }
    }
}



//Traquiar los eventos de los tipos
const trackEvents = async (clienteId, eventData) => {
    try {
        const response = await axios({
            method: 'POST',
            url: `${process.env.URLMONEYTHOR}/fpm/api/v5/trackevents`,
            data: eventData,
            httpsAgent: agent,
            headers: {
                "Content-Type": "application/json",
                "customer": clienteId
            }
        });
        return {
            success: true,
            data: response.data
        };
                
    } catch (error) {
        console.log("Error al enviar eventos a Moneythor: ", error);
        return {
            error: true,
            mensaje: error.message
        };
    }
};


//Buscar el cliente
const searchCustomer = async (cif) => {
    try {
        const response = await axios({
            method: 'GET',
            url: `${process.env.URLMONEYTHOR}/fpm/api/v5/searchcustomer`,
            httpsAgent: agent,
            headers: {
                "Content-Type": "application/json",
                "customer": cif, 
            },
        });

        return {
            success: true,
            data: response.data,
        };
    } catch (error) {
        console.log("Error al buscar cliente en Moneythor: ", error);

        return {
            error: true,
            mensaje: error.message,
        };
    }
};


const getApisMoneyThor = async(Tipo, Data, Api, Cif) => {
    try {
        const response = await axios({
            method: Tipo,
            url: `${process.env.URLMONEYTHOR}/fpm/api/v5/${Api}`,
            httpsAgent: agent,
            data: Data,
            headers: {
                "Content-Type": "application/json",
                "customer": Cif, 
            }
        });

        return response.data;
    } catch (error) {
        console.log("ERROR ", error.message);
        return { success: false, mensaje: error.message }
    }
}


//Obtener los tips desde moneythor 
const getTipsMoneythor = async(Cif, tip) => {
    try {
        const response = await axios({
            method: 'GET',
            url: `${process.env.URLMONEYTHOR}/fpm/api/v5/tip?tip_key=${encodeURIComponent(tip.key)}&format=html&status=live`,
            httpsAgent: agent,
            data: {},
            headers: {
                "Content-Type": "application/json",
                "customer": Cif, 
            }
        });

        return { success: true, data: response.data, tip: tip }
    } catch (error) {
        console.log("ERROR Al obtener el tips con el id " + tip.key, error);
        return { success: false, mensaje: error.message }
    }
}

module.exports = {
    getServicesDetalle,
    getServices,
    trackEvents,
    searchCustomer,
    getApisMoneyThor,
    getTipsMoneythor
}