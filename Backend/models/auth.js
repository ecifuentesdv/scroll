const Core = require('./core');


module.exports = class Auth extends Core {

    constructor( nombre, email, pass ){
        super('users', 'id_user');
        this.nombre = nombre;
        this.email = email;
        this.pass = pass;
        this.table = 'users';
        this.idTable = 'id_user';
    }

    //Obtener usuario por credenciales
    async getCredentials(){
        return await super.executeQuery(`SELECT * FROM ${this.table} WHERE password = ? AND ( email = ? OR nombre = ? ) LIMIT 1;`,
                                        [ this.pass, this.email, this.nombre ]);
    }
}