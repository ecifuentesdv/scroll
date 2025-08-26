const { response, request } = require('express');
const bcryptjs = require('bcryptjs');


const Config = require('../config/config');
const cnf = new Config();


const { getServicesDetalle, getApisMoneyThor } = require('../middlewares')



//Agregar producto en MoneyTHor
const addMoneyThor = async( req = request, res = response ) => {
 
    const { CIF, Producto, DataMoneythor } = req.body;
    const cliente = cnf.customerConfig;
    const { CodigoReferencia } =  DataMoneythor;

    console.log("Producto", Producto);

    try {
        
        
        const dataServicio = await getServicesDetalle( cliente, { 
            "name": cnf.servicioName,
            "format": "json",
            "parameters": {}
        });

        console.log("informacion del servicio ", dataServicio);

        if( dataServicio?.Maqueta?.header?.success ){

            const dataProductos = dataServicio?.Maqueta?.payload?.parametros?.PRODUCTOS || []; 
            
            const producto = dataProductos.filter((p) => p?.PRODUCTO?.toLowerCase() == Producto?.toLowerCase() );
            console.log("PRODUCTO ", producto);
            if( producto.length ){
                

                const programaReferido = producto[0]?.PROGRAMA_REFERIDO || '';
                const programaReferente = producto[0]?.PROGRAMA_REFERENTE || '';
                const dataProducto = ( producto[0].TIPO == 'Cliente' ) ? formatDataCliente(CIF, DataMoneythor) : formatDataProducto(CIF, DataMoneythor);
                


                //Agregar el producto a moneythor
                const addMoneyThor = await getApisMoneyThor('POST', dataProducto, 'syncbackendtransactions', '');
                console.log("Agregar a moneythor ", addMoneyThor);


                if( addMoneyThor?.header?.success ){
                    
                    //Validar que el cliente no este registrado en el programa anteriormente
                    const programas = await  getApisMoneyThor('POST', {}, 'getprogrammes', CIF);
                    console.log("programas ", programas);

                    if( programas?.header?.success ){
                        const programasCustomer = programas?.payload || [];
                        const exist = programasCustomer.filter((p) => p?.code?.toLowerCase() == programaReferido?.toLowerCase());
                        console.log("ya esta regisrado ", exist );
                        if( !exist.length ){
                            
                            console.log("Programs ", programasCustomer);
                            
                            //Registrar al programa
                            const dataPrograma = {
                                "code": programaReferido,
                                "instance": `week${getNumeroSemana()}`,
                                "parameters": []
                            }
                            
                            console.log("referido ", dataPrograma);
                            const addPrograma = await getApisMoneyThor('POST', dataPrograma , 'registerprogramme', CIF);
                            console.log("registrado ", addPrograma);

                            if( addPrograma?.header?.success ){

                                //Obtener informacion del referente
                                const dataReferente = await getApisMoneyThor('POST', { "referral_code": CodigoReferencia }, 'searchcustomer', '');
                                console.log("codgio ", CodigoReferencia);
                                if( dataReferente?.header?.success ){
                                    const cifReferente = dataReferente?.payload?.name;

                                    //Inscribir al programa para agregar referido a referente
                                    const dataProgramaReferente = {
                                        "code": programaReferente,
                                        "instance": CIF,
                                        "parameters": [
                                            { "name": "referee", "value": CIF },
                                            { "name": "account", "value": ( DataMoneythor.Cuenta ) ? DataMoneythor.Cuenta : CIF },
                                            { "name": "product", "value": Producto },
                                            { "name": "cantidad", "value": producto[0].CANTIDAD_RECOMPENSA },
                                            { "name": "recompensa", "value": producto[0].TIPO_RECOMPENSA }
                                        ]
                                    }

                                    console.log("REFERENTEs ", dataProgramaReferente );
                                    const addPrograma = await getApisMoneyThor('POST', dataProgramaReferente , 'registerprogramme', cifReferente);
                                    console.log("ADDpROGRAMA ", addPrograma );


                                }
                                console.log("REFERENTE ", dataReferente );


                                //Agregar la recompensa


                                return res.status(200).json({ "Mensaje": "Se registro con exito al cliente" })
                            }
                            
                            
                            console.log("PROGramas registrados ", addPrograma);   
                        }else {
                            return res.status(409).json({"Mensaje": `El cliente con el CIF ${CIF}, ya se a registrado al programa con el codigo ${programaReferido}` })   
                        }
                    }
                }
                
                
            }else {
                return res.status(404).json({"Mensaje": `No se encontro un producto con el codigo ${Producto}`});
            }
            
        }
        
    } catch (error) {
        console.log("Error al intentar inscribir o agregar la informacion a moneythor ", error);
    }

    return res.status(500).json({"Mensaje": "Ocurrio un error al intentar agregar el usuario a MoneyThor"})
    
}



