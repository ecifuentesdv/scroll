const Core = require('./core');


module.exports = class uUser extends Core {

    constructor(idUser, nombre, apellido, email, pass, rol = 'USUARIO', create, update ){
        super('Usuario', 'Id_usuario');
        this.idUser = idUser; 
        this.nombre = nombre; 
        this.apellido = apellido;
        this.email = email;
        this.rol = rol;
        this.pass = pass;
        this.create = create;
        this.update = update;
        this.table = 'Usuario';
        this.idTable = 'Id_usuario';
    }

    //Obtener los usuarios atravez de funcion
    async getUsuarios(){
        return await super.executeQuery(`SELECT * FROM [dbo].GetUsuarios();`);
    }

    //Obtener los usuarios por email
    async getEmail(){
        console.log("THIS ", this.email);
        return await super.executeQuery(`SELECT TOP 1 * FROM [dbo].GetUsuarios() WHERE Correo = '${this.email}';`);
    }

    //Agregar usuario
    async addUser(){
        return await super.executeQuery(`EXEC [dbo].AddUsuario '${this.nombre}', '${this.apellido}', '${this.email}', '${this.rol}', '${this.pass}';`);
    }


    //eliminar
    async Eliminar(id){
        return await this.executeQuery(`DELETE FROM [dbo].Usuario WHERE Id_usuario = ${id};`);
    }


    //Editar usuario
    async editarUsuario(){
        return await super.executeQuery(`EXEC [dbo].UpdateUsuario '${this.nombre}', '${this.apellido}', '${this.rol}', '${this.pass}', '${this.create}', ${this.idUser}, '';`);
    }

}