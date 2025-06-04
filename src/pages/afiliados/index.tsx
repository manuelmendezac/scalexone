import React from 'react';
import ProtectedRoute from '../../components/ProtectedRoute';
import AfiliadosLayout from '../../components/afiliados/AfiliadosLayout';
import AfiliadosDashboard from '../../components/afiliados/AfiliadosDashboard';

const AfiliadosPage = () => {
  return (
    <ProtectedRoute>
      <AfiliadosLayout>
        <AfiliadosDashboard />
      </AfiliadosLayout>
    </ProtectedRoute>
  );
};

export default AfiliadosPage; 