import { Component, OnInit, ElementRef, ViewChild, AfterViewChecked } from '@angular/core';
import { RagService, MensajeChat } from '../../../core/services/rag.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-rag-chat',
  templateUrl: './rag-chat.component.html',
  styleUrls: ['./rag-chat.component.css']
})
export class RagChatComponent implements OnInit, AfterViewChecked {
  @ViewChild('chatMessages') private chatMessagesContainer!: ElementRef;
  
  mensajes: MensajeChat[] = [];
  preguntaActual = '';
  cargando = false;
  mostrandoFuentes = false;
  fuenteSeleccionada: any = null;

  constructor(
    private ragService: RagService,
    private toastr: ToastrService
  ) {
    // Mensaje de bienvenida
    this.mensajes.push({
      rol: 'asistente',
      contenido: '👋 ¡Hola! Soy ZENTHOR AI, tu asistente académico inteligente.\n\nPuedo ayudarte con:\n📚 Explicar conceptos difíciles\n💡 Resolver dudas de tus documentos\n📝 Generar guías de estudio\n✨ Responder preguntas basadas en tus apuntes\n\n¿En qué puedo ayudarte hoy?'
    });
  }

  ngOnInit(): void {
    this.cargarHistorial();
  }

  ngAfterViewChecked(): void {
    this.scrollToBottom();
  }

  cargarHistorial(): void {
    const historial = localStorage.getItem('zenthor_chat_historial');
    if (historial) {
      const parsed = JSON.parse(historial);
      if (parsed.length > 1) {
        this.mensajes = parsed;
      }
    }
  }

  guardarHistorial(): void {
    localStorage.setItem('zenthor_chat_historial', JSON.stringify(this.mensajes));
  }

  enviarMensaje(): void {
    if (!this.preguntaActual.trim()) return;

    const pregunta = this.preguntaActual.trim();
    this.mensajes.push({ rol: 'usuario', contenido: pregunta });
    this.guardarHistorial();
    this.preguntaActual = '';
    this.cargando = true;

    this.ragService.enviarPregunta(pregunta).subscribe({
      next: (res) => {
        this.mensajes.push({
          rol: 'asistente',
          contenido: res.respuesta,
          fuentes: res.fuentes
        });
        this.cargando = false;
        this.guardarHistorial();
      },
      error: (err) => {
        this.toastr.error('Error al obtener respuesta');
        this.mensajes.push({
          rol: 'asistente',
          contenido: 'Lo siento, hubo un error procesando tu pregunta. Por favor, intenta de nuevo.'
        });
        this.cargando = false;
      }
    });
  }

  mostrarFuentes(fuentes: any[]): void {
    this.fuenteSeleccionada = fuentes;
    this.mostrandoFuentes = true;
  }

  limpiarChat(): void {
    if (confirm('¿Borrar todo el historial del chat?')) {
      this.mensajes = [this.mensajes[0]];
      localStorage.removeItem('zenthor_chat_historial');
      this.toastr.info('Chat limpiado');
    }
  }

  private scrollToBottom(): void {
    try {
      this.chatMessagesContainer.nativeElement.scrollTop = this.chatMessagesContainer.nativeElement.scrollHeight;
    } catch (err) { }
  }
}