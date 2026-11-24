import { useEffect, useState, type ReactNode } from 'react'
import { go, useApp, destinoPorRol, type Ticket } from '../store'
import { api, ApiError } from '../lib/api'
import { COMPANIES, ROUTES, SERVICES, TRIPS, CONFLICT_SEAT, USER, bs, type Trip } from '../data'
import { Badge, Bar, BusMap, Button, Card, CountdownBar, Empty, Field, Icon, Input, Legend, Modal, QR, Select, Stepper, Toast, cx, fmt } from '../ui'

const DATE = 'dom 23 nov 2026'
const A = ({ to, children, className }: { to: string; children: ReactNode; className?: string }) => (
  <a href={'#' + to} className={className}>{children}</a>
)

export function Shell({ children, active }: { children: ReactNode; active?: string }) {
  const { user, logout } = useApp()
  const [open, setOpen] = useState(false)
  const [menu, setMenu] = useState(false)
  const links = [['/', 'Inicio'], ['/buscar', 'Buscar viajes'], ['/boletos', 'Mis boletos']]
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b border-line bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between px-4 lg:px-0">
          <A to="/" className="flex items-center gap-2 text-xl font-bold text-brand"><Icon n="bus" />TerminalLP</A>
          <nav className="hidden gap-8 md:flex">
            {links.map(([p, l]) => <A key={p} to={p} className={cx('text-sm font-medium hover:text-brand', active === p ? 'text-brand' : 'text-mute')}>{l}</A>)}
          </nav>
          <div className="hidden items-center gap-2 md:flex">
            {user ? (
              <div className="relative">
                <button onClick={() => setMenu(!menu)} className="flex items-center gap-2 rounded-full border border-line py-1 pl-1 pr-3 text-sm font-medium">
                  <span className="grid size-8 place-items-center rounded-full bg-brand text-white">{user.name[0]}</span>{user.name.split(' ')[0]}
                </button>
                {menu && (
                  <div className="pop absolute right-0 mt-2 w-48 rounded-xl border border-line bg-white p-1 shadow-lg" onClick={() => setMenu(false)}>
                    <A to="/perfil" className="block rounded-lg px-3 py-2 text-sm hover:bg-slate-50">Mi perfil</A>
                    <A to="/boletos" className="block rounded-lg px-3 py-2 text-sm hover:bg-slate-50">Mis boletos</A>
                    <button onClick={() => { logout(); go('/') }} className="block w-full rounded-lg px-3 py-2 text-left text-sm text-bad hover:bg-slate-50">Cerrar sesión</button>
                  </div>
                )}
              </div>
            ) : (<>
              <Button v="secondary" onClick={() => go('/acceso')}>Iniciar sesión</Button>
              <Button onClick={() => go('/acceso?registro')}>Registrarse</Button>
            </>)}
          </div>
          <button className="grid size-11 place-items-center md:hidden" aria-label="Abrir menú" onClick={() => setOpen(true)}><Icon n="menu" s={24} /></button>
        </div>
      </header>
      {open && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 md:hidden" onClick={() => setOpen(false)}>
          <aside className="pop ml-auto flex h-full w-72 flex-col gap-1 bg-white p-4" onClick={(e) => { e.stopPropagation(); setOpen(false) }}>
            <div className="mb-4 flex items-center justify-between"><span className="text-lg font-bold text-brand">TerminalLP</span><button aria-label="Cerrar"><Icon n="x" /></button></div>
            {links.map(([p, l]) => <A key={p} to={p} className="flex h-12 items-center rounded-lg px-3 font-medium hover:bg-slate-50">{l}</A>)}
            {user && <A to="/perfil" className="flex h-12 items-center rounded-lg px-3 font-medium hover:bg-slate-50">Mi perfil</A>}
            <div className="mt-auto space-y-2">
              {user ? <Button v="secondary" className="w-full" onClick={() => { logout(); go('/') }}>Cerrar sesión</Button> : <>
                <Button v="secondary" className="w-full" onClick={() => go('/acceso')}>Iniciar sesión</Button>
                <Button className="w-full" onClick={() => go('/acceso?registro')}>Registrarse</Button></>}
            </div>
          </aside>
        </div>
      )}
      <main className="flex-1">{children}</main>
      <footer className="mt-16 border-t border-line bg-white py-8 text-center text-sm text-mute">
        <p className="font-semibold text-ink">TerminalLP</p>
        <p>Terminal de Buses de La Paz, Bolivia · Prototipo con datos ficticios</p>
        <p className="mt-2"><A to="/pantallas" className="text-brand underline">Ver todas las pantallas</A></p>
      </footer>
    </div>
  )
}

