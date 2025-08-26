import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Router } from '@angular/router';
import { global } from '../global';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class LogsService {
    
    private url: string;
    constructor( 

        public _http: HttpClient,

    ){
        this.url = global.url
    }
    


    //Obtener el listado de todos los usuarios
    getLogs(token?: string):Observable<any> {
        let headers = new HttpHeaders().set('Content-Type', 'application/json')
                                       .set('Authorization', `Bearer ${token}`)
        return this._http.get(`${this.url}/Logs`, { headers })
    }


}