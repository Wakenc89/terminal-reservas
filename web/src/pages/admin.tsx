import { useState, type ReactNode } from 'react'
import { go, useApp } from '../store'
import { api, ApiError, useApi } from '../lib/api'
import { COMPANIES, ROUTES, SERVICES, TRIPS, bs } from '../data'
import { type SessionUser } from '../store'
import { Badge, Bar, BusMap, Button, Card, Empty, Field, Icon, Input, Modal, QR, Select, Toast, cx } from '../ui'

type Item = [string, string, string]
const COMPANY_NAV: Item[] = [['/empresa', 'Panel', 'home'], ['/empresa/buses', 'Buses y asientos', 'bus'], ['/empresa/rutas', 'Rutas', 'route'], ['/empresa/viajes', 'Viajes y tarifas', 'cal'], ['/empresa/verificar', 'Verificar abordaje', 'scan'], ['/empresa/reportes', 'Reportes', 'chart']]
const TERM_NAV: Item[] = [['/terminal', 'Panel global', 'home'], ['/terminal/empresas', 'Empresas', 'building']]

export function AdminShell({ kind, active, title, action, children }: { kind: 'empresa' | 'terminal'; active: string; title: string; action?: ReactNode; children: ReactNode }) {
  const nav = kind === 'empresa' ? COMPANY_NAV : TERM_NAV
  const { user, logout } = useApp()
  const empresa = user?.empresaNombre ?? 'tu empresa'
  const [open, setOpen] = useState(false)
  const Side = (
    <nav className="flex flex-col gap-1 p-4">
      <p className="mb-4 flex items-center gap-2 px-2 text-lg font-bold text-brand"><Icon n="bus" />TerminalLP</p>
      {nav.map(([p, l, i]) => (
        <a key={p} href={'#' + p} onClick={() => setOpen(false)} className={cx('flex h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium', active === p ? 'bg-brand-soft text-brand' : 'text-mute hover:bg-slate-50')}><Icon n={i} s={18} />{l}</a>
      ))}
      <a href="#/pantallas" className="mt-6 px-3 text-xs text-mute underline">Todas las pantallas</a>
    </nav>
  )
  return (
    <div className="flex min-h-screen">
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 border-r border-line bg-white lg:block">{Side}</aside>
      {open && <div className="fixed inset-0 z-50 bg-slate-900/50 lg:hidden" onClick={() => setOpen(false)}><aside className="h-full w-64 bg-white" onClick={(e) => e.stopPropagation()}>{Side}</aside></div>}
      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-line bg-white px-4 lg:px-8">
          <button className="lg:hidden" aria-label="Menú" onClick={() => setOpen(true)}><Icon n="menu" s={24} /></button>
          <span className="font-semibold">{kind === 'empresa' ? empresa : 'Terminal de Buses de La Paz'}</span>
          <Badge tone="blue">{kind === 'empresa' ? 'Administrador de empresa' : 'Administrador de la terminal'}</Badge>
          <div className="ml-auto flex items-center gap-3">
            <span className="hidden items-center gap-2 text-sm sm:flex"><span className="grid size-8 place-items-center rounded-full bg-brand text-white">{user?.name?.[0] ?? 'A'}</span>{user?.name ?? ''}</span>
            <Button v="ghost" onClick={() => { logout(); go('/acceso') }}><Icon n="logout" s={18} /><span className="hidden sm:inline">Cerrar sesión</span></Button>
          </div>
        </header>
        <main className="space-y-6 p-4 lg:p-8">
          {kind === 'empresa' && <p className="flex items-center gap-2 rounded-lg bg-brand-soft px-3 py-2 text-sm text-blue-900"><Icon n="lock" s={16} />Solo ves los datos de {empresa}.</p>}
          <div className="flex flex-wrap items-center justify-between gap-3"><h1 className="text-2xl font-bold">{title}</h1>{action}</div>
          {children}
        </main>
      </div>
    </div>
  )
}

