
import { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const location = useLocation();

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

                    // If user hasn't completed onboarding, redirect to complete-profile or select-role
                    // (only if not already on an onboarding page)
                    const currentPath = window.location.pathname;
                    const onboardingPaths = ['/select-role', '/complete-profile', '/login', '/register', '/reset-password'];
                    const isOnboardingPath = onboardingPaths.includes(currentPath) || currentPath === '/';

                    if (!isOnboardingPath && userData.onboarding_completo === false) {
                        const userRole = (userData.role || userData.tipo_usuario || '').toLowerCase();
                        const hasNoRole = !userRole || userRole === 'user' || userRole === 'usuario' || userRole === '';
                        if (hasNoRole) {
                            navigate('/select-role', { replace: true });
                        } else {
                            navigate('/complete-profile', { replace: true });
                        }
                    }
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

            const userRole = (userData.role || userData.tipo_usuario || '').toLowerCase();
            const hasNoRole = !userRole || userRole === 'user' || userRole === 'usuario' || userRole === '';

            if (hasNoRole) {
                navigate('/select-role');
                return;
            }

            // Check if onboarding is complete before navigating to dashboard
            if (userData.onboarding_completo === false) {
                navigate('/complete-profile');
                return;
            }

            // Navigate based on role
            const role = userRole;
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

    const register = async (nombre, apellidos, email, password, role, profileData) => {
        // Prepare the payload matching the EXACT original UserCreate schema
        const payload = {
            username: nombre.toLowerCase().replace(/\s+/g, '') + Math.floor(Math.random() * 1000),
            nombre: nombre,
            apellidos: apellidos,
            email: email,
            password: password,
            role: role === 'estudiante' ? 'student' : 'graduate',
            university: profileData?.universidad || 'Pendiente',
            career: profileData?.carrera || 'Pendiente',
            phone: profileData?.telefono_movil || null,
            gender: profileData?.genero || null,
            anio_inicio: profileData?.anio_inicio ? parseInt(profileData.anio_inicio) : null,
            anio_fin: profileData?.anio_fin ? (profileData.anio_fin === 'cursando' ? -1 : parseInt(profileData.anio_fin)) : null
        };

        // 1. Create the account
        const response = await fetch('/api/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            let errorDetail = 'Error al registrar';
            try {
                const error = await response.json();
                errorDetail = error.detail || JSON.stringify(error);
            } catch (e) {
                errorDetail = 'Error validando datos (422)';
            }
            throw new Error(errorDetail);
        }

        // 2. Fetch token manually (instead of login() to control the flow)
        const tokenFormData = new URLSearchParams();
        tokenFormData.append('username', email);
        tokenFormData.append('password', password);

        const tokenResponse = await fetch('/api/token', {
            method: 'POST',
            body: tokenFormData,
        });

        if (!tokenResponse.ok) {
            throw new Error('Error al iniciar sesión después del registro');
        }

        const tokenData = await tokenResponse.json();
        localStorage.setItem('token', tokenData.access_token);

        // 3. Update profile with all extra data (LinkedIn, Date of Birth, etc)
        if (profileData) {
            const profileRes = await fetch('/api/users/me/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${tokenData.access_token}`
                },
                body: JSON.stringify(profileData),
            });
            if (!profileRes.ok) {
                console.error('Failed to update profile');
            }
        }

        // 4. Finally, fetch the completely updated user and navigate
        const userRes = await fetch('/api/users/me', {
            headers: { Authorization: `Bearer ${tokenData.access_token}` }
        });

        if (userRes.ok) {
            const userData = await userRes.json();
            setUser(userData);

            const userRole = (userData.role || '').toLowerCase();

            // Navigate based on role (Dashboard)
            if (['admin', 'administrador'].includes(userRole)) {
                navigate('/admin/dashboard');
            } else if (['mentor', 'graduate', 'egresado'].includes(userRole)) {
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

            const userRole = (userData.role || userData.tipo_usuario || '').toLowerCase();
            const hasNoRole = !userRole || userRole === 'user' || userRole === 'usuario' || userRole === '';

            // ALWAYS check role first — if no role assigned, go to role selection
            if (hasNoRole) {
                navigate('/select-role');
                return { is_new: true };
            }

            // Has a role but hasn't completed onboarding profile
            if (userData.onboarding_completo === false || !userData.onboarding_completo) {
                navigate('/complete-profile');
                return { is_new: true };
            }

            // Existing user with completed onboarding — go to their dashboard
            if (['admin', 'administrador'].includes(userRole)) {
                navigate('/admin/dashboard');
            } else if (['mentor', 'graduate', 'egresado'].includes(userRole)) {
                navigate('/mentor/dashboard');
            } else {
                navigate('/student/dashboard');
            }
            return { is_new: false };
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
        <AuthContext.Provider value={{ user, login, register, loginWithGoogle, logout, loading, refreshUser: verifyToken }}>
            {/* Show loading spinner or nothing while checking auth? */}
            {!loading ? children : null}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
