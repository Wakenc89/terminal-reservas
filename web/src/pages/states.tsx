import { useState, type ReactNode } from 'react'
import { go, useApp } from '../store'
import { TRIPS } from '../data'
import { Button, Card, Empty, Icon, Modal, Toast, BusMap } from '../ui'
import { NoResults, Shell } from './passenger'

const Sec = ({ id, t, children }: { id: string; t: string; children: ReactNode }) => (
  <section className="space-y-3"><h2 className="text-lg font-semibold"><span className="mr-2 rounded bg-brand-soft px-2 py-0.5 text-sm text-brand">{id}</span>{t}</h2>{children}</section>
)
const Center = ({ icon, tone, title, text, children }: { icon: string; tone: string; title: string; text: string; children: ReactNode }) => (
  <Card className="p-8 text-center"><span className={`mx-auto grid size-16 place-items-center rounded-full ${tone}`}><Icon n={icon} s={32} /></span><h3 className="mt-4 text-xl font-bold">{title}</h3><p className="mx-auto mt-1 max-w-sm text-sm text-mute">{text}</p><div className="mt-5 flex justify-center gap-2">{children}</div></Card>
)

export function States() {
  const [m, setM] = useState(false)
  return (
    <Shell>
      <div className="mx-auto max-w-[1200px] space-y-10 px-4 pt-8 lg:px-0">
        <h1 className="text-3xl font-bold">Estados y errores</h1>
        <Sec id="E01" t="Sin resultados de búsqueda"><NoResults /></Sec>
        <Sec id="E02" t="Estado vacío en tablas de admin"><Card><Empty icon="bus" title="Aún no hay buses" text="Registra el primer bus de tu empresa para programar viajes." action={<Button>+ Registrar bus</Button>} /></Card></Sec>
        <div className="grid gap-6 md:grid-cols-2">
          <Sec id="E03" t="Error 403"><Center icon="lock" tone="bg-red-100 text-bad" title="No tienes permiso para ver esta página" text="Tu rol no tiene acceso a esta sección.">
            <Button onClick={() => go('/')}>Ir al inicio</Button></Center></Sec>
          <Sec id="E04" t="Sesión expirada (401)"><Center icon="clock" tone="bg-amber-100 text-warn" title="Tu sesión expiró" text="Por seguridad cerramos tu sesión. Inicia sesión de nuevo para continuar.">
            <Button onClick={() => go('/acceso')}>Iniciar sesión</Button></Center></Sec>
        </div>
        <Sec id="E05" t="Error de red"><Center icon="wifi" tone="bg-slate-100 text-mute" title="No pudimos conectar" text="Revisa tu conexión a internet e inténtalo otra vez."><Button>Reintentar</Button></Center></Sec>
        <Sec id="E06" t="Esqueletos de carga">
          <div className="grid gap-6 md:grid-cols-[1fr_auto]">
            <div className="space-y-3">{[0, 1, 2].map((i) => <Card key={i} className="flex items-center gap-4 p-5"><div className="skel size-11" /><div className="flex-1 space-y-2"><div className="skel h-4 w-1/2" /><div className="skel h-3 w-1/3" /></div><div className="skel h-10 w-24" /></Card>)}</div>
            <Card className="grid grid-cols-4 gap-2 p-5">{Array.from({ length: 16 }, (_, i) => <div key={i} className="skel size-11" />)}</Card>
          </div>
        </Sec>
        <Sec id="E07" t="Toasts"><div className="grid max-w-md gap-3"><Toast tone="ok"><b>Éxito.</b> Cambios guardados.</Toast><Toast tone="bad"><b>Error.</b> No pudimos procesar el pago.</Toast><Toast tone="warn"><b>Atención.</b> Te quedan 2 minutos de reserva.</Toast></div></Sec>
        <Sec id="E08" t="Modal de confirmación destructiva"><Button v="danger" onClick={() => setM(true)}>Abrir modal</Button></Sec>
        {m && <Modal onClose={() => setM(false)}><span className="mb-3 grid size-12 place-items-center rounded-full bg-red-100 text-bad"><Icon n="alert" /></span><h2 className="text-lg font-semibold">¿Desactivar la empresa?</h2><p className="mt-1 text-sm text-mute">Esta acción oculta sus viajes a los pasajeros.</p><div className="mt-6 flex gap-3"><Button v="secondary" className="flex-1" onClick={() => setM(false)}>Cancelar</Button><Button v="danger" className="flex-1" onClick={() => setM(false)}>Desactivar</Button></div></Modal>}
      </div>
    </Shell>
  )
}

const GROUPS: [string, [string, string, string][]][] = [
  ['Pasajero (responsivo, 1440 y 390)', [['P01 / M01', '/', 'Inicio y búsqueda'], ['P02 / M02', '/buscar', 'Resultados con filtros'], ['P03 / M03', '/viaje', 'Detalle y mapa de asientos'], ['P04 / M04', '/acceso', 'Iniciar sesión / Registrarse'], ['P05 / M05', '/demo/resumen', 'Resumen de compra'], ['P06 / M06', '/demo/pago', 'Pago por QR'], ['P07 / M07', '/demo/boleto', 'Boleto digital'], ['P08 / M08', '/boletos', 'Mis boletos'], ['P09', '/perfil', 'Mi perfil'], ['P10', '/demo/expirada', 'Reserva expirada'], ['P11', '/viaje', 'Conflicto 409 (elige el asiento 22)'], ['M09', '/', 'Menú hamburguesa (ancho < 768 px)']]],
  ['Administrador de empresa', [['A01', '/empresa', 'Panel'], ['A02', '/empresa/buses', 'Buses y asientos'], ['A03', '/empresa/buses/nuevo', 'Registrar bus'], ['A04', '/empresa/rutas', 'Rutas'], ['A05', '/empresa/viajes', 'Viajes y tarifas'], ['A06', '/empresa/verificar', 'Verificar QR'], ['A07', '/empresa/reportes', 'Reportes']]],
  ['Administrador de la terminal', [['T01', '/terminal', 'Panel global'], ['T02', '/terminal/empresas', 'Empresas'], ['T03', '/terminal/empresas/nueva', 'Registrar empresa']]],
  ['Estados y errores', [['E01–E08', '/estados', 'Todos los estados']]],
]
export function Gallery() {
  return (
    <div className="mx-auto max-w-[1200px] space-y-8 px-4 py-10 lg:px-0">
      <div><h1 className="text-3xl font-bold">TerminalLP · Mapa de pantallas</h1><p className="text-mute">Prototipo navegable. Flujo de compra: Inicio → Resultados → Asiento → Acceso → Resumen → Pago → Boleto.</p></div>
      {GROUPS.map(([g, items]) => (
        <section key={g}><h2 className="mb-3 font-semibold">{g}</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{items.map(([id, p, t]) => <a key={id + t} href={'#' + p} className="rounded-xl border border-line bg-white p-4 hover:border-brand"><span className="text-xs font-bold text-brand">{id}</span><p className="font-medium">{t}</p></a>)}</div></section>))}
    </div>
  )
}

export function Demo({ to }: { to: string }) {
  const { login, setSeat, setTrip, hold, user } = useApp()
  const [done, setDone] = useState(false)
  if (!done) {
    setDone(true)
    queueMicrotask(() => {
      if (!user) login()
      setTrip(TRIPS[0]); setSeat(14)
      if (to === 'resumen' || to === 'pago') hold()
      go('/' + (to === 'expirada' ? 'expirada' : to))
    })
  }
  return null
}
export { BusMap }
