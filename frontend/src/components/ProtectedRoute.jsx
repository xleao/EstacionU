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

    const hasNoRole = !role || role === 'user' || role === 'usuario';

    // 1. If user has NO ROLE, they can only be on /select-role
    if (hasNoRole) {
        if (path !== '/select-role') {
            return <Navigate to="/select-role" replace />;
        }
        return children;
    }

    // 2. If user has a role but hasn't completed onboarding, they can only be on /complete-profile
    if (user.onboarding_completo === false) {
        if (path !== '/complete-profile') {
            return <Navigate to="/complete-profile" replace />;
        }
        return children;
    }

    // 3. User has completed onboarding, prevent them from accessing onboarding paths
    if (path === '/select-role' || path === '/complete-profile') {
        const isAdminUser = ['admin', 'administrador'].includes(role);
        if (isAdminUser) {
            return <Navigate to="/admin/dashboard" replace />;
        } else if (['mentor', 'graduate', 'egresado'].includes(role)) {
            return <Navigate to="/mentor/dashboard" replace />;
        } else {
            return <Navigate to="/student/dashboard" replace />;
        }
    }

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
