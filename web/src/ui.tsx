import { useEffect, useState, type ReactNode, type ButtonHTMLAttributes } from 'react'
import { HELD, OCCUPIED } from './data'

export const cx = (...a: (string | false | null | undefined)[]) => a.filter(Boolean).join(' ')

const P: Record<string, string> = {
  x: 'M6 6l12 12M18 6L6 18',
  clock: 'M12 7v5l3 2M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  check: 'M5 13l4 4L19 7',
  menu: 'M4 6h16M4 12h16M4 18h16',
  arrow: 'M5 12h14M13 6l6 6-6 6',
  bus: 'M5 17h14M6 5h12a1 1 0 011 1v10H5V6a1 1 0 011-1zM5 11h14M8 20v-3M16 20v-3',
  qr: 'M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h2v2h-2zM18 18h2v2h-2zM14 20h2',
  ticket: 'M3 9a2 2 0 002-2h14a2 2 0 002 2v1a2 2 0 000 4v1a2 2 0 00-2 2H5a2 2 0 00-2-2v-1a2 2 0 000-4z',
  user: 'M12 12a4 4 0 100-8 4 4 0 000 8zM4 20a8 8 0 0116 0',
  eye: 'M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12zM12 15a3 3 0 100-6 3 3 0 000 6z',
  alert: 'M12 9v4M12 17h.01M10.3 3.9L2.4 18a2 2 0 001.7 3h15.8a2 2 0 001.7-3L13.7 3.9a2 2 0 00-3.4 0z',
  info: 'M12 16v-4M12 8h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  home: 'M3 11l9-8 9 8v9a1 1 0 01-1 1h-5v-6H9v6H4a1 1 0 01-1-1z',
  route: 'M6 19a2 2 0 100-4 2 2 0 000 4zM18 9a2 2 0 100-4 2 2 0 000 4zM8 17h6a3 3 0 000-6h-4a3 3 0 010-6h6',
  cal: 'M7 3v4M17 3v4M4 9h16M5 5h14a1 1 0 011 1v14a1 1 0 01-1 1H5a1 1 0 01-1-1V6a1 1 0 011-1z',
  chart: 'M4 20V10M10 20V4M16 20v-8M22 20H2',
  scan: 'M4 8V5a1 1 0 011-1h3M16 4h3a1 1 0 011 1v3M20 16v3a1 1 0 01-1 1h-3M8 20H5a1 1 0 01-1-1v-3M4 12h16',
  building: 'M4 21V4a1 1 0 011-1h9a1 1 0 011 1v17M15 9h4a1 1 0 011 1v11M3 21h18M8 8h3M8 12h3M8 16h3',
  plus: 'M12 5v14M5 12h14',
  search: 'M21 21l-4.3-4.3M17 10a7 7 0 11-14 0 7 7 0 0114 0z',
  wifi: 'M2 8.8a15 15 0 0120 0M5 12.5a10 10 0 0114 0M8.5 16a5 5 0 017 0M12 19.5h.01',
  lock: 'M7 11V8a5 5 0 0110 0v3M6 11h12a1 1 0 011 1v8a1 1 0 01-1 1H6a1 1 0 01-1-1v-8a1 1 0 011-1z',
  filter: 'M3 5h18l-7 8v6l-4 2v-8z',
  download: 'M12 4v12M7 11l5 5 5-5M5 20h14',
  logout: 'M15 4h3a1 1 0 011 1v14a1 1 0 01-1 1h-3M10 8l-4 4 4 4M6 12h10',
  steer: 'M12 21a9 9 0 100-18 9 9 0 000 18zM12 14a2 2 0 100-4 2 2 0 000 4zM12 14v7M10 11L3.5 9.5M14 11l6.5-1.5',
}
export function Icon({ n, s = 20, className }: { n: string; s?: number; className?: string }) {
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d={P[n] || P.info} />
    </svg>
  )
}

export function Button({ v = 'primary', loading, className, children, ...r }: ButtonHTMLAttributes<HTMLButtonElement> & { v?: 'primary' | 'secondary' | 'ghost' | 'danger'; loading?: boolean }) {
  const st = {
    primary: 'bg-brand text-white hover:bg-brand-dark disabled:bg-slate-300 disabled:text-slate-500',
    secondary: 'border border-slate-300 bg-white text-ink hover:bg-slate-50 disabled:text-slate-400',
    ghost: 'text-brand hover:bg-brand-soft',
    danger: 'bg-bad text-white hover:bg-red-700 disabled:bg-slate-300',
  }[v]
  return (
    <button {...r} disabled={r.disabled || loading} className={cx('inline-flex h-11 items-center justify-center gap-2 rounded-lg px-5 text-sm font-semibold transition-colors', st, className)}>
      {loading && <span className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />}
      {children}
    </button>
  )
}

export function Badge({ tone = 'gray', children }: { tone?: 'green' | 'gray' | 'amber' | 'red' | 'blue'; children: ReactNode }) {
  const t = { green: 'bg-emerald-100 text-emerald-800', gray: 'bg-slate-200 text-slate-700', amber: 'bg-amber-100 text-amber-800', red: 'bg-red-100 text-red-800', blue: 'bg-brand-soft text-blue-900' }[tone]
  return <span className={cx('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold', t)}>{children}</span>
}

