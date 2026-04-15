const express = require('express');
const router = express.Router();
const examenesController = require('../controllers/examenes.controller');
const authMiddleware = require('../middleware/auth');
const { validateCreateExamen, validateUpdateExamen } = require('../validators/examenes.validator');

router.use(authMiddleware);
router.get('/', examenesController.getAll);
router.get('/proximos', examenesController.getProximos);
router.get('/:id', examenesController.getById);
router.post('/', validateCreateExamen, examenesController.create);
router.put('/:id', validateUpdateExamen, examenesController.update);
router.delete('/:id', examenesController.delete);

module.exports = router;