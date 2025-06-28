import React from 'react';
import ProtectedRoute from '../../components/ProtectedRoute';
import AfiliadosLayout from '../../components/afiliados/AfiliadosLayout';
import MarketingAfiliadosPanel from '../../components/afiliados/MarketingAfiliadosPanel';

const AfiliadosPage = () => {
  return (
    <ProtectedRoute>
      <AfiliadosLayout>
        <MarketingAfiliadosPanel />
      </AfiliadosLayout>
    </ProtectedRoute>
  );
};

export default AfiliadosPage; 