const Table = ({ head, children }: { head: string[]; children: ReactNode }) => (
  <Card className="overflow-x-auto"><table className="w-full min-w-[640px] text-left text-sm">
    <thead className="bg-slate-100 text-xs uppercase tracking-wide text-mute"><tr>{head.map((h) => <th key={h} className="px-4 py-3 font-semibold">{h}</th>)}</tr></thead>
    <tbody className="divide-y divide-line [&_td]:h-14 [&_td]:px-4">{children}</tbody></table></Card>
)
const Kpi = ({ l, v, i, sub }: { l: string; v: string; i: string; sub?: string }) => (
  <Card className="p-5"><div className="flex items-center justify-between text-mute"><span className="text-sm">{l}</span><Icon n={i} s={18} /></div><p className="mt-2 text-3xl font-bold">{v}</p>{sub && <p className="text-xs text-mute">{sub}</p>}</Card>
)
const Bars = ({ data, h = 160 }: { data: [string, number][]; h?: number }) => (
  <div className="flex items-end gap-2 sm:gap-4" style={{ height: h + 28 }}>
    {data.map(([l, v]) => <div key={l} className="flex flex-1 flex-col items-center gap-1"><span className="text-xs font-medium">{v}%</span><div className={cx('w-full rounded-t-md', v > 85 ? 'bg-warn' : 'bg-brand')} style={{ height: (v / 100) * h }} /><span className="text-xs text-mute">{l}</span></div>)}
  </div>
)
const Line = ({ pts }: { pts: number[] }) => {
  const w = 600, h = 160, m = Math.max(...pts)
  const xy = pts.map((p, i) => `${(i / (pts.length - 1)) * w},${h - (p / m) * (h - 10) - 5}`)
  return <svg viewBox={`0 0 ${w} ${h}`} className="h-44 w-full" role="img" aria-label="Movimiento de reservas"><polyline points={`0,${h} ${xy.join(' ')} ${w},${h}`} fill="#dbeafe" opacity=".6" /><polyline points={xy.join(' ')} fill="none" stroke="#1d4ed8" strokeWidth="3" strokeLinejoin="round" />{xy.map((p, i) => <circle key={i} cx={p.split(',')[0]} cy={p.split(',')[1]} r="4" fill="#1d4ed8" />)}</svg>
}

export function A01() {
  const dep = [['La Paz → Cochabamba', '08:30', 'Bus 12', 90, 'En venta'], ['La Paz → Oruro', '10:00', 'Bus 07', 45, 'En venta'], ['La Paz → Sucre', '19:00', 'Bus 03', 98, 'Casi lleno'], ['La Paz → Santa Cruz', '21:30', 'Bus 15', 72, 'En venta']] as const
  return (
    <AdminShell kind="empresa" active="/empresa" title="Panel de empresa">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><Kpi l="Viajes de hoy" v="14" i="bus" /><Kpi l="Ocupación promedio" v="78%" i="chart" sub="+4% vs. ayer" /><Kpi l="Asientos vendidos hoy" v="312" i="ticket" /><Kpi l="Reservas retenidas ahora" v="9" i="clock" sub="Se liberan en ≤ 8 min" /></div>
      <Card className="p-5"><h2 className="mb-4 font-semibold">Ocupación por viaje (próximos 7 días)</h2><Bars data={[['Lun', 72], ['Mar', 64], ['Mié', 58], ['Jue', 81], ['Vie', 93], ['Sáb', 96], ['Dom', 88]]} /></Card>
      <div><h2 className="mb-3 font-semibold">Próximas salidas</h2>
        <Table head={['Ruta', 'Hora', 'Bus', 'Ocupación', 'Estado']}>{dep.map(([r, h, b, o, e]) => <tr key={r}><td className="font-medium">{r}</td><td>{h}</td><td>{b}</td><td className="w-56"><div className="flex items-center gap-2"><Bar pct={o} /><span className="w-10 text-xs">{o}%</span></div></td><td><Badge tone={o > 95 ? 'amber' : 'green'}>{e}</Badge></td></tr>)}</Table></div>
    </AdminShell>
  )
}

type Bus = { id_bus: number; placa: string; tipo_servicio: string; capacidad: number; distribucion: '2+2' | '2+1'; activo: boolean }

