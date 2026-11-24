// Pruebas de integración del Sprint 1. Requieren la BD levantada y el seed ejecutado:
//   docker compose exec api npm run seed && docker compose exec api npm test
import test, { before, after } from 'node:test';
import assert from 'node:assert/strict';
import { app } from '../src/app.js';
import { pool } from '../src/config/db.js';

let server, base;
before(async () => {
  server = app.listen(0);
  base = `http://127.0.0.1:${server.address().port}/api`;
});
after(async () => { server.close(); await pool.end(); });

const llamar = async (ruta, { metodo = 'GET', token, cuerpo } = {}) => {
  const r = await fetch(base + ruta, {
    method: metodo,
    headers: { 'Content-Type': 'application/json', ...(token && { Authorization: `Bearer ${token}` }) },
    body: cuerpo && JSON.stringify(cuerpo),
  });
  return { status: r.status, data: await r.json() };
};
const login = async (correo, password) => (await llamar('/auth/login', { metodo: 'POST', cuerpo: { correo, password } }));
const sufijo = Date.now().toString().slice(-7);

test('HU2: login correcto devuelve token y rol', async () => {
  const r = await login('diego@correo.test', 'Pasajero123');
  assert.equal(r.status, 200);
  assert.equal(r.data.usuario.rol, 'PASAJERO');
  assert.ok(r.data.token);
});

test('HU2: credenciales incorrectas -> 401 con el mismo mensaje', async () => {
  const a = await login('diego@correo.test', 'mala-clave-1');
  const b = await login('noexiste@correo.test', 'mala-clave-1');
  assert.equal(a.status, 401); assert.equal(b.status, 401);
  assert.equal(a.data.error, b.data.error);
});

test('HU1: registro crea PASAJERO; documento/correo duplicado -> 409; clave corta -> 400', async () => {
  const cuerpo = { nombre: 'Prueba Uno', documento_identidad: `D${sufijo}`, correo: `p${sufijo}@correo.test`, password: 'Clave12345' };
  const ok = await llamar('/auth/registro', { metodo: 'POST', cuerpo });
  assert.equal(ok.status, 201); assert.equal(ok.data.usuario.rol, 'PASAJERO');
  assert.equal((await llamar('/auth/registro', { metodo: 'POST', cuerpo })).status, 409);
  assert.equal((await llamar('/auth/registro', { metodo: 'POST', cuerpo: { ...cuerpo, correo: 'x@y.com', password: '123' } })).status, 400);
});

test('RF4: sin token -> 401; pasajero en ruta de empresa -> 403', async () => {
  assert.equal((await llamar('/buses')).status, 401);
  const t = (await login('diego@correo.test', 'Pasajero123')).data.token;
  assert.equal((await llamar('/buses', { token: t })).status, 403);
  assert.equal((await llamar('/empresas', { token: t })).status, 403);
});

test('HU5/RF10: admin de empresa crea bus de 40 y se generan 40 asientos', async () => {
  const t = (await login('admin.flota@terminal.test', 'Admin12345')).data.token;
  const r = await llamar('/buses', { metodo: 'POST', token: t,
    cuerpo: { placa: `T${sufijo}`, tipo_servicio: 'Semicama', capacidad: 40, distribucion: '2+2' } });
  assert.equal(r.status, 201);
  const as = await llamar(`/buses/${r.data.bus.id_bus}/asientos`, { token: t });
  assert.equal(as.data.asientos.length, 40);
});

test('RF8/RNF7 AISLAMIENTO: una empresa no ve ni modifica buses de otra', async () => {
  const tA = (await login('admin.flota@terminal.test', 'Admin12345')).data.token;
  const tB = (await login('admin.illimani@terminal.test', 'Admin12345')).data.token;
  const bus = (await llamar('/buses', { metodo: 'POST', token: tA,
    cuerpo: { placa: `A${sufijo}`, tipo_servicio: 'Cama', capacidad: 30, distribucion: '2+1' } })).data.bus;
  const listaB = (await llamar('/buses', { token: tB })).data.buses;
  assert.ok(!listaB.some((b) => b.id_bus === bus.id_bus), 'B no debe ver el bus de A');
  assert.equal((await llamar(`/buses/${bus.id_bus}`, { metodo: 'PATCH', token: tB, cuerpo: { activo: false } })).status, 404);
  assert.equal((await llamar(`/buses/${bus.id_bus}/asientos`, { token: tB })).status, 404);
  // intento de inyectar id_empresa en el cuerpo: se ignora, el bus queda en la empresa del token
  const r = await llamar('/buses', { metodo: 'POST', token: tB,
    cuerpo: { placa: `B${sufijo}`, tipo_servicio: 'Cama', capacidad: 20, id_empresa: 1 } });
  assert.equal(r.status, 201);
  const empresaB = (await llamar('/buses', { token: tB })).data.buses[0].id_empresa;
  assert.equal(r.data.bus.id_empresa, empresaB, 'la empresa sale del token, no del cuerpo');
});

test('HU4/RF6/RF7: admin de terminal crea empresa con su admin y la desactiva (login bloqueado)', async () => {
  const t = (await login('admin@terminal.test', 'Admin12345')).data.token;
  const r = await llamar('/empresas', { metodo: 'POST', token: t, cuerpo: {
    nombre: `Empresa ${sufijo}`, administrador: { nombre: 'Admin Nuevo', documento_identidad: `E${sufijo}`,
      correo: `e${sufijo}@terminal.test`, password: 'Clave12345' } } });
  assert.equal(r.status, 201);
  assert.equal((await login(`e${sufijo}@terminal.test`, 'Clave12345')).status, 200);
  const off = await llamar(`/empresas/${r.data.empresa.id_empresa}/estado`, { metodo: 'PATCH', token: t, cuerpo: { activa: false } });
  assert.equal(off.data.empresa.activa, false);
  assert.equal((await login(`e${sufijo}@terminal.test`, 'Clave12345')).status, 403);
});