const Wrap = ({ children, className }: { children: ReactNode; className?: string }) => <div className={cx('mx-auto max-w-[1200px] px-4 lg:px-0', className)}>{children}</div>

/* P01 / M01 */
export function Home() {
  const { dest, setDest } = useApp()
  const feats = [['wifi', 'Asientos en tiempo real', 'Mira qué asientos están libres y elige el tuyo.'], ['qr', 'Paga con QR', 'Escanea desde la app de tu banco, sin efectivo.'], ['ticket', 'Boleto digital', 'Tu boleto con QR de abordaje, siempre en tu celular.']]
  return (
    <Shell active="/">
      <section className="bg-gradient-to-b from-brand-soft to-canvas pb-24 pt-12 md:pt-20">
        <Wrap>
          <h1 className="max-w-2xl text-3xl font-bold leading-tight md:text-5xl">Viaja desde la Terminal de La Paz sin hacer filas</h1>
          <p className="mt-4 max-w-xl text-lg text-mute">Compara empresas, elige tu asiento y paga con QR. Todo desde tu navegador, sin crear cuenta hasta el momento de pagar.</p>
        </Wrap>
      </section>
      <Wrap className="-mt-16">
        <Card className="grid gap-4 p-5 shadow-xl md:grid-cols-[1fr_1fr_1fr_auto] md:items-end">
          <Field label="Origen"><Input value="La Paz" disabled readOnly /></Field>
          <Field label="Destino"><Select value={dest} onChange={(e) => setDest(e.target.value)}>{ROUTES.map((r) => <option key={r.dest}>{r.dest}</option>)}</Select></Field>
          <Field label="Fecha"><Input type="date" defaultValue="2026-11-23" /></Field>
          <Button onClick={() => go('/buscar')}><Icon n="search" s={18} />Buscar viajes</Button>
        </Card>
        <div className="mt-14 grid gap-4 md:grid-cols-3">
          {feats.map(([i, t, d]) => (
            <div key={t} className="flex gap-4 p-2">
              <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-brand-soft text-brand"><Icon n={i} /></span>
              <div><h3 className="font-semibold">{t}</h3><p className="text-sm text-mute">{d}</p></div>
            </div>))}
        </div>
        <h2 className="mb-5 mt-14 text-2xl font-semibold">Destinos populares</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {[['Cochabamba', 40, 'from-sky-500 to-blue-700'], ['Santa Cruz', 120, 'from-emerald-500 to-teal-700'], ['Sucre', 90, 'from-amber-500 to-orange-700']].map(([c, p, g]) => (
            <button key={c as string} onClick={() => { setDest(c as string); go('/buscar') }} className={cx('flex h-44 flex-col justify-end rounded-xl bg-gradient-to-br p-5 text-left text-white shadow-sm transition hover:-translate-y-1', g as string)}>
              <span className="text-xl font-bold">{c}</span><span className="text-sm">desde Bs {p}</span>
            </button>))}
        </div>
        <div className="mt-14 rounded-xl border border-line bg-white p-6 text-center">
          <p className="mb-3 text-sm font-medium text-mute">Empresas que operan en la terminal</p>
          <div className="flex flex-wrap justify-center gap-x-10 gap-y-2 text-lg font-semibold">{COMPANIES.map((c) => <span key={c}>{c}</span>)}</div>
        </div>
      </Wrap>
    </Shell>
  )
}

/* P02 / M02 */
export function TripCard({ t, onPick }: { t: Trip; onPick: () => void }) {
  const occ = Math.round((1 - t.free / 40) * 100)
  return (
    <Card className="grid gap-4 p-5 md:grid-cols-[1.2fr_1.4fr_1fr_auto] md:items-center">
      <div className="flex items-center gap-3">
        <span className="grid size-11 place-items-center rounded-lg bg-brand-soft font-bold text-brand">{t.company[0]}</span>
        <div><p className="font-semibold">{t.company}</p><Badge tone="blue">{t.service}</Badge></div>
      </div>
      <div className="flex items-center gap-3">
        <div><p className="text-xl font-bold">{t.dep}</p><p className="text-xs text-mute">La Paz</p></div>
        <div className="flex-1 text-center text-xs text-mute">{t.dur}<div className="my-1 h-px bg-slate-300" /></div>
        <div><p className="text-xl font-bold">{t.arr}</p><p className="text-xs text-mute">Llegada est.</p></div>
      </div>
      <div>
        <p className={cx('mb-1 text-sm font-medium', t.free < 5 ? 'text-bad' : 'text-mute')}>{t.free} asientos libres</p>
        <Bar pct={occ} tone={t.free < 5 ? 'bg-bad' : 'bg-ok'} />
      </div>
      <div className="flex items-center justify-between gap-4 md:flex-col md:items-end md:gap-2">
        <p className="text-3xl font-bold">{bs(t.price)}</p>
        <Button onClick={onPick}>Ver asientos</Button>
      </div>
    </Card>
  )
}

