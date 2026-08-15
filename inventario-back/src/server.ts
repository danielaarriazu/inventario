import 'dotenv/config';
import express from 'express';
import cros from 'cors';
import path from 'path';
import destinoRoutes from './routes/destino.routes';
import departamentoRoutes from './routes/departamento.routes';
import divisionRoutes from './routes/division.routes';
import oficinaRoutes from './routes/oficina.routes';
import equipoRoutes from './routes/equipo.routes';
import auditoriaRoutes from './routes/auditoria.routes';
import reporteRoutes from './routes/reporte.routes';
import authRoutes from './routes/auth.routes';
import cargoRoutes from './routes/cargo.routes';
import publicoRoutes from './routes/publico.routes';


import swaggerUi from 'swagger-ui-express';
import swaggerDocument from './docs/swagger.json';

import prisma from './config/db';

const app = express();
app.use(cros());
app.use(express.json());

// Endpoint liviano para "despertar" tanto el servidor (Render) como la base
// (Neon) — el front lo llama apenas carga la pantalla de Login, antes de
// que la persona termine de tipear sus credenciales
app.get('/api/status', async (req, res) => {
  try {
    await prisma.cargo.count();
    res.json({ mensaje: '¡El servidor del inventario está corriendo perfecto!' });
  } catch (error) {
    res.status(503).json({ mensaje: 'El servidor está despertando, probá de nuevo en unos segundos' });
  }
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use('/api/destinos', destinoRoutes);
app.use('/api/departamentos', departamentoRoutes); 
app.use('/api/divisiones', divisionRoutes);      
app.use('/api/equipos', equipoRoutes);
app.use('/api/oficinas', oficinaRoutes);
app.use('/api/auditoria', auditoriaRoutes);
app.use('/api/reportes', reporteRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/cargo', cargoRoutes);
app.use('/api/publico', publicoRoutes);

// A partir de acá, front y back viven en el mismo servicio — servimos el
// build del frontend directamente desde acá, en vez de depender del
// mecanismo de "Static Site" de Render (que no estaba aplicando bien el
// rewrite pese a estar configurado correctamente).
const frontendDistPath = path.join(__dirname, '../../inventario-front/dist');
app.use(express.static(frontendDistPath));

// Comodín: cualquier ruta que NO sea /api (todas las pantallas de React)
// devuelve el index.html, para que React Router se haga cargo del resto.
// Va al final a propósito, después de todas las rutas /api de arriba.
app.get('/*splat', (req, res) => {
  res.sendFile(path.join(frontendDistPath, 'index.html'));
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});