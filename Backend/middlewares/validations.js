const { response, request } = require('express');
const { validationResult } = require('express-validator');

const Config = require('../config/config');
const cnf = new Config();

//Validar los posibles erroes en las validaciones
const validate = ( req = request, res = response, next)=>{
    const errors = validationResult( req );
    errors.Codigo = 400;
    if( !errors.isEmpty() ) return res.status(400).json(errors);
    next();
}

//Validar con regex los campos de tipo string
const validText = async(Value)=> {
    console.log("VALUE ", Value);
    if(!Value)return true;
    const isValid = Value.replace( /[^A-Za-zäÄëËïÏöÖüÜáéíóúáéíóúÁÉÍÓÚÂÊÎÔÛâêîôûàèìòùÀÈÌÒÙñÑ ]/gi, "");
    if( isValid != Value ) throw new Error(`La referencia: '${Value}', contiene carácteres no permitidos`);
}

//Validar con regex los campos de tipo string
const validAN = async(Value)=> {
    if( !Value ) return true;
    const isValid = Value.replace( /[^A-Za-z0-9+äÄëËïÏöÖüÜáéíóúáéíóúÁÉÍÓÚÂÊÎÔÛâêîôûàèìòùÀÈÌÒÙñÑ{}\.,\[\];:@_/\-()\$ ]/gi, "");
    if( isValid != Value ) throw new Error(`La referencia: '${Value}', contiene caracteres no permitidos`); 
}

//Validar si es un numero
const validNumber = async(Value) => {
    if( !Value ) return true;
    const isValid = Value.toString().replace( /[^0-9.]/gi, "");
    if( isValid != Value ) throw new Error(`La referencia: '${Value}', contiene caracteres no permitidos`); 
}

//Validar quie el rol sea valido
const validRol = async(Value) => {
    const existRol = cnf.rolesValidos.find( e => e == Value.toUpperCase() );
    if( !existRol ) throw new Error(`El rol ${Value} no es valido.`);
}





module.exports = {
    validate,
    validText,
    validAN,
    validRol,
    validNumber
}