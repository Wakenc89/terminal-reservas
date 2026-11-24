# TerminalLP – Sistema web de reservas y gestión de asientos

Proyecto del Informe Integrador (Ing. en Sistemas, UPFT). Arquitectura de 3 capas en Docker:
`web` (React + Tailwind) → `api` (Node + Express) → `db` (PostgreSQL).

## Requisitos
- Docker Desktop (con Docker Compose v2) y Git. Nada más: Node y PostgreSQL corren dentro de contenedores.

## Primer arranque (Paso 0)
```bash
cp .env.example .env          # luego edita las claves del .env
docker compose up --build     # construye y levanta los 3 contenedores
```
Verifica:
- http://localhost:5173  → debe mostrar "Tablas creadas: 10"
- http://localhost:4000/api/health → `{"api":"ok","baseDeDatos":"ok","tablas":10}`

## Comandos útiles
```bash
docker compose up -d              # levantar en segundo plano
docker compose logs -f api        # ver logs de la API
docker compose exec db psql -U tlp_user -d terminal_reservas   # entrar a la BD
docker compose down               # apagar (conserva los datos)
docker compose down -v            # apagar y BORRAR la BD (re-ejecuta db/init/*.sql)
```
> Los scripts de `db/init/` solo se ejecutan cuando el volumen de datos está vacío.
> Si cambias el esquema en desarrollo: `docker compose down -v && docker compose up`.

## Sprint 1 – Sesiones y empresas
```bash
docker compose exec api npm run seed   # crea admin de terminal, 3 empresas y 3 admins, 1 pasajero
docker compose exec api npm test       # 4 pruebas de asientos + 7 de integración (auth, roles, aislamiento)
```
Usuarios de prueba (clave `Admin12345`; el pasajero usa `Pasajero123`):
`admin@terminal.test` · `admin.flota@terminal.test` · `admin.illimani@terminal.test` · `admin.altiplano@terminal.test` · `diego@correo.test`

Endpoints: `POST /api/auth/registro` · `POST /api/auth/login` · `GET /api/auth/me` · `GET/POST /api/empresas` ·
`PATCH /api/empresas/:id/estado` · `GET/POST /api/buses` · `PATCH /api/buses/:id` · `GET /api/buses/:id/asientos`

## Frontend (prototipo de Figma integrado)
El frontend usa el prototipo exportado de Figma (React 19 + TypeScript + Tailwind v4, rutas con `#`).
- Conectadas a la API real (Sprint 1): `#/acceso` (login y registro), `#/empresa/buses`, `#/empresa/buses/nuevo`, `#/terminal/empresas`, `#/terminal/empresas/nueva`.
- Aún con datos de ejemplo (se conectan en su Sprint): búsqueda, viaje, reserva, pago, boletos, rutas, viajes, reportes, panel global.
- `#/pantallas` lista todas las pantallas del prototipo.

Si cambiaste de versión del proyecto (cambió el package.json del web), levanta así para reinstalar dependencias sin borrar la base de datos:
```bash
docker compose up --build --renew-anon-volumes
```
