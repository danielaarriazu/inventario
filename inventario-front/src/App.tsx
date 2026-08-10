import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LoginForm from './components/LoginForm';
import RegistroCargo from './components/RegistroCargo';
import Dashboard from './pages/Dashboard';
import Auxiliares from './pages/Auxiliares';
import Departamentos from './pages/Departamentos';

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
          
          {/* Ruta actualizada sin caracteres conflictivos */}
          <Route path="/dashboard/auxiliares" element={<Auxiliares />} />
          <Route path="/dashboard/destinos/:idDestino/departamentos" element={<Departamentos />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
export default App;