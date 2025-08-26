import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Router } from '@angular/router';
import { global } from '../global';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class WebViewService {

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

    //Consumir servicios de moneythor
    requestMoneyThor(parameters:any, token:string, customer:string):Observable<any>{
        const headers = new HttpHeaders().set('Content-Type', 'application/json')
                                         .set('customer', decodeURIComponent(customer))
                                         .set('Authorization', `Bearer ${token}`);
        return this._http.post(`${this.url}/WebView/Services/MoneyThor`, JSON.stringify(parameters),{ headers: headers} )
    }


    //Obtener el listado de todos los productos
    getAll(idProducto:number, token?: string):Observable<any> {
        let headers = new HttpHeaders().set('Content-Type', 'application/json');
        if(token) { headers = headers.set('Authorization', `Bearer ${token}`) }
        return this._http.get(`${this.url}/WebView/${idProducto}`, { headers: headers})
    }

    //Obtener el detalle de la webview
    getDetalleOrquestador(idWebview:number, parametros:any, token:string, cif:string):Observable<any>{
        let headers = new HttpHeaders().set('Content-Type', 'application/json')
                                       .set('Authorization', `Bearer ${token}`) 
                                       .set('customer', cif) 
        return this._http.post(`${this.url}/WebView/Detalles/${idWebview}`,  JSON.stringify( parametros ), { headers: headers});
    }

//Trackiar los enventos
    setTracking(cif:string, token:string, parametros:any):Observable<any>{
        let headers = new HttpHeaders().set('Content-Type', 'application/json')
                                        .set('Authorization', `Bearer ${token}`) 
                                        .set('customer', decodeURIComponent(cif));

        return this._http.post(`${this.url}/WebView/Trackevents`,JSON.stringify(parametros), { headers: headers })

    }

//Obtener el detalle de las webview
    getDetalle(idWebview:number, parametros:any, token:string, cif:string):Observable<any>{
        const headers = new HttpHeaders().set('Content-Type', 'application/json');
        return this._http.post(`${this.url}/WebView/Detalles/${idWebview}`,  JSON.stringify( parametros ), { headers: headers});
    }

    //Eliminar la webview seleccionada
    DeleteWebview (token?: string, idWebview?: number):Observable<any> {
        let headers = new HttpHeaders().set('Content-Type', 'application/json');
        if(token) { headers = headers.set('Authorization', `Bearer ${token}`) }
        return this._http.delete(`${this.url}/WebView/${idWebview}`, { headers })
    }

    //Obtener el listado de todos los servicios de un producto
    getServiceProduct(idProducto:number, token?: string):Observable<any> {
        let headers = new HttpHeaders().set('Content-Type', 'application/json');
        if(token) { headers = headers.set('Authorization', `Bearer ${token}`) }
        return this._http.get(`${this.url}/WebView/Servicios/${idProducto}`, { headers: headers})
    }

    //Crear una webview nueva
    CreateWebView (parametros:any, token?: string):Observable<any> {
        let headers = new HttpHeaders().set('Content-Type', 'application/json');
        if(token) { headers = headers.set('Authorization', `Bearer ${token}`) }
        return this._http.post(`${this.url}/WebView`, JSON.stringify(parametros), { headers })
    }

    //Editar la webview seleccionado
    EditWebView (parametros:any, token?: string, idEditarWebView?: number):Observable<any> {
        let headers = new HttpHeaders().set('Content-Type', 'application/json');
        if(token) { headers = headers.set('Authorization', `Bearer ${token}`) }
        return this._http.put(`${this.url}/WebView/${idEditarWebView}`, JSON.stringify(parametros), { headers })
    }

    //Obtener el detalle de la webview por el Id
    getWebView(idWebView:number, token?: string):Observable<any> {
        let headers = new HttpHeaders().set('Content-Type', 'application/json');
        if(token) { headers = headers.set('Authorization', `Bearer ${token}`) }
        return this._http.get(`${this.url}/WebView/Orquestador/Detalles/${idWebView}`, { headers: headers})
    }
}