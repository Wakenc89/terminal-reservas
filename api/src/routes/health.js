import { Router } from 'express';
import { query } from '../config/db.js';

const router = Router();

// GET /api/health -> comprueba API + conexión a PostgreSQL y lista las tablas
router.get('/', async (_req, res) => {
  try {
    const { rows } = await query(
      "SELECT count(*)::int AS tablas FROM information_schema.tables WHERE table_schema='public'"
    );
    res.json({ api: 'ok', baseDeDatos: 'ok', tablas: rows[0].tablas });
  } catch (e) {
    res.status(500).json({ api: 'ok', baseDeDatos: 'error', detalle: e.message });
  }
});

export default router;