/** A02 – Buses y asientos (HU5, RF9, RF11). Datos reales: GET /api/buses */
export function A02() {
  const { data, cargando, error, recargar } = useApi<{ buses: Bus[] }>('/buses')
  const [q, setQ] = useState('')
  const [type, setType] = useState('')
  const [seats, setSeats] = useState<Bus | null>(null)
  const [del, setDel] = useState<Bus | null>(null)
  const [edit, setEdit] = useState<Bus | null>(null)
  const [msg, setMsg] = useState('')
  const rows = (data?.buses ?? []).filter((b) => b.placa.toLowerCase().includes(q.toLowerCase()) && (!type || b.tipo_servicio === type))

  const cambiar = async (b: Bus, cuerpo: object, ok: string) => {
    try { await api(`/buses/${b.id_bus}`, { metodo: 'PATCH', cuerpo }); setMsg(ok); recargar() }
    catch (e) { setMsg((e as Error).message) }
    setDel(null); setEdit(null)
  }
  return (
    <AdminShell kind="empresa" active="/empresa/buses" title="Buses y asientos" action={<Button onClick={() => go('/empresa/buses/nuevo')}><Icon n="plus" s={18} />Registrar bus</Button>}>
      {msg && <Toast tone="ok" onClose={() => setMsg('')}>{msg}</Toast>}
      <div className="flex flex-wrap gap-3"><Input className="max-w-xs" placeholder="Buscar por placa" value={q} onChange={(e) => setQ(e.target.value)} /><Select className="max-w-xs" value={type} onChange={(e) => setType(e.target.value)}><option value="">Todos los tipos</option>{SERVICES.map((s) => <option key={s}>{s}</option>)}</Select></div>
      {cargando ? <div className="skel h-48" /> : error ? <Toast tone="bad">{error}</Toast> : rows.length ? <Table head={['Placa', 'Tipo de servicio', 'Capacidad', 'Estado', 'Acciones']}>{rows.map((b) => <tr key={b.id_bus}><td className="font-semibold">{b.placa}</td><td>{b.tipo_servicio}</td><td>{b.capacidad}</td><td><Badge tone={b.activo ? 'green' : 'gray'}>{b.activo ? 'Activo' : 'Baja'}</Badge></td>
        <td><div className="flex gap-1"><Button v="ghost" className="h-9 px-3" onClick={() => setEdit(b)}>Editar</Button><Button v="ghost" className="h-9 px-3" onClick={() => setSeats(b)}>Ver asientos</Button>{b.activo && <Button v="ghost" className="h-9 px-3 text-bad" onClick={() => setDel(b)}>Dar de baja</Button>}</div></td></tr>)}</Table>
        : <Card><Empty icon="bus" title="Sin buses registrados" text="Registra tu primer bus para generar sus asientos." action={<Button onClick={() => go('/empresa/buses/nuevo')}>Registrar bus</Button>} /></Card>}
      {seats && <Modal w="max-w-lg" onClose={() => setSeats(null)}><h2 className="mb-4 text-lg font-semibold">Asientos del bus {seats.placa}</h2><BusMap count={seats.capacidad} layout={seats.distribucion} stateOf={() => 'free'} /><Button v="secondary" className="mt-4 w-full" onClick={() => setSeats(null)}>Cerrar</Button></Modal>}
      {del && <ConfirmModal title={`¿Dar de baja el bus ${del.placa}?`} text="Ya no podrás programar viajes con este bus. Los viajes existentes no se modifican." cta="Dar de baja" onClose={() => setDel(null)} onOk={() => cambiar(del, { activo: false }, `Bus ${del.placa} dado de baja.`)} />}
      {edit && <EditarBus bus={edit} onClose={() => setEdit(null)} onSave={(t) => cambiar(edit, { tipo_servicio: t }, `Bus ${edit.placa} actualizado.`)} />}
    </AdminShell>
  )
}

function EditarBus({ bus, onClose, onSave }: { bus: Bus; onClose: () => void; onSave: (t: string) => void }) {
  const [t, setT] = useState(bus.tipo_servicio)
  return <Modal onClose={onClose}><h2 className="text-lg font-semibold">Editar bus {bus.placa}</h2>
    <p className="mt-1 text-sm text-mute">La capacidad y la distribución no se cambian: los asientos ya fueron generados.</p>
    <Field label="Tipo de servicio" className="mt-4"><Select value={t} onChange={(e) => setT(e.target.value)}>{SERVICES.map((s) => <option key={s}>{s}</option>)}</Select></Field>
    <div className="mt-6 flex gap-3"><Button v="secondary" className="flex-1" onClick={onClose}>Cancelar</Button><Button className="flex-1" onClick={() => onSave(t)}>Guardar</Button></div></Modal>
}

