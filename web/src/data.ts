export const COMPANIES = ['Flota Andina', 'Expreso Illimani', 'Trans Altiplano']
export const ROUTES = [
  { dest: 'Cochabamba', dur: '7 h', from: 40 },
  { dest: 'Santa Cruz', dur: '14 h', from: 120 },
  { dest: 'Oruro', dur: '3 h 30', from: 40 },
  { dest: 'Sucre', dur: '11 h', from: 90 },
  { dest: 'Potosí', dur: '9 h', from: 80 },
  { dest: 'Uyuni', dur: '10 h', from: 100 },
  { dest: 'Tarija', dur: '16 h', from: 150 },
]
export const SERVICES = ['Convencional', 'Semicama', 'Cama', 'Bus-cama doble piso']
export type Trip = { id: number; company: string; service: string; dep: string; arr: string; dur: string; free: number; price: number }
const deps = ['06:00', '08:30', '10:00', '13:30', '15:00', '19:00', '21:30', '23:00']
const prices = [80, 95, 70, 110, 85, 140, 120, 160]
export const TRIPS: Trip[] = deps.map((d, i) => {
  const h = (parseInt(d) + 7) % 24
  return { id: i + 1, company: COMPANIES[i % 3], service: SERVICES[i % 4], dep: d, arr: String(h).padStart(2, '0') + d.slice(2), dur: '7 h', free: [12, 4, 22, 3, 18, 9, 27, 15][i], price: prices[i] }
})
export const OCCUPIED = new Set([2, 3, 7, 8, 11, 15, 16, 20, 21, 25, 26, 30, 33, 37])
export const HELD = new Set([5, 18, 24])
export const CONFLICT_SEAT = 22
export const USER = { name: 'Diego Condori', doc: '8123456 LP', phone: '+591 71234567', email: 'diego.condori@correo.bo' }
export const bs = (n: number) => `Bs ${n}`
