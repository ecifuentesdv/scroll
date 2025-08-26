import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Router } from '@angular/router';
import { global } from '../global';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class ProductoService {
    
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
    
    //Obtener el listado de todos los productos
    getAll(token?: string):Observable<any> {
        let headers = new HttpHeaders().set('Content-Type', 'application/json');
        if(token) { headers = headers.set('Authorization', `Bearer ${token}`) }
        return this._http.get(`${this.url}/Productos`, { headers: headers})
    }

    //Crear un producto nuevo
    CreateProducto (parametros:any, token?: string):Observable<any> {
        let headers = new HttpHeaders().set('Content-Type', 'application/json');
        if(token) { headers = headers.set('Authorization', `Bearer ${token}`) }
        return this._http.post(`${this.url}/Productos`, JSON.stringify(parametros), { headers })
    }

    //Editar el producto seleccionado
    EditProducto (parametros:any, token?: string, idEditarProducto?: number):Observable<any> {
        let headers = new HttpHeaders().set('Content-Type', 'application/json');
        if(token) { headers = headers.set('Authorization', `Bearer ${token}`) }
        return this._http.put(`${this.url}/Productos/${idEditarProducto}`, JSON.stringify(parametros), { headers })
    }

    //Eliminar el producto seleccionado
    DeleteProducto (token?: string, idEliminarProducto?: string):Observable<any> {
        let headers = new HttpHeaders().set('Content-Type', 'application/json');
        if(token) { headers = headers.set('Authorization', `Bearer ${token}`) }
        return this._http.delete(`${this.url}/Productos/${idEliminarProducto}`, { headers })
    }

    //Obtener la url del producto
    getURL(token: string|null, productId: number):Observable<any> {
        let headers = new HttpHeaders().set('Content-Type', 'application/json')
                                       .set('Authorization', `Bearer ${token}`); 

        return this._http.get(`${this.url}/Webview/Link/${productId}`, { headers: headers });
    }

    //Generar credenciales
    generateCredentials(token: string|null ):Observable<any>{
        let headers = new HttpHeaders().set('Content-Type', 'application/json')
                                       .set('Authorization', `Bearer ${token}`); 
        return this._http.post(`${this.url}/Webview/Generate/Credentials`,JSON.stringify({}), { headers: headers });
        
    }
}