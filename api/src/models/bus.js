import { query, withTransaction } from '../config/db.js';
import { generarAsientos } from '../utils/asientos.js';

// TODAS las consultas filtran por id_empresa (aislamiento multi-empresa)
export const listar = (idEmpresa) =>
  query(`SELECT * FROM buses WHERE id_empresa = $1 ORDER BY id_bus`, [idEmpresa]).then((r) => r.rows);

export const obtener = (idEmpresa, idBus) =>
  query(`SELECT * FROM buses WHERE id_empresa = $1 AND id_bus = $2`, [idEmpresa, idBus]).then((r) => r.rows[0]);

// Crea el bus y genera sus asientos en una sola transacción (RF9, RF10)
export const crearConAsientos = (idEmpresa, b) =>
  withTransaction(async (client) => {
    const bus = (
      await client.query(
        `INSERT INTO buses (id_empresa, placa, tipo_servicio, capacidad, distribucion)
         VALUES ($1,$2,$3,$4,$5) RETURNING *`,
        [idEmpresa, b.placa.toUpperCase(), b.tipo_servicio, b.capacidad, b.distribucion]
      )
    ).rows[0];
    const a = generarAsientos(b.capacidad, b.distribucion);
    await client.query(
      `INSERT INTO asientos (id_bus, numero, fila, columna, piso)
       SELECT $1, * FROM unnest($2::text[], $3::int[], $4::int[], $5::int[])`,
      [bus.id_bus, a.map((x) => x.numero), a.map((x) => x.fila), a.map((x) => x.columna), a.map((x) => x.piso)]
    );
    return bus;
  });

export const actualizar = (idEmpresa, idBus, c) =>
  query(
    `UPDATE buses SET tipo_servicio = COALESCE($3, tipo_servicio), activo = COALESCE($4, activo)
      WHERE id_empresa = $1 AND id_bus = $2 RETURNING *`,
    [idEmpresa, idBus, c.tipo_servicio ?? null, c.activo ?? null]
  ).then((r) => r.rows[0]);

export const asientosDe = (idBus) =>
  query(`SELECT id_asiento, numero, fila, columna, piso FROM asientos WHERE id_bus = $1 ORDER BY fila, columna`, [idBus]).then(
    (r) => r.rows
  );