export function Results() {
  const { dest, setTrip, setSeat } = useApp()
  const [cos, setCos] = useState<string[]>([])
  const [slots, setSlots] = useState<string[]>([])
  const [max, setMax] = useState(200)
  const [svc, setSvc] = useState<string[]>([])
  const [sort, setSort] = useState('cheap')
  const [page, setPage] = useState(1)
  const [sheet, setSheet] = useState(false)
  const tog = (a: string[], s: (x: string[]) => void, v: string) => { s(a.includes(v) ? a.filter((x) => x !== v) : [...a, v]); setPage(1) }
  const slot = (h: string) => { const n = +h.slice(0, 2); return n < 6 ? 'Madrugada' : n < 12 ? 'Mañana' : n < 19 ? 'Tarde' : 'Noche' }
  let list = TRIPS.filter((t) => (!cos.length || cos.includes(t.company)) && (!slots.length || slots.includes(slot(t.dep))) && t.price <= max && (!svc.length || svc.includes(t.service)))
  list = [...list].sort((a, b) => sort === 'cheap' ? a.price - b.price : a.dep.localeCompare(b.dep))
  const pages = Math.max(1, Math.ceil(list.length / 4))
  const shown = list.slice((page - 1) * 4, page * 4)
  const clear = () => { setCos([]); setSlots([]); setSvc([]); setMax(200) }
  const chip = (on: boolean) => cx('rounded-full border px-3 py-1.5 text-sm font-medium', on ? 'border-brand bg-brand-soft text-brand' : 'border-slate-300 bg-white')
  const Filters = (
    <div className="space-y-6">
      <div><p className="mb-2 font-semibold">Empresa</p>{COMPANIES.map((c) => <label key={c} className="flex h-9 items-center gap-2 text-sm"><input type="checkbox" className="size-4 accent-brand" checked={cos.includes(c)} onChange={() => tog(cos, setCos, c)} />{c}</label>)}</div>
      <div><p className="mb-2 font-semibold">Horario</p><div className="flex flex-wrap gap-2">{['Madrugada', 'Mañana', 'Tarde', 'Noche'].map((s) => <button key={s} className={chip(slots.includes(s))} onClick={() => tog(slots, setSlots, s)}>{s}</button>)}</div></div>
      <div><p className="mb-2 font-semibold">Tarifa máxima: {bs(max)}</p><input type="range" min={40} max={220} step={10} value={max} onChange={(e) => { setMax(+e.target.value); setPage(1) }} className="w-full accent-brand" aria-label="Tarifa máxima" /><div className="flex justify-between text-xs text-mute"><span>Bs 40</span><span>Bs 220</span></div></div>
      <div><p className="mb-2 font-semibold">Tipo de servicio</p><div className="flex flex-wrap gap-2">{SERVICES.map((s) => <button key={s} className={chip(svc.includes(s))} onClick={() => tog(svc, setSvc, s)}>{s}</button>)}</div></div>
      <Button v="secondary" className="w-full" onClick={clear}>Limpiar filtros</Button>
    </div>
  )
  return (
    <Shell active="/buscar">
      <Wrap className="pt-8">
        <h1 className="text-2xl font-bold md:text-3xl">La Paz → {dest}</h1>
        <p className="text-mute">{DATE} · {list.length} viajes</p>
        <div className="mt-6 grid gap-6 lg:grid-cols-[260px_1fr]">
          <Card className="hidden h-fit p-5 lg:block">{Filters}</Card>
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <Button v="secondary" className="lg:hidden" onClick={() => setSheet(true)}><Icon n="filter" s={18} />Filtros</Button>
              <div className="ml-auto flex gap-2">{[['cheap', 'Más baratos'], ['early', 'Más temprano']].map(([k, l]) => <button key={k} onClick={() => setSort(k)} className={chip(sort === k)}>{l}</button>)}</div>
            </div>
            {shown.length ? shown.map((t) => <TripCard key={t.id} t={t} onPick={() => { setTrip(t); setSeat(null); go('/viaje') }} />) : <NoResults onClear={clear} />}
            {list.length > 0 && (
              <div className="flex items-center justify-center gap-2 pt-2">
                <Button v="secondary" disabled={page === 1} onClick={() => setPage(page - 1)}>Anterior</Button>
                {Array.from({ length: pages }, (_, i) => <button key={i} onClick={() => setPage(i + 1)} className={cx('size-11 rounded-lg text-sm font-semibold', page === i + 1 ? 'bg-brand text-white' : 'border border-slate-300 bg-white')}>{i + 1}</button>)}
                <Button v="secondary" disabled={page === pages} onClick={() => setPage(page + 1)}>Siguiente</Button>
              </div>)}
          </div>
        </div>
      </Wrap>
      {sheet && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 lg:hidden" onClick={() => setSheet(false)}>
          <div className="pop absolute inset-x-0 bottom-0 max-h-[85vh] overflow-auto rounded-t-2xl bg-white p-5" onClick={(e) => e.stopPropagation()}>
            <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-slate-300" />
            {Filters}<Button className="mt-4 w-full" onClick={() => setSheet(false)}>Ver {list.length} viajes</Button>
          </div>
        </div>)}
    </Shell>
  )
}
export const NoResults = ({ onClear }: { onClear?: () => void }) => (
  <Card><Empty title="No encontramos viajes" text="Prueba con otra fecha o quita algunos filtros para ver más opciones." action={<Button onClick={onClear}>Limpiar filtros</Button>} /></Card>
)