export function ConfirmModal({ title, text, cta, onClose, onOk }: { title: string; text: string; cta: string; onClose: () => void; onOk?: () => void }) {
  return <Modal onClose={onClose}><span className="mb-3 grid size-12 place-items-center rounded-full bg-red-100 text-bad"><Icon n="alert" /></span><h2 className="text-lg font-semibold">{title}</h2><p className="mt-1 text-sm text-mute">{text}</p><div className="mt-6 flex gap-3"><Button v="secondary" className="flex-1" onClick={onClose}>Cancelar</Button><Button v="danger" className="flex-1" onClick={onOk ?? onClose}>{cta}</Button></div></Modal>
}

/** A03 – Registrar bus (HU5, RF9, RF10). POST /api/buses genera los asientos automáticamente. */
export function A03() {
  const [placa, setPlaca] = useState('')
  const [tipo, setTipo] = useState(SERVICES[1])
  const [cap, setCap] = useState(40)
  const [lay, setLay] = useState<'2+2' | '2+1'>('2+2')
  const [errs, setErrs] = useState<Record<string, string>>({})
  const [srv, setSrv] = useState('')
  const [loading, setLoading] = useState(false)
  const guardar = async () => {
    setErrs({}); setSrv(''); setLoading(true)
    try {
      await api('/buses', { metodo: 'POST', cuerpo: { placa: placa.trim(), tipo_servicio: tipo, capacidad: cap, distribucion: lay } })
      go('/empresa/buses')
    } catch (e) {
      if (e instanceof ApiError) { setErrs(e.porCampo()); setSrv(e.status === 409 ? 'Ya existe un bus con esa placa.' : e.message) }
    } finally { setLoading(false) }
  }
  return (
    <AdminShell kind="empresa" active="/empresa/buses" title="Registrar bus">
      <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
        <Card className="space-y-4 p-6">
          <Field label="Placa" error={errs.placa} help="Ejemplo: 2845-LPZ"><Input value={placa} onChange={(e) => setPlaca(e.target.value)} err={!!errs.placa} /></Field>
          <Field label="Tipo de servicio"><Select value={tipo} onChange={(e) => setTipo(e.target.value)}>{SERVICES.map((s) => <option key={s}>{s}</option>)}</Select></Field>
          <Field label="Capacidad" help="Entre 10 y 60 asientos."><Input type="number" min={10} max={60} value={cap} onChange={(e) => setCap(Math.min(60, Math.max(4, +e.target.value || 4)))} /></Field>
          <Field label="Distribución"><Select value={lay} onChange={(e) => setLay(e.target.value as '2+2')}><option>2+2</option><option>2+1</option></Select></Field>
          {srv && <Toast tone="bad">{srv}</Toast>}
          <div className="flex gap-3"><Button v="secondary" className="flex-1" onClick={() => go('/empresa/buses')}>Cancelar</Button><Button className="flex-1" loading={loading} onClick={guardar}>Guardar</Button></div>
        </Card>
        <Card className="p-6"><div className="mb-4 flex items-center justify-between"><h2 className="font-semibold">Vista previa</h2><Badge tone="blue">Se generarán {cap} asientos</Badge></div><BusMap count={cap} layout={lay} stateOf={() => 'free'} /></Card>
      </div>
    </AdminShell>
  )
}

