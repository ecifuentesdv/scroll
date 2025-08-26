const {  response, request  } = require('express');
const bcryptjs = require('bcryptjs');

const User = require('../models/user');
const usr = new User();

const Log = require('../models/logs')
const log = new Log();

const Notification = require('../helpers/notificationEmail');
const notif = new Notification();


//obtemer todos los usuarios
const getAll = async( req = request, res = response ) => {

    const todos = await usr.getUsuarios();
    if( !todos) return res.status(500).json({"Mensaje":"Ocurrio un error al intentar obtener todos los usuarios"});
    const usuarios = todos.recordset.map( u => {
        delete u.Contrasenia;
        return u;
    })
    return res.status(200).json({"Usuarios": usuarios });
}



//obtener usuario por correo
const getEmail = async( req = request, res = response ) => {
    const user = req.User;
    return res.status(200).json(user);
}


//Agregar usuario
const addUser = async( req = request, res = response )=>{
    const { Nombre, Apellido,  Email, Password, Rol } = req.body;


    //Cifrar la contraseña
    const salt = bcryptjs.genSaltSync(10);
    const pass = bcryptjs.hashSync( Password, salt );

    usr.nombre   = Nombre.toUpperCase();
    usr.apellido = Apellido.toUpperCase();
    usr.email    = Email.toUpperCase();
    usr.pass     = pass;
    usr.rol      = Rol.toUpperCase();
    const addUser = await usr.addUser();

    console.log("Agregar Usuario ", addUser );
    if( addUser && addUser.recordset.length > 0 ) {

        const userLogin = req.userLogin;
        const idLogin = userLogin.id;
        log.idUser = idLogin;
        log.nombre = 'Usuario Agregado';
        log.descripcion = `El usuario con ID: ${idLogin} y el correo ${userLogin.email} ha agregado un usuario con el correo ${Email}`
        log.addLog()
        console.log('ID------------',idLogin)
        return res.status(200).json({"Mensaje":"Usuario agregado correctamente"});
}
    return res.status(500).json({"Mensaje":"Ocurrio un error al itentar agregar el usuario"});
}

//Editar usuario
const UpdateUser = async ( req = request, res = response 
) => {
    const { Nombre, Apellido, Rol } = req.body;
    const userEmail = req.User;

    usr.nombre = Nombre.toUpperCase();
    usr.apellido = Apellido.toUpperCase();
    usr.rol = Rol.toUpperCase();
    usr.pass = userEmail.Contrasenia;
    usr.create = mapFecha(userEmail.Create);
    usr.idUser = userEmail.Id;

    const updateUser = await usr.editarUsuario();
    if( !updateUser || updateUser.rowsAffected.length <= 0 )return res.status(500).json({"Mensaje":"Ocurrio un error al intentar editar al usuario con el correo " + req.params.email } );
    {      
        const userLogin = req.userLogin;
        const idLogin = userLogin.id;
        log.idUser = idLogin;
        log.nombre = 'Usuario Actualizado';
        log.descripcion = `El usuario con ID: ${idLogin} y el correo ${userLogin.email} ha actualizado un usuario con el correo ${req.params.email}`;
        log.addLog();
        console.log('ID------------',idLogin)
        return res.status(200).json({"Mensaje":"Usuario editado correctamente" } );
    }

}

//Eliminar usuario
const DeleteUser = async( req = request, res = response ) => {

    const userEmail = req.User;
    usr.idUser = userEmail.Id;
    const deleteUser = await usr.Eliminar(usr.idUser);
    if( !deleteUser || deleteUser.rowsAffected.length <= 0 ) return res.status(500).json({"Mensaje": "Ocurrio un error al intentar eliminar al usuario con el correo " + req.params.email });

    {
        const userLogin = req.userLogin;
        const idLogin = userLogin.id;
        log.idUser = idLogin;
        log.nombre = 'Usuario Eliminado';
        log.descripcion = `El usuario con ID: ${idLogin} y el correo ${userLogin.email} ha eliminado al usuario con el correo ${userEmail.Correo}`;
        log.addLog();
        console.log('ID------------',idLogin)
        return res.status(200).json({"Mensaje":"Usuario eliminado correctamente"})
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
    getAll,
    getEmail,
    addUser,
    UpdateUser,
    DeleteUser
}