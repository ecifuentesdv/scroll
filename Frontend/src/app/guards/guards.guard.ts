import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree,Route, UrlSegment } from '@angular/router';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuthService } from '../services/auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class GuardGuard implements CanActivate {

  constructor (private authservise: AuthService,   
    private router: Router){}

    canLoad(route: Route, segments: UrlSegment[]): boolean | UrlTree | Observable<boolean | UrlTree> | Promise<boolean | UrlTree> {
      // throw new Error('Method not implemented.');
      return this.authservise.validarToken()
        .pipe(
          tap( isAuthenticated=> {
            if(!isAuthenticated){
              this.router.navigateByUrl('/login')
            }
          })
        )
    }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot) {

    //console.log('Entro al authguard.');
    
    return this.authservise.validarToken()
      .pipe(
        tap( isAuthenticated=> {
          if(!isAuthenticated){  
            this.router.navigateByUrl('/login')
          }
        })
      )
  }
  
}