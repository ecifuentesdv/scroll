import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Router } from '@angular/router';
import { global } from '../global';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class UserService {
    
    private url: string;
    public regexContrase_a: RegExp;
    public regexStringConEspacio: RegExp;

    constructor( 

        public _http: HttpClient,
        private _router: Router

    ){
        
        this.url = global.url
        this.regexContrase_a = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+?¿\'-/])[A-Za-z\d!@#$%^&*()_+?¿\'-/]{8,30}$/;
        this.regexStringConEspacio = /^[a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\s]+$/;

    }
    


    //Obtener el listado de todos los usuarios
    ObtenerListaUsuarios(token?: string):Observable<any> {
        let headers = new HttpHeaders().set('Content-Type', 'application/json');
        if(token) { headers = headers.set('Authorization', `Bearer ${token}`) }
        return this._http.get(`${this.url}/Usuarios`, { headers })
    }

    //Eliminar el usuario seleccionado
    DeleteUsuario (token?: string, correoEliminarUsuario?: string):Observable<any> {
        let headers = new HttpHeaders().set('Content-Type', 'application/json');
        if(token) { headers = headers.set('Authorization', `Bearer ${token}`) }
        return this._http.delete(`${this.url}/Usuarios/${correoEliminarUsuario}`, { headers })
    }

    //Crear un usuario nuevo
    CreateUsuario (parametros:any, token?: string):Observable<any> {
        let headers = new HttpHeaders().set('Content-Type', 'application/json');
        if(token) { headers = headers.set('Authorization', `Bearer ${token}`) }
        return this._http.post(`${this.url}/Usuarios`, JSON.stringify(parametros), { headers })
    }

    //Editar el usuario seleccionado
    EditUsuario (parametros:any, token?: string, correoEditarUsuario?: string):Observable<any> {
        let headers = new HttpHeaders().set('Content-Type', 'application/json');
        if(token) { headers = headers.set('Authorization', `Bearer ${token}`) }
        return this._http.put(`${this.url}/Usuarios/${correoEditarUsuario}`, JSON.stringify(parametros), { headers })
    }

}