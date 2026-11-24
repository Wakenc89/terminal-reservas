import { Router } from 'express';
import { wrap } from '../utils/errors.js';
import { autenticar, exigirRol, contextoEmpresa } from '../middleware/auth.js';
import * as c from '../controllers/buses.js';

const r = Router();
r.use(autenticar, exigirRol('ADMIN_EMPRESA'), contextoEmpresa);
r.get('/', wrap(c.listar));
r.post('/', wrap(c.crear));
r.patch('/:id', wrap(c.actualizar));
r.get('/:id/asientos', wrap(c.asientos));
export default r;
