import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react'
import { TRIPS, USER, type Trip } from './data'
import { api, saveToken, getToken } from './lib/api'

export const useHash = () => {
  const [h, set] = useState(() => location.hash.slice(1) || '/')
  useEffect(() => {
    const f = () => { set(location.hash.slice(1) || '/'); window.scrollTo(0, 0) }
    addEventListener('hashchange', f); return () => removeEventListener('hashchange', f)
  }, [])
  return h
}
export const go = (p: string) => { location.hash = p }

export const destinoPorRol = (r: Rol) => (r === 'ADMIN_EMPRESA' ? '/empresa/buses' : r === 'ADMIN_TERMINAL' ? '/terminal/empresas' : '/')
export type Rol = 'PASAJERO' | 'ADMIN_EMPRESA' | 'ADMIN_TERMINAL'
/** Usuario de la sesión real (viene de /api/auth/me). Mantiene los nombres que usa el prototipo (name, doc…) */
export type SessionUser = { name: string; doc: string; phone: string; email: string; rol: Rol; empresaId: number | null; empresaNombre: string | null }

export type Ticket = { code: string; trip: Trip; seat: number; dest: string; used: boolean }
type S = {
  user: SessionUser | null; cargandoSesion: boolean
  /** Guarda el token y carga el usuario real desde la API (Sprint 1) */
  iniciarSesion: (token: string) => Promise<SessionUser>
  login: () => void   // solo para las rutas /demo del prototipo
  logout: () => void
  seat: number | null; setSeat: (n: number | null) => void
  trip: Trip; setTrip: (t: Trip) => void
  dest: string; setDest: (d: string) => void
  secs: number; hold: () => void; release: () => void
  tickets: Ticket[]; issue: () => void
}
const Ctx = createContext<S>(null!)
export const useApp = () => useContext(Ctx)

const seedTickets = (): Ticket[] => [
  { code: 'TKT-8C21D0', trip: TRIPS[6], seat: 9, dest: 'Cochabamba', used: false },
  { code: 'TKT-1B77E4', trip: TRIPS[2], seat: 31, dest: 'Oruro', used: true },
]

const aSesion = (u: any): SessionUser => ({
  name: u.nombre, doc: u.documento_identidad, phone: u.telefono ?? '', email: u.correo,
  rol: u.rol, empresaId: u.id_empresa ?? null, empresaNombre: u.empresa_nombre ?? null,
})

export function Provider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null)
  const [cargandoSesion, setCargando] = useState(!!getToken())
  const [seat, setSeat] = useState<number | null>(null)
  const [trip, setTrip] = useState<Trip>(TRIPS[0])
  const [dest, setDest] = useState('Cochabamba')
  const [end, setEnd] = useState<number | null>(null)
  const [now, setNow] = useState(Date.now())
  const [tickets, setTickets] = useState<Ticket[]>(seedTickets)

  // Al abrir la app, si hay token guardado se recupera la sesión real
  useEffect(() => {
    if (!getToken()) return
    api('/auth/me').then((d) => setUser(aSesion(d.usuario))).catch(() => saveToken(null)).finally(() => setCargando(false))
  }, [])

  useEffect(() => { const i = setInterval(() => setNow(Date.now()), 500); return () => clearInterval(i) }, [])
  const secs = end ? Math.max(0, Math.ceil((end - now) / 1000)) : 0
  useEffect(() => {
    if (end && now >= end) { setEnd(null); setSeat(null); go('/expirada') }
  }, [now, end])

  const hold = useCallback(() => { setEnd(Date.now() + 8 * 60 * 1000); setNow(Date.now()) }, [])
  const release = useCallback(() => { setEnd(null); setSeat(null) }, [])
  const issue = () => {
    if (seat) setTickets((t) => [{ code: 'TKT-4F9A21', trip, seat, dest, used: false }, ...t.filter((x) => x.code !== 'TKT-4F9A21')])
    setEnd(null)
  }
  const iniciarSesion = async (token: string) => {
    saveToken(token)
    const d = await api('/auth/me')
    const u = aSesion(d.usuario)
    setUser(u)
    return u
  }
  const logout = () => { saveToken(null); setUser(null) }
  const loginDemo = () => setUser({ name: USER.name, doc: USER.doc, phone: USER.phone, email: USER.email, rol: 'PASAJERO', empresaId: null, empresaNombre: null })
  return (
    <Ctx.Provider value={{ user, cargandoSesion, iniciarSesion, login: loginDemo, logout, seat, setSeat, trip, setTrip, dest, setDest, secs, hold, release, tickets, issue }}>
      {children}
    </Ctx.Provider>
  )
}
