import React from 'react';
import ProtectedRoute from '../../components/ProtectedRoute';
import MarketingAfiliadosPanel from '../../components/afiliados/MarketingAfiliadosPanel';

const AfiliadosPage = () => {
  return (
    <ProtectedRoute>
      <MarketingAfiliadosPanel />
    </ProtectedRoute>
  );
};

export default AfiliadosPage; 