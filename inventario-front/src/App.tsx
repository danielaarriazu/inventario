import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LoginForm from './components/LoginForm';
import RegistroCargo from './components/RegistroCargo';
import Dashboard from './pages/Dashboard';
import Menu from './pages/Menu';
import Movimientos from './pages/Movimientos';
import Auxiliares from './pages/Auxiliares';
import Departamentos from './pages/Departamentos';
import Divisiones from './pages/Divisiones';
import Oficinas from './pages/Oficinas';

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
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/menu" element={<Menu />} />
          <Route path="/movimientos" element={<Movimientos />} />
          
          {/* Ruta actualizada sin caracteres conflictivos */}
          <Route path="/dashboard/auxiliares" element={<Auxiliares />} />
          <Route path="/dashboard/destinos/:idDestino/departamentos" element={<Departamentos />} />
          <Route path="/dashboard/departamentos/:idDepartamento/divisiones" element={<Divisiones />} />
          <Route path="/dashboard/divisiones/:idDivision/oficinas" element={<Oficinas />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
export default App;