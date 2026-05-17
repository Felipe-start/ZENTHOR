import { Component, OnInit, ElementRef, ViewChild, AfterViewChecked, OnDestroy } from '@angular/core';
import { RagService, MensajeChat, DocumentoVector } from '../../../core/services/rag.service';
import { ToastrService } from 'ngx-toastr';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';

interface Suggestion {
  text: string;
  icon: string;
  category: string;
}

interface ThinkingStep {
  message: string;
  icon: string;
  duration: number;
}

@Component({
  selector: 'app-rag-hub',
  templateUrl: './rag-hub.component.html',
  styleUrls: ['./rag-hub.component.css']
})
export class RagHubComponent implements OnInit, AfterViewChecked, OnDestroy {
  @ViewChild('chatMessages') private chatMessagesContainer!: ElementRef;
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  
  // Chat state
  mensajes: MensajeChat[] = [];
  preguntaActual = '';
  cargando = false;
  mostrandoFuentes = false;
  fuentesSeleccionadas: any[] = [];
  conversacionId: string | null = null;
  isThinking = false;
  currentThinkingStep = 0;
  thinkingText = '';
  
  // Documentos state
  documentos: DocumentoVector[] = [];
  cargandoDocs = false;
  subiendo = false;
  archivoSeleccionado: File | null = null;
  uploadForm: FormGroup;
  
  // UI State
  modoActivo: 'chat' | 'documentos' = 'chat';
  mostrarSidebar = true;
  isMobile = false;
  
  // Sugerencias inteligentes
  sugerencias: Suggestion[] = [
    { text: 'Explícame qué es el machine learning', icon: '🤖', category: 'IA' },
    { text: 'Ayúdame a entender las redes neuronales', icon: '🧠', category: 'IA' },
    { text: '¿Cómo funciona el algoritmo de regresión lineal?', icon: '📊', category: 'Matemáticas' },
    { text: 'Resume mis apuntes sobre programación', icon: '📝', category: 'Estudio' },
    { text: 'Genérame una guía de estudio', icon: '📚', category: 'Estudio' },
    { text: '¿Qué es RAG y cómo funciona?', icon: '🔍', category: 'Tecnología' }
  ];
  
  // Steps de "pensamiento"
  thinkingSteps: ThinkingStep[] = [
    { message: '🧠 Analizando tu pregunta...', icon: '🔍', duration: 800 },
    { message: '📚 Buscando en tus documentos...', icon: '📖', duration: 600 },
    { message: '⚡ Procesando información con IA...', icon: '⚡', duration: 700 },
    { message: '✨ Generando respuesta personalizada...', icon: '✨', duration: 500 }
  ];
  
  private typingInterval: any;
  private stepInterval: any;

  constructor(
    private ragService: RagService,
    private toastr: ToastrService,
    private sanitizer: DomSanitizer,
    private fb: FormBuilder
  ) {
    this.uploadForm = this.fb.group({
      titulo: [''],
      fuente: ['subida_manual']
    });
  }

  ngOnInit(): void {
    this.checkMobile();
    window.addEventListener('resize', () => this.checkMobile());
    this.cargarHistorial();
    this.cargarDocumentos();
    this.mensajes.push({
      rol: 'asistente',
      contenido: this.getWelcomeMessage(),
      timestamp: new Date()
    });
  }

  getWelcomeMessage(): string {
    const hour = new Date().getHours();
    let greeting = '👋 ¡Hola!';
    if (hour < 12) greeting = '🌅 ¡Buenos días!';
    else if (hour < 18) greeting = '☀️ ¡Buenas tardes!';
    else greeting = '🌙 ¡Buenas noches!';
    
    return `${greeting} Soy **ZENTHOR AI**, tu asistente académico inteligente.\n\n` +
           `📚 Puedo ayudarte a entender cualquier concepto basado en tus **${this.documentos.length} documentos** subidos.\n` +
           `💡 Pregúntame sobre cualquier tema y usaré tu material de estudio para responderte.\n` +
           `📝 También puedo ayudarte a **generar guías de estudio personalizadas**.\n\n` +
           `¿En qué puedo ayudarte hoy? ✨`;
  }

  checkMobile(): void {
    this.isMobile = window.innerWidth <= 768;
    if (!this.isMobile) {
      this.mostrarSidebar = true;
    }
  }

  ngAfterViewChecked(): void {
    this.scrollToBottom();
  }

  ngOnDestroy(): void {
    if (this.typingInterval) clearInterval(this.typingInterval);
    if (this.stepInterval) clearInterval(this.stepInterval);
  }

  cargarHistorial(): void {
    const historial = localStorage.getItem('zenthor_chat_historial');
    if (historial) {
      try {
        const parsed = JSON.parse(historial);
        if (parsed.length > 1) {
          this.mensajes = parsed;
          this.conversacionId = localStorage.getItem('zenthor_conversacion_id');
        }
      } catch (e) {}
    }
  }

