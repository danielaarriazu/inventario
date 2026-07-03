import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LoginForm from './components/LoginForm';
import RegistroCargo from './components/RegistroCargo';
import Dashboard from './pages/Dashboard';
import Auxiliares from './pages/Auxiliares';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-100 flex flex-col">
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
        </Routes>
      </div>
    </BrowserRouter>
  );
}
export default App;