import React, { useState, useEffect } from 'react';
import api from '../services/api';

/**
 * Componente para probar la conexión con el backend
 */
const TestConnection = () => {
  // Estado para almacenar la respuesta del servidor
  const [response, setResponse] = useState(null);
  // Estado para manejar errores
  const [error, setError] = useState(null);
  // Estado para manejar la carga
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Función para probar la conexión con el backend
    const testConnection = async () => {
      try {
        setLoading(true);
        // Hacemos una petición al endpoint de prueba
        const data = await api.get('/test');
        setResponse(data);
        setError(null);
      } catch (err) {
        console.error('Error al conectar con el backend:', err);
        setError('No se pudo conectar con el servidor. Verifica que el backend esté funcionando.');
        setResponse(null);
      } finally {
        setLoading(false);
      }
    };

    // Llamamos a la función cuando el componente se monta
    testConnection();
  }, []);

  return (
    <div className="test-connection-container">
      <h2>Prueba de Conexión con el Backend</h2>
      
      {loading && (
        <div className="loading">
          <p>Conectando con el servidor...</p>
        </div>
      )}

      {error && !loading && (
        <div className="error-container">
          <h3>Error de Conexión</h3>
          <p>{error}</p>
          <div className="technical-details">
            <h4>Detalles técnicos:</h4>
            <p>Asegúrate de que:</p>
            <ul>
              <li>El servidor Laravel esté ejecutándose en <code>http://localhost:8000</code></li>
              <li>El endpoint <code>/api/test</code> esté disponible en el backend</li>
              <li>La configuración CORS permita conexiones desde el frontend</li>
            </ul>
          </div>
        </div>
      )}

      {response && !loading && (
        <div className="success-container">
          <h3>Conexión Exitosa!</h3>
          <div className="response-data">
            <h4>Respuesta del servidor:</h4>
            <pre>{JSON.stringify(response, null, 2)}</pre>
          </div>
        </div>
      )}
    </div>
  );
};

export default TestConnection;
