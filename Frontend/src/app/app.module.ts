import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { WebviewComponent } from './components/webview/webview.component';
import { OrquestadorLayoutComponent } from './layouts/orquestador-layout/orquestador-layout.component';
import { AuthLayoutComponent } from './layouts/auth-layout/auth-layout.component';
import { UsuariosLayoutComponent } from './layouts/usuarios-layout/usuarios-layout.component';
import { ErrorComponent } from './components/error/error.component';

import { MatTooltipModule } from '@angular/material/tooltip';

/*FORMULARIOS REACTIVOS */
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';

/*REDIRECCIONES*/
import { HttpClientModule } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { HeaderComponent } from './components/header/header.component';

@NgModule({
  declarations: [
    AppComponent,
    WebviewComponent,
    OrquestadorLayoutComponent,
    AuthLayoutComponent,
    UsuariosLayoutComponent,
    ErrorComponent,
    HeaderComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    MatTooltipModule
  ],
  providers: [
    provideAnimationsAsync()
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
