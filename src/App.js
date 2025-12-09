import { HashRouter as Router, Route, Routes, Navigate, useLocation } from "react-router-dom";
import './App.css';
import LandingPage from './pages/landingPage/LandingPage';
import Login from "./pages/login/Login";
import ForgotPassword from "./pages/login/ForgotPassword";
import ResetPassword from "./pages/login/ResetPassword";
import SignUp from "./pages/signup/SignUp";
import Documentos from "./pages/documentos/Documentos";
import Psicologos from "./pages/psicologos/Psicologos";
import Publicaciones from "./pages/publicaciones/Publicaciones";
import TestPsi from "./pages/test_psi/TestPsi";
import Dashboard from './pages/dashboard/Dashboard';
import Perfil from './pages/perfil/Perfil';
import Manuales from './pages/manuales/Manuales';
import AgregarPaciente from './pages/pacientes/agregar/AgregarPaciente';
import EditarPaciente from './pages/pacientes/editar/EditarPaciente';
import HistorialPaciente from './pages/pacientes/historial/HistorialPaciente';
import PacientesEliminados from './pages/pacientes/eliminados/PacientesEliminados';
import AgregarPsicologo from './pages/psicologos/agregar/AgregarPsicologo';
import PsicologosEliminados from './pages/psicologos/eliminados/PsicologosEliminados';
import Especializaciones from './pages/especializaciones/Especializaciones';
import TestConnectionPage from './pages/test-connection/TestConnectionPage';
import TestPostsApi from './pages/TestPostsApi';
import ProtectedRoute from './components/auth/ProtectedRoute';


function App() {
  return (
    <div className="App">
      <Router>
        <Routes>
          {/* Rutas públicas */}
          <Route path="/" element={<RootRouteHandler />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          {/* Ruta alternativa por si se accede directamente con la URL completa */}
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/test-connection" element={<TestConnectionPage />} />
          <Route path="/test-posts-api" element={<TestPostsApi />} />
          
          {/* Rutas protegidas (requieren autenticación) */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/perfil" element={
            <ProtectedRoute>
              <Perfil />
            </ProtectedRoute>
          } />
          <Route path="/documentos" element={
            <ProtectedRoute>
              <Documentos />
            </ProtectedRoute>
          } />
          <Route path="/publicaciones" element={
            <ProtectedRoute>
              <Publicaciones />
            </ProtectedRoute>
          } />
          <Route path="/test" element={
            <ProtectedRoute>
              <TestPsi />
            </ProtectedRoute>
          } />
          <Route path="/psicologos" element={
            <ProtectedRoute>
              <Psicologos />
            </ProtectedRoute>
          } />
          <Route path="/psicologos/agregar" element={
            <ProtectedRoute>
              <AgregarPsicologo />
            </ProtectedRoute>
          } />
          <Route path="/psicologos/eliminados" element={
            <ProtectedRoute>
              <PsicologosEliminados />
            </ProtectedRoute>
          } />
          <Route path="/especializaciones" element={
            <ProtectedRoute>
              <Especializaciones />
            </ProtectedRoute>
          } />
          <Route path="/pacientes/agregar" element={
            <ProtectedRoute>
              <AgregarPaciente />
            </ProtectedRoute>
          } />
          <Route path="/pacientes/editar/:id" element={
            <ProtectedRoute>
              <EditarPaciente />
            </ProtectedRoute>
          } />
          <Route path="/pacientes/historial/:id" element={
            <ProtectedRoute>
              <HistorialPaciente />
            </ProtectedRoute>
          } />
          <Route path="/pacientes/eliminados" element={
            <ProtectedRoute>
              <PacientesEliminados />
            </ProtectedRoute>
          } />
          <Route path="/manuales" element={
            <ProtectedRoute>
              <Manuales />
            </ProtectedRoute>
          } />
        </Routes>
      </Router>
    </div>
  );
}

// Componente para manejar la raíz y detectar parámetros de consulta
function RootRouteHandler() {
  const location = useLocation();
  
  // Si hay parámetros de consulta y uno de ellos es token, redirigir a reset-password
  if (location.search && location.search.includes('token=')) {
    return <Navigate to={`/reset-password${location.search}`} replace />;
  }
  
  // Verificar si hay doble slash en la URL
  const fullPath = window.location.pathname;
  if (fullPath.includes('//')) {
    
    // Normalizar el pathname
    let normalizedPath = fullPath;
    while (normalizedPath.includes('//')) {
      normalizedPath = normalizedPath.replace('//', '/');
    }
    
    // Si el path normalizado contiene reset-password, redirigir correctamente
    if (normalizedPath.includes('/reset-password')) {
      return <Navigate to={`/#${normalizedPath}${location.search}`} replace />;
    }
  }
  
  // En cualquier otro caso, mostrar la página de inicio normal
  return <LandingPage />;
}

export default App;
