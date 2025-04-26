import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import authService from '../../services/auth';
import Swal from 'sweetalert2';

/**
 * Componente que protege rutas que requieren autenticación
 * Si el usuario no está autenticado, redirige a la página de login
 */
const ProtectedRoute = ({ children }) => {
  const location = useLocation();
  const isAuthenticated = authService.isAuthenticated();

  useEffect(() => {
    // Verificar autenticación cada vez que cambia la ruta
    if (!isAuthenticated) {
      console.log('Usuario no autenticado, redirigiendo a login');
    }
  }, [location.pathname, isAuthenticated]);

  // Si no está autenticado, mostrar una alerta y redirigir a login
  if (!isAuthenticated) {
    // Solo mostrar la alerta si viene de una página interna (no al cargar directamente la ruta)
    if (location.key) {
      Swal.fire({
        title: 'Sesión expirada',
        text: 'Tu sesión ha expirado o has cerrado sesión. Por favor, inicia sesión nuevamente.',
        icon: 'warning',
        timer: 2000,
        showConfirmButton: false
      });
    }
    
    // Redirigir a login y reemplazar la entrada en el historial para prevenir navegación hacia atrás
    return <Navigate to="/login" replace />;
  }

  // Si está autenticado, renderizar los hijos (componente protegido)
  return children;
};

export default ProtectedRoute;
