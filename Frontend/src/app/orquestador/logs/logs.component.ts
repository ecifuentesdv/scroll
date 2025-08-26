import { Component, OnInit } from '@angular/core';

/**IMPORTAR LOS SERVICIOS */
import { LogsService } from '../../services/orquestador/logs.service'

/**MENSAJE DE ALERTA */
import Swal from 'sweetalert2';

@Component({
  selector: 'app-logs',
  templateUrl: './logs.component.html',
  styleUrl: './logs.component.css'
})
export class LogsComponent implements OnInit {

  public mostrarLoaderPagina:boolean;
  public filtro: boolean;
  public logs: any[];
  public logsFiltrados: any[];
  private token:string;

  constructor(
    private _sLogs: LogsService
  ){
    this.mostrarLoaderPagina = false;
    this.filtro = false;
    this.logs = [];
    this.logsFiltrados = [];
    this.token = sessionStorage?.getItem('tokenOrquestador') || '';
  }

  ngOnInit(): void {
    this.mostrarLoaderPagina = true;
    this._sLogs.getLogs(this.token).subscribe( response => {
      console.log("logs ", response);
      this.mostrarLoaderPagina = false;

      this.logs = response.Logs
    }, error => {
      this.mostrarLoaderPagina = false;

      console.log("Error: ", error);

    })
  }


filtrar(event: any) {
  const valor = event.target.value.toLowerCase();
  if (valor.trim() === '') {
    this.filtro = false;
    this.logsFiltrados = [];
  } else {
    this.filtro = true;
    this.logsFiltrados = this.logs.filter(log =>
      log.Nombre.toLowerCase().includes(valor) ||
      log.Descripcion.toLowerCase().includes(valor) ||
      log.Create.toLowerCase().includes(valor)
    );
  }
}

}
