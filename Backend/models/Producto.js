const Core = require('./core');

module.exports = class Producto extends Core {

    constructor(idProducto, nombre, descripcion, nomenclatura, estatus, create, updated  ){
        super('Producto', 'Id_producto');
        this.idProducto   = idProducto;
        this.nombre       = nombre;
        this.descripcion  = descripcion;
        this.nomenclatura = nomenclatura;
        this.estatus      = estatus;
        this.create       = create;
        this.updated      = updated;
        this.table        = 'Producto';
        this.idTable      = 'Id_producto';
    }

    //Obtener todos los productos
    getAllProductos(){
        return super.executeQuery(`SELECT * FROM GetProductos();`);
    }

    //Obtener todos los productos
    getProductoId(){
        return super.executeQuery(`SELECT * FROM GetProductos() WHERE Id = ${this.idProducto};`);
    }

    //Agregar Producto
    addProducto(){
        return  super.executeQuery(`EXEC [dbo].AddProducto '${this.nombre}', '${this.descripcion}', '${this.nomenclatura}'`);
    }

    //Obtener producto por nombre
    getProductoNombre(){
        return super.executeQuery(`SELECT TOP 1 * FROM GetProductos() WHERE Nombre = '${this.nombre}';`);
    }

    //Obtener producto por nomenclatura
    getProductoNomenclatura(){
        return super.executeQuery(`SELECT TOP 1 * FROM GetProductos() WHERE Nomenclatura = '${this.nomenclatura}';`);
    }

        //eliminar
    async Eliminar(id){
        return await this.executeQuery(`DELETE FROM [dbo].Producto WHERE Id_producto = ${id};`);
    }

    //Editar producto
    editarProducto(){
        return super.executeQuery(`EXEC [dbo].UpdateProducto '${this.nombre}', '${this.descripcion}', '${this.nomenclatura}', '${this.create}', ${this.idProducto}, '';`);
    }
}