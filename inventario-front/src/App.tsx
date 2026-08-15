import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginForm from './components/LoginForm';
import RegistroCargo from './components/RegistroCargo';
import RutaProtegida from './components/RutaProtegida';
import Dashboard from './pages/Dashboard';
import Menu from './pages/Menu';
import Movimientos from './pages/Movimientos';
import Auxiliares from './pages/Auxiliares';
import Departamentos from './pages/Departamentos';
import Divisiones from './pages/Divisiones';
import Oficinas from './pages/Oficinas';
import Equipos from './pages/Equipos';
import AltaPlanilla from './pages/AltaPlanilla';
import Ficha from './pages/Ficha';
import ImprimirFicha from './pages/ImprimirFicha';
import ImprimirOficina from './pages/ImprimirOficina';
import ImprimirQRsOficina from './pages/ImprimirQRsOficina';
import FichaPublica from './pages/FichaPublica';
import ImprimirFichaPublica from './pages/ImprimirFichaPublica';
import HistorialMovimientos from './pages/HistorialMovimientos';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-fondo flex flex-col">
        <Routes>
          <Route path="/" element={
            <div className="flex-grow flex items-center justify-center"><LoginForm /></div>
          } />
          <Route path="/registro" element={
            <div className="flex-grow flex items-center justify-center"><RegistroCargo /></div>
          } />

          {/* Rutas públicas — a las que llega alguien que escaneó el QR,
              sin necesidad de login. Deliberadamente fuera de RutaProtegida */}
          <Route path="/publico/equipos/:id" element={<FichaPublica />} />
          <Route path="/publico/equipos/:id/imprimir" element={<ImprimirFichaPublica />} />

          <Route path="/dashboard" element={<RutaProtegida><Dashboard /></RutaProtegida>} />
          <Route path="/menu" element={<RutaProtegida><Menu /></RutaProtegida>} />
          <Route path="/movimientos" element={<RutaProtegida><Movimientos /></RutaProtegida>} />
          <Route path="/dashboard/auxiliares" element={<RutaProtegida><Auxiliares /></RutaProtegida>} />
          <Route path="/dashboard/destinos/:idDestino/departamentos" element={<RutaProtegida><Departamentos /></RutaProtegida>} />
          <Route path="/dashboard/departamentos/:idDepartamento/divisiones" element={<RutaProtegida><Divisiones /></RutaProtegida>} />
          <Route path="/dashboard/divisiones/:idDivision/oficinas" element={<RutaProtegida><Oficinas /></RutaProtegida>} />
          <Route path="/dashboard/equipos" element={<RutaProtegida><Equipos /></RutaProtegida>} />
          <Route path="/dashboard/equipos/nuevo" element={<RutaProtegida><AltaPlanilla /></RutaProtegida>} />
          <Route path="/equipos/:id" element={<RutaProtegida><Ficha /></RutaProtegida>} />
          <Route path="/equipos/:id/imprimir" element={<RutaProtegida><ImprimirFicha /></RutaProtegida>} />
          <Route path="/dashboard/oficinas/:idOficina/imprimir" element={<RutaProtegida><ImprimirOficina /></RutaProtegida>} />
          <Route path="/dashboard/oficinas/:idOficina/imprimir-qrs" element={<RutaProtegida><ImprimirQRsOficina /></RutaProtegida>} />
          <Route path="/dashboard/historial" element={<RutaProtegida><HistorialMovimientos /></RutaProtegida>} />

          {/* Cualquier ruta que no matchee con nada de arriba — en vez de
              quedar en blanco, manda al Login */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
export default App;