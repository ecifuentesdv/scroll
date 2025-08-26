const moment = require('moment');
const {Router} = require('express'); 
let router = Router();

const Config = require('../config/config');
const cnf = new Config();

const Sesion = require('../models/sesiones');


const WINDOW_DURATION_IN_MINUTES     = cnf.tiempoBloqueado;
const MAX_WINDOW_REQUEST_COUNT       = cnf.cantidadPeticiones;
const WINDOW_LOG_DURATION_IN_MINUTES = cnf.tiempoBloqueado;


const customLimiter = router.use(async function (req, res, next)  {




    try {

        const sesion = new Sesion();

        
        //Obtener la ip de cliente que hace la solicitud        
        //const ipClient = (req.headers['x-forwarded-for'])? req.headers['x-forwarded-for']: await cnf.getIp(req.ip);
        const ipClient = await cnf.getIp(req.ip);
        console.log("Ip de la peticion ", req.ip, " ", ipClient );
        
        sesion.idSesion = ipClient;
        const getSesion = await sesion.getSesion();


        //Obtener la fecha del momento en el que se esta haciendo la peticion al API
        const currentTime = moment();

        if( !getSesion?.recordset?.length ){
            sesion.data = JSON.stringify([{
                requestTimeStamp: currentTime.unix(),
                requestCount: 1
            }])
            await sesion.addSesion();
            next();

        }else{
            const data = JSON.parse( getSesion.recordset[0].Data );

            let windowBeginTimestamp = moment().subtract(WINDOW_DURATION_IN_MINUTES, 'minutes').unix();
            let requestsinWindow = data.filter(entry => {
                    return entry.requestTimeStamp >= windowBeginTimestamp;
            });

             let totalWindowRequestsCount = requestsinWindow.reduce((accumulator, entry) => {
                    return accumulator + entry.requestCount;
             }, 0);


            
            if (totalWindowRequestsCount >= MAX_WINDOW_REQUEST_COUNT) {
                return res.status(429).json({"Mensaje": `¡Has superado el límite de solicitudes, intentalo mas tarde!`, Codigo: 429});

            }else {
                let lastRequestLog = data[data.length - 1];
                let potentialCurrentWindowIntervalStartTimeStamp = currentTime.subtract(WINDOW_LOG_DURATION_IN_MINUTES, 'minutes').unix();
                
                //When the interval has not passed from the last request, then the counter increments
                if (lastRequestLog.requestTimeStamp > potentialCurrentWindowIntervalStartTimeStamp) {
                    lastRequestLog.requestCount++;
                    data[data.length - 1] = lastRequestLog;
                    sesion.data = JSON.stringify(data);
                    await sesion.updateSesion();
                    next();

                } else {
                    await sesion.deleteSesion();
                    next();
                }   
            }

        }
        
    } catch (error) {
        next(error);
    }
});



module.exports = {
    customLimiter
}