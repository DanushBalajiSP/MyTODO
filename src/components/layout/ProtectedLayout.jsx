import { Navigate, Outlet } from 'react-router';
import { useAuth } from '../../hooks/useAuth';
import Loader from '../common/Loader';

const ProtectedLayout = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <Loader fullscreen text="Checking authentication..." />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedLayout;
