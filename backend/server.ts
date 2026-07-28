import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import routes from './routes';
import dbConnect from './lib/db';

// Configurar variables de entorno desde el archivo .env principal del proyecto
dotenv.config({ path: path.join(__dirname, '../.env.local') });

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
app.listen(PORT, () => {
  console.log(`[ControlQR Backend] Server is running on http://localhost:${PORT}`);
});
