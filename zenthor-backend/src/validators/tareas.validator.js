const Joi = require('joi');

// Esquema para crear tarea
const createTareaSchema = Joi.object({
  materia_id: Joi.number()
    .integer()
    .required()
    .messages({
      'number.base': 'El ID de la materia debe ser un número',
      'any.required': 'La materia es obligatoria'
    }),
  titulo: Joi.string()
    .min(3)
    .max(200)
    .required()
    .messages({
      'string.empty': 'El título de la tarea es obligatorio',
      'string.min': 'El título debe tener al menos 3 caracteres',
      'string.max': 'El título no puede exceder 200 caracteres'
    }),
  descripcion: Joi.string()
    .max(2000)
    .allow('', null)
    .optional(),
  fecha_entrega: Joi.date()
    .iso()
    .required()
    .messages({
      'date.base': 'La fecha de entrega debe ser una fecha válida',
      'any.required': 'La fecha de entrega es obligatoria'
    }),
  prioridad: Joi.string()
    .valid('baja', 'media', 'alta')
    .default('media')
    .messages({
      'any.only': 'La prioridad debe ser baja, media o alta'
    })
});

// Esquema para actualizar tarea
const updateTareaSchema = Joi.object({
  materia_id: Joi.number()
    .integer()
    .optional(),
  titulo: Joi.string()
    .min(3)
    .max(200)
    .optional(),
  descripcion: Joi.string()
    .max(2000)
    .allow('', null)
    .optional(),
  fecha_entrega: Joi.date()
    .iso()
    .optional(),
  prioridad: Joi.string()
    .valid('baja', 'media', 'alta')
    .optional(),
  estado: Joi.string()
    .valid('pendiente', 'completada')
    .optional()
}).min(1); // Al menos un campo debe ser actualizado

// Middleware de validación
const validateCreateTarea = (req, res, next) => {
  const { error } = createTareaSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message
    });
  }
  next();
};

const validateUpdateTarea = (req, res, next) => {
  const { error } = updateTareaSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message
    });
  }
  next();
};

module.exports = {
  validateCreateTarea,
  validateUpdateTarea
};