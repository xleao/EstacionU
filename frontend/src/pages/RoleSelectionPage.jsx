import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import WaveBackground from '../components/WaveBackground';
import { useAuth } from '../context/AuthContext';

const RoleSelectionPage = () => {
    const [selectedRole, setSelectedRole] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { user, refreshUser } = useAuth();

    const roles = [
        {
            id: 'estudiante',
            title: 'Estudiante',
            subtitle: 'Estoy buscando mentoría',
            description: 'Conecta con egresados y profesionales que te guiarán en tu camino académico y profesional.',
            icon: 'school',
            color: 'from-blue-500 to-cyan-400',
            bgLight: 'bg-blue-50',
            bgDark: 'dark:bg-blue-900/20',
            borderColor: 'border-blue-200 dark:border-blue-800',
            selectedBorder: 'border-blue-500 dark:border-blue-400',
            iconBg: 'bg-blue-100 dark:bg-blue-900/40',
            iconColor: 'text-blue-600 dark:text-blue-400',
        },
        {
            id: 'mentor',
            title: 'Mentor / Egresado',
            subtitle: 'Quiero guiar estudiantes',
            description: 'Comparte tu experiencia profesional con estudiantes que buscan orientación para crecer.',
            icon: 'workspace_premium',
            color: 'from-amber-500 to-orange-400',
            bgLight: 'bg-amber-50',
            bgDark: 'dark:bg-amber-900/20',
            borderColor: 'border-amber-200 dark:border-amber-800',
            selectedBorder: 'border-amber-500 dark:border-amber-400',
            iconBg: 'bg-amber-100 dark:bg-amber-900/40',
            iconColor: 'text-amber-600 dark:text-amber-400',
        }
    ];

    const handleContinue = async () => {
        if (!selectedRole) return;
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
                body: JSON.stringify({ role: selectedRole }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.detail || 'Error al actualizar el rol');
            }

            // Refresh user data so context has the updated role
            await refreshUser();

            // Navigate to the appropriate dashboard
            if (selectedRole === 'mentor') {
                navigate('/mentor/dashboard');
            } else {
                navigate('/student/dashboard');
            }
        } catch (err) {
            setError(err.message || 'Ocurrió un error. Intenta de nuevo.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 h-screen flex flex-col font-sans transition-colors duration-300 relative overflow-hidden">
            <WaveBackground />

            <main className="flex-grow flex items-center justify-center p-4 relative z-10 w-full">
                <div className="w-full max-w-lg transition-all duration-300">
                    <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/20 dark:border-slate-800 p-6 md:p-10 rounded-2xl md:rounded-3xl shadow-2xl animate-fade-in">

                        {/* Header */}
                        <div className="text-center mb-8">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-blue-600 text-white mb-4 shadow-lg shadow-blue-500/20">
                                <span className="material-icons text-3xl">handshake</span>
                            </div>
                            <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                                ¡Bienvenido{user?.nombre ? `, ${user.nombre}` : ''}!
                            </h1>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                Selecciona tu rol para personalizar tu experiencia
                            </p>
                        </div>

                        {/* Error */}
                        {error && (
                            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl relative mb-4 text-sm flex items-center gap-2" role="alert">
                                <span className="material-icons text-lg">error_outline</span>
                                <span>{error}</span>
                            </div>
                        )}

                        {/* Role Cards */}
                        <div className="space-y-3 mb-6">
                            {roles.map((role) => {
                                const isSelected = selectedRole === role.id;
                                return (
                                    <button
                                        key={role.id}
                                        onClick={() => setSelectedRole(role.id)}
                                        className={`w-full text-left p-5 rounded-2xl border-2 transition-all duration-300 group relative overflow-hidden ${isSelected
                                            ? `${role.selectedBorder} ${role.bgLight} ${role.bgDark} shadow-lg scale-[1.02]`
                                            : `border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 bg-white dark:bg-slate-800/50 hover:shadow-md`
                                            }`}
                                    >
                                        {/* Selected indicator */}
                                        {isSelected && (
                                            <div className={`absolute top-3 right-3 w-6 h-6 rounded-full bg-gradient-to-br ${role.color} flex items-center justify-center animate-fade-in`}>
                                                <span className="material-icons text-white text-sm">check</span>
                                            </div>
                                        )}

                                        <div className="flex items-start gap-4">
                                            <div className={`w-12 h-12 rounded-xl ${role.iconBg} flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-110`}>
                                                <span className={`material-icons text-2xl ${role.iconColor}`}>{role.icon}</span>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-0.5">
                                                    {role.title}
                                                </h3>
                                                <p className={`text-xs font-semibold mb-1.5 ${isSelected ? role.iconColor : 'text-slate-400'} transition-colors`}>
                                                    {role.subtitle}
                                                </p>
                                                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                                                    {role.description}
                                                </p>
                                            </div>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>

                        {/* Continue Button */}
                        <button
                            onClick={handleContinue}
                            disabled={!selectedRole || loading}
                            className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3.5 px-6 rounded-xl shadow-lg shadow-primary/20 transition-all active:scale-[0.98] text-base disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <span className="material-icons animate-spin text-lg">autorenew</span>
                                    Configurando...
                                </>
                            ) : (
                                <>
                                    Continuar
                                    <span className="material-icons text-lg">arrow_forward</span>
                                </>
                            )}
                        </button>

                        <p className="text-center text-xs text-slate-400 dark:text-slate-500 mt-4">
                            Podrás cambiar tu rol más adelante desde tu perfil
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default RoleSelectionPage;
