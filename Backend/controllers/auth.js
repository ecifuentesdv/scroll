const { response, request } = require('express');
const bcrypt = require('bcryptjs');
const JWT = require('jsonwebtoken');

const Config = require('../config/config');
const cnf = new Config();

const Sesion = require('../models/sesiones');



const { EnviarAlerta } = require('../config/mailer');
const { notificationForggotPasswordTextPlain } = require("../config/static/plantillasCorreo");

const { soapRequest } = require('../config/email/email');

const User = require('../models/user');
const usr = new User();


//Login
const login = async( req = request, res = response ) => {
    
    const user = req.User;
    
    
    try {
        
        //Obtener la ip del cliente
        //const ipUser = ( req.headers['x-forwarded-for'] ) ?  req.headers['x-forwarded-for']   : await cnf.getIp( req.ip );
        const ipUser = await cnf.getIp( req.ip );
        
        console.log("IP L", ipUser);
        
        const sesion = new Sesion();
        sesion.idSesion = user.Correo;
        sesion.data = {};
        sesion.data.idClient = ipUser;
        
        //Eliminamos las sesiones anteriores del usuario
        await sesion.deleteSesion();



        //comparamos las contraseñas
        const verify = bcrypt.compareSync( req.body.Password, user.Contrasenia);
        if( verify ){


            //generar el token
            const token = JWT.sign({  user: user.Nombre, 
                                      email: user.Correo, 
                                      ReqIp: ipUser,
                                      Rol: user.Rol
                                    }, cnf.claveToken,
                                    { expiresIn: cnf.tiempoToken });


            //Guardamos la sesion
            sesion.data.token = token;
            sesion.data = JSON.stringify( sesion.data );
            await sesion.addSesion();


            return res.status(200).json({
                user: user.Nombre,
                rol: user.Rol,
                token: token
            });

        }else {
            return res.status(400).json( {"Mensaje":"Usuario y contraseña no valido"} );
        }

    } catch (error) {
        console.log(error);
        return res.status(500).json({"Mensaje": error.message});
    }    
}



//Verificar que el token sea valido
const verificarToken = async(req= Request, res=Response)=>{

    const { auth } = req.headers;
    const sesion = new Sesion();
    try {


        //Extraemos la información del token
        const { user, email, ReqIp, Rol  } = JWT.verify( auth, cnf.claveToken );

        //Obtener la ip del cliente
        //const ipUser = ( req.headers['x-forwarded-for'] ) ?  req.headers['x-forwarded-for'] : await cnf.getIp( req.ip );
        const ipUser = await cnf.getIp( req.ip );

        

        sesion.idSesion = email;
        sesion.data = {};
        sesion.data.idClient = ipUser;
        let dataSesion = await sesion.getSesion();
        dataSesion = ( dataSesion && dataSesion.recordset.length > 0 ) ? JSON.parse(dataSesion.recordset[0].Data) : {};
 

        console.log("IPRequest ", ipUser);
        console.log("IPSesion ", dataSesion.idClient);

        //Se valida que sea el mismo token y que se halla generado con la misma ip
        if( dataSesion.token && auth == dataSesion.token ){

            //Validamos el origen del token
            if( cnf.validarOrigen && dataSesion.idClient != ipUser  ) return res.status(403).json({"Mensaje":"El token se origino en una fuente diferente"});


            //Generamos un nuevo token
            const token = JWT.sign({ user, email, ReqIp, Rol }, 
                                    cnf.claveToken, 
                                    { expiresIn: cnf.tiempoToken });

            //Eliminamos la sesion anterior
            await sesion.deleteSesion();

            //Agregamos nuevamente la sesion con el nuevo token
            sesion.data.token = token;
            sesion.data = JSON.stringify(sesion.data);
            await sesion.addSesion();

            
            return res.status(200).json( { "token": token } );
        }

        return res.status(401).json({"Mensaje":"Usuario no autorizado"});
        
    } catch (error) {
        console.log(error)
        return res.status(500).json( { "Mensaje":error.message } );
    }
}




