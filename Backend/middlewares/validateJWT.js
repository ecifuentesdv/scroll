const { response, request } = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const Config = require('../config/config');
const cnf = new Config();

const User = require('../models/user');
const usr = new User();


const Sesion = require('../models/sesiones');

const getClaveToken  = require('../helpers/claveAleatoria');
const Encriptar = require('../helpers/cif');



//Validar el token para novegar en el orquestador
const validateJWT = async( req = request, res = response, next )=> {
    
    const auth = req.header('Authorization');
    if( !auth ) return res.status(401).json({"Mensaje":"Usuario no autorizado."});

    try {

        //Obtener la ip del cliente
        //const reqIP = ( req.headers['x-forwarded-for'] ) ? req.headers['x-forwarded-for']  : await cnf.getIp( req.ip );
        const reqIP =  await cnf.getIp( req.ip );

        //Extraer el token de los headers
        const tokenBear = auth.split(" ");
        const token = tokenBear[1];
        if( !token || tokenBear[0] != "Bearer" ) return res.status(401).json({"Mensaje":"Usuario no autorizado."});

        //Validamos que el token sea legitimo
        const { user, ReqIp, email, Rol } = jwt.verify( token, cnf.claveToken );
        if( user && email && ReqIp && Rol ){

            //Validamos que el token se halla generado del mismo origen
            if( cnf.validarOrigen && reqIP != ReqIp ) return res.status(403).json({"Mensaje":"El token se creo en una fuente diferente"});

            const sesion = new Sesion();
            sesion.idSesion = email;
            const existSesion = await sesion.getSesion();
            if( existSesion && existSesion.recordset.length > 0 ){

                console.log("email  ", email );
                
                //Obterner la informacion del usuario l ogeado desde la base de datos
                usr.email = email.toUpperCase();
                const infoUser = await usr.getEmail();
                const userLogin = { 
                    user: infoUser.recordset[0].Nombre, 
                    email: infoUser.recordset[0].Correo, 
                    lastname: infoUser.recordset[0].Apellido, 
                    ReqIp, 
                    Rol: infoUser.recordset[0].Rol,
                    id: infoUser.recordset[0].Id 
                };
                req.userLogin = userLogin;
                next();
            }else {
                return res.status(401).json({"Mensaje":"La sesión a vencido"})
            }

        }else {
            return res.status(401).json({"Mensaje":"Token no valido"});
        }
    } catch (error) {
        console.log("ERROR", error);
        if( error.message == "jwt expired")   return res.status(401).json({"Mensaje":"Token no valido"});
        if( error.message == "invalid token") return res.status(400).json({"Mensaje":"Token no valido"});
        
        return res.status(500).json({"Mensaje":"Ocurrio un error al validar el token"});
    }
}



//Validar el token para navegar en las paginas del orquestador
const validateJWTWebview = async( req = request, res = response, next )=> { 

    const path = req.route.path;
    console.log("request ", path);

    const auth = req.header('Authorization');
    if( !auth ) return res.status(401).json({"Mensaje":"Usuario no autorizado.", Codigo: 401});


    try {

        //Obtener la clave aleatoria
        const claveRedis = await getClaveToken();

        //Obtener la ip del cliente
        const reqIP =  await cnf.getIp( req.ip );
        let cif = req.headers['customer'];


        //desencriptar
        const encript = new Encriptar('', cif);
        cif = encript.decrypt();


        //Extraer el token de los headers
        const tokenBear = auth.split(" ");
        const token = tokenBear[1];
        if( !token || tokenBear[0] != "Bearer" ) return res.status(401).json({"Mensaje":"Usuario no autorizado.", Codigo: 401});

        console.log("Token ", token);

        //Validamos que el token sea legitimo
        const { usuario:CIF, rol:Ip } = jwt.verify( token, claveRedis.clave );

        if( CIF && Ip ){

            
            console.log("Peticion IP", reqIP);

            //Validamos que el token se halla generado del mismo origen
            if( cnf.validarOrigen && !( bcrypt.compareSync(reqIP, Ip ) ) ) return res.status(403).json({"Mensaje":"El token se creo en una fuente diferente", Codigo: 403});

            //Obterner la informacion del usuario l ogeado desde la base de datos
            if( !( bcrypt.compareSync(cif, CIF ) ) ) return res.status(403).json({"Mensaje":"Token no valido", Codigo: 403});

            const sesion = new Sesion();
            sesion.idSesion = cif;
            const getSesion = await sesion.getSesion();
            const customerSesion = ( getSesion && getSesion.recordset.length > 0 ) ? JSON.parse(getSesion.recordset[0].Data) : false;
            console.log("Sesion IP", customerSesion.idClient);


            if( customerSesion.token && ( customerSesion.token == token ) ){

                //Se se esta realizando el tracking de un cliente, no se actualizara el token
                if( path != '/Trackevents' ){

                    const decodeToken = jwt.decode(token);
                    const now = Math.floor( Date.now() / 1000 );
                    
                    console.log("Le queda en minutos ", ( decodeToken.exp - now ) / 60 );
                    console.log("Actualizar en menos de", cnf.tiempoActualizarToken );

                    if( ( decodeToken.exp - now ) / 60 <= cnf.tiempoActualizarToken ){
                        
                        const newToken = jwt.sign({ "usuario" : CIF, "rol": Ip }, claveRedis.clave, { expiresIn: cnf.tiempoTokenWebview});
                        sesion.data = {};
                        sesion.data.idClient = reqIP;
                        sesion.data.token = newToken;
                        sesion.data = JSON.stringify( sesion.data );
                        await sesion.updateSesion();
                        req.newToken = newToken;
                    }else {
                        req.newToken = token;
                    }
                }

                req.CIF = cif;
                next();

            }else {
              if(customerSesion.token && ( customerSesion.token != token ) )  return res.status(401).json({"Mensaje":"Sesión duplicada", Codigo: 401});
              return res.status(500).json({"Mensaje":"Ocurrio un error al intentar iniciar sesión", Codigo: 500});
            }


        }else {
            return res.status(401).json({"Mensaje":"Token no valido", Codigo: 401});
        }


    } catch (error) {
        console.log("ERROR", error);
        if( error.message == "jwt expired")   return res.status(401).json({"Mensaje":"Token no valido", Codigo: 401});
        if( error.message == "invalid token") return res.status(400).json({"Mensaje":"Token no valido", Codigo: 400});
        
        return res.status(500).json({"Mensaje":"Ocurrio un error al validar el token", Codigo: 500});
    }
}

module.exports = {
    validateJWT,
    validateJWTWebview
}