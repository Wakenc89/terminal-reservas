import { Router } from 'express';
import { wrap } from '../utils/errors.js';
import { autenticar, exigirRol } from '../middleware/auth.js';
import * as c from '../controllers/empresas.js';

const r = Router();
r.use(autenticar, exigirRol('ADMIN_TERMINAL'));   // solo el administrador de la terminal
r.get('/', wrap(c.listar));
r.post('/', wrap(c.crear));
r.patch('/:id/estado', wrap(c.cambiarEstado));
export default r;
