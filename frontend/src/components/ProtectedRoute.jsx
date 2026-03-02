import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
    const { user, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!user) {
        // No autenticado: siempre al inicio.
        return <Navigate to="/" state={{ from: location }} replace />;
    }

    const role = (user.role || '').toLowerCase();
    const path = location.pathname.toLowerCase();

    // Protección extra: si un usuario que NO es admin intenta entrar a rutas de admin,
    // lo redirigimos automáticamente al dashboard correspondiente a su rol.
    const isAdminPath = path.startsWith('/admin');
    const isAdminUser = ['admin', 'administrador'].includes(role);

    if (isAdminPath && !isAdminUser) {
        if (['mentor', 'graduate', 'egresado'].includes(role)) {
            return <Navigate to="/mentor/dashboard" replace />;
        }
        // Por defecto cualquier otro rol va al dashboard de estudiante
        return <Navigate to="/student/dashboard" replace />;
    }

    return children;
};

export default ProtectedRoute;
