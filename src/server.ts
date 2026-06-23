import express from 'express';
import cros from 'cors';
import destinoRoutes from './routes/destino.routes';
import departamentoRoutes from './routes/departamento.routes';
import divisionRoutes from './routes/division.routes';

const app = express();
app.use(cros());
app.use(express.json());

app.get('/api/status', (req, res) => {
  res.json({ mensaje: '¡El servidor del inventario está corriendo perfecto!' });
});

app.use('/api/destinos', destinoRoutes);
app.use('/api/departamentos', departamentoRoutes); 
app.use('/api/divisiones', divisionRoutes);      

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});