import {BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import './App.css';
import LandingPage from './pages/landingPage/LandingPage';
import Login from "./pages/login/Login";
import SignUp from "./pages/signup/SignUp";
import Documentos from "./pages/documentos/Documentos";
import Psicologos from "./pages/psicologos/Psicologos";
import Publicaciones from "./pages/publicaciones/Publicaciones";
import TestPsi from "./pages/test_psi/TestPsi";
import Dashboard from './pages/dashboard/Dashboard';
import Perfil from './pages/perfil/Perfil';
import AgregarPaciente from './pages/pacientes/agregar/AgregarPaciente';
import EditarPaciente from './pages/pacientes/editar/EditarPaciente';
import HistorialPaciente from './pages/pacientes/historial/HistorialPaciente';
import AgregarPsicologo from './pages/psicologos/agregar/AgregarPsicologo';


function App() {
  return (
    <div className="App">
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/documentos" element={<Documentos />} />
          <Route path="/publicaciones" element={<Publicaciones />} />
          <Route path="/test" element={<TestPsi />} />
          <Route path="/psicologos" element={<Psicologos />} />
          <Route path="/perfil" element={<Perfil />} />
          <Route path="/pacientes/agregar" element={<AgregarPaciente />} />
          <Route path="/pacientes/editar/:id" element={<EditarPaciente />} />
          <Route path="/pacientes/historial/:id" element={<HistorialPaciente />} />
          <Route path="/psicologos/agregar" element={<AgregarPsicologo />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
