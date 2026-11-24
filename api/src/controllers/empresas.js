import bcrypt from 'bcrypt';
import { z } from 'zod';
import { withTransaction } from '../config/db.js';
import { HttpError } from '../utils/errors.js';
import * as Empresa from '../models/empresa.js';
import * as Usuario from '../models/usuario.js';

export const listar = async (_req, res) => res.json({ empresas: await Empresa.listar() });

const crearSchema = z.object({
  nombre: z.string().trim().min(3).max(100),
  nit: z.string().trim().max(20).optional(),
  telefono: z.string().trim().max(20).optional(),
  correo: z.string().trim().email().max(120).optional(),
  administrador: z.object({
    nombre: z.string().trim().min(3).max(100),
    documento_identidad: z.string().trim().min(5).max(20),
    correo: z.string().trim().email().max(120),
    password: z.string().min(8).max(72),
  }),
});

// POST /api/empresas  (HU4, RF6): empresa + su administrador en UNA transacción (ACID)
export async function crear(req, res) {
  const d = crearSchema.parse(req.body);
  const hash = await bcrypt.hash(d.administrador.password, 10);
  const out = await withTransaction(async (client) => {
    const empresa = await Empresa.crear(d, client);
    const admin = await Usuario.crearUsuario(
      { ...d.administrador, password_hash: hash, rol: 'ADMIN_EMPRESA', id_empresa: empresa.id_empresa },
      client
    );
    return { empresa, administrador: admin };
  });
  res.status(201).json(out);
}

// PATCH /api/empresas/:id/estado  (RF7)
export async function cambiarEstado(req, res) {
  const { activa } = z.object({ activa: z.boolean() }).parse(req.body);
  const e = await Empresa.cambiarEstado(Number(req.params.id), activa);
  if (!e) throw new HttpError(404, 'Empresa no encontrada');
  res.json({ empresa: e });
}
