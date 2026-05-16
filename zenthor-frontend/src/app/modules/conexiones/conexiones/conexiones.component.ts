import { Component, OnInit } from '@angular/core';
import { ConexionesService, ConexionEstado } from '../../../core/services/conexiones.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-conexiones',
  templateUrl: './conexiones.component.html',
  styleUrls: ['./conexiones.component.css']
})
export class ConexionesComponent implements OnInit {
  conexiones: ConexionEstado = {
    google_classroom: { activo: false },
    notion: { activo: false },
    teams: { activo: false },
    moodle: { activo: false }
  };
  cargando = true;
  sincronizando = false;
  mostrarModalMoodle = false;
  moodleUrl = '';
  moodleToken = '';

  constructor(
    private conexionesService: ConexionesService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.cargarConexiones();
  }

  cargarConexiones(): void {
    this.cargando = true;
    this.conexionesService.obtenerConexiones().subscribe({
      next: (res) => {
        this.conexiones = res.data;
        this.cargando = false;
      },
      error: (err) => {
        this.toastr.error('Error al cargar conexiones');
        this.cargando = false;
      }
    });
  }

  conectarGoogle(): void {
    this.conexionesService.conectarGoogle().subscribe({
      next: (res) => {
        // Abrir ventana de OAuth
        window.open(res.url, '_blank', 'width=500,height=600');
        this.toastr.info('Autoriza ZENTHOR en la ventana que se abrió');
      },
      error: () => {
        this.toastr.error('Error al iniciar conexión con Google');
      }
    });
  }

  sincronizarGoogle(): void {
    this.sincronizando = true;
    this.conexionesService.sincronizarGoogle().subscribe({
      next: (res) => {
        this.toastr.success(res.mensaje || 'Sincronización completada');
        this.sincronizando = false;
        this.cargarConexiones();
      },
      error: () => {
        this.toastr.error('Error al sincronizar');
        this.sincronizando = false;
      }
    });
  }

  configurarMoodle(): void {
    if (!this.moodleUrl || !this.moodleToken) {
      this.toastr.warning('Completa todos los campos');
      return;
    }

    this.conexionesService.configurarMoodle(this.moodleUrl, this.moodleToken).subscribe({
      next: () => {
        this.toastr.success('Moodle configurado correctamente');
        this.mostrarModalMoodle = false;
        this.cargarConexiones();
      },
      error: () => {
        this.toastr.error('Error al configurar Moodle');
      }
    });
  }

  desconectar(tipo: string, nombre: string): void {
    if (confirm(`¿Desconectar ${nombre}? Los datos sincronizados permanecerán.`)) {
      this.conexionesService.desconectar(tipo).subscribe({
        next: () => {
          this.toastr.success(`${nombre} desconectado`);
          this.cargarConexiones();
        },
        error: () => {
          this.toastr.error('Error al desconectar');
        }
      });
    }
  }
}