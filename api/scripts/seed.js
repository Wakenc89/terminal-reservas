// Datos iniciales de desarrollo. Idempotente: se puede ejecutar varias veces.
//   docker compose exec api npm run seed
import bcrypt from 'bcrypt';
import { pool } from '../src/config/db.js';

const CLAVE_ADMIN = 'Admin12345';
const CLAVE_PASAJERO = 'Pasajero123';

const empresas = [
  { nombre: 'Flota Andina', corto: 'flota' },
  { nombre: 'Expreso Illimani', corto: 'illimani' },
  { nombre: 'Trans Altiplano', corto: 'altiplano' },
];

async function main() {
  const hashAdmin = await bcrypt.hash(CLAVE_ADMIN, 10);
  const hashPas = await bcrypt.hash(CLAVE_PASAJERO, 10);

  await pool.query(
    `INSERT INTO usuarios (nombre, documento_identidad, correo, password_hash, rol)
     VALUES ('Administrador Terminal','1000001','admin@terminal.test',$1,'ADMIN_TERMINAL')
     ON CONFLICT (correo) DO NOTHING`, [hashAdmin]);

  let doc = 2000000;
  for (const e of empresas) {
    doc += 1;
    const { rows } = await pool.query(
      `INSERT INTO empresas (nombre) VALUES ($1)
       ON CONFLICT (nombre) DO UPDATE SET nombre = EXCLUDED.nombre RETURNING id_empresa`, [e.nombre]);
    await pool.query(
      `INSERT INTO usuarios (nombre, documento_identidad, correo, password_hash, rol, id_empresa)
       VALUES ($1,$2,$3,$4,'ADMIN_EMPRESA',$5) ON CONFLICT (correo) DO NOTHING`,
      [`Admin ${e.nombre}`, String(doc), `admin.${e.corto}@terminal.test`, hashAdmin, rows[0].id_empresa]);
  }

  await pool.query(
    `INSERT INTO usuarios (nombre, documento_identidad, telefono, correo, password_hash, rol)
     VALUES ('Diego Condori','9000001','70000000','diego@correo.test',$1,'PASAJERO')
     ON CONFLICT (correo) DO NOTHING`, [hashPas]);

  console.log('Seed listo.\n  ADMIN_TERMINAL : admin@terminal.test        /', CLAVE_ADMIN);
  console.log('  ADMIN_EMPRESA  : admin.flota@terminal.test  /', CLAVE_ADMIN, '(también illimani, altiplano)');
  console.log('  PASAJERO       : diego@correo.test          /', CLAVE_PASAJERO);
  await pool.end();
}
main().catch((e) => { console.error(e); process.exit(1); });
