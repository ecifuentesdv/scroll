const {  response, request  } = require('express');


const Producto = require('../models/Producto');
const producto = new Producto();


const Log = require('../models/logs')
const log = new Log();


//Editar producto 
const updateProducto = async( req = request, res= response ) => {

    const { Nombre, Nomenclatura, Descripcion } = req.body;
    const dataProducto = req.Producto;
    producto.nombre         = Nombre.toUpperCase();
    producto.descripcion    = Descripcion || '';
    producto.nomenclatura   = Nomenclatura.toUpperCase();
    producto.idProducto     = dataProducto.Id;
    producto.create         = mapFecha(dataProducto.Create);

    
    const update = await producto.editarProducto();
    if( !update || update.rowsAffected.length <= 0 ) return res.status(500).json({"Mensaje":"Ocurrio un error al intentar editar el producto con el id " + dataProducto.Id } );
    
    {
        const userLogin = req.userLogin;
        const idLogin = userLogin.id;
        log.idUser = idLogin;
        log.nombre = 'Producto Actualizado';
        log.descripcion = `El usuario con ID: ${idLogin} y el correo ${userLogin.email} ha actualizado el producto con el id ${dataProducto.Id} y el nombre ${dataProducto.Nombre}`
        log.addLog()
        return res.status(200).json({"Mensaje":"Producto editado correctamente" } );
    }

}

//Obtener todos los productos
const getAll = async( req= request, res=response)=>{

    const productos = await producto.getAllProductos();
    if( !productos ) return res.status(500).json({"Mensaje":"Ocurrio un error al intentar obtener los productos"});

    return res.status(200).json({
        "Productos": productos.recordset
    })
}



//Agregar Producto
const addProducto = async( req = request, res = response ) => {
    const { Nombre, Nomenclatura, Descripcion } = req.body;

    producto.nombre = Nombre.toUpperCase();
    producto.nomenclatura = Nomenclatura.toUpperCase();
    producto.descripcion = Descripcion || '';
    
    const addProducto = await producto.addProducto();
    if( !addProducto && addProducto.recordset.length <= 0 ) return res.status(500).json({"Mensaje":"Ocurrio un error al intentar agregar el producto"});
    {
        const userLogin = req.userLogin;
        const idLogin = userLogin.id;
        log.idUser = idLogin;
        log.nombre = 'Prodcuto Agregado';
        log.descripcion = `El usuario con ID: ${idLogin} y el correo ${userLogin.email} ha agregado un producto con el nombre ${Nombre}`
        log.addLog()
        console.log('ID------------',idLogin)
    
        return res.status(200).json({ "Mensaje":"Producto agregado correctamente"});
    }
}




//Eliminar producto
const deleteProducto = async( req = request, res = response ) => {
    const produtoE = req.Producto;
    producto.idProducto = produtoE.Id;
    const deleteProducto = await producto.Eliminar(producto.idProducto);
    if( !deleteProducto || deleteProducto.rowsAffected.length <= 0 ) return res.status(500).json({"Mensaje": "Ocurrio un error al intentar eliminar el producto con el nombre " + produtoE.Nombre });

    {
        const userLogin = req.userLogin;
        const idLogin = userLogin.id;
        log.idUser = idLogin;
        log.nombre = 'Producto Eliminado';
        log.descripcion = `El usuario con ID: ${idLogin} y el correo ${userLogin.email} ha eliminado un producto con el id ${produtoE.Id} y el nombre ${produtoE.Nombre}`
        log.addLog()
        console.log('ID------------',idLogin)
        return res.status(200).json({"Mensaje":"Se hizo la eliminacion en cascada del producto con el nomnbre " + produtoE.Nombre});
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
    addProducto,
    deleteProducto,
    updateProducto
}