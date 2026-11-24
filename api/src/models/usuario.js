import { query } from '../config/db.js';

const PUBLICO = 'id_usuario, nombre, documento_identidad, telefono, correo, rol, id_empresa';

export const crearUsuario = async (u, client) =>
  (client ?? { query }).query(
    `INSERT INTO usuarios (nombre, documento_identidad, telefono, correo, password_hash, rol, id_empresa)
     VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING ${PUBLICO}`,
    [u.nombre, u.documento_identidad, u.telefono ?? null, u.correo.toLowerCase(), u.password_hash, u.rol, u.id_empresa ?? null]
  ).then((r) => r.rows[0]);

export const buscarPorCorreo = (correo) =>
  query(
    `SELECT u.*, e.activa AS empresa_activa
       FROM usuarios u LEFT JOIN empresas e ON e.id_empresa = u.id_empresa
      WHERE u.correo = $1`,
    [correo.toLowerCase()]
  ).then((r) => r.rows[0]);

// Incluye el nombre de la empresa para mostrarlo en el panel del administrador
export const buscarPorId = (id) =>
  query(
    `SELECT u.id_usuario, u.nombre, u.documento_identidad, u.telefono, u.correo, u.rol, u.id_empresa,
            e.nombre AS empresa_nombre
       FROM usuarios u LEFT JOIN empresas e ON e.id_empresa = u.id_empresa
      WHERE u.id_usuario = $1`,
    [id]
  ).then((r) => r.rows[0]);
