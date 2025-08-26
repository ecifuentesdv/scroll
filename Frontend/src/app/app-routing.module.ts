import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

//Componentes
import { OrquestadorLayoutComponent } from './layouts/orquestador-layout/orquestador-layout.component';
import { UsuariosLayoutComponent } from './layouts/usuarios-layout/usuarios-layout.component';
import { AuthLayoutComponent } from './layouts/auth-layout/auth-layout.component';
import { ErrorComponent } from './components/error/error.component';
import { WebviewComponent } from './components/webview/webview.component'


const routes: Routes = [
  {
    path: 'orquestador',
    component: OrquestadorLayoutComponent,
    loadChildren: () => import('./orquestador/orquestador.module').then(o => o.OrquestadorModule)
  },
  {
    path: 'usuarios',
    component: UsuariosLayoutComponent,
    loadChildren: () => import('./usuarios/usuarios.module').then( u => u.UsuariosModule)
  },
  {
    path: 'webview/:customer/:idWebview/:token',
    component: WebviewComponent
  },
  {
    path: '', component: AuthLayoutComponent,
    children: [{
      path: '',
      redirectTo: '/login',
      pathMatch: 'full'
    }]
  },
  {
    path: 'login',
    component: AuthLayoutComponent,
    loadChildren: () => import('./auth/auth.module').then( a => a.AuthModule )
  },
  {
    path: '**',
    component: ErrorComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
