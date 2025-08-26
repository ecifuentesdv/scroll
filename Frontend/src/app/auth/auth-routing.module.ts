import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

/*COMPONENTES*/
import { LoginComponent } from './login/login.component';
import { ValidarEmailComponent } from './validar-email/validar-email.component';
import { CambiarPassComponent } from './cambiar-pass/cambiar-pass.component';

const routes: Routes = [
    {
        path:"",
        component: LoginComponent,
        children: [{
                path: 'login',
                component: LoginComponent,        
            }
        ]
    },
    {
        path: 'validar-correo',
        component: ValidarEmailComponent
    },
    {
        path: 'cambiar-contrasenia/:token',
        component: CambiarPassComponent
    }
]


@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
  })
  export class AuthRoutingModule { }
  