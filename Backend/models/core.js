const Connection = require('../config/db/connection');
const connection = new Connection();

module.exports = class Core {
    constructor(table, id){
        this.table = table;
        this.id = id;
        this.connection = connection;
    }

    //Obtener todos los elementos de una tabla
    async getAll(){
        return await this.executeQuery(`SELECT * FROM ${this.table}`);
    }

    //Obtener los elementos por su id
    async getId(id){
        return await this.executeQuery(`SELECT * FROM ${this.table} WHERE ${this.id} = '${id}'`);
    }


    //Funcion para hacer consultas hacia la base de datos
    async executeQuery( query ){
        try {
            return await this.connection.querysExect( query );
        } catch (error) {
            console.log("ERROR CONSULTA DB ", error);
            return false;
        }
    }
}