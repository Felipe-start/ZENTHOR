import { Component, OnInit, ElementRef, ViewChild, AfterViewChecked } from '@angular/core';
import { RagService, MensajeChat } from '../../../core/services/rag.service';
import { ToastrService } from 'ngx-toastr';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

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
  fuentesSeleccionadas: any[] = [];
  conversacionId: string | null = null;

  constructor(
    private ragService: RagService,
    private toastr: ToastrService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.cargarHistorial();
    this.mensajes.push({
      rol: 'asistente',
      contenido: '👋 ¡Hola! Soy ZENTHOR AI, tu asistente académico inteligente.\n\n📚 Puedo ayudarte a entender cualquier concepto basado en tus apuntes y documentos.\n💡 Solo pregúntame sobre cualquier tema y usaré tu material de estudio para responderte.\n📝 También puedo ayudarte a generar guías de estudio personalizadas.\n\n¿En qué puedo ayudarte hoy?',
      timestamp: new Date()
    });
  }

  ngAfterViewChecked(): void {
    this.scrollToBottom();
  }

  cargarHistorial(): void {
    const historial = localStorage.getItem('zenthor_chat_historial');
    if (historial) {
      try {
        const parsed = JSON.parse(historial);
        if (parsed.length > 0) {
          this.mensajes = parsed;
          this.conversacionId = localStorage.getItem('zenthor_conversacion_id');
        }
      } catch (e) {}
    }
  }

  guardarHistorial(): void {
    localStorage.setItem('zenthor_chat_historial', JSON.stringify(this.mensajes));
    if (this.conversacionId) {
      localStorage.setItem('zenthor_conversacion_id', this.conversacionId);
    }
  }

  enviarMensaje(): void {
    if (!this.preguntaActual.trim()) return;

    const pregunta = this.preguntaActual.trim();
    this.mensajes.push({ 
      rol: 'usuario', 
      contenido: pregunta,
      timestamp: new Date()
    });
    this.guardarHistorial();
    this.preguntaActual = '';
    this.cargando = true;

    this.ragService.enviarPregunta(pregunta, this.conversacionId || undefined).subscribe({
      next: (res) => {
        this.mensajes.push({
          rol: 'asistente',
          contenido: res.respuesta,
          fuentes: res.fuentes,
          timestamp: new Date()
        });
        if (res.conversacion_id && !this.conversacionId) {
          this.conversacionId = res.conversacion_id;
        }
        this.cargando = false;
        this.guardarHistorial();
      },
      error: (err) => {
        console.error('Error:', err);
        this.toastr.error('Error al obtener respuesta del asistente');
        this.mensajes.push({
          rol: 'asistente',
          contenido: 'Lo siento, hubo un error procesando tu pregunta. Por favor, intenta de nuevo.',
          timestamp: new Date()
        });
        this.cargando = false;
      }
    });
  }

  mostrarFuentes(fuentes: any[]): void {
    this.fuentesSeleccionadas = fuentes;
    this.mostrandoFuentes = true;
  }

  limpiarChat(): void {
    if (confirm('¿Borrar todo el historial del chat?')) {
      this.mensajes = [this.mensajes[0]];
      this.conversacionId = null;
      localStorage.removeItem('zenthor_chat_historial');
      localStorage.removeItem('zenthor_conversacion_id');
      this.toastr.info('Chat limpiado correctamente');
    }
  }

  formatearTexto(texto: string): SafeHtml {
    let html = texto.replace(/\n/g, '<br>');
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
    html = html.replace(/`(.*?)`/g, '<code>$1</code>');
    html = html.replace(/📚/g, '<span class="emoji">📚</span>');
    html = html.replace(/💡/g, '<span class="emoji">💡</span>');
    html = html.replace(/✨/g, '<span class="emoji">✨</span>');
    html = html.replace(/⚠️/g, '<span class="emoji">⚠️</span>');
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

  private scrollToBottom(): void {
    try {
      this.chatMessagesContainer.nativeElement.scrollTop = this.chatMessagesContainer.nativeElement.scrollHeight;
    } catch (err) {}
  }
}