export function A04() {
  const [m, setM] = useState(false)
  return (
    <AdminShell kind="empresa" active="/empresa/rutas" title="Rutas" action={<Button onClick={() => setM(true)}><Icon n="plus" s={18} />Nueva ruta</Button>}>
      <Table head={['Origen', 'Destino', 'Duración estimada', 'Acciones']}>{ROUTES.map((r) => <tr key={r.dest}><td>La Paz</td><td className="font-medium">{r.dest}</td><td>{r.dur}</td><td><Button v="ghost" className="h-9 px-3">Editar</Button></td></tr>)}</Table>
      {m && <Modal onClose={() => setM(false)}><h2 className="mb-4 text-lg font-semibold">Nueva ruta</h2><div className="space-y-4"><Field label="Origen"><Input value="La Paz" readOnly /></Field><Field label="Destino"><Select>{ROUTES.map((r) => <option key={r.dest}>{r.dest}</option>)}</Select></Field><div className="grid grid-cols-2 gap-3"><Field label="Horas"><Input type="number" defaultValue={7} /></Field><Field label="Minutos"><Input type="number" defaultValue={0} /></Field></div></div><div className="mt-6 flex gap-3"><Button v="secondary" className="flex-1" onClick={() => setM(false)}>Cancelar</Button><Button className="flex-1" onClick={() => setM(false)}>Guardar ruta</Button></div></Modal>}
    </AdminShell>
  )
}

export function A05() {
  const [m, setM] = useState(false)
  const [prices, setPrices] = useState(TRIPS.slice(0, 5).map((t) => t.price))
  const [toast, setToast] = useState(false)
  return (
    <AdminShell kind="empresa" active="/empresa/viajes" title="Viajes y tarifas" action={<Button onClick={() => setM(true)}><Icon n="plus" s={18} />Programar viaje</Button>}>
      <Table head={['Ruta', 'Bus', 'Fecha', 'Hora', 'Tarifa (Bs)', 'Libres', 'Estado']}>{TRIPS.slice(0, 5).map((t, i) => <tr key={t.id}><td className="font-medium">La Paz → {['Cochabamba', 'Oruro', 'Sucre', 'Potosí', 'Santa Cruz'][i]}</td><td>{BUSES[i % 3][0]}</td><td>23 nov</td><td>{t.dep}</td>
        <td><Input type="number" aria-label="Tarifa" className="h-9 w-24" value={prices[i]} onChange={(e) => setPrices(prices.map((p, j) => j === i ? +e.target.value : p))} onBlur={() => setToast(true)} /></td><td>{t.free}</td><td><Badge tone={i === 4 ? 'amber' : 'green'}>{i === 4 ? 'Programado' : 'En venta'}</Badge></td></tr>)}</Table>
      {toast && <div className="fixed bottom-6 right-4 z-50"><Toast tone="ok" onClose={() => setToast(false)}>Tarifa actualizada.</Toast></div>}
      {m && <Modal onClose={() => setM(false)}><h2 className="mb-4 text-lg font-semibold">Programar viaje</h2><div className="space-y-4"><Field label="Ruta"><Select>{ROUTES.map((r) => <option key={r.dest}>La Paz → {r.dest}</option>)}</Select></Field><Field label="Bus"><Select>{BUSES.filter((b) => b[3] === 'Activo').map((b) => <option key={b[0]}>{b[0]} · {b[1]}</option>)}</Select></Field><div className="grid grid-cols-2 gap-3"><Field label="Fecha"><Input type="date" defaultValue="2026-11-23" /></Field><Field label="Hora de salida"><Input type="time" defaultValue="21:30" /></Field></div><Field label="Tarifa (Bs)"><Input type="number" defaultValue={80} /></Field></div><div className="mt-6 flex gap-3"><Button v="secondary" className="flex-1" onClick={() => setM(false)}>Cancelar</Button><Button className="flex-1" onClick={() => setM(false)}>Programar</Button></div></Modal>}
    </AdminShell>
  )
}

