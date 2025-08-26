import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

/*COMPONENTES*/
import { MainComponent } from './main/main.component';
import { CrearEditarUsuarioComponent } from './crear-editar-usuario/crear-editar-usuario.component';

/* Guardian */
import { GuardGuard } from '../guards/guards.guard'

const routes: Routes = [
    {
        path:"",
        component: MainComponent,
        canActivate: [GuardGuard],
        children: [{
                path: 'usuarios',
                component: MainComponent,        
            }
        ]
    },
    {
        path: 'crear-editar',
        canActivate: [GuardGuard],
        component: CrearEditarUsuarioComponent
    },
    {
        path: 'crear-editar/:idUsuario',
        canActivate: [GuardGuard],
        component: CrearEditarUsuarioComponent
    }
]


@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
  })
  export class UsuariosRoutingModule { }
  