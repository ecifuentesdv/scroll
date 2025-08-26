import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

import { MatTooltipModule } from '@angular/material/tooltip'

/**COMPONENTES */
import { ProductosComponent } from './productos/productos.component';
import { WebviewsComponent } from './webviews/webviews.component';
import { CrearEditarWebviewComponent } from './crear-editar-webview/crear-editar-webview.component';

/**ENRUTADOR */
import { OrquestadorRoutingModule } from './orquestador-routing.module';
import { LogsComponent } from './logs/logs.component';

@NgModule({
  declarations: [
    ProductosComponent,
    WebviewsComponent,
    CrearEditarWebviewComponent,
    LogsComponent
  ],
  imports: [
    CommonModule,
    OrquestadorRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatTooltipModule
  ]
})
export class OrquestadorModule { }