  guardarHistorial(): void {
    localStorage.setItem('zenthor_chat_historial', JSON.stringify(this.mensajes.slice(-100)));
    if (this.conversacionId) {
      localStorage.setItem('zenthor_conversacion_id', this.conversacionId);
    }
  }

  cargarDocumentos(): void {
    this.cargandoDocs = true;
    this.ragService.obtenerDocumentos().subscribe({
      next: (docs) => {
        this.documentos = docs;
        this.cargandoDocs = false;
      },
      error: () => {
        this.toastr.error('Error al cargar documentos');
        this.cargandoDocs = false;
      }
    });
  }

  async startThinkingAnimation(): Promise<void> {
    this.isThinking = true;
    this.currentThinkingStep = 0;
    
    for (let i = 0; i < this.thinkingSteps.length; i++) {
      this.currentThinkingStep = i;
      this.thinkingText = this.thinkingSteps[i].message;
      await this.delay(this.thinkingSteps[i].duration);
    }
  }

  stopThinkingAnimation(): void {
    this.isThinking = false;
    this.currentThinkingStep = 0;
  }

  delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async enviarMensaje(): Promise<void> {
    if (!this.preguntaActual.trim()) return;

    const pregunta = this.preguntaActual.trim();
    this.mensajes.push({ 
      rol: 'usuario', 
      contenido: pregunta,
      timestamp: new Date()
    });
    this.guardarHistorial();
    this.preguntaActual = '';
    
    await this.startThinkingAnimation();
    this.cargando = true;

    this.ragService.enviarPregunta(pregunta, this.conversacionId || undefined).subscribe({
      next: (res) => {
        this.stopThinkingAnimation();
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
        this.stopThinkingAnimation();
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

  usarSugerencia(sugerencia: Suggestion): void {
    this.preguntaActual = sugerencia.text;
    this.enviarMensaje();
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

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain', 'application/vnd.openxmlformats-officedocument.presentationml.presentation', 'image/jpeg', 'image/png'];
      if (!allowedTypes.includes(file.type)) {
        this.toastr.error('Solo se permiten PDF, DOCX, PPTX, TXT, JPG, PNG');
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        this.toastr.error('El archivo no puede superar los 10MB');
        return;
      }
      this.archivoSeleccionado = file;
      this.uploadForm.get('titulo')?.setValue(file.name.replace(/\.[^/.]+$/, ''));
    }
  }

  subirDocumento(): void {
    if (!this.archivoSeleccionado) {
      this.toastr.warning('Selecciona un archivo primero');
      return;
    }

    this.subiendo = true;
    const titulo = this.uploadForm.get('titulo')?.value || this.archivoSeleccionado.name;
    const fuente = this.uploadForm.get('fuente')?.value || 'subida_manual';
    
    this.ragService.subirDocumento(this.archivoSeleccionado, titulo, fuente).subscribe({
      next: () => {
        this.toastr.success('Documento subido y vectorizado correctamente');
        this.subiendo = false;
        this.archivoSeleccionado = null;
        this.uploadForm.get('titulo')?.setValue('');
        this.cargarDocumentos();
        if (this.fileInput) this.fileInput.nativeElement.value = '';
        this.mensajes[0].contenido = this.getWelcomeMessage();
      },
      error: (err) => {
        this.toastr.error(err.error?.error || 'Error al subir documento');
        this.subiendo = false;
      }
    });
  }

  eliminarDocumento(id: string, titulo: string): void {
    if (confirm(`¿Eliminar "${titulo}"?`)) {
      this.ragService.eliminarDocumento(id).subscribe({
        next: () => {
          this.toastr.success('Documento eliminado');
          this.cargarDocumentos();
          this.mensajes[0].contenido = this.getWelcomeMessage();
        },
        error: () => {
          this.toastr.error('Error al eliminar');
        }
      });
    }
  }

  cancelarSubida(): void {
    this.archivoSeleccionado = null;
    this.uploadForm.get('titulo')?.setValue('');
    if (this.fileInput) this.fileInput.nativeElement.value = '';
  }

  toggleSidebar(): void {
    if (this.isMobile) {
      this.mostrarSidebar = !this.mostrarSidebar;
    }
  }

  formatearTexto(texto: string): SafeHtml {
    let html = texto.replace(/\n/g, '<br>');
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
    html = html.replace(/`(.*?)`/g, '<code>$1</code>');
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

  private scrollToBottom(): void {
    try {
      this.chatMessagesContainer.nativeElement.scrollTop = this.chatMessagesContainer.nativeElement.scrollHeight;
    } catch (err) {}
  }
}