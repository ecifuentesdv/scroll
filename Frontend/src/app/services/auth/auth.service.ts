import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Router } from '@angular/router';
import { map, catchError } from 'rxjs/operators';
import { global } from '../global';
import { Observable, BehaviorSubject, of } from 'rxjs';

/**MENSAJE DE ALERTA */
import Swal from 'sweetalert2';

@Injectable({
    providedIn: 'root'
})
export class AuthService {

    private url: string;
    public regexContrase_a: RegExp;
    public estadoSession = new BehaviorSubject('');

    constructor(

        public _http: HttpClient,
        private _router: Router

    ){

        this.url = global.url;
        this.regexContrase_a = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+?¿\'-/])[A-Za-z\d!@#$%^&*()_+?¿\'-/]{8,30}$/;  

    }

    setEstadoSession (info: any) {
        this.estadoSession.next(info);
    }

    getEstadoSession () {
        return this.estadoSession.getValue();
    }

    // Enviar los parametros para el login y poder ingresar al sistema
    Login(parametros:any):Observable<any>{
        const headers = new HttpHeaders().set('Content-Type', 'application/json');
        return this._http.post(`${this.url}/Auth/Login`,  JSON.stringify( parametros ), { headers: headers});
    }

    // Enviar el correo para poder validar si existe en la base de datos y mandar un link para poder cambiar la contraseña
    ValidarCorreo(parametros:any):Observable<any>{
        const headers = new HttpHeaders().set('Content-Type', 'application/json');
        return this._http.post(`${this.url}/Auth/ValidarCorreo`, JSON.stringify(parametros), { headers: headers});
    }

    // Enviar los parametros para poder cambiar la contraseña
    CambiarPassword(parametros:any):Observable<any>{
        const headers = new HttpHeaders().set('Content-Type', 'application/json');
        return this._http.post(`${this.url}/Auth/CambiarContrasenia`, JSON.stringify(parametros), { headers: headers});
    }

    // Validar el token 
    validarToken():Observable<boolean>{
        const token = sessionStorage.getItem('tokenOrquestador') || '';
        const headers = new HttpHeaders().set('auth', token)
        return this._http.post(`${this.url}/Auth/Token`, {}, { headers: headers} ).pipe(
            map( ( res:any) => {
                sessionStorage.setItem("tokenOrquestador", res.token);
                return true;
            }),
            catchError( error => {
                //console.clear();
                sessionStorage.removeItem("tokenOrquestador");
                sessionStorage.removeItem("usuarioOrquestador");
                sessionStorage.removeItem("rolOrquestador");
                //this.setEstadoSession('¡Usuario no autorizado! Por favor, inicie sesión para poder ingresar al sitio web.');
                Swal.fire({
                    title: '¡Usuario no autorizado!',
                    text: 'Por favor, inicie sesión para poder ingresar al sitio web.',
                    icon: 'error',
                    confirmButtonText: 'OK',
                    confirmButtonColor: "#003865"
                });
                return of(false)
            })
        )
    }

    // Cerrar sesión
    outSession(token?: string): Observable<any> {
        let headers = new HttpHeaders().set('Content-Type', 'application/json');
        if (token) { headers = headers.set('Authorization', `Bearer ${token}`); }    
        return this._http.post(`${this.url}/Auth/CerrarSesion`, {}, { headers }); 
    }
    
}

