import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import WaveBackground from '../components/WaveBackground';
import Navbar from '../components/Navbar';

const ResetPasswordPage = () => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [status, setStatus] = useState('idle'); // 'idle', 'loading', 'success', 'error'
    const [errorMessage, setErrorMessage] = useState('');

    const navigate = useNavigate();
    const location = useLocation();

    // Obtenemos el token de la URL (ej: ?token=abc123xyz) de forma segura
    const queryParams = new URLSearchParams(location.search);
    const token = queryParams.get('token');

    // Validar en cuanto cargamos la página si traen un token
    useEffect(() => {
        if (!token) {
            setStatus('error');
            setErrorMessage('Enlace inválido o expirado. Por favor solicita uno nuevo.');
        }
    }, [token]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            setStatus('error');
            setErrorMessage('Las contraseñas no coinciden. Intenta de nuevo.');
            return;
        }

        if (password.length < 8) {
            setStatus('error');
            setErrorMessage('La contraseña debe tener al menos 8 caracteres.');
            return;
        }

        setStatus('loading');

        try {
            const response = await fetch('/api/users/reset-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ token: token, new_password: password })
            });

            if (response.ok) {
                setStatus('success');
                setTimeout(() => {
                    navigate('/login');
                }, 5000);
            } else {
                const data = await response.json();
                setStatus('error');
                setErrorMessage(data.detail || 'Ocurrió un error al restablecer la contraseña.');
            }
        } catch (error) {
            console.error('Error solicitando cambio:', error);
            setStatus('error');
            setErrorMessage('Error de red comprobando tu enlace.');
        }
    };

    return (
        <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 min-h-screen flex flex-col font-sans transition-colors duration-300 relative overflow-hidden">
            {/* Dynamic Wave Background */}
            <WaveBackground />

            {/* Solo Navbar, SIN FOOTER (porque está fuera del envoltorio principal de las rutas en App.jsx si lo configuramos bien pero para el reseteo suele verse genial así nomás) */}
            <Navbar />

            <main className="flex-grow flex items-center justify-center p-4 relative z-10 w-full">
                <div className="w-full max-w-sm transition-all duration-300">
                    <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/20 dark:border-slate-800 p-8 rounded-3xl shadow-2xl animate-fade-in relative overflow-hidden">

                        {/* Indicador superior estético */}
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-indigo-500"></div>

                        {status === 'success' ? (
                            <div className="text-center py-4 animate-fade-in">
                                <div className="w-16 h-16 rounded-full bg-green-50 dark:bg-green-900/30 text-green-500 flex items-center justify-center mx-auto mb-4 border border-green-100 dark:border-green-800/50">
                                    <span className="material-icons text-3xl">check_circle</span>
                                </div>
                                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2 mt-4">¡Contraseña Actualizada!</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400 mb-8 mt-2">
                                    Tu contraseña ha sido restablecida exitosamente. Te estamos redirigiendo automáticamente para que inicies sesión.
                                </p>
                                <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden mt-6 relative">
                                    <style>
                                        {`@keyframes fill-bar { 0% { width: 0%; } 100% { width: 100%; } }`}
                                    </style>
                                    <div
                                        className="bg-green-500 h-full absolute top-0 left-0 rounded-full"
                                        style={{ animation: 'fill-bar 5s ease-in-out forwards' }}
                                    ></div>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className="text-center mb-6 mt-2">
                                    <div className="w-14 h-14 rounded-full bg-blue-50 dark:bg-blue-900/30 text-primary flex items-center justify-center mx-auto mb-4 border border-blue-100 dark:border-blue-800/50">
                                        <span className="material-icons text-3xl">password</span>
                                    </div>
                                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Nueva Contraseña</h1>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">
                                        Por favor ingresa tu nueva contraseña segura.
                                    </p>
                                </div>

                                {status === 'error' && (
                                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 text-red-600 dark:text-red-400 px-4 py-3 rounded-xl mb-6 text-sm flex items-start gap-2 animate-fade-in">
                                        <span className="material-icons text-base mt-0.5">error_outline</span>
                                        <span>{errorMessage}</span>
                                    </div>
                                )}
                                <form className="space-y-4" onSubmit={handleSubmit}>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-medium text-slate-700 dark:text-slate-300 ml-1" htmlFor="password">
                                            Contraseña nueva
                                        </label>
                                        <div className="relative">
                                            <span className="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">lock</span>
                                            <input
                                                className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none dark:text-white text-sm"
                                                id="password"
                                                placeholder="••••••••"
                                                required
                                                type="password"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                disabled={status === 'loading' || !token}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-1.5 mb-6">
                                        <label className="text-xs font-medium text-slate-700 dark:text-slate-300 ml-1" htmlFor="confirmPassword">
                                            Confirmar contraseña
                                        </label>
                                        <div className="relative">
                                            <span className="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">lock_clock</span>
                                            <input
                                                className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none dark:text-white text-sm"
                                                id="confirmPassword"
                                                placeholder="••••••••"
                                                required
                                                type="password"
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                disabled={status === 'loading' || !token}
                                            />
                                        </div>
                                        <p className="text-[11px] text-slate-400 ml-1 mt-1">Mínimo 8 caracteres.</p>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={status === 'loading' || !token}
                                        className="w-full bg-primary hover:bg-blue-600 text-white font-bold py-3 rounded-xl shadow-lg shadow-blue-500/20 transition-all active:scale-[0.98] disabled:opacity-70 disabled:active:scale-100 flex items-center justify-center gap-2 mt-2"
                                    >
                                        {status === 'loading' ? (
                                            <>
                                                <span className="material-icons animate-spin text-sm">autorenew</span>
                                                Guardando...
                                            </>
                                        ) : (
                                            'Guardar y Entrar'
                                        )}
                                    </button>
                                </form>
                            </>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ResetPasswordPage;