/* P03 / M03 */
export function TripDetail() {
  const { trip, seat, setSeat, hold, user, secs } = useApp()
  const [extra, setExtra] = useState<number[]>([])
  const [conflict, setConflict] = useState(false)
  const [floor, setFloor] = useState(1)
  const [ago, setAgo] = useState(3)
  useEffect(() => { const i = setInterval(() => setAgo((a) => (a >= 9 ? 1 : a + 1)), 1000); return () => clearInterval(i) }, [])
  const double = trip.service.includes('doble')
  const pick = (n: number) => {
    if (n === CONFLICT_SEAT) { setExtra([n]); setSeat(null); setConflict(true); return }
    setConflict(false); setSeat(n)
  }
  void secs
  const cont = () => { hold(); go(user ? '/resumen' : '/acceso') }
  const Panel = (
    <Card className="p-5">
      <h2 className="font-semibold">Tu selección</h2>
      {seat ? (
        <div className="mt-3 space-y-2 text-sm">
          <div className="flex justify-between"><span className="text-mute">Asiento</span><b className="text-lg">{seat}</b></div>
          <div className="flex justify-between"><span className="text-mute">Tarifa</span><b>{bs(trip.price)}</b></div>
          <p className="text-xs text-mute">Máximo 1 asiento por compra.</p>
        </div>) : <p className="mt-3 text-sm text-mute">Toca un asiento libre en el mapa.</p>}
      <Button className="mt-4 w-full" disabled={!seat} onClick={cont}>Continuar al pago</Button>
      <p className="mt-3 flex gap-1.5 text-xs text-mute"><Icon n="clock" s={14} />Al continuar, retendremos tu asiento por 8 minutos</p>
    </Card>
  )
  return (
    <Shell active="/buscar">
      <Wrap className="pb-28 pt-8 lg:pb-0">
        <button onClick={() => go('/buscar')} className="mb-4 text-sm font-medium text-brand">← Volver a resultados</button>
        <div className="grid gap-6 lg:grid-cols-[280px_1fr_300px]">
          <Card className="h-fit space-y-3 p-5 text-sm">
            <h2 className="text-lg font-semibold">Resumen del viaje</h2>
            {[['Empresa', trip.company], ['Ruta', 'La Paz → Cochabamba'], ['Fecha', DATE], ['Salida', trip.dep], ['Duración', trip.dur], ['Servicio', trip.service]].map(([a, b]) => <div key={a} className="flex justify-between gap-2"><span className="text-mute">{a}</span><b className="text-right">{b}</b></div>)}
            <div className="flex justify-between border-t border-line pt-3"><span className="text-mute">Tarifa por asiento</span><b className="text-xl">{bs(trip.price)}</b></div>
          </Card>
          <Card className="p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-semibold">Elige tu asiento</h2>
              <span className="flex items-center gap-1.5 text-xs text-mute"><span className="size-2 animate-pulse rounded-full bg-ok" />Actualizado hace {ago} s</span>
            </div>
            {double && <div className="mb-4 flex gap-2">{[1, 2].map((f) => <button key={f} onClick={() => setFloor(f)} className={cx('rounded-lg px-4 py-2 text-sm font-medium', floor === f ? 'bg-brand text-white' : 'bg-slate-100')}>Piso {f}</button>)}</div>}
            {conflict && <div className="mb-4"><Toast tone="bad" onClose={() => setConflict(false)}><b>409: ese asiento ya no está disponible.</b><br />Ese asiento acaba de ser reservado por otro pasajero. Elige otro.</Toast></div>}
            <BusMap mine={seat} onPick={pick} extraHeld={extra} count={double ? 20 : 40} stateOf={double ? (n) => { const m = floor === 1 ? n : n + 20; return m === seat ? 'mine' : m % 6 === 0 ? 'taken' : m % 7 === 0 ? 'held' : 'free' } : undefined} />
            <div className="mt-5"><Legend /></div>
            <p className="mt-3 text-center text-xs text-mute">Demo: el asiento {CONFLICT_SEAT} simula un conflicto (409).</p>
          </Card>
          <div className="hidden h-fit lg:block">{Panel}</div>
        </div>
      </Wrap>
      <div className="fixed inset-x-0 bottom-0 z-30 flex items-center gap-3 border-t border-line bg-white p-3 shadow-[0_-4px_12px_rgba(0,0,0,.06)] lg:hidden">
        <div className="text-sm"><p className="text-mute">{seat ? `Asiento ${seat}` : 'Sin selección'}</p><p className="text-lg font-bold">{seat ? bs(trip.price) : '—'}</p></div>
        <Button className="ml-auto flex-1" disabled={!seat} onClick={cont}>Continuar al pago</Button>
      </div>
    </Shell>
  )
}

