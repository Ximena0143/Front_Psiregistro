import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';


(function() {
  // Rutas que debemos corregir (sin el slash inicial)
  const routesToFix = ['reset-password', 'forgot-password'];
  
  // Verificar si tenemos un doble slash o una ruta sin hash
  if (!window.location.hash) {
    // Normalizar la ruta eliminando posibles slashes duplicados
    let pathname = window.location.pathname;
    while (pathname.includes('//')) {
      pathname = pathname.replace('//', '/');
    }
    
    // Si después de normalizar, la ruta no es solo '/'
    if (pathname !== '/') {
      const path = pathname.substring(1); // Quitar el slash inicial
      const search = window.location.search;
      
      // Verificar si estamos en una ruta que necesita corrección
      for (const route of routesToFix) {
        if (path.startsWith(route)) {
          window.location.replace(`/#/${path}${search}`);
          break;
        }
      }
    }
  }
})();

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
