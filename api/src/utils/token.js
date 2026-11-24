import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

// El token lleva id, rol y empresa (Informe 4.3.1.3.1, Fig. 8)
export const firmarToken = (u) =>
  jwt.sign({ sub: u.id_usuario, rol: u.rol, id_empresa: u.id_empresa ?? null }, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn,
  });

export const verificarToken = (t) => jwt.verify(t, env.jwtSecret);
