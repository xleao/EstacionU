import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import WaveBackground from '../components/WaveBackground';
import { useAuth } from '../context/AuthContext';
import { useGoogleLogin } from '@react-oauth/google';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [showForgotModal, setShowForgotModal] = useState(false);
    const [forgotEmail, setForgotEmail] = useState('');
    const [forgotStatus, setForgotStatus] = useState('idle'); // 'idle', 'loading', 'success'
    const { login, loginWithGoogle } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            setSuccessMessage('');
            await login(email, password);
        } catch (err) {
            setError('Credenciales inválidas. Por favor intenta de nuevo.');
            console.error(err);
        }
    };

    const handleGoogleLogin = useGoogleLogin({
        onSuccess: async tokenResponse => {
            try {
                setError('');
                await loginWithGoogle(tokenResponse.access_token);
            } catch (err) {
                setError(err.message || 'Error en la autenticación con Google');
            }
        },
        onError: () => {
            setError('Error en la autenticación con Google');
        },
        prompt: 'select_account consent'
    });

    const handleForgotSubmit = async (e) => {
        e.preventDefault();
        setForgotStatus('loading');
        try {
            await fetch('/api/users/forgot-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email: forgotEmail })
            });
            setForgotStatus('success');
        } catch (error) {
            console.error('Error solicitando recuperación:', error);
            setForgotStatus('success'); // Prevent getting stuck on loading if network fails
        }
    };

    return (
        <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 h-screen flex flex-col font-sans transition-colors duration-300 relative overflow-hidden" >
            {/* Dynamic Wave Background */}
            < WaveBackground />
            <Navbar />
            <main className="flex-grow flex items-center justify-center p-4 relative z-10 w-full h-full">
                <div className="w-full max-w-md transition-all duration-300">
                    <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/20 dark:border-slate-800 p-6 md:p-10 rounded-2xl md:rounded-3xl shadow-2xl animate-fade-in">
                        <div className="text-center mb-8">
                            <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">¡Hola de nuevo!</h1>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Inicia sesión para continuar</p>
                        </div>

                        {error && (
                            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4 text-sm" role="alert">
                                <span className="block sm:inline">{error}</span>
                            </div>
                        )}

                        {successMessage && (
                            <div className="bg-emerald-100 border border-emerald-400 text-emerald-700 px-4 py-3 rounded-xl relative mb-4 text-sm flex items-center gap-2 animate-fade-in" role="alert">
                                <span className="material-icons text-lg">check_circle</span>
                                <span className="block sm:inline font-medium">{successMessage}</span>
                            </div>
                        )}

                        <form className="space-y-5" onSubmit={handleSubmit}>
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 ml-1" htmlFor="email">Correo Institucional</label>
                                <div className="relative">
                                    <span className="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">alternate_email</span>
                                    <input
                                        className="w-full pl-10 pr-4 py-3.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none dark:text-white text-sm shadow-sm"
                                        id="email"
                                        placeholder="usuario@universidad.edu.pe"
                                        required
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 ml-1" htmlFor="password">Contraseña</label>
                                <div className="relative">
                                    <span className="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">lock_outline</span>
                                    <input
                                        className="w-full pl-10 pr-4 py-3.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none dark:text-white text-sm shadow-sm"
                                        id="password"
                                        placeholder="••••••••"
                                        required
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-1">
                                <label className="flex items-center gap-2 cursor-pointer group">
                                    <input className="w-4 h-4 rounded text-primary focus:ring-primary border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 transition-all" type="checkbox" />
                                    <span className="text-xs font-medium text-slate-600 dark:text-slate-400 group-hover:text-primary transition-colors whitespace-nowrap">Mantener sesión</span>
                                </label>
                                <button
                                    className="text-[13px] text-primary hover:text-blue-600 hover:underline font-bold transition-colors focus:outline-none whitespace-nowrap"
                                    onClick={(e) => { e.preventDefault(); setShowForgotModal(true); setForgotStatus('idle'); setForgotEmail(''); }}
                                    type="button"
                                >
                                    ¿Olvidaste tu contraseña?
                                </button>
                            </div>

                            {/* Actions */}
                            <button className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3.5 px-6 rounded-xl shadow-lg shadow-primary/20 transition-all active:scale-[0.98] mt-2 text-base" type="submit">
                                Iniciar Sesión
                            </button>

                            {/* Secondary Actions Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                                <Link
                                    to="/register"
                                    className="flex items-center justify-center gap-2 w-full bg-white dark:bg-slate-800 border-2 border-primary text-primary hover:bg-primary hover:text-white font-bold py-2.5 px-4 rounded-xl transition-all duration-300 active:scale-[0.98] shadow-sm hover:shadow-md group text-sm"
                                >
                                    <span className="material-icons text-lg group-hover:text-white transition-colors">person_add</span>
                                    Registrarse
                                </Link>
                                <button
                                    onClick={() => handleGoogleLogin()}
                                    className="flex items-center justify-center gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 py-2.5 px-4 rounded-xl transition-all text-slate-700 dark:text-slate-300 font-bold active:scale-[0.98] shadow-sm text-sm"
                                    type="button"
                                >
                                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
                                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
                                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"></path>
                                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path>
                                    </svg>
                                    Google
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </main>

            {/* Forgot Password Modal */}
            {showForgotModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-800 transform transition-all duration-300 scale-100">
                        <div className="p-6 relative">
                            {/* Close button */}
                            <button
                                onClick={() => setShowForgotModal(false)}
                                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                            >
                                <span className="material-icons">close</span>
                            </button>

                            {forgotStatus === 'idle' || forgotStatus === 'loading' ? (
                                <form onSubmit={handleForgotSubmit}>
                                    <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-primary flex items-center justify-center mb-4">
                                        <span className="material-icons text-2xl">lock_reset</span>
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Recuperar acceso</h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-5">
                                        Ingresa tu correo institucional y te enviaremos las instrucciones paso a paso para restablecer tu contraseña.
                                    </p>

                                    <div className="space-y-1.5 mb-6">
                                        <div className="relative">
                                            <span className="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">mail</span>
                                            <input
                                                className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none dark:text-white text-sm"
                                                id="forgot-email"
                                                placeholder="usuario@universidad.edu.pe"
                                                required
                                                type="email"
                                                value={forgotEmail}
                                                onChange={(e) => setForgotEmail(e.target.value)}
                                                disabled={forgotStatus === 'loading'}
                                            />
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={forgotStatus === 'loading' || !forgotEmail}
                                        className="w-full bg-primary hover:bg-blue-600 text-white font-bold py-3 rounded-xl shadow-md transition-all active:scale-[0.98] disabled:opacity-70 disabled:active:scale-100 flex items-center justify-center gap-2"
                                    >
                                        {forgotStatus === 'loading' ? (
                                            <>
                                                <span className="material-icons animate-spin text-sm">autorenew</span>
                                                Enviando...
                                            </>
                                        ) : 'Enviar instrucciones'}
                                    </button>
                                </form>
                            ) : (
                                <div className="text-center py-4 animate-fade-in">
                                    <div className="w-16 h-16 rounded-full bg-green-50 dark:bg-green-900/30 text-green-500 flex items-center justify-center mx-auto mb-4">
                                        <span className="material-icons text-3xl">check_circle</span>
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">¡Mensaje Enviado!</h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                                        Hemos enviado instrucciones de recuperación a <span className="font-semibold text-slate-700 dark:text-slate-300">{forgotEmail}</span>. Por favor revisa tu bandeja de entrada y carpeta de spam.
                                    </p>
                                    <button
                                        onClick={() => setShowForgotModal(false)}
                                        className="w-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-bold py-3 rounded-xl transition-all active:scale-[0.98]"
                                    >
                                        Entendido
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div >
    );
};
export default LoginPage;