export function A06() {
  const [res, setRes] = useState<'ok' | 'used' | 'bad' | null>('ok')
  const [code, setCode] = useState('')
  const R = {
    ok: ['border-ok bg-emerald-50', 'text-ok', 'check', 'VÁLIDO', 'Diego Condori · Asiento 14 · Marcado como usado'],
    used: ['border-warn bg-amber-50', 'text-warn', 'alert', 'YA USADO', 'Usado a las 21:12'],
    bad: ['border-bad bg-red-50', 'text-bad', 'x', 'NO CORRESPONDE', 'El boleto no pertenece a este viaje'],
  }
  return (
    <AdminShell kind="empresa" active="/empresa/verificar" title="Verificar QR de abordaje">
      <Field label="Viaje a verificar" className="max-w-md"><Select><option>La Paz → Cochabamba · 21:30 · Bus 2845-LPZ</option><option>La Paz → Oruro · 23:00 · Bus 1921-LPZ</option></Select></Field>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="space-y-4 p-6">
          <div className="relative mx-auto grid aspect-square w-full max-w-xs place-items-center rounded-xl bg-slate-900 text-slate-400">
            {['left-3 top-3 border-l-4 border-t-4', 'right-3 top-3 border-r-4 border-t-4', 'bottom-3 left-3 border-b-4 border-l-4', 'bottom-3 right-3 border-b-4 border-r-4'].map((c) => <span key={c} className={cx('absolute size-10 rounded-sm border-white', c)} />)}
            <span className="flex flex-col items-center gap-2 text-sm"><Icon n="scan" s={36} />Apunta la cámara al QR</span>
          </div>
          <Field label="O ingresa el código manualmente"><Input placeholder="TKT-4F9A21" value={code} onChange={(e) => setCode(e.target.value)} /></Field>
          <Button className="w-full" onClick={() => setRes(code.toUpperCase().includes('USED') ? 'used' : code.toUpperCase().includes('X') ? 'bad' : 'ok')}>Verificar</Button>
          <p className="text-xs text-mute">Demo: incluye “USED” o “X” en el código para ver otros resultados.</p>
        </Card>
        <div className="space-y-4">
          {(['ok', 'used', 'bad'] as const).map((k) => (
            <button key={k} onClick={() => setRes(k)} className={cx('flex w-full items-center gap-4 rounded-xl border-2 p-5 text-left transition', R[k][0], res === k ? 'ring-4 ring-brand/20' : 'opacity-60')}>
              <span className={cx('grid size-14 place-items-center rounded-full bg-white', R[k][1])}><Icon n={R[k][2]} s={30} /></span>
              <span><span className={cx('block text-2xl font-bold', R[k][1])}>{R[k][3]}</span><span className="text-sm">{R[k][4]}</span></span>
            </button>))}
        </div>
      </div>
    </AdminShell>
  )
}

export function A07() {
  return (
    <AdminShell kind="empresa" active="/empresa/reportes" title="Reportes de ocupación" action={<Button v="secondary"><Icon n="download" s={18} />Exportar CSV</Button>}>
      <div className="flex flex-wrap gap-3"><Input type="date" defaultValue="2026-11-16" className="w-44" aria-label="Desde" /><Input type="date" defaultValue="2026-11-23" className="w-44" aria-label="Hasta" /><Select className="w-56"><option>Todas las rutas</option>{ROUTES.map((r) => <option key={r.dest}>La Paz → {r.dest}</option>)}</Select></div>
      <Card className="p-5"><h2 className="mb-2 font-semibold">Movimiento de reservas</h2><Line pts={[42, 55, 48, 70, 66, 92, 88, 104]} /></Card>
      <div><h2 className="mb-3 font-semibold">Ocupación por viaje</h2><Table head={['Viaje', 'Fecha', 'Vendidos', 'Ocupación']}>{[['La Paz → Cochabamba 08:30', '23 nov', 36, 90], ['La Paz → Oruro 10:00', '23 nov', 18, 45], ['La Paz → Sucre 19:00', '23 nov', 39, 98], ['La Paz → Potosí 21:30', '22 nov', 29, 72]].map(([v, f, n, o]) => <tr key={v as string}><td className="font-medium">{v}</td><td>{f}</td><td>{n}</td><td className="w-60"><div className="flex items-center gap-2"><Bar pct={o as number} /><span className="w-10 text-xs">{o}%</span></div></td></tr>)}</Table></div>
    </AdminShell>
  )
}

