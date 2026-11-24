import { useCallback, useEffect, useState } from 'react'

const API = (import.meta.env.VITE_API_URL as string) || 'http://localhost:4000/api'

export const getToken = () => { try { return localStorage.getItem('tlp_token') } catch { return null } }
export const saveToken = (t: string | null) => {
  try { t ? localStorage.setItem('tlp_token', t) : localStorage.removeItem('tlp_token') } catch { /* sin almacenamiento */ }
}

export class ApiError extends Error {
  status: number
  campos: { campo: string; mensaje: string }[]
  constructor(m: string, status: number, campos: { campo: string; mensaje: string }[] = []) {
    super(m); this.status = status; this.campos = campos
  }
  /** Convierte los errores de validación de la API en { campo: mensaje } para mostrarlos en el formulario */
  porCampo(mapa: Record<string, string> = {}) {
    return Object.fromEntries(this.campos.map((c) => [mapa[c.campo] ?? c.campo, c.mensaje]))
  }
}

/** Cliente HTTP único: agrega el token y lanza ApiError con el mensaje de la API */
export async function api<T = any>(ruta: string, o: { metodo?: string; cuerpo?: unknown } = {}): Promise<T> {
  const token = getToken()
  let r: Response
  try {
    r = await fetch(API + ruta, {
      method: o.metodo ?? 'GET',
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: o.cuerpo ? JSON.stringify(o.cuerpo) : undefined,
    })
  } catch {
    throw new ApiError('No se pudo conectar con el servidor', 0)
  }
  const data = await r.json().catch(() => ({}))
  if (!r.ok) throw new ApiError(data.error || 'Error del servidor', r.status, data.campos)
  return data as T
}

/** Hook de lectura: { data, cargando, error, recargar } */
export function useApi<T = any>(ruta: string) {
  const [data, setData] = useState<T | null>(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const recargar = useCallback(() => {
    setCargando(true)
    api<T>(ruta).then((d) => { setData(d); setError('') }).catch((e) => setError(e.message)).finally(() => setCargando(false))
  }, [ruta])
  useEffect(() => { recargar() }, [recargar])
  return { data, cargando, error, recargar }
}
