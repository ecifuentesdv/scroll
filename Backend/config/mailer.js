
const nodemailer = require('nodemailer');
const Config = require('./config');
const cnf = new Config();

const EnviarAlerta = async( mensaje, asunto, correo )=>{
   
    try {
        let transporter = nodemailer.createTransport( cnf.confEmail );

        await transporter.sendMail({
            from: cnf.confEmail.host, // sender address
            to: correo, // list of receivers
       //     to: 'paezaxel2221@gmail.com', // list of receivers
            subject: asunto, // Subject line
            text: mensaje, // html body
        });

        return true;
    } catch (error) {
        console.log("Error al enviar el correo ", error);
        return false;
    } 
}


module.exports = {
    EnviarAlerta
    
}