//cerrar sesion
const cerrarSesion = async( req = Request, res = Response)=>{
    try {

        //Obtenemos la información del cliente logeado
        const user = req.userLogin;

        const sesion = new Sesion();
        sesion.idSesion = user.email;
        await sesion.deleteSesion();


        console.log("Cession cerrada");
        return res.status(200).json({"Mensaje":"Sesión cerrada"});


    }catch( error ){
        console.log(error);
        return res.status(500).json({"Mensaje":"Ocurrio un error al intentar cerrar la sesión"})
    }
}




    //enviar correo para cambiar la contraseña
const verifyEmail = async (req= Request, res= Response) => {
    try {
        const { Email } = req.body;
        const { User } = req;  
        
        const token = JWT.sign({ userId: User.Id, email: User.Correo, username: User.Nombre, roles: User.Rol }, cnf.claveToken, { expiresIn: cnf.tiempoTokenCorreo });
        const mensaje = notificationForggotPasswordTextPlain(token, User.Nombre, User.Apellido, cnf.hostEmail);

        const result = ( cnf.emailMailes ) ?
            await EnviarAlerta(mensaje, 'Cambio de contraseña del sitio Orquestador Moneythor', Email) :
            await soapRequest( mensaje, 'Cambio de contraseña del sitio Orquestador Moneythor', Email );
            

        if( !result ) return res.status(500).json( {"Mensaje":"Ocurrio un error al enviar el mensaje de cambio de contraseña"} );
        return res.status(200).json({"Mensaje":`Se a enviado un correo al usuario con el correo: '${Email}'`});


    } catch (err) {
        console.log(err);
        return res.status(200).json({"Mensaje":err.message})
    }
}




// cambiar la contraseña
const ChangePassword = async(req= Request, res= Response)=>{
    try {
        const { Token, Password } = req.body
        const verifyT = await validateToken( Token );

        if( !verifyT ) return res.status(400).json({"Mensaje":"Token no valido"});
        
            const { email } = verifyT;
            usr.email = email.toUpperCase();
            const dataUsr = await usr.getEmail();
            if( !dataUsr || dataUsr.recordset.length <= 0 ) return res.status(400).json({"Mensaje":"Token no valido"});

            /* Convertimos contrasenia cruda en cifrada */
            const salt = bcrypt.genSaltSync(10);
            const Pass = bcrypt.hashSync(Password, salt);

            usr.nombre = dataUsr.recordset[0].Nombre;
            usr.apellido = dataUsr.recordset[0].Apellido;
            usr.rol = dataUsr.recordset[0].Rol;
            usr.create = mapFecha(dataUsr.recordset[0].Create);
            usr.pass = Pass;
            usr.idUser = dataUsr.recordset[0].Id;

            const updatePassword = await usr.editarUsuario();
            console.log("Editar ", updatePassword);                
            if( !updatePassword || updatePassword.rowsAffected.length <= 0 ) return res.status(500).json({"Mensaje":"Ocurrio un error al intentar cambiar la contraseña"});
            return res.status(200).json( { Mensaje: 'Se a cambido la contraseña correctamente.'} );

    } catch (err) {
        console.log(err);
        return res.status(500).json( { "Mensaje":err.message } )
    }
}




//validar el token
const validateToken = async(token)=>{
    try {
        const { email, ...data } = JWT.verify(token, cnf.claveToken );
        console.log("email ", data);
        const userLogin = {
            user: data,
            email
        }
        return userLogin;
    } catch (error) {
        console.log("ERROR", error.message);
        return false;
    }
}  




//Mapear la fecha
const mapFecha = (fecha) =>{
    const fechaS = fecha.split(' ');
    const mesAll = fechaS[0];
    const diaAll = fechaS[1];

    const fechaAll = mesAll.split('/');
    return `${fechaAll[2]}-${fechaAll[1]}-${fechaAll[0]} ${diaAll}:000`;
}


module.exports = {
    login,
    verificarToken,
    cerrarSesion,
    verifyEmail,
    ChangePassword
}