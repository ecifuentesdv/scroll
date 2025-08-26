const Core = require('./core');

module.exports = class uLog extends Core{
    constructor(idLog, idUser, nombre, descripcion, create){
        super('Log','Id_log');
        this.idLog = idLog;
        this.idUser = idUser;
        this.nombre = nombre;
        this.descripcion = descripcion;
        this.create = create;
        this.table = 'Logs';
        this.idTable = 'Id_log';
    }

    //obtener todos los usuarios
async getAllLogs(){
    return await super.executeQuery(`SELECT TOP 1000* FROM [dbo].GetLogs() ORDER BY Id DESC;`)
}

    //Agregar usuario
async addLog(){
    return await super.executeQuery(`EXEC [dbo].AddLog '${this.idUser}', '${this.nombre}', '${this.descripcion}';`);
}

} 