import { z } from 'zod';
import { HttpError } from '../utils/errors.js';
import * as Bus from '../models/bus.js';

const crearSchema = z.object({
  placa: z.string().trim().min(5).max(10),
  tipo_servicio: z.enum(['Convencional', 'Semicama', 'Cama', 'Bus-cama doble piso']),
  capacidad: z.number().int().min(4).max(80),
  distribucion: z.enum(['2+2', '2+1']).default('2+2'),
});

export const listar = async (req, res) => res.json({ buses: await Bus.listar(req.idEmpresa) });

// POST /api/buses (HU5, RF9, RF10)
export async function crear(req, res) {
  const d = crearSchema.parse(req.body);   // NOTA: id_empresa NO se acepta del cliente
  const bus = await Bus.crearConAsientos(req.idEmpresa, d);
  res.status(201).json({ bus });
}

// PATCH /api/buses/:id (RF11): editar tipo de servicio o dar de baja (activo=false)
export async function actualizar(req, res) {
  const d = z
    .object({ tipo_servicio: crearSchema.shape.tipo_servicio.optional(), activo: z.boolean().optional() })
    .parse(req.body);
  const bus = await Bus.actualizar(req.idEmpresa, Number(req.params.id), d);
  if (!bus) throw new HttpError(404, 'Bus no encontrado');   // 404 (no 403): no revela buses de otras empresas
  res.json({ bus });
}

export async function asientos(req, res) {
  const bus = await Bus.obtener(req.idEmpresa, Number(req.params.id));
  if (!bus) throw new HttpError(404, 'Bus no encontrado');
  res.json({ bus, asientos: await Bus.asientosDe(bus.id_bus) });
}
