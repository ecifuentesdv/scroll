const sqlserver = require('mssql');
const { promisify } = require('util');

const  Config  = require('../../config/config');
const config = new Config();


class Connection {

    constructor(){
        this.pool = null;
        
    }

    // Inicializar pool (si no existe)
    async connected() {


        if (this.pool && this.pool.connected) return this.pool; // Ya existe, usarlo
        try {
            console.log("config ", config.connectionConf);
            
            const pool = new sqlserver.ConnectionPool(config.connectionConf);
            pool.on('error', err => {
                console.error('❌ Error en el pool de conexiones, reseteando...', err);
                this.pool = null;
            });

            this.pool = await pool.connect();
            console.log("Conectado a la base de datos");
            return this.pool;
        } catch (error) {
            console.error("Error de conexión a la base de datos", error);
            throw error;
        }
    }

    //Cerrar coneccion
    async closeConection(pool){
        await pool.close();
        console.log("coneccion cerrada");
    }

    //Ejecutar consultas 
    async querysExect(query) {
        if (!query) return;
        try {
            const pool = await this.connected();
            const request = pool.request();
            const result = await request.query(query);
            return result;
        } catch (error) {
            console.error("Error al ejecutar el query", error);
            return false;
        }
    }

}

module.exports = Connection; 