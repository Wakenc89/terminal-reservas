import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env } from './config/env.js';
import health from './routes/health.js';
import auth from './routes/auth.js';
import empresas from './routes/empresas.js';
import buses from './routes/buses.js';
import { errorHandler } from './middleware/errorHandler.js';

export const app = express();

app.use(helmet());                                   // cabeceras seguras (RNF6)
app.use(cors({ origin: env.corsOrigin }));           // solo el frontend autorizado
app.use(express.json());

app.use('/api/health', health);
app.use('/api/auth', auth);          // Sprint 1
app.use('/api/empresas', empresas);  // Sprint 1
app.use('/api/buses', buses);        // Sprint 1
// Sprint 1 -> /api/auth, /api/empresas, /api/buses
// Sprint 2 -> /api/rutas, /api/viajes
// Sprint 3 -> /api/reservas
// Sprint 4 -> /api/pagos, /api/boletos
// Sprint 5 -> /api/abordaje, /api/reportes

app.use((_req, res) => res.status(404).json({ error: 'Ruta no encontrada' }));
app.use(errorHandler);
