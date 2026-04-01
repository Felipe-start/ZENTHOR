const Joi = require('joi');

// Esquema para crear materia
const createMateriaSchema = Joi.object({
  nombre: Joi.string()
    .min(3)
    .max(100)
    .required()
    .messages({
      'string.empty': 'El nombre de la materia es obligatorio',
      'string.min': 'El nombre debe tener al menos 3 caracteres',
      'string.max': 'El nombre no puede exceder 100 caracteres'
    }),
  profesor: Joi.string()
    .max(100)
    .allow('', null)
    .optional(),
  horario: Joi.string()
    .max(200)
    .allow('', null)
    .optional(),
  color: Joi.string()
    .pattern(/^#[0-9A-Fa-f]{6}$/)
    .allow('', null)
    .optional()
    .messages({
      'string.pattern.base': 'El color debe ser un código hexadecimal válido (#RRGGBB)'
    })
});

// Esquema para actualizar materia
const updateMateriaSchema = Joi.object({
  nombre: Joi.string()
    .min(3)
    .max(100)
    .optional(),
  profesor: Joi.string()
    .max(100)
    .allow('', null)
    .optional(),
  horario: Joi.string()
    .max(200)
    .allow('', null)
    .optional(),
  color: Joi.string()
    .pattern(/^#[0-9A-Fa-f]{6}$/)
    .allow('', null)
    .optional(),
  activo: Joi.boolean().optional()
}).min(1); // Al menos un campo debe ser actualizado

// Middleware de validación
const validateCreateMateria = (req, res, next) => {
  const { error } = createMateriaSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message
    });
  }
  next();
};

const validateUpdateMateria = (req, res, next) => {
  const { error } = updateMateriaSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message
    });
  }
  next();
};

module.exports = {
  validateCreateMateria,
  validateUpdateMateria
};
