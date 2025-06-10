import { Navigate } from 'react-router-dom';
import useNeuroState from '../store/useNeuroState';

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { userName } = useNeuroState();
  console.log('ProtectedRoute', window.location.pathname, userName);
  const isLoggedIn = userName && userName !== 'Invitado';
  if (!isLoggedIn) {
    return <Navigate to="/" replace />;
  }
  return children;
};

export default ProtectedRoute; 