import React from 'react';
import NeonSpinner from './NeonSpinner';

interface GlobalLoadingSpinnerProps {
  loading: boolean;
  children: React.ReactNode;
  size?: number;
}

const GlobalLoadingSpinner: React.FC<GlobalLoadingSpinnerProps> = ({ 
  loading, 
  children, 
  size = 64 
}) => {
  if (loading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        background: '#000', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center' 
      }}>
        <NeonSpinner size={size} />
      </div>
    );
  }

  return <>{children}</>;
};

export default GlobalLoadingSpinner; 