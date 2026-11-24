import { Provider, useApp, useHash, go, destinoPorRol } from './store'
import type { Rol } from './store'
import { Home, Results, TripDetail, Access, Summary, Pay, TicketPage, MyTickets, Profile, Expired } from './pages/passenger'
import { A01, A02, A03, A04, A05, A06, A07, T01, T02, T03 } from './pages/admin'
import { States, Gallery, Demo } from './pages/states'

/** Protege rutas por sesión y rol (RF4). Si no hay sesión -> /acceso; si el rol no corresponde -> su panel. */
function Guard({ rol, children }: { rol: Rol; children: React.ReactNode }) {
  const { user, cargandoSesion } = useApp()
  if (cargandoSesion) return <p className="p-8 text-mute">Cargando sesión…</p>
  if (!user) { queueMicrotask(() => go('/acceso')); return null }
  if (user.rol !== rol) { queueMicrotask(() => go(destinoPorRol(user.rol))); return null }
  return <>{children}</>
}

function Router() {
  const h = useHash().split('?')[0]
  const E = (el: React.ReactNode) => <Guard rol="ADMIN_EMPRESA">{el}</Guard>
  const T = (el: React.ReactNode) => <Guard rol="ADMIN_TERMINAL">{el}</Guard>
  switch (h) {
    case '/': return <Home />
    case '/buscar': return <Results />
    case '/viaje': return <TripDetail />
    case '/acceso': return <Access />
    case '/resumen': return <Summary />
    case '/pago': return <Pay />
    case '/boleto': return <TicketPage />
    case '/boletos': return <MyTickets />
    case '/perfil': return <Profile />
    case '/expirada': return <Expired />
    case '/empresa': return E(<A01 />)
    case '/empresa/buses': return E(<A02 />)
    case '/empresa/buses/nuevo': return E(<A03 />)
    case '/empresa/rutas': return E(<A04 />)
    case '/empresa/viajes': return E(<A05 />)
    case '/empresa/verificar': return E(<A06 />)
    case '/empresa/reportes': return E(<A07 />)
    case '/terminal': return T(<T01 />)
    case '/terminal/empresas': return T(<T02 />)
    case '/terminal/empresas/nueva': return T(<T03 />)
    case '/estados': return <States />
    case '/pantallas': return <Gallery />
    case '/demo/resumen': return <Demo to="resumen" />
    case '/demo/pago': return <Demo to="pago" />
    case '/demo/boleto': return <Demo to="boleto" />
    case '/demo/expirada': return <Demo to="expirada" />
    default: return <Home />
  }
}
export default function App() {
  return <Provider><Router /></Provider>
}
