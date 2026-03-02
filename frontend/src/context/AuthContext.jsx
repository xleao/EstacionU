
import { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const verifyToken = async () => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const response = await fetch('/api/users/me', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (response.ok) {
                    const userData = await response.json();
                    setUser(userData);
                } else {
                    localStorage.removeItem('token');
                    setUser(null);
                }
            } catch (error) {
                console.error("Auth verify error:", error);
                localStorage.removeItem('token');
                setUser(null);
            }
        }
        setLoading(false);
    };

    useEffect(() => {
        verifyToken();
    }, []);

    const login = async (email, password) => {
        const formData = new URLSearchParams();
        formData.append('username', email);
        formData.append('password', password);

        const response = await fetch('/api/token', {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Error al iniciar sesión');
        }

        const data = await response.json();
        localStorage.setItem('token', data.access_token);

        // Fetch user data immediately to set state and navigate
        const userRes = await fetch('/api/users/me', {
            headers: { Authorization: `Bearer ${data.access_token}` }
        });

        if (userRes.ok) {
            const userData = await userRes.json();
            setUser(userData);

            // Navigate based on role
            const role = (userData.role || '').toLowerCase();
            if (['admin', 'administrador'].includes(role)) {
                navigate('/admin/dashboard');
            } else if (['mentor', 'graduate', 'egresado'].includes(role)) {
                navigate('/mentor/dashboard');
            } else {
                navigate('/student/dashboard');
            }
        } else {
            localStorage.removeItem('token');
            setUser(null);
            throw new Error('Error al obtener perfil de usuario');
        }
    };

    const loginWithGoogle = async (googleToken) => {
        const response = await fetch('/api/google', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ credential: googleToken }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Error al autenticar con Google');
        }

        const data = await response.json();
        localStorage.setItem('token', data.access_token);

        const userRes = await fetch('/api/users/me', {
            headers: { Authorization: `Bearer ${data.access_token}` }
        });

        if (userRes.ok) {
            const userData = await userRes.json();

            setUser(userData);
            const role = (userData.role || '').toLowerCase();
            if (['admin', 'administrador'].includes(role)) {
                navigate('/admin/dashboard');
            } else if (['mentor', 'graduate', 'egresado'].includes(role)) {
                navigate('/mentor/dashboard');
            } else {
                navigate('/student/dashboard');
            }
            return { is_new: data.is_new };
        } else {
            localStorage.removeItem('token');
            setUser(null);
            throw new Error('Error al obtener perfil de usuario');
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
        navigate('/');
    };

    return (
        <AuthContext.Provider value={{ user, login, loginWithGoogle, logout, loading, refreshUser: verifyToken }}>
            {/* Show loading spinner or nothing while checking auth? */}
            {!loading ? children : null}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
