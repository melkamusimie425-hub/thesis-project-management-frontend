import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Spinner } from './ui';

/**
 * Guards a route. Optionally restricts it to a set of allowed roles.
 */
export default function ProtectedRoute({ roles, children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <Spinner label="Loading…" />;

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (roles && !roles.includes('*') && !roles.includes(user.role)) {
    return (
      <div className="content">
        <div className="alert alert-error">
          <span>⛔</span>
          <div>You do not have permission to view this page. Your role ({user.role}) is not authorized.</div>
        </div>
      </div>
    );
  }

  return children;
}
