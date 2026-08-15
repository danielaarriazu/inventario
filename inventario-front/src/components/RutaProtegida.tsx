import { Navigate } from 'react-router-dom';

interface Props {
  children: React.ReactNode;
}

// Si no hay token guardado, ni siquiera intenta renderizar la pantalla —
// redirige derecho al Login, en vez de dejar que la pantalla intente
// cargar datos y termine mostrando algo roto o en blanco.
//
// Si el token existe pero ya venció (sesión expirada en el servidor), cada
// pantalla ya lo maneja: sus pedidos a la API devuelven 401 y redirigen
// solas — este componente no interfiere con eso.
export default function RutaProtegida({ children }: Props) {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
}