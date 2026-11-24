// Genera la geometría de los asientos de un bus (RF10, Informe 4.2.1).
// '2+2': columnas 1,2 | pasillo | 3,4   -> 4 asientos por fila
// '2+1': columnas 1,2 | pasillo | 3     -> 3 asientos por fila
export function generarAsientos(capacidad, distribucion = '2+2') {
  const porFila = distribucion === '2+1' ? 3 : 4;
  const asientos = [];
  for (let i = 0; i < capacidad; i++) {
    asientos.push({
      numero: String(i + 1),
      fila: Math.floor(i / porFila) + 1,
      columna: (i % porFila) + 1,
      piso: 1,
    });
  }
  return asientos;
}
