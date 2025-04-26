import React from 'react';
import TestConnection from '../../components/TestConnection';

/**
 * Página para probar la conexión con el backend
 */
const TestConnectionPage = () => {
  return (
    <div className="test-connection-page">
      <div className="container">
        <TestConnection />
      </div>
    </div>
  );
};

export default TestConnectionPage;