/* P04 / M04 */
export function Access() {
  const { seat, secs, iniciarSesion, hold } = useApp()
  const [srv, setSrv] = useState('')
  const [tab, setTab] = useState(location.hash.includes('registro') ? 1 : 0)
  const [show, setShow] = useState(false)
  const [errs, setErrs] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const f = new FormData(e.currentTarget), er: Record<string, string> = {}
    if (!/^\S+@\S+\.\S+$/.test(String(f.get('email') || ''))) er.email = 'Ingresa un correo válido.'
    if (String(f.get('pass') || '').length < 8) er.pass = 'La contraseña debe tener al menos 8 caracteres.'
    if (tab === 1) {
      if (!f.get('name')) er.name = 'Ingresa tu nombre completo.'
      if (!f.get('doc')) er.doc = 'Ingresa tu documento de identidad.'
      if (f.get('pass') !== f.get('pass2')) er.pass2 = 'Las contraseñas no coinciden.'
      if (!f.get('terms')) er.terms = 'Debes aceptar los términos.'
    }
    setErrs(er); setSrv('')
    if (Object.keys(er).length) return
    setLoading(true)
    const correo = String(f.get('email')).trim(), password = String(f.get('pass'))
    try {
      // Conexión real con la API (Sprint 1: HU1 registro, HU2 inicio de sesión)
      const d = tab === 1
        ? await api('/auth/registro', { metodo: 'POST', cuerpo: { nombre: String(f.get('name')).trim(), documento_identidad: String(f.get('doc')).trim(), telefono: String(f.get('tel') || '').trim() || undefined, correo, password } })
        : await api('/auth/login', { metodo: 'POST', cuerpo: { correo, password } })
      const u = await iniciarSesion(d.token)
      go(u.rol === 'PASAJERO' ? (seat ? '/resumen' : '/') : destinoPorRol(u.rol))
    } catch (err) {
      if (err instanceof ApiError) { setErrs(err.porCampo({ nombre: 'name', documento_identidad: 'doc', correo: 'email', password: 'pass' })); setSrv(err.message) }
      else setSrv('Ocurrió un error inesperado.')
    } finally { setLoading(false) }
  }
  void hold
  return (
    <Shell>
      {seat && <CountdownBar secs={secs} text={`Tu asiento ${seat} está retenido para ti`} />}
      <Wrap className="py-10">
        <div className="mx-auto max-w-md">
          <Card className="p-6">
            {seat && <p className="mb-4 rounded-lg bg-brand-soft p-3 text-sm text-blue-900">Inicia sesión o regístrate para continuar con tu compra.</p>}
            <div className="mb-5 grid grid-cols-2 rounded-lg bg-slate-100 p-1">
              {['Iniciar sesión', 'Crear cuenta'].map((t, i) => <button key={t} onClick={() => { setTab(i); setErrs({}) }} className={cx('h-10 rounded-md text-sm font-semibold', tab === i ? 'bg-white shadow-sm' : 'text-mute')}>{t}</button>)}
            </div>
            <form onSubmit={submit} noValidate className="space-y-4">
              {tab === 1 && <>
                <Field label="Nombre completo" error={errs.name}><Input name="name" err={!!errs.name} /></Field>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Documento de identidad" error={errs.doc}><Input name="doc" err={!!errs.doc} /></Field>
                  <Field label="Teléfono"><Input name="tel" inputMode="tel" /></Field>
                </div></>}
              <Field label="Correo electrónico" error={errs.email}><Input name="email" type="email" err={!!errs.email} placeholder="tu@correo.bo" /></Field>
              <Field label="Contraseña" error={errs.pass} help={tab === 1 ? 'Mínimo 8 caracteres.' : undefined}>
                <div className="relative"><Input name="pass" type={show ? 'text' : 'password'} err={!!errs.pass} className="pr-11" />
                  <button type="button" onClick={() => setShow(!show)} aria-label="Mostrar u ocultar contraseña" className="absolute right-0 top-0 grid size-11 place-items-center text-mute"><Icon n="eye" s={18} /></button></div>
              </Field>
              {tab === 1 ? <>
                <Field label="Confirmar contraseña" error={errs.pass2}><Input name="pass2" type="password" err={!!errs.pass2} /></Field>
                <div><label className="flex items-start gap-2 text-sm"><input name="terms" type="checkbox" className="mt-0.5 size-4 accent-brand" />Acepto los términos y condiciones y la política de privacidad.</label>{errs.terms && <p className="mt-1 text-sm text-bad">{errs.terms}</p>}</div></>
                : <span className="block text-sm font-medium text-brand">¿Olvidaste tu contraseña?</span>}
              {srv && <Toast tone="bad">{srv}</Toast>}
              <Button className="w-full" loading={loading}>{tab ? 'Crear cuenta y continuar' : 'Iniciar sesión'}</Button>
            </form>
          </Card>
        </div>
      </Wrap>
    </Shell>
  )
}

