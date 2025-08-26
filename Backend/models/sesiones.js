
const Core = require('./core');

const Config = require('../config/config');
const cnf = new Config();




module.exports = class Sesion extends Core{
    constructor( idSesion, data ){
        super('Moneythor','id_moneythor');
        this.idSesion = idSesion;
        this.data = data;
        this.tiempoExp = cnf.tiempoSesion;
    }


    //Agregar data de sesion
    async addSesion(){
        return await super.executeQuery(`EXEC [dbo].addMoneythor '${this.idSesion}', '${this.data}';`);   
    }


    //Editar la data de sesion
    async updateSesion(){
        return await super.executeQuery( `EXEC [dbo].UpdateMoneythor '${this.idSesion}', '${this.data}', '';` );
    }


    //eliminar la data de sesion
    async deleteAllSesions(){
        return await super.executeQuery( `EXEC clearMoneythor ${this.tiempoExp};`);
    }

    //eliminar sesion
    async deleteSesion(){
        return await super.executeQuery(`DELETE FROM Moneythor WHERE Cif = '${this.idSesion}';`);
    }

    //Eliminar la clave del token
    async eliminarClave(){
        return await super.executeQuery(`DELETE FROM Moneythor WHERE Cif = 'claveTokenCliente';`);
    }


    //Obterner informacion de la sesion
    async getSesion(){
        return await super.executeQuery( `SELECT TOP 1* FROM GetMoneythor() WHERE CIF = '${this.idSesion}'` );
    }


}