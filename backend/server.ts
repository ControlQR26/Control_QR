import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import routes from './routes';
import dbConnect from './lib/db';

// Configurar variables de entorno y zona horaria
process.env.TZ = 'America/Bogota';
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());

// Conexión a la base de datos
dbConnect()
  .then(() => {
    console.log('Database initialized successfully.');
  })
  .catch((err) => {
    console.error('Failed to initialize database:', err);
  });

// Rutas de la API
app.use('/api', routes);

// Ruta base informativa
app.get('/', (req, res) => {
  res.json({
    name: 'ControlQR API Server',
    status: 'running',
    version: '1.0.0'
  });
});

// Iniciar servidor
const server = app.listen(Number(PORT), '0.0.0.0', () => {
  console.log(`[ControlQR Backend] Server is running on http://0.0.0.0:${PORT}`);
});

// Configuración de timeouts recomendada para Render / Proxies
server.keepAliveTimeout = 120000;
server.headersTimeout = 125000;
