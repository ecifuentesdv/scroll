const { request, response, next} = require('express');

const Producto = require('../models/Producto');
const producto = new Producto();

//Verificar que el nombre no se repita
const noExisteNombreProducto = ( tipo)=> {
    return async( req = Request, res = Response, next ) => {
        const { Nombre } = req.body;
        if( Nombre ){
            const producto = await getProductoNombre( Nombre );
            const dataProducto = req.Producto;
            if( ( !dataProducto && producto ) || ( producto && producto.Id != dataProducto.Id) ) return res.status(409).json({"Mensaje": `Ya existe un producto con el nombre: '${Nombre}'`});
            next();
        }else {
            next();
        }
    }
}

const noExisteNomenclaturaProducto = ( tipo)=> {
    return async( req = Request, res = Response, next ) => {
        const { Nomenclatura } = req.body;
        if( Nomenclatura ){
            const producto = await getProductoNomenclatura( Nomenclatura );
            const dataProducto = req.Producto;
            if( ( !dataProducto && producto ) || ( producto && producto.Id != dataProducto.Id) ) return res.status(409).json({"Mensaje": `Ya existe un producto con la nomenclatura: '${Nomenclatura}'`});
            next();
        }else {
            next();
        }
    }
}


//Validar si existe el producto por Id
const existeProducto = async( req = request, res = response, next ) => {
    const { IdProducto }= req.params;
    if( IdProducto ){
        producto.idProducto = IdProducto;
        const existProducto = await producto.getProductoId();
        if( !existProducto || existProducto.recordset.length <= 0 ) return res.status(404).json({"Mensaje": `No se encontro un producto con el id '${IdProducto}'`});
        req.Producto = existProducto.recordset[0];
        next();
    }else {
        return res.status(400).json( {"Mensaje":"No se pudo obtener el id del producto"} );
    }
}

//Obtener producto por nombre
const getProductoNombre = async( nombre ) => {
    producto.nombre = nombre.toUpperCase();
    const infoProducto = await producto.getProductoNombre();
    if( !infoProducto || infoProducto.recordset.length <= 0 ) return false;
    return infoProducto.recordset[0];
}

//Obtener producto por nomenclatura
const getProductoNomenclatura = async( nomenclatura ) => {
    producto.nomenclatura = nomenclatura.toUpperCase();
    const infoProducto = await producto.getProductoNomenclatura();
    if( !infoProducto || infoProducto.recordset.length <= 0 ) return false;
    return infoProducto.recordset[0];
}
module.exports = {
    noExisteNombreProducto,
    noExisteNomenclaturaProducto,
    existeProducto
}