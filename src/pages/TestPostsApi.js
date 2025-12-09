import React, { useEffect, useState } from 'react';
import api from '../services/api';

const TestPostsApi = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [posts, setPosts] = useState([]);
  const [rawResponse, setRawResponse] = useState(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        
        // Método 1: Usando fetch directo
        console.log("Método 1: Iniciando fetch directo");
        const fetchResponse = await fetch('http://localhost:8000/api/landing/post/index', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Origin': 'http://localhost:3000'
          },
          credentials: 'include'
        });
        
        const fetchData = await fetchResponse.json();
        console.log("Respuesta de fetch directo:", fetchData);
        
        // Método 2: Usando el servicio api
        console.log("Método 2: Iniciando petición con api service");
        const apiResponse = await api.get('/landing/post/index');
        console.log("Respuesta de api service:", apiResponse);
        setRawResponse(apiResponse);
        
        if (apiResponse && apiResponse.data && apiResponse.data.data) {
          setPosts(apiResponse.data.data);
          console.log("Posts procesados:", apiResponse.data.data);
        } else {
          console.error("Estructura de respuesta inesperada:", apiResponse);
          setError("Estructura de respuesta inesperada");
        }
      } catch (err) {
        console.error("Error al obtener posts:", err);
        setError(err.message || "Error al obtener publicaciones");
      } finally {
        setLoading(false);
      }
    };
    
    fetchPosts();
  }, []);

  return (
    <div style={{ padding: '20px' }}>
      <h1>Prueba de API de Publicaciones</h1>
      
      {loading ? (
        <p>Cargando...</p>
      ) : error ? (
        <div>
          <h2>Error:</h2>
          <pre>{error}</pre>
        </div>
      ) : (
        <div>
          <h2>Respuesta Raw:</h2>
          <pre style={{ whiteSpace: 'pre-wrap', backgroundColor: '#f5f5f5', padding: '10px', borderRadius: '5px' }}>
            {JSON.stringify(rawResponse, null, 2)}
          </pre>
          
          <h2>Publicaciones Procesadas ({posts.length}):</h2>
          {posts.length === 0 ? (
            <p>No se encontraron publicaciones</p>
          ) : (
            <div>
              {posts.map(post => (
                <div key={post.id} style={{ marginBottom: '20px', border: '1px solid #ddd', padding: '15px', borderRadius: '8px' }}>
                  <h3>{post.tittle}</h3>
                  <p>{post.description}</p>
                  <p>Tipo: {post.post_type}</p>
                  <p>Creado: {new Date(post.created_at).toLocaleString()}</p>
                  {post.post_type === 'image' && post.signed_url && (
                    <img src={post.signed_url} alt={post.tittle} style={{ maxWidth: '100%', maxHeight: '300px' }} />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TestPostsApi;
