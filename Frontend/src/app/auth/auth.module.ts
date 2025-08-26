import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';


/**COMPONENTES */
import { LoginComponent } from './login/login.component';
import { ValidarEmailComponent } from './validar-email/validar-email.component';
import { CambiarPassComponent } from './cambiar-pass/cambiar-pass.component';

/**ERUTADOR */
import { AuthRoutingModule } from './auth-routing.module';

@NgModule({
  declarations: [
    LoginComponent,
    ValidarEmailComponent,
    CambiarPassComponent
  ],
  imports: [
    CommonModule,
    AuthRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule
  ]
})
export class AuthModule { }


