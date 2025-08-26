const Config = require('../config');
const config = new Config();






  
    const notificationCredentialsCreated = (Nombre, Apellido, Usuario, Password)=>{

        return `<!DOCTYPE html>
        <html lang="en">

        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <meta http-equiv="X-UA-Compatible" content="ie=edge">
            <title></title>

        </head>
        <body>
            <div id="contenedor" style="width: 100%; background-color: #eaeaea; padding: 15px;">
                <div class="arial letrawhite encabezado " style="font-family: 'Segoe UI', Arial, sans-serif; text-align: justify; max-width: 500px; display: block; margin: auto; padding: 20px; background-color: #fff;">
                    <p>Hola ${Nombre} ${Apellido}</p>

                    <p>Mediante la presente, le informamos que se ha procedido a la generación de un nuevo usuario y contraseña con el fin de facilitar el acceso y consumo de los servicios proporcionados por Moneythor.</p>

                    <div style="background-color: #ffe6b0; padding: 15px; font-weight: bold; color: #003865"">Las credenciales generadas son las siguientes: <br>
                    <br>
                    <table style="width: 100%; max-width: 100%; table-layout: fixed;  border-collapse: collapse">
                        <tbody>
                            <tr>
                                <td style="  word-break: break-all; overflow-wrap: anywhere;  padding: 8px; border: 1px solid #ffe6b0">
                                    <b style="font-weight: bold; color: #003865">USUARIO: </b>
                                </td>
                                <td style="word-break: break-all; overflow-wrap: anywhere;  padding: 8px; border: 1px solid #ffe6b0">
                                    <b style="font-weight: bold; color: #003865">${Usuario}</b>
                                </td>
                            </tr>
                            <tr>
                                <td style="word-break: break-all; overflow-wrap: anywhere;  padding: 8px; border: 1px solid #ffe6b0">
                                    <b style="font-weight: bold; color: #003865">CONTRASEÑA: </b>
                                </td>
                                <td style="word-break: break-all; overflow-wrap: anywhere;  padding: 8px; border: 1px solid #ffe6b0">
                                    <b style="font-weight: bold; color: #003865">${Password}</b>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                    <br>
                </div>
                <br>
                    Le informamos que el proceso de generación de nuevas credenciales <b>no inhabilita las anteriores</b>, por lo que ambas (las antiguas y las nuevas) permanecerán activas en el sistema. A fin de mantener un control adecuado y evitar posibles riesgos operativos o de seguridad se recomienda evitar la creación excesiva de credenciales.
                    <br><br>
                </div>
            </div>
        </body></html>
        `
    }



    const notificationForgotPassword = (token, Nombre, Apellido)=>{
        return `<!DOCTYPE html>
        <html lang="en">

        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <meta http-equiv="X-UA-Compatible" content="ie=edge">
            <title></title>

        </head>
        <body>
            <div id="contenedor" style="width: 100%; background-color: #eaeaea; padding: 15px;">
                <div class="arial letrawhite encabezado " style="font-family: 'Segoe UI', Arial, sans-serif; text-align: justify; max-width: 500px; display: block; margin: auto; padding: 10px; background-color: #fff;">
                    <p>Hola ${Nombre} ${Apellido}</p>
                    
                    <p>Hemos recibido una solicitud para cambiar la contraseña de tu cuenta en el sitio Orquestador MoneyThor. Si no has sido tú quien ha realizado esta solicitud, por favor ignora este correo o contacta con nuestro equipo de soporte.</p>
                    
                    <p style="background-color: #ffe6b0; padding: 5px;">Para completar el proceso de cambio de contraseña, haz clic en el siguiente enlace:
                    <br>
                    <a href="${config.hostEmail}/login/cambiar-contrasenia/${token}" style="font-weight: bold; color: #003865">Ir a cambiar contraseña</a>
                    </p>
                    
                    Este enlace es válido por 5 minutos. Si no lo utilizas en ese período, tendrás que solicitar otro enlace de cambio de contraseña.
                    <br><br>
                </div>
            </div>
        </body></html>
        `
    }

    const notificationForggotPasswordTextPlain = ( token, Nombre, Apellido, hostEmail ) => {
        return `
            Hola ${Nombre} ${Apellido},

            Hemos recibido una solicitud para cambiar la contraseña de tu cuenta en el sitio Orquestador MoneyThor. Si no has sido tú quien ha realizado esta solicitud, por favor ignora este correo o contacta con nuestro equipo de soporte.
            Para completar el proceso de cambio de contraseña, haz clic en el siguiente enlace:

            ${hostEmail}/login/cambiar-contrasenia/${token}

            Este enlace es válido por 5 minutos. Si no lo utilizas en ese período, tendrás que solicitar otro enlace de cambio de contraseña.
        `;
    }

module.exports = {
    notificationForgotPassword,
    notificationCredentialsCreated,
    notificationForggotPasswordTextPlain
};