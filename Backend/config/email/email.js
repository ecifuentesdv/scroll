const axios = require('axios');
const Config = require('../config');
const cnf = new Config();


const soapRequest = async (mensaje, asunto, correo ) => {

  const url = cnf.hostEmailBanco;
  const soapAction = cnf.soapAction;

  console.log("URL ", url );  
  console.log("soapAction ", soapAction );
  console.log("Origen ", cnf.emailOrigen);

  const xml = `<?xml version="1.0" encoding="utf-8"?>
  <soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
                 xmlns:xsd="http://www.w3.org/2001/XMLSchema"
                 xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
    <soap:Body>
      <Fun_bln_EnviaCorreo xmlns="http://tempuri.org/SendMailAspx/Service1">
        <origen>${cnf.emailOrigen}</origen>
        <destinatarios>${correo}</destinatarios>
        <asunto>${asunto}</asunto>
        <mensaje>
            <![CDATA[${mensaje}]]>
        </mensaje>
        <attachments></attachments>
      </Fun_bln_EnviaCorreo>
    </soap:Body>
  </soap:Envelope>`;

  console.log("Body ", xml);

  try {
    const response = await axios.post(url, xml, {
      headers: {
        'Content-Type': 'text/xml; charset=utf-8',
        'SOAPAction': soapAction,
      },
    });


    console.log('Respuesta XML:\n', response.data);


    return true;
  } catch (error) {
    console.error('Error al enviar correo:', error);
    return false;
  }


};

module.exports = {
    soapRequest
}