/* Terminal */
export function T01() {
  const co = [['Flota Andina', 78, 14], ['Expreso Illimani', 64, 11], ['Trans Altiplano', 71, 9]] as const
  return (
    <AdminShell kind="terminal" active="/terminal" title="Panel global">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><Kpi l="Empresas activas" v="3" i="building" /><Kpi l="Viajes de hoy" v="34" i="bus" /><Kpi l="Ocupación global" v="71%" i="chart" /><Kpi l="Reservas activas" v="23" i="clock" /></div>
      <div className="grid gap-4 md:grid-cols-3">{co.map(([n, o, v]) => <Card key={n} className="p-5"><p className="font-semibold">{n}</p><p className="mt-2 text-sm text-mute">Ocupación</p><div className="flex items-center gap-2"><Bar pct={o} /><b>{o}%</b></div><p className="mt-2 text-sm text-mute">{v} viajes hoy</p></Card>)}</div>
      <Card className="p-5"><h2 className="mb-4 font-semibold">Ocupación por empresa</h2><Bars data={co.map(([n, o]) => [n, o] as [string, number])} /></Card>
      <div><h2 className="mb-3 font-semibold">Últimas reservas</h2><Table head={['Código', 'Empresa', 'Ruta', 'Monto', 'Estado']}>{[['TKT-4F9A21', 'Flota Andina', 'Cochabamba', 80, 'Emitido'], ['TKT-7D10B2', 'Expreso Illimani', 'Sucre', 110, 'Retenida'], ['TKT-92AA03', 'Trans Altiplano', 'Oruro', 40, 'Emitido']].map(([c, e, r, m, s]) => <tr key={c as string}><td className="font-mono">{c}</td><td>{e}</td><td>La Paz → {r}</td><td>{bs(m as number)}</td><td><Badge tone={s === 'Emitido' ? 'green' : 'amber'}>{s}</Badge></td></tr>)}</Table></div>
    </AdminShell>
  )
}

type Empresa = { id_empresa: number; nombre: string; activa: boolean; fecha_registro: string; buses: number; administrador: string | null }
const fechaCorta = (iso: string) => new Date(iso).toLocaleDateString('es-BO', { day: '2-digit', month: 'short', year: 'numeric' })

/** T02 – Empresas (HU4, RF6, RF7). Datos reales: GET /api/empresas, PATCH /api/empresas/:id/estado */
export function T02() {
  const { data, cargando, error, recargar } = useApi<{ empresas: Empresa[] }>('/empresas')
  const [conf, setConf] = useState<Empresa | null>(null)
  const [msg, setMsg] = useState('')
  const cambiar = async (e: Empresa, activa: boolean) => {
    try { await api(`/empresas/${e.id_empresa}/estado`, { metodo: 'PATCH', cuerpo: { activa } }); setMsg(`${e.nombre} ${activa ? 'activada' : 'desactivada'}.`); recargar() }
    catch (er) { setMsg((er as Error).message) }
    setConf(null)
  }
  return (
    <AdminShell kind="terminal" active="/terminal/empresas" title="Empresas" action={<Button onClick={() => go('/terminal/empresas/nueva')}><Icon n="plus" s={18} />Registrar empresa</Button>}>
      {msg && <Toast tone="ok" onClose={() => setMsg('')}>{msg}</Toast>}
      {cargando ? <div className="skel h-48" /> : error ? <Toast tone="bad">{error}</Toast> :
      <Table head={['Empresa', 'Administrador', 'Buses', 'Estado', 'Registro']}>{(data?.empresas ?? []).map((c) => <tr key={c.id_empresa}><td className="font-semibold">{c.nombre}</td><td>{c.administrador ?? '—'}</td><td>{c.buses}</td>
        <td><button role="switch" aria-checked={c.activa} aria-label={`Activar ${c.nombre}`} onClick={() => c.activa ? setConf(c) : cambiar(c, true)} className={cx('flex items-center gap-2 text-sm font-medium', c.activa ? 'text-ok' : 'text-mute')}><span className={cx('flex h-6 w-11 items-center rounded-full p-0.5 transition', c.activa ? 'bg-ok' : 'bg-slate-300')}><span className={cx('size-5 rounded-full bg-white transition', c.activa && 'translate-x-5')} /></span>{c.activa ? 'Activa' : 'Inactiva'}</button></td>
        <td>{fechaCorta(c.fecha_registro)}</td></tr>)}</Table>}
      {conf && <Modal onClose={() => setConf(null)}><span className="mb-3 grid size-12 place-items-center rounded-full bg-red-100 text-bad"><Icon n="alert" /></span><h2 className="text-lg font-semibold">¿Desactivar {conf.nombre}?</h2><p className="mt-1 text-sm text-mute">Su administrador no podrá iniciar sesión mientras la empresa esté inactiva.</p><div className="mt-6 flex gap-3"><Button v="secondary" className="flex-1" onClick={() => setConf(null)}>Cancelar</Button><Button v="danger" className="flex-1" onClick={() => cambiar(conf, false)}>Desactivar</Button></div></Modal>}
    </AdminShell>
  )
}

