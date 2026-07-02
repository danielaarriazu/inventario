import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LoginForm from './components/LoginForm';
import RegistroCargo from './components/RegistroCargo';

function App() {
  return (
    // BrowserRouter envuelve la app para permitir la navegación por URLs
    <BrowserRouter>
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <Routes>
          {/* Cuando la URL está vacía (/), muestra el Login */}
          <Route path="/" element={<LoginForm />} />
          
          {/* Cuando la URL es /registro, muestra el formulario de Alta */}
          <Route path="/registro" element={<RegistroCargo />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;