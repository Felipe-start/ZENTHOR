const Joi = require('joi');

const createExamenSchema = Joi.object({
  materia_id: Joi.number().integer().required().messages({
    'number.base': 'El ID de la materia debe ser un número',
    'any.required': 'La materia es obligatoria'
  }),
  fecha_examen: Joi.date().iso().required().messages({
    'date.base': 'La fecha del examen debe ser una fecha válida',
    'any.required': 'La fecha del examen es obligatoria'
  }),
  temas: Joi.string().max(2000).allow('', null).optional(),
  aula: Joi.string().max(100).allow('', null).optional()
});

const updateExamenSchema = Joi.object({
  materia_id: Joi.number().integer().optional(),
  fecha_examen: Joi.date().iso().optional(),
  temas: Joi.string().max(2000).allow('', null).optional(),
  aula: Joi.string().max(100).allow('', null).optional()
}).min(1);

const validateCreateExamen = (req, res, next) => {
  const { error } = createExamenSchema.validate(req.body);
  if (error) return res.status(400).json({ success: false, message: error.details[0].message });
  next();
};

const validateUpdateExamen = (req, res, next) => {
  const { error } = updateExamenSchema.validate(req.body);
  if (error) return res.status(400).json({ success: false, message: error.details[0].message });
  next();
};

module.exports = { validateCreateExamen, validateUpdateExamen };