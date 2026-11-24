# Guía de desarrollo paso a paso (con Docker)
Cada paso indica **qué hacemos**, **por qué** y **dónde está justificado en el Informe**.

## Decisiones de partida (las tomé yo; dime si cambias alguna)
| # | Decisión | Justificación |
|---|---|---|
| 1 | **1 asiento por compra** | RF19/RF20 y la Fig. 9 se resuelven con una sola fila bloqueada; simplifica pago y boleto (HU15–16). Se declara en 3.3 como limitación. |
| 2 | **Registro tardío con "invitado"**: `reservas.id_usuario` pasa a ser opcional y se agrega `token_invitado`; al iniciar sesión la reserva se reasigna al usuario. | Tus mockups (P04) muestran el asiento retenido con cuenta regresiva *antes* de iniciar sesión. Es la única forma de cumplir RF5/HU13 y a la vez RF19. |
| 3 | **Geometría del bus**: `asientos` gana `fila`, `columna`, `piso` y `buses` gana `distribucion` (2+2 / 2+1). | Sin esto no se puede dibujar el mapa de asientos (RF10, RF18, Mockup P03). |
| 4 | **Actualización de asientos por polling** (cada 3–5 s) | Cumple RNF3 (<5 s) sin WebSockets ni infraestructura extra (1.4: "sin necesidad de colas de mensajes"). |
| 5 | Pago **simulado** | Ya definido en 3.3 (fuera de alcance: pasarela real). |

> Estos ajustes alteran el Informe en 4 lugares (Fig. 17, Anexo 2 tablas B3/B4/B5/B7, 3.3 y RF5). Los marcamos `[AJUSTE]` en el SQL y los actualizamos en el Informe cuando termines el Sprint 1.

---
## PASO 0 – Entorno Docker y esqueleto  ✅ (ya generado en `terminal-reservas/`)
**Qué:** `docker-compose.yml` con 3 contenedores (`db`, `api`, `web`), `.env`, esquema SQL de las 10 tablas, API mínima con `/api/health` y un frontend React+Tailwind que consulta ese endpoint.
**Por qué Docker:** el Informe 3.5 fija que "el desarrollo y las pruebas se realizan en un entorno local controlado". Docker garantiza que PostgreSQL 16, Node 22 y las dependencias sean idénticos en tu PC, en la de tu docente y en la defensa. Evita el "en mi máquina sí funciona".
**Por qué 3 contenedores:** cada uno es una capa de la **arquitectura cliente-servidor en tres capas** (4.3.1.9, Fig. 19): presentación (React+Tailwind), lógica (Node+Express) y datos (PostgreSQL). Respeta RNF12 (MVC desacoplado: la interfaz y el servidor solo hablan por API REST).
**Por qué `db/init/01_schema.sql`:** es el **diagrama físico** (4.3.1.7, Fig. 17) hecho código. Incluye los `CHECK` de estado del Anexo 2 y un índice `(estado, fecha_expiracion)` que la nota de la tabla B8 sugiere para la liberación automática.
**Por qué bcrypt/JWT/helmet/zod en dependencias:** RNF4 (contraseñas cifradas, HTTPS), RNF5 (tokens), RNF6 (protección contra ataques). Zod valida entradas (evita datos basura).
**Cómo verificar:** `docker compose up --build` → http://localhost:5173 muestra "Tablas creadas: 10".
**Evidencia para el Informe:** captura de pantalla de los 3 contenedores corriendo → Figura en 4.3.2 (Sprint 0).

## PASO 1 – Control de versiones y tablero Scrum
**Qué:** repositorio Git (`main` + ramas `feature/…`), commits por historia de usuario (`HU1: registro de usuario`), tablero de GitHub Projects con las 23 HU del Backlog y 5 Sprints.
**Por qué:** Scrum (4.1) exige transparencia e inspección; el tablero es la evidencia del Sprint Backlog (Tabla 7) y de la revisión/retrospectiva de cada Sprint. Un commit por HU permite demostrar al docente (Product Owner) qué se entregó en cada Sprint.