//Agregar moneythor (ALERTA)
const addMoneyThorAlerta = async( req = request, res = response ) => {
    const { CIF, Producto, DataMoneythor } = req.body;
    const cliente = cnf.customerConfig;

    console.log("Producto", Producto);

    try {
        
        
        const dataServicio = await getServicesDetalle( cliente, { 
            "name": cnf.servicioName,
            "format": "json",
            "parameters": {}
        });

        console.log("informacion del servicio ", dataServicio);

        if( dataServicio?.Maqueta?.header?.success ){

            const dataProductos = dataServicio?.Maqueta?.payload?.parametros?.PRODUCTOS || []; 
            
            const producto = dataProductos.filter((p) => p?.PRODUCTO?.toLowerCase() == Producto?.toLowerCase() );
            if( producto.length ){
                
                console.log("PRODUCTO ", producto);
                const dataProducto = ( producto[0].TIPO == 'Cliente' ) ? formatDataCliente(CIF, DataMoneythor) : formatDataProducto(CIF, DataMoneythor);
                

                console.log("Data producto ", JSON.stringify(dataProducto));

                //Agregar el producto a moneythor
                const addMoneyThor = await getApisMoneyThor('POST', dataProducto, 'syncbackendtransactions', '');
                console.log("Agregar a moneythor ", addMoneyThor);


                if( addMoneyThor?.header?.success ){
                    return res.status(200).json({ "Mensaje": "Se registro con exito al cliente" })
                }
                
                
            }else {
                return res.status(404).json({"Mensaje": `No se encontro un producto con el codigo ${Producto}`});
            }
            
        }
        
    } catch (error) {
        console.log("Error al intentar inscribir o agregar la informacion a moneythor ", error);
    }

    return res.status(500).json({"Mensaje": "Ocurrio un error al intentar agregar el usuario a MoneyThor"})
}


//Dar formato a la informacion del cliente
const formatDataCliente = ( cif, dataCliente ) => {
    return     {
        "source": {
            "name": "BI"
        },
        "customer": {
            "name": cif,
            "custom_fields": CFCliente(dataCliente)
        }
    }

}

//Dar formato a los custom fields del cliente
const CFCliente = ( data ) => {
    const formatData = [];
    for (const key in data) {
        if (Object.prototype.hasOwnProperty.call(data, key)) {
            if( key != 'FechaNacimiento' && key != 'Nombre' ){
                const json = {};
                json.name = key.toLowerCase();
                json.value = data[key];
                formatData.push(json)
            }
        }
    }
    return formatData
}





const formatDataProducto = (cif, dataProducto) => {
    return    {
        "source": {
            "name": "BI"
        },
        "customer": {
            "name": cif
        },
        "account": CFProducto(dataProducto)
    }
}


const CFProducto = (data) => {
    return {
        number: ( data.Cuenta ) ? `${data.Cuenta}-${ data.Moneda.toUpperCase() == "DOLARES" ? "USD" : "GTQ"}` : '',
        currency: 'GTQ',
        type: ( data.TipoCuenta ) ? data.TipoCuenta : '',
        balance: parseFloat(data.Situacion),
        custom_fields:  dataCFProducto(data)
    }
}


const dataCFProducto = (data) => {
    const dataDFormat = [];
    for (const key in data) {
        if (Object.prototype.hasOwnProperty.call(data, key)) {
            if( key != 'Cuenta' && key != 'TipoCuenta' && key != 'Situacion'){
                const json = {};
                json.name = key.toLowerCase();
                json.value = data[key];
                dataDFormat.push(json)
            }
        }
    }

    dataDFormat.push({"name": "acc_type", "value": data.Moneda.toUpperCase() == "DOLARES" ? "USD" : "GTQ" })


    return dataDFormat;
}

function getNumeroSemana() {
  const date = new Date()
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
  const pastDaysOfYear = Math.floor((date - firstDayOfYear) / 86400000);
  return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
}


module.exports = {
    addMoneyThor,
    addMoneyThorAlerta
}