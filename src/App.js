import { HashRouter as Router, Route, Routes } from "react-router-dom";
import './App.css';
import LandingPage from './pages/landingPage/LandingPage';
import Login from "./pages/login/Login";
import SignUp from "./pages/signup/SignUp";
import Documentos from "./pages/documentos/documentos";
import Psicologos from "./pages/psicologos/Psicologos";
import Publicaciones from "./pages/publicaciones/Publicaciones";
import TestPsi from "./pages/test_psi/TestPsi";
import Dashboard from './pages/dashboard/Dashboard';
import Perfil from './pages/perfil/Perfil';
import AgregarPaciente from './pages/pacientes/agregar/AgregarPaciente';
import EditarPaciente from './pages/pacientes/editar/EditarPaciente';
import HistorialPaciente from './pages/pacientes/historial/HistorialPaciente';
import PacientesEliminados from './pages/pacientes/eliminados/PacientesEliminados';
import AgregarPsicologo from './pages/psicologos/agregar/AgregarPsicologo';
import PsicologosEliminados from './pages/psicologos/eliminados/PsicologosEliminados';
import Especializaciones from './pages/especializaciones/Especializaciones';
import TestConnectionPage from './pages/test-connection/TestConnectionPage';
import ProtectedRoute from './components/auth/ProtectedRoute';


function App() {
  return (
    <div className="App">
      <Router>
        <Routes>
          {/* Rutas públicas */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/test-connection" element={<TestConnectionPage />} />
          
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
        </Routes>
      </Router>
    </div>
  );
}

export default App;
