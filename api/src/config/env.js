import 'dotenv/config';

export const env = {
  port: Number(process.env.API_PORT || 4000),
  db: {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 5432),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  },
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '8h',
  holdMinutes: Number(process.env.HOLD_MINUTES || 8),
  cronSeconds: Number(process.env.CRON_SECONDS || 30),
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
};

if (!env.jwtSecret || env.jwtSecret.length < 16) {
  console.error('Falta JWT_SECRET (mínimo 16 caracteres) en el archivo .env');
  process.exit(1);
}
