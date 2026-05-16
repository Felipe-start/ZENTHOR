const multer = require('multer');
const path = require('path');
const fs = require('fs');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const { vectorizarDocumento } = require('../services/embeddings.service');
const { supabaseAdmin } = require('../config/supabase');

// Configurar multer para subida temporal
const storage = multer.diskStorage({
  destination: './uploads/',
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.pdf', '.docx', '.txt', '.md', '.pptx'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Tipo de archivo no permitido'));
    }
  }
});

// Previsualizar documento antes de subir
const previsualizarDocumento = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No se subió ningún archivo' });
  }

  try {
    const filePath = req.file.path;
    const extension = path.extname(req.file.originalname).toLowerCase();
    let contenido = '';

    // Extraer texto según tipo de archivo
    if (extension === '.pdf') {
      const dataBuffer = fs.readFileSync(filePath);
      const pdfData = await pdfParse(dataBuffer);
      contenido = pdfData.text;
    } 
    else if (extension === '.docx') {
      const dataBuffer = fs.readFileSync(filePath);
      const result = await mammoth.extractRawText({ buffer: dataBuffer });
      contenido = result.value;
    }
    else if (extension === '.txt' || extension === '.md') {
      contenido = fs.readFileSync(filePath, 'utf8');
    }
    else {
      contenido = 'Vista previa no disponible para este tipo de archivo';
    }

    // Guardar temporalmente para confirmación
    req.session.previewDocumento = {
      path: filePath,
      nombre: req.file.originalname,
      contenido: contenido.substring(0, 3000),
      titulo: req.body.titulo || req.file.originalname,
      fuente: req.body.fuente || 'subida_manual'
    };

    res.json({
      nombre: req.file.originalname,
      tamaño: req.file.size,
      tipo: extension,
      preview: contenido.substring(0, 2000),
      hayMas: contenido.length > 2000
    });

  } catch (error) {
    // Limpiar archivo temporal
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ error: error.message });
  }
};

// Confirmar subida y vectorizar
const confirmarSubida = async (req, res) => {
  const preview = req.session.previewDocumento;
  
  if (!preview) {
    return res.status(400).json({ error: 'No hay documento pendiente de confirmación' });
  }

  try {
    // Leer contenido completo
    let contenidoCompleto = '';
    const extension = path.extname(preview.nombre).toLowerCase();

    if (extension === '.pdf') {
      const dataBuffer = fs.readFileSync(preview.path);
      const pdfData = await pdfParse(dataBuffer);
      contenidoCompleto = pdfData.text;
    } else if (extension === '.docx') {
      const dataBuffer = fs.readFileSync(preview.path);
      const result = await mammoth.extractRawText({ buffer: dataBuffer });
      contenidoCompleto = result.value;
    } else {
      contenidoCompleto = fs.readFileSync(preview.path, 'utf8');
    }

    // Vectorizar y guardar
    const documento = await vectorizarDocumento(
      req.user.id,
      preview.titulo,
      contenidoCompleto,
      preview.fuente,
      { nombre_original: preview.nombre, tipo: extension }
    );

    // Limpiar archivo temporal
    if (fs.existsSync(preview.path)) {
      fs.unlinkSync(preview.path);
    }
    delete req.session.previewDocumento;

    res.json({
      success: true,
      documento_id: documento.id,
      mensaje: 'Documento subido y vectorizado exitosamente'
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Obtener documentos del usuario
const getDocumentos = async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('documentos_vector')
      .select('id, titulo, fuente, creado_en, metadata')
      .eq('usuario_id', req.user.id)
      .order('creado_en', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Eliminar documento
const eliminarDocumento = async (req, res) => {
  const { id } = req.params;

  try {
    const { error } = await supabaseAdmin
      .from('documentos_vector')
      .delete()
      .eq('id', id)
      .eq('usuario_id', req.user.id);

    if (error) throw error;
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  upload,
  previsualizarDocumento,
  confirmarSubida,
  getDocumentos,
  eliminarDocumento
};