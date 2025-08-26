const { request, response, next} = require('express');

const User = require('../models/user');
const user = new User();

//validar correo, que viene como parametro
const validateEmail = async( req = request, res = response, next ) => {
    const { email }= req.params;
    if( email ){
        const user = await getUserDB( email );
        if( !user ) return res.status(404).json({"Mensaje": `No se encontro un usuario con el correo '${email}'`});
        req.User = user;
        next();
    }else {
        return res.status(400).json( {"Mensaje":"No se pudo obtener el correo del usuario"} );
    }
}

//Validar correo, que viene en el body
const validateEmailBody = (tipo) => {
    return async( req = request, res = response, next )=>{
        const { Email } = req.body;
        console.log("correo ", Email );
        if( Email ){
            const user = await getUserDB( Email );
            console.log("user ", user );
            if( !user && tipo ) return res.status(404).json({"Mensaje": `No se encontro un usuario con el correo '${Email}'`});
            if( user && !tipo ) return res.status(404).json({"Mensaje": `Ya existe un usuario con el correo '${Email}'`});
            if( tipo ) req.User = user;
            next();
    
        }else {
            return res.status(400).json( {"Mensaje":"No se pudo obtener el correo del usuario"} );
        }
    }
} 

//Validar que el rol sea administrador para consumir el API
const isAdmin = (rol) => {
    return async( req = request, res = Response, next ) => {
        const User = req.userLogin;
        console.log("USER ", User);
        if( User.Rol === 'ADMINISTRADOR'){
            next()
        }else {
            return res.status(403).json({"Mensaje": "Usuario sin permisos para realizar esta acción"});
        }

    }
}

//Validar si existe el correo enviado en el body
const noExisteEmail = ( tipo )=> {
    return async( req = Request, res = Response, next ) => {
        const { Email } = req.body;
        if( Email ){
            const user = await getUserDB( Email );
            if( !user && tipo ) return res.status(404).json({"Mensaje": `No se encontro un usuario con el correo '${Email}'`});
            if( user && !tipo ) return res.status(404).json({"Mensaje": `Ya existe un usuario con el correo '${Email}'`});
            if( tipo ) req.User = user;
            next();
        }else {
            next();
        }
    }
}

//Validar correo contra la DB
const getUserDB = async( email )=> {
    user.email = email.toUpperCase();
    const infoUser = await user.getEmail();
    if( !infoUser || infoUser.recordset.length <= 0 ) return false;
    return infoUser.recordset[0];
}

module.exports = {
    validateEmail,
    validateEmailBody,
    noExisteEmail,
    isAdmin
}