function Row({ a, b }: { a: string; b: ReactNode }) { return <div className="flex justify-between gap-4 py-2.5 text-sm"><span className="text-mute">{a}</span><b className="text-right">{b}</b></div> }

/* P05 / M05 */
export function Summary() {
  const { trip, seat, secs, user, dest, release } = useApp()
  if (!seat) return <Redirect to="/buscar" />
  return (
    <Shell>
      <CountdownBar secs={secs} sticky />
      <Wrap className="py-8"><Stepper step={1} />
        <Card className="mx-auto mt-8 max-w-xl p-6">
          <h1 className="mb-2 text-2xl font-bold">Resumen de compra</h1>
          <div className="divide-y divide-line">
            <Row a="Ruta" b={`La Paz → ${dest}`} /><Row a="Fecha" b={DATE} /><Row a="Hora de salida" b={trip.dep} />
            <Row a="Empresa" b={trip.company} /><Row a="Servicio" b={trip.service} /><Row a="Asiento" b={seat} />
            <Row a="Pasajero" b={<>{user?.name}<br /><span className="font-normal text-mute">{user?.doc}</span></>} />
            <Row a="Tarifa" b={bs(trip.price)} />
            <div className="flex justify-between py-4 text-lg"><span className="font-semibold">Total</span><b className="text-2xl text-brand">{bs(trip.price)}</b></div>
          </div>
          <p className="mb-5 text-xs text-mute">1 asiento por compra.</p>
          <div className="flex flex-col gap-3 sm:flex-row"><Button v="secondary" className="flex-1" onClick={() => { release(); go('/viaje') }}>Volver al viaje</Button><Button className="flex-1" onClick={() => go('/pago')}><Icon n="qr" s={18} />Pagar con QR</Button></div>
        </Card>
      </Wrap>
    </Shell>
  )
}
function Redirect({ to }: { to: string }) { useEffect(() => go(to), [to]); return null }

