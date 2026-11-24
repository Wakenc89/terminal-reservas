import { Router } from 'express';
import { wrap } from '../utils/errors.js';
import { autenticar } from '../middleware/auth.js';
import * as c from '../controllers/auth.js';

const r = Router();
r.post('/registro', wrap(c.registro));
r.post('/login', wrap(c.login));
r.get('/me', autenticar, wrap(c.me));
export default r;
