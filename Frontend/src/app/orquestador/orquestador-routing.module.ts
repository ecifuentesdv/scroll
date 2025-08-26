import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

/*COMPONENTES*/
import { CrearEditarWebviewComponent } from './crear-editar-webview/crear-editar-webview.component';
import { ProductosComponent } from './productos/productos.component';
import { WebviewsComponent } from './webviews/webviews.component';
import { LogsComponent  } from './logs/logs.component';

/* Guardian */
import { GuardGuard } from '../guards/guards.guard'

const routes: Routes = [
    {
        path: "",
        component: ProductosComponent,
        canActivate: [GuardGuard],
        children: [{
                path: 'productos',
                component: ProductosComponent,        
            }
        ]
    },
    {
        path: 'webviews/:idProducto',
        canActivate: [GuardGuard],
        component: WebviewsComponent,
    },
    {
        path: 'logs',
        canActivate: [GuardGuard],
        component: LogsComponent,
    },
    {
        path: 'crear_editar/:idProducto',
        canActivate: [GuardGuard],
        component: CrearEditarWebviewComponent
    },
    {
        path: 'crear_editar/:idProducto/:nombreWebView',
        canActivate: [GuardGuard],
        component: CrearEditarWebviewComponent
    }
]


@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
  })
  export class OrquestadorRoutingModule { }
  