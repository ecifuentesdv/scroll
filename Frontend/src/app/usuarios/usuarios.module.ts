import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

import { MatTooltipModule } from '@angular/material/tooltip'

/**COMPONENTES */
import { MainComponent } from './main/main.component';
import { CrearEditarUsuarioComponent } from './crear-editar-usuario/crear-editar-usuario.component';

/**ENRUTAMIENTO */
import { UsuariosRoutingModule } from './usuarios-routin.module';


@NgModule({
  declarations: [
    MainComponent,
    CrearEditarUsuarioComponent
  ],
  imports: [
    CommonModule,
    UsuariosRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatTooltipModule
  ]
})
export class UsuariosModule { }
