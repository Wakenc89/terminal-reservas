import bcrypt from 'bcrypt';
import { z } from 'zod';
import { HttpError } from '../utils/errors.js';
import { firmarToken } from '../utils/token.js';
import * as Usuario from '../models/usuario.js';

const registroSchema = z.object({
  nombre: z.string().trim().min(3).max(100),
  documento_identidad: z.string().trim().min(5).max(20),
  telefono: z.string().trim().max(20).optional(),
  correo: z.string().trim().email().max(120),
  password: z.string().min(8, 'Mínimo 8 caracteres').max(72),
});

// POST /api/auth/registro  (HU1, RF1) -> siempre crea un PASAJERO
export async function registro(req, res) {
  const d = registroSchema.parse(req.body);
  const password_hash = await bcrypt.hash(d.password, 10);
  const user = await Usuario.crearUsuario({ ...d, password_hash, rol: 'PASAJERO' });
  res.status(201).json({ token: firmarToken(user), usuario: user });
}

const loginSchema = z.object({ correo: z.string().trim().email(), password: z.string().min(1) });

// POST /api/auth/login  (HU2, RF2) - Fig. 8
export async function login(req, res) {
  const { correo, password } = loginSchema.parse(req.body);
  const u = await Usuario.buscarPorCorreo(correo);
  // Mismo mensaje si no existe o la clave es incorrecta (no revela qué correos existen)
  const ok = u && (await bcrypt.compare(password, u.password_hash));
  if (!ok) throw new HttpError(401, 'Correo o contraseña incorrectos');
  if (u.rol === 'ADMIN_EMPRESA' && u.empresa_activa === false)
    throw new HttpError(403, 'Tu empresa está desactivada. Contacta a la administración de la terminal.');
  const { password_hash, empresa_activa, ...publico } = u;
  res.json({ token: firmarToken(u), usuario: publico });
}

// GET /api/auth/me
export async function me(req, res) {
  const u = await Usuario.buscarPorId(req.user.id);
  if (!u) throw new HttpError(401, 'Usuario no encontrado');
  res.json({ usuario: u });
}