/* P06 / M06 */
export function Pay() {
  const { trip, seat, secs, issue } = useApp()
  if (!seat) return <Redirect to="/buscar" />
  return (
    <Shell>
      <CountdownBar secs={secs} sticky />
      <Wrap className="py-8"><Stepper step={2} />
        <Card className="mx-auto mt-8 max-w-xl p-6 text-center">
          <h1 className="text-2xl font-bold">Escanea para pagar</h1>
          <p className="mt-1 text-4xl font-bold text-brand">{bs(trip.price)}</p>
          <div className="mx-auto mt-5 w-fit rounded-xl border border-line p-3"><QR seed="PAGO-4F9A21" size={220} /></div>
          <ol className="mx-auto mt-6 max-w-xs space-y-3 text-left text-sm">
            {['Abre la app de tu banco', 'Escanea el QR', 'Confirma el pago'].map((t, i) => <li key={t} className="flex items-center gap-3"><span className="grid size-7 place-items-center rounded-full bg-brand-soft text-xs font-bold text-brand">{i + 1}</span>{t}</li>)}
          </ol>
          <p className="mt-6 flex items-center justify-center gap-2 text-sm font-medium text-mute"><span className="size-4 animate-spin rounded-full border-2 border-brand border-t-transparent" />Esperando confirmación…</p>
          <div className="mt-6 rounded-lg bg-amber-50 p-3 text-xs text-amber-900">Pago simulado – entorno de pruebas</div>
          <Button v="secondary" className="mt-3 w-full" onClick={() => { issue(); go('/boleto') }}>Simular pago confirmado</Button>
        </Card>
      </Wrap>
    </Shell>
  )
}

/* Ticket */
export function TicketCard({ t, name = USER.name, doc = USER.doc, big }: { t: Ticket; name?: string; doc?: string; big?: boolean }) {
  return (
    <div className="relative flex flex-col overflow-hidden rounded-2xl border border-line bg-white shadow-md sm:flex-row">
      <div className="flex-1 p-5 sm:p-6">
        <div className="flex items-center justify-between"><span className="font-semibold text-brand">{t.trip.company}</span><Badge tone={t.used ? 'gray' : 'green'}>{t.used ? 'USADO' : 'EMITIDO'}</Badge></div>
        <p className="mt-3 text-2xl font-bold">La Paz → {t.dest}</p>
        <div className={cx('mt-4 grid gap-3 text-sm', big ? 'grid-cols-2' : 'grid-cols-3')}>
          {[['Fecha', DATE], ['Hora', t.trip.dep], ['Asiento', String(t.seat)], ...(big ? [['Pasajero', name], ['Documento', doc]] : [])].map(([a, b]) => <div key={a}><p className="text-xs text-mute">{a}</p><p className="font-semibold">{b}</p></div>)}
        </div>
      </div>
      <div className="relative flex items-center justify-center border-t-2 border-dashed border-slate-300 bg-slate-50 p-5 sm:w-52 sm:border-l-2 sm:border-t-0">
        <span className="absolute -top-3 left-1/2 hidden size-6 -translate-x-1/2 rounded-full bg-canvas sm:block" />
        <span className="absolute -bottom-3 left-1/2 hidden size-6 -translate-x-1/2 rounded-full bg-canvas sm:block" />
        <div className="text-center"><QR seed={t.code} size={big ? 140 : 100} /><p className="mt-2 font-mono text-xs font-semibold">{t.code}</p></div>
      </div>
    </div>
  )
}

/* P07 / M07 */
export function TicketPage() {
  const { tickets } = useApp()
  const [toast, setToast] = useState(true)
  const t = tickets[0]
  return (
    <Shell>
      <Wrap className="py-8"><Stepper step={3} />
        <div className="mx-auto mt-8 max-w-3xl space-y-6">
          {toast && <Toast tone="ok" onClose={() => setToast(false)}><b>¡Pago confirmado!</b> Tu boleto fue emitido.</Toast>}
          <TicketCard t={t} big />
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center"><Button onClick={() => window.print()}><Icon n="download" s={18} />Descargar PDF</Button><Button v="secondary" onClick={() => go('/boletos')}>Ir a Mis boletos</Button></div>
        </div>
      </Wrap>
    </Shell>
  )
}

