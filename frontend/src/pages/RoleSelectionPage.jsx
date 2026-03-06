import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import WaveBackground from '../components/WaveBackground';

const RoleSelectionPage = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { user, refreshUser } = useAuth();

    const handleSelectRole = async (role) => {
        setLoading(true);
        setError('');
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/users/me/role', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ role }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.detail || 'Error al actualizar el rol');
            }

            await refreshUser();
            navigate('/complete-profile');
        } catch (err) {
            setError(err.message || 'Ocurrió un error. Intenta de nuevo.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-background-light dark:bg-background-dark min-h-screen flex items-center justify-center font-sans transition-colors duration-300 relative overflow-hidden">
            <WaveBackground />

            {/* Main Card */}
            <div className="relative z-10 w-full max-w-md mx-4">
                <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl shadow-slate-200/60 dark:shadow-black/30 border border-slate-100 dark:border-slate-800 px-8 py-10 md:px-10 md:py-12 transition-all duration-300">

                    {/* Header */}
                    <div className="text-center mb-8">
                        <h1 className="text-[28px] font-extrabold text-slate-900 dark:text-white tracking-tight mb-2">
                            Selecciona tu perfil
                        </h1>
                        <p className="text-[15px] text-slate-400 dark:text-slate-500 font-medium">
                            Elige tu tipo de perfil para continuar
                        </p>
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-2xl mb-5 text-sm flex items-center gap-2 font-medium">
                            <span className="material-icons text-lg">error_outline</span>
                            <span>{error}</span>
                        </div>
                    )}

                    {/* Role Cards */}
                    <div className="space-y-3 mb-8">
                        {/* Estudiante */}
                        <button
                            onClick={() => handleSelectRole('estudiante')}
                            disabled={loading}
                            className="w-full group flex items-center gap-4 p-5 rounded-2xl border-2 border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-800/50 hover:border-[#3C96E0]/40 dark:hover:border-primary/40 hover:bg-[#f8fbff] dark:hover:bg-slate-800 transition-all duration-200 text-left active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {/* Icon */}
                            <div className="w-12 h-12 rounded-2xl bg-[#EBF5FF] dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform duration-200">
                                <span className="material-icons text-[#3C96E0] text-[22px]">school</span>
                            </div>
                            {/* Text */}
                            <div className="flex-1 min-w-0">
                                <h3 className="text-[15px] font-bold text-slate-900 dark:text-white">Soy Estudiante</h3>
                                <p className="text-[13px] text-slate-400 dark:text-slate-500 font-medium mt-0.5">Accede a mentorías y recursos</p>
                            </div>
                            {/* Arrow */}
                            <span className="material-icons text-slate-300 dark:text-slate-600 text-[20px] group-hover:text-[#3C96E0] group-hover:translate-x-0.5 transition-all duration-200">arrow_forward_ios</span>
                        </button>

                        {/* Egresado / Mentor */}
                        <button
                            onClick={() => handleSelectRole('mentor')}
                            disabled={loading}
                            className="w-full group flex items-center gap-4 p-5 rounded-2xl border-2 border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-800/50 hover:border-emerald-300/60 dark:hover:border-emerald-700/40 hover:bg-[#f6fdf9] dark:hover:bg-slate-800 transition-all duration-200 text-left active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {/* Icon */}
                            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform duration-200">
                                <span className="material-icons text-emerald-500 text-[22px]">work</span>
                            </div>
                            {/* Text */}
                            <div className="flex-1 min-w-0">
                                <h3 className="text-[15px] font-bold text-slate-900 dark:text-white">Soy Egresado</h3>
                                <p className="text-[13px] text-slate-400 dark:text-slate-500 font-medium mt-0.5">Comparte experiencia y conecta</p>
                            </div>
                            {/* Arrow */}
                            <span className="material-icons text-slate-300 dark:text-slate-600 text-[20px] group-hover:text-emerald-500 group-hover:translate-x-0.5 transition-all duration-200">arrow_forward_ios</span>
                        </button>
                    </div>

                    {/* Loading indicator */}
                    {loading && (
                        <div className="flex items-center justify-center gap-2 text-primary text-sm font-semibold mb-4 animate-pulse">
                            <span className="material-icons animate-spin text-lg">autorenew</span>
                            Configurando tu perfil...
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RoleSelectionPage;
