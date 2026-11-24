-- =====================================================================
-- Modelo físico (Informe 4.3.1.7, Figura 17; diccionario Anexo 2, B1-B10)
-- 10 tablas. Cambios respecto al informe marcados con [AJUSTE].
-- =====================================================================
SET client_min_messages = warning;

CREATE TABLE empresas (
  id_empresa      SERIAL PRIMARY KEY,
  nombre          VARCHAR(100) NOT NULL UNIQUE,
  nit             VARCHAR(20),                  -- [AJUSTE] datos de contacto (mockup T03)
  telefono        VARCHAR(20),                  -- [AJUSTE]
  correo          VARCHAR(120),                 -- [AJUSTE]
  activa          BOOLEAN NOT NULL DEFAULT TRUE,
  fecha_registro  TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE usuarios (
  id_usuario           SERIAL PRIMARY KEY,
  nombre               VARCHAR(100) NOT NULL,
  documento_identidad  VARCHAR(20)  NOT NULL UNIQUE,
  telefono             VARCHAR(20),
  correo               VARCHAR(120) NOT NULL UNIQUE,
  password_hash        VARCHAR(100) NOT NULL,           -- bcrypt (RNF4)
  rol                  VARCHAR(20)  NOT NULL
                       CHECK (rol IN ('PASAJERO','ADMIN_EMPRESA','ADMIN_TERMINAL')),
  id_empresa           INTEGER REFERENCES empresas(id_empresa),
  -- un admin de empresa debe tener empresa; los demás no
  CONSTRAINT ck_usuario_empresa CHECK (
    (rol = 'ADMIN_EMPRESA' AND id_empresa IS NOT NULL) OR
    (rol <> 'ADMIN_EMPRESA' AND id_empresa IS NULL))
);

CREATE TABLE rutas (
  id_ruta              SERIAL PRIMARY KEY,
  id_empresa           INTEGER NOT NULL REFERENCES empresas(id_empresa),
  origen               VARCHAR(60) NOT NULL,
  destino              VARCHAR(60) NOT NULL,
  duracion_estimada_min INTEGER CHECK (duracion_estimada_min > 0),
  UNIQUE (id_empresa, origen, destino)
);

CREATE TABLE buses (
  id_bus         SERIAL PRIMARY KEY,
  id_empresa     INTEGER NOT NULL REFERENCES empresas(id_empresa),
  placa          VARCHAR(10) NOT NULL UNIQUE,
  tipo_servicio  VARCHAR(30) NOT NULL,
  capacidad      INTEGER NOT NULL CHECK (capacidad BETWEEN 1 AND 80),
  distribucion   VARCHAR(5) NOT NULL DEFAULT '2+2'      -- [AJUSTE] para dibujar el mapa
                 CHECK (distribucion IN ('2+2','2+1')),
  activo         BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE asientos (
  id_asiento  SERIAL PRIMARY KEY,
  id_bus      INTEGER NOT NULL REFERENCES buses(id_bus) ON DELETE CASCADE,
  numero      VARCHAR(5) NOT NULL,
  fila        INTEGER NOT NULL,                          -- [AJUSTE] geometría del mapa
  columna     INTEGER NOT NULL,                          -- [AJUSTE]
  piso        INTEGER NOT NULL DEFAULT 1,                -- [AJUSTE]
  UNIQUE (id_bus, numero)
);

CREATE TABLE viajes (
  id_viaje      SERIAL PRIMARY KEY,
  id_empresa    INTEGER NOT NULL REFERENCES empresas(id_empresa),
  id_ruta       INTEGER NOT NULL REFERENCES rutas(id_ruta),
  id_bus        INTEGER NOT NULL REFERENCES buses(id_bus),
  fecha_salida  DATE NOT NULL,
  hora_salida   TIME NOT NULL,
  tarifa        NUMERIC(10,2) NOT NULL CHECK (tarifa > 0),
  UNIQUE (id_bus, fecha_salida, hora_salida)
);

CREATE TABLE asientos_viaje (
  id_asiento_viaje  SERIAL PRIMARY KEY,
  id_viaje          INTEGER NOT NULL REFERENCES viajes(id_viaje) ON DELETE CASCADE,
  id_asiento        INTEGER NOT NULL REFERENCES asientos(id_asiento),
  estado            VARCHAR(10) NOT NULL DEFAULT 'LIBRE'
                    CHECK (estado IN ('LIBRE','RETENIDO','OCUPADO')),
  UNIQUE (id_viaje, id_asiento)
);

CREATE TABLE reservas (
  id_reserva        SERIAL PRIMARY KEY,
  id_asiento_viaje  INTEGER NOT NULL REFERENCES asientos_viaje(id_asiento_viaje),
  id_usuario        INTEGER REFERENCES usuarios(id_usuario),   -- [AJUSTE] nulo si es invitado
  token_invitado    VARCHAR(64),                               -- [AJUSTE] registro tardío
  estado            VARCHAR(10) NOT NULL DEFAULT 'RETENIDA'
                    CHECK (estado IN ('RETENIDA','PAGADA','EXPIRADA','CANCELADA')),
  fecha_creacion    TIMESTAMP NOT NULL DEFAULT now(),
  fecha_expiracion  TIMESTAMP NOT NULL,
  CONSTRAINT ck_reserva_titular CHECK (id_usuario IS NOT NULL OR token_invitado IS NOT NULL)
);
-- Un asiento no puede tener dos reservas RETENIDAS a la vez (defensa extra al bloqueo de fila)
CREATE UNIQUE INDEX ux_reserva_activa ON reservas(id_asiento_viaje) WHERE estado = 'RETENIDA';
-- Índice sugerido en la nota de B8 para la liberación automática
CREATE INDEX ix_reservas_estado_exp ON reservas(estado, fecha_expiracion);

CREATE TABLE pagos (
  id_pago      SERIAL PRIMARY KEY,
  id_reserva   INTEGER NOT NULL UNIQUE REFERENCES reservas(id_reserva),
  monto        NUMERIC(10,2) NOT NULL CHECK (monto > 0),
  codigo_qr    TEXT NOT NULL,
  estado       VARCHAR(10) NOT NULL DEFAULT 'PENDIENTE'
               CHECK (estado IN ('PENDIENTE','CONFIRMADO')),
  fecha_pago   TIMESTAMP
);

CREATE TABLE boletos (
  id_boleto           SERIAL PRIMARY KEY,
  id_pago             INTEGER NOT NULL UNIQUE REFERENCES pagos(id_pago),
  codigo_qr_abordaje  VARCHAR(64) NOT NULL UNIQUE,
  estado              VARCHAR(10) NOT NULL DEFAULT 'EMITIDO'
                      CHECK (estado IN ('EMITIDO','USADO')),
  fecha_emision       TIMESTAMP NOT NULL DEFAULT now()
);

-- Índices de consulta (RNF1: búsqueda < 3 s)
CREATE INDEX ix_viajes_busqueda ON viajes(fecha_salida, id_ruta);
CREATE INDEX ix_asientos_viaje_viaje ON asientos_viaje(id_viaje);
CREATE INDEX ix_usuarios_empresa ON usuarios(id_empresa);