/** T03 – Registrar empresa (HU4, RF6). POST /api/empresas crea la empresa y su administrador en una transacción. */
export function T03() {
  const [f, setF] = useState({ nombre: '', nit: '', telefono: '', correo: '', an: '', ad: '', ac: '', ap: '' })
  const [errs, setErrs] = useState<Record<string, string>>({})
  const [srv, setSrv] = useState('')
  const [loading, setLoading] = useState(false)
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement>) => setF({ ...f, [k]: e.target.value })
  const enviar = async (e: React.FormEvent) => {
    e.preventDefault(); setErrs({}); setSrv(''); setLoading(true)
    try {
      await api('/empresas', { metodo: 'POST', cuerpo: {
        nombre: f.nombre.trim(), nit: f.nit.trim() || undefined, telefono: f.telefono.trim() || undefined, correo: f.correo.trim() || undefined,
        administrador: { nombre: f.an.trim(), documento_identidad: f.ad.trim(), correo: f.ac.trim(), password: f.ap },
      } })
      go('/terminal/empresas')
    } catch (er) {
      if (er instanceof ApiError) {
        setErrs(er.porCampo({ nombre: 'nombre', correo: 'correo', 'administrador.nombre': 'an', 'administrador.documento_identidad': 'ad', 'administrador.correo': 'ac', 'administrador.password': 'ap' }))
        setSrv(er.status === 409 ? 'Ya existe una empresa o un usuario con esos datos (nombre, documento o correo).' : er.message)
      }
    } finally { setLoading(false) }
  }
  return (
    <AdminShell kind="terminal" active="/terminal/empresas" title="Registrar empresa">
      <form className="max-w-3xl space-y-6" onSubmit={enviar} noValidate>
        <Card className="space-y-4 p-6"><h2 className="font-semibold">Datos de la empresa</h2>
          <Field label="Nombre de la empresa" error={errs.nombre}><Input value={f.nombre} onChange={set('nombre')} err={!!errs.nombre} /></Field>
          <div className="grid gap-4 sm:grid-cols-2"><Field label="NIT"><Input value={f.nit} onChange={set('nit')} /></Field><Field label="Teléfono"><Input type="tel" value={f.telefono} onChange={set('telefono')} /></Field></div>
          <Field label="Correo de contacto" error={errs.correo}><Input type="email" value={f.correo} onChange={set('correo')} err={!!errs.correo} /></Field></Card>
        <Card className="space-y-4 p-6"><h2 className="font-semibold">Administrador de la empresa</h2>
          <div className="grid gap-4 sm:grid-cols-2"><Field label="Nombre" error={errs.an}><Input value={f.an} onChange={set('an')} err={!!errs.an} /></Field><Field label="Documento" error={errs.ad}><Input value={f.ad} onChange={set('ad')} err={!!errs.ad} /></Field><Field label="Correo" error={errs.ac}><Input type="email" value={f.ac} onChange={set('ac')} err={!!errs.ac} /></Field><Field label="Contraseña inicial" help="Mínimo 8 caracteres." error={errs.ap}><Input type="password" value={f.ap} onChange={set('ap')} err={!!errs.ap} /></Field></div></Card>
        <p className="flex items-center gap-2 text-sm text-mute"><Icon n="info" s={16} />Se creará el identificador de empresa que aísla sus datos.</p>
        {srv && <Toast tone="bad">{srv}</Toast>}
        <div className="flex gap-3"><Button v="secondary" type="button" onClick={() => go('/terminal/empresas')}>Cancelar</Button><Button loading={loading}>Registrar</Button></div>
      </form>
    </AdminShell>
  )
}
export { QR }