export const Card = ({ className, children }: { className?: string; children: ReactNode }) => (
  <div className={cx('rounded-xl border border-line bg-white shadow-sm', className)}>{children}</div>
)

export function Field({ label, help, error, children, className }: { label: string; help?: string; error?: string; children?: ReactNode; className?: string }) {
  return (
    <label className={cx('block', className)}>
      <span className="mb-1.5 block text-sm font-medium">{label}</span>
      {children}
      {error ? <span className="mt-1 block text-sm text-bad">{error}</span> : help && <span className="mt-1 block text-sm text-mute">{help}</span>}
    </label>
  )
}
export const inputCls = 'h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm placeholder:text-slate-400 disabled:bg-slate-100 disabled:text-mute'
export const Input = (p: React.InputHTMLAttributes<HTMLInputElement> & { err?: boolean }) => (
  <input {...p} className={cx(inputCls, p.err && 'border-bad', p.className)} />
)
export const Select = ({ children, ...p }: React.SelectHTMLAttributes<HTMLSelectElement>) => (
  <select {...p} className={cx(inputCls, p.className)}>{children}</select>
)

export function Modal({ children, onClose, w = 'max-w-md' }: { children: ReactNode; onClose?: () => void; w?: string }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4" onClick={onClose}>
      <div role="dialog" aria-modal className={cx('pop max-h-[92vh] w-full overflow-auto rounded-2xl bg-white p-6 shadow-xl', w)} onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  )
}

export function Toast({ tone, children, onClose }: { tone: 'ok' | 'bad' | 'warn'; children: ReactNode; onClose?: () => void }) {
  const t = { ok: ['border-ok', 'text-ok', 'check'], bad: ['border-bad', 'text-bad', 'alert'], warn: ['border-warn', 'text-warn', 'alert'] }[tone]
  return (
    <div role="status" className={cx('pop flex items-start gap-3 rounded-xl border-l-4 bg-white p-4 text-sm shadow-lg', t[0])}>
      <Icon n={t[2]} className={t[1]} />
      <div className="flex-1">{children}</div>
      {onClose && <button onClick={onClose} aria-label="Cerrar"><Icon n="x" s={16} /></button>}
    </div>
  )
}