/* P08 / M08 */
export function MyTickets() {
  const { tickets, user } = useApp()
  const [tab, setTab] = useState(0)
  const [open, setOpen] = useState<Ticket | null>(null)
  const list = tickets.filter((t) => t.used === !!tab)
  return (
    <Shell active="/boletos">
      <Wrap className="pt-8">
        <h1 className="mb-5 text-2xl font-bold md:text-3xl">Mis boletos</h1>
        {!user && <Toast tone="warn"><A to="/acceso" className="font-semibold underline">Inicia sesión</A> para ver tus boletos reales. Mostramos ejemplos.</Toast>}
        <div className="my-5 flex gap-2 border-b border-line">{['Próximos', 'Usados'].map((t, i) => <button key={t} onClick={() => setTab(i)} className={cx('h-11 border-b-2 px-4 text-sm font-semibold', tab === i ? 'border-brand text-brand' : 'border-transparent text-mute')}>{t}</button>)}</div>
        {list.length ? <div className="space-y-4">{list.map((t) => (
          <Card key={t.code} className="flex flex-wrap items-center gap-4 p-4">
            <span className="grid size-12 place-items-center rounded-lg bg-brand-soft text-brand"><Icon n="ticket" /></span>
            <div className="min-w-40 flex-1"><p className="font-semibold">La Paz → {t.dest}</p><p className="text-sm text-mute">{DATE} · {t.trip.dep} · Asiento {t.seat} · {t.trip.company}</p></div>
            <Badge tone={t.used ? 'gray' : 'green'}>{t.used ? 'USADO' : 'EMITIDO'}</Badge>
            <Button v="secondary" onClick={() => setOpen(t)}>Ver boleto</Button>
          </Card>))}</div>
          : <Card><Empty icon="ticket" title="Aún no tienes boletos aquí" text="Cuando compres un viaje, tu boleto digital aparecerá en esta lista." action={<Button onClick={() => go('/buscar')}>Buscar viajes</Button>} /></Card>}
      </Wrap>
      {open && <Modal w="max-w-3xl" onClose={() => setOpen(null)}><TicketCard t={open} big /><Button v="secondary" className="mt-4 w-full" onClick={() => setOpen(null)}>Cerrar</Button></Modal>}
    </Shell>
  )
}

/* P09 */
export function Profile() {
  const { user } = useApp()
  const [ok, setOk] = useState(false)
  const u = user || USER
  useEffect(() => { if (ok) { const i = setTimeout(() => setOk(false), 3000); return () => clearTimeout(i) } }, [ok])
  return (
    <Shell>
      <Wrap className="pt-8">
        <h1 className="mb-6 text-2xl font-bold md:text-3xl">Mi perfil</h1>
        <div className="grid gap-6 md:grid-cols-[280px_1fr]">
          <Card className="h-fit p-6 text-center"><span className="mx-auto grid size-20 place-items-center rounded-full bg-brand text-3xl font-bold text-white">D</span><p className="mt-3 font-semibold">{u.name}</p><p className="text-sm text-mute">{u.email}</p><div className="mt-3"><Badge tone="green">Cuenta de pasajero</Badge></div></Card>
          <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); setOk(true) }}>
            <Card className="space-y-4 p-6"><h2 className="font-semibold">Datos personales</h2>
              <Field label="Nombre completo"><Input defaultValue={u.name} /></Field>
              <div className="grid gap-4 sm:grid-cols-2"><Field label="Documento" help="No se puede modificar."><Input defaultValue={u.doc} disabled /></Field><Field label="Teléfono"><Input defaultValue={u.phone} /></Field></div>
              <Field label="Correo electrónico"><Input type="email" defaultValue={u.email} /></Field></Card>
            <Card className="space-y-4 p-6"><h2 className="font-semibold">Cambiar contraseña</h2>
              <div className="grid gap-4 sm:grid-cols-3"><Field label="Actual"><Input type="password" /></Field><Field label="Nueva"><Input type="password" /></Field><Field label="Confirmar"><Input type="password" /></Field></div></Card>
            <Button>Guardar cambios</Button>
          </form>
        </div>
      </Wrap>
      {ok && <div className="fixed bottom-6 right-4 z-50"><Toast tone="ok">Cambios guardados correctamente.</Toast></div>}
    </Shell>
  )
}

/* P10 */
export function Expired() {
  const { seat } = useApp()
  return (
    <Shell>
      <Wrap className="py-16"><Card className="mx-auto max-w-md p-8 text-center">
        <span className="mx-auto grid size-20 place-items-center rounded-full bg-amber-100 text-warn"><Icon n="clock" s={40} /></span>
        <h1 className="mt-5 text-2xl font-bold">Tu tiempo de reserva venció</h1>
        <p className="mt-2 text-mute">Liberamos el asiento {seat ?? 14} para otros pasajeros. Puedes volver al viaje y elegir de nuevo.</p>
        <Button className="mt-6 w-full" onClick={() => go('/viaje')}>Volver al viaje</Button>
      </Card></Wrap>
    </Shell>
  )
}
export { fmt }
