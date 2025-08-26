const nodemailer = require('nodemailer');

const Config = require('../config/config');
const cnf = new Config();

const TemplatesEmail = require('../static/templateEmail');
const TE = new TemplatesEmail();

module.exports = class Notification {
    async EnviarAlerta ( mensaje, email, asunto ){
   
        try {
            console.log("credenciales ", cnf.confEmail);
            let transporter = nodemailer.createTransport( cnf.confEmail );
    
            await transporter.sendMail({
                from: cnf.confEmail.auth.user, // sender address
                to: email, // list of receivers
                subject: asunto, // Subject line
                html: mensaje, // html body
            });
    
            return true;
        } catch (error) {
            console.log("Error al enviar el correo ", error);
            return false;
        } 
    }
    
    async sendEmail(tipo, email, asunto ){
        const template = await this.getTemplate(tipo.toUpperCase());
        return this.EnviarAlerta( template, email, asunto );
    }
    
    async getTemplate(tipo){
        let template = '';
    
        switch(tipo){
            case 'NUEVO-USUARIO':
                template = TE.welcomeUser();
            break;
        }
        return template;
    }
}