export const fmt = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`

export function CountdownBar({ secs, text = 'Tu asiento se libera en', sticky }: { secs: number; text?: string; sticky?: boolean }) {
  const low = secs < 120
  return (
    <div className={cx('flex items-center justify-between gap-3 px-4 py-2.5 text-sm font-medium', low ? 'bg-red-50 text-red-800' : 'bg-amber-50 text-amber-900', sticky && 'sticky top-16 z-30')}>
      <span className="flex items-center gap-2"><Icon n="clock" s={18} />{text}</span>
      <span className="font-mono text-base font-bold tabular-nums">{fmt(secs)}</span>
    </div>
  )
}

export function Stepper({ step }: { step: 1 | 2 | 3 }) {
  const items = ['Resumen', 'Pago', 'Boleto']
  return (
    <ol className="mx-auto flex max-w-lg items-center">
      {items.map((t, i) => {
        const n = i + 1, done = n < step || step === 3 && n === 3, cur = n === step && !done
        return (
          <li key={t} className="flex flex-1 items-center last:flex-none">
            <span className="flex items-center gap-2 text-sm font-medium">
              <span className={cx('grid size-8 place-items-center rounded-full text-sm font-bold', done ? 'bg-ok text-white' : cur ? 'bg-brand text-white' : 'bg-slate-200 text-mute')}>
                {done ? <Icon n="check" s={16} /> : n}
              </span>
              <span className={cx('hidden sm:inline', !cur && !done && 'text-mute')}>{t}</span>
            </span>
            {n < 3 && <span className={cx('mx-3 h-0.5 flex-1', n < step ? 'bg-ok' : 'bg-slate-200')} />}
          </li>
        )
      })}
    </ol>
  )
}

/* Pseudo QR determinista (simulado) */
export function QR({ seed = 'TKT-4F9A21', size = 200 }: { seed?: string; size?: number }) {
  const N = 25
  let h = 0
  for (const c of seed) h = (h * 31 + c.charCodeAt(0)) >>> 0
  const rnd = () => ((h = (h * 1664525 + 1013904223) >>> 0), h / 4294967296)
  const cells: ReactNode[] = []
  const finder = (x: number, y: number) => x < 8 && y < 8 || x > N - 9 && y < 8 || x < 8 && y > N - 9
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
    if (finder(x, y)) continue
    if (rnd() > 0.52) cells.push(<rect key={x + '-' + y} x={x} y={y} width="1" height="1" />)
  }
  const F = ({ x, y }: { x: number; y: number }) => (
    <g transform={`translate(${x} ${y})`}><rect width="7" height="7" /><rect x="1" y="1" width="5" height="5" fill="#fff" /><rect x="2" y="2" width="3" height="3" /></g>
  )
  return (
    <svg width={size} height={size} viewBox={`-1 -1 ${N + 2} ${N + 2}`} fill="#0f172a" role="img" aria-label="Código QR simulado" className="rounded-lg bg-white">
      <rect x="-1" y="-1" width={N + 2} height={N + 2} fill="#fff" />
      {cells}<F x={0} y={0} /><F x={N - 7} y={0} /><F x={0} y={N - 7} />
    </svg>
  )
}

export type SeatState = 'free' | 'held' | 'taken' | 'mine'
export function Seat({ n, st, onClick }: { n: number; st: SeatState; onClick?: () => void }) {
  const base = 'relative grid size-11 place-items-center rounded-lg border-2 text-sm font-bold transition-transform sm:size-12'
  const lab = { free: 'libre', held: 'retenido por otro pasajero', taken: 'ocupado', mine: 'seleccionado por ti' }[st]
  const s = {
    free: 'border-ok bg-[#34d399] text-emerald-950 hover:scale-105',
    held: 'border-dashed border-amber-700 bg-[#fbbf24] text-amber-950',
    taken: 'border-slate-300 bg-[#cbd5e1] text-slate-500',
    mine: 'border-brand-dark bg-brand text-white ring-4 ring-brand/25',
  }[st]
  return (
    <button disabled={st === 'held' || st === 'taken'} onClick={onClick} aria-label={`Asiento ${n}, ${lab}`} className={cx(base, s)}>
      {st === 'taken' ? <Icon n="x" s={18} /> : n}
      {st === 'held' && <Icon n="clock" s={11} className="absolute right-0.5 top-0.5" />}
    </button>
  )
}

export function seatState(n: number, mine: number | null, extraHeld: number[] = []): SeatState {
  if (n === mine) return 'mine'
  if (OCCUPIED.has(n)) return 'taken'
  if (HELD.has(n) || extraHeld.includes(n)) return 'held'
  return 'free'
}

export function BusMap({ mine, onPick, extraHeld, count = 40, layout = '2+2', stateOf }: { mine?: number | null; onPick?: (n: number) => void; extraHeld?: number[]; count?: number; layout?: '2+2' | '2+1'; stateOf?: (n: number) => SeatState }) {
  const per = layout === '2+2' ? 4 : 3
  const rows = Math.ceil(count / per)
  const get = (n: number) => (n > count ? null : n)
  return (
    <div className="mx-auto w-fit rounded-[2rem] border-2 border-slate-300 bg-slate-50 px-5 pb-6 pt-4">
      <div className="mb-4 flex items-center justify-between border-b border-dashed border-slate-300 pb-3 text-xs text-mute">
        <span className="flex items-center gap-1.5"><Icon n="steer" s={22} />Conductor</span><span>Puerta</span>
      </div>
      <div className="space-y-2">
        {Array.from({ length: rows }, (_, r) => {
          const ns = Array.from({ length: per }, (_, i) => get(r * per + i + 1))
          const left = ns.slice(0, 2), right = ns.slice(2)
          const render = (n: number | null, i: number) => n ? <Seat key={n} n={n} st={stateOf ? stateOf(n) : seatState(n, mine ?? null, extraHeld)} onClick={() => onPick?.(n)} /> : <span key={i} className="size-11 sm:size-12" />
          return (
            <div key={r} className="flex items-center gap-2">
              {left.map(render)}<span className="w-6 text-center text-[10px] text-slate-400 sm:w-8">{r + 1}</span>{right.map(render)}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export function Legend() {
  const it = (c: string, l: string, extra = '') => (
    <span className="flex items-center gap-2 text-sm"><span className={cx('grid size-5 place-items-center rounded border-2', c, extra)} />{l}</span>
  )
  return (
    <div className="flex flex-wrap justify-center gap-x-5 gap-y-2">
      {it('border-ok bg-[#34d399]', 'Libre')}
      {it('border-dashed border-amber-700 bg-[#fbbf24]', 'Retenido')}
      <span className="flex items-center gap-2 text-sm"><span className="grid size-5 place-items-center rounded border-2 border-slate-300 bg-[#cbd5e1] text-slate-500"><Icon n="x" s={12} /></span>Ocupado</span>
      {it('border-brand-dark bg-brand', 'Seleccionado')}
    </div>
  )
}

export function Empty({ icon = 'search', title, text, action }: { icon?: string; title: string; text: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center px-6 py-14 text-center">
      <div className="mb-4 grid size-20 place-items-center rounded-full bg-brand-soft text-brand"><Icon n={icon} s={36} /></div>
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-mute">{text}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}

export function useTick(ms = 1000) {
  const [, set] = useState(0)
  useEffect(() => { const i = setInterval(() => set((x) => x + 1), ms); return () => clearInterval(i) }, [ms])
}

export const Bar = ({ pct, tone }: { pct: number; tone?: string }) => (
  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
    <div className={cx('h-full rounded-full', tone || (pct > 85 ? 'bg-bad' : 'bg-brand'))} style={{ width: pct + '%' }} />
  </div>
)
