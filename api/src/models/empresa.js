import { query } from '../config/db.js';

export const listar = () =>
  query(
    `SELECT e.*, 
            (SELECT count(*)::int FROM buses b WHERE b.id_empresa = e.id_empresa) AS buses,
            (SELECT u.nombre FROM usuarios u WHERE u.id_empresa = e.id_empresa AND u.rol='ADMIN_EMPRESA' LIMIT 1) AS administrador
       FROM empresas e ORDER BY e.id_empresa`
  ).then((r) => r.rows);

export const crear = (e, client) =>
  client.query(
    `INSERT INTO empresas (nombre, nit, telefono, correo) VALUES ($1,$2,$3,$4) RETURNING *`,
    [e.nombre, e.nit ?? null, e.telefono ?? null, e.correo ?? null]
  ).then((r) => r.rows[0]);

export const cambiarEstado = (id, activa) =>
  query(`UPDATE empresas SET activa = $2 WHERE id_empresa = $1 RETURNING *`, [id, activa]).then((r) => r.rows[0]);
