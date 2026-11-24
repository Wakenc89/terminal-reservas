import { HttpError } from '../utils/errors.js';
import { verificarToken } from '../utils/token.js';

// 1) Autenticación: exige un token válido (401 si falta o es inválido)
export function autenticar(req, _res, next) {
  const h = req.headers.authorization || '';
  const token = h.startsWith('Bearer ') ? h.slice(7) : null;
  if (!token) return next(new HttpError(401, 'Sesión requerida'));
  try {
    const p = verificarToken(token);
    req.user = { id: p.sub, rol: p.rol, id_empresa: p.id_empresa };
    next();
  } catch {
    next(new HttpError(401, 'Sesión inválida o expirada'));
  }
}

// 2) Autorización por rol (403 si el rol no corresponde) - RF4
export const exigirRol = (...roles) => (req, _res, next) =>
  roles.includes(req.user?.rol) ? next() : next(new HttpError(403, 'No tienes permiso para esta acción'));

// 3) Contexto de empresa: el id_empresa SIEMPRE sale del token, nunca del cuerpo
//    de la petición. Es el aislamiento multi-empresa (RF8, RNF7).
export function contextoEmpresa(req, _res, next) {
  if (!req.user?.id_empresa) return next(new HttpError(403, 'Usuario sin empresa asignada'));
  req.idEmpresa = req.user.id_empresa;
  next();
}
