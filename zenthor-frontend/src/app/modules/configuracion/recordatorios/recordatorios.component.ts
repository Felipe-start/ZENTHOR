import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { RecordatoriosService } from '../../../core/services/recordatorios.service';

@Component({
  selector: 'app-recordatorios',
  templateUrl: './recordatorios.component.html',
  styleUrls: ['./recordatorios.component.css']
})
export class RecordatoriosComponent implements OnInit {
  recordatoriosForm: FormGroup;
  cargando = true;
  email = '';

  constructor(
    private fb: FormBuilder,
    private recordatoriosService: RecordatoriosService,
    private toastr: ToastrService
  ) {
    this.recordatoriosForm = this.fb.group({
      activos: [false]
    });
  }

  ngOnInit(): void {
    this.cargarEstado();
  }

  cargarEstado(): void {
    this.cargando = true;
    this.recordatoriosService.getEstado().subscribe({
      next: (res) => {
        if (res.success) {
          this.recordatoriosForm.patchValue({ activos: res.data.activos });
          this.email = res.data.email;
        }
        this.cargando = false;
      },
      error: () => {
        this.cargando = false;
        this.toastr.error('Error al cargar configuración de recordatorios');
      }
    });
  }

  guardarConfiguracion(): void {
    const activos = this.recordatoriosForm.get('activos')?.value;
    
    this.recordatoriosService.toggleRecordatorios(activos).subscribe({
      next: () => {
        this.toastr.success(
          activos ? '✅ Recordatorios activados' : '🔕 Recordatorios desactivados',
          'Configuración guardada'
        );
      },
      error: () => {
        this.toastr.error('Error al guardar la configuración');
        this.recordatoriosForm.patchValue({ activos: !activos });
      }
    });
  }
}