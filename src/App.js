import {BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import './App.css';
import LandingPage from './pages/LandingPage';
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import Documentos from "./pages/documentos/documentos";
import Publicaciones from "./pages/publicaciones/publicaciones";
import Test from "./pages/test/test";
import Dashboard from './pages/dashboard/Dashboard';


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
          <Route path="/test" element={<Test />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
