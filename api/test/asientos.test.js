import test from 'node:test';
import assert from 'node:assert/strict';
import { generarAsientos } from '../src/utils/asientos.js';

test('2+2 con 40 asientos: 10 filas, 4 columnas, numeración 1..40', () => {
  const a = generarAsientos(40, '2+2');
  assert.equal(a.length, 40);
  assert.equal(a[0].numero, '1'); assert.equal(a[39].numero, '40');
  assert.equal(Math.max(...a.map((x) => x.fila)), 10);
  assert.equal(Math.max(...a.map((x) => x.columna)), 4);
});
test('2+1 con 30 asientos: 10 filas, 3 columnas', () => {
  const a = generarAsientos(30, '2+1');
  assert.equal(Math.max(...a.map((x) => x.fila)), 10);
  assert.equal(Math.max(...a.map((x) => x.columna)), 3);
});
test('capacidad no múltiplo de la fila: última fila incompleta', () => {
  const a = generarAsientos(42, '2+2');
  assert.equal(a.length, 42);
  assert.equal(a.at(-1).fila, 11);
});
test('no hay posiciones repetidas', () => {
  const a = generarAsientos(40, '2+2');
  assert.equal(new Set(a.map((x) => `${x.piso}-${x.fila}-${x.columna}`)).size, 40);
});