## PASO 2 – Sprint 1: Sesiones y empresas (HU1–HU5, 11 pts, 76 h)
Orden interno:
1. **Semillas (`02_seed.sql` + script):** 1 admin de terminal, 3 empresas, 3 admins de empresa. *Justifica:* RF6/RF4 (el admin de terminal registra empresas y sus administradores; no se auto-registran).
2. **Registro y login (HU1, HU2; RF1, RF2):** `POST /api/auth/registro`, `POST /api/auth/login`; contraseña con bcrypt; JWT con `id`, `rol`, `id_empresa` (Fig. 8). *Por qué:* RNF4/RNF5 y exactamente la secuencia de la Fig. 8 (401 si credenciales inválidas).
3. **Middleware de token, rol y empresa (HU3; RF4, RF8):** `autenticar`, `exigirRol(...)`, `filtrarPorEmpresa`. *Por qué:* es el **aislamiento multi-empresa**, la novedad científica del proyecto (1.4) y RNF7. Se prueba con un test: el admin de Flota Andina no puede ver buses de Expreso Illimani.
4. **CRUD de empresas (HU4; RF6, RF7)** — solo ADMIN_TERMINAL; activar/desactivar.
5. **CRUD de buses + generación de asientos (HU5; RF9–RF11):** al crear un bus se insertan sus N asientos con `fila/columna` según la distribución. *Por qué:* RF10 lo exige y alimenta el mapa de asientos.
6. **Pantallas web:** P04 (login/registro), A02–A03 (buses), T02–T03 (empresas) tomadas de tus mockups de Figma.
**Pruebas:** Jest/Supertest (o `node --test`): login correcto/incorrecto, acceso cruzado entre empresas.
**Evidencia para el Informe:** capturas de pantallas reales vs. mockups, y resultados de pruebas → 4.3.2 "Sprint 1".

## PASO 3 – Sprint 2: Viajes y búsqueda (HU6–HU10, 13 pts, 78 h)
Rutas → programar viajes (al crear un viaje se generan sus `asientos_viaje` en estado LIBRE) → búsqueda por destino+fecha con filtros → detalle y mapa de asientos (solo lectura).
**Por qué en este orden:** no puedes buscar viajes sin viajes ni mostrar un mapa sin `asientos_viaje`. Cumple RNF1 (<3 s) con los índices ya creados.
**Pantallas:** P01, P02, P03 (lectura), A04, A05.

## PASO 4 – Sprint 3: Reserva con control de concurrencia (HU11–HU13, 11 pts, 90 h)  ← el de mayor riesgo
1. `POST /api/reservas`: transacción con `SELECT … FOR UPDATE` sobre el `asiento_viaje`; si LIBRE → RETENIDO + reserva con expiración a +8 min (201); si no → rollback y 409 (Fig. 9, Fig. 13).
2. **Tarea `node-cron`** cada 30 s que expira reservas vencidas y libera asientos (Fig. 10, RF21).
3. Cuenta regresiva en el frontend + polling del mapa (RF22, RNF3).
4. **Registro tardío** con `token_invitado` (RF5, HU13).
5. **Prueba de concurrencia:** lanzar 20 peticiones simultáneas al mismo asiento → exactamente 1 responde 201 y 19 responden 409 (RNF13).
**Por qué es crítico:** es el **aporte ingenieril** de 1.4. Esta prueba es la evidencia principal para tu defensa.
**Pantallas:** P03 (selección real), P04 (banner con cuenta regresiva), P10, P11.

## PASO 5 – Sprint 4: Pago y boleto (HU14–HU17, 9 pts, 66 h)
Resumen de compra → generar QR de pago (`qrcode`) → simulación de confirmación en transacción (verifica vigencia, marca PAGADA y OCUPADO, emite boleto) → "Mis boletos".
**Por qué:** Fig. 11 y Fig. 14 definen la secuencia; la verificación de vigencia **dentro** de la transacción evita cobrar un asiento ya liberado.
**Pantallas:** P05–P08.

## PASO 6 – Sprint 5: Administración y abordaje (HU18–HU23, 13 pts, 74 h)
Verificación de QR (VÁLIDO / YA_USADO / NO_CORRESPONDE, Fig. 12), reportes de ocupación, panel global, perfil.
**Pantallas:** A01, A06, A07, T01, P09.

## PASO 7 – Cierre
Pruebas de rendimiento (RNF1–RNF2), respaldo de BD con `pg_dump` (RNF14), manual de instalación (este README), actualización del Informe (nuevas figuras: capturas reales, árbol de problemas, mockups; Fig. 1/16/18 rehechas).

---
## Qué hacemos ahora
**Tú:** instala Docker Desktop, descomprime `terminal-reservas.zip`, `cp .env.example .env`, `docker compose up --build`, y dime si ves "Tablas creadas: 10".
**Yo (siguiente turno):** Sprint 1 — semillas, autenticación (bcrypt + JWT), middleware de roles/empresa, y sus pruebas.
