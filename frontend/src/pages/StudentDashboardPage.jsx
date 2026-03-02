import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import LakeBackground from '../components/LakeBackground';
import { useAuth } from '../context/AuthContext';
import HelpCenterModal from '../components/HelpCenterModal';

const StudentDashboardPage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [sessions, setSessions] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showHelp, setShowHelp] = useState(false);
    const [hideBanner, setHideBanner] = useState(sessionStorage.getItem('hideCoffeeChatBanner') === 'true');


    // A profile is considered incomplete if essential fields are missing or empty
    const isProfileComplete = user &&
        user.carrera && user.carrera.trim() !== '' &&
        user.universidad && user.universidad.trim() !== '' &&
        user.telefono_movil && user.telefono_movil.trim() !== '' &&
        user.fecha_nacimiento &&
        user.genero && user.genero.trim() !== '' &&
        user.url_linkedin && user.url_linkedin.trim() !== '';

    const fullName = user?.nombre_completo || `${user?.nombre || ''} ${user?.apellidos || ''}`.trim() || 'Estudiante';
    const firstName = fullName.split(' ')[0];

    useEffect(() => {
        const fetchData = async () => {
            const token = localStorage.getItem('token');
            if (!token) { setLoading(false); return; }

            try {
                const [reqRes, statsRes] = await Promise.all([
                    fetch('/api/appointments/me', {
                        headers: { Authorization: `Bearer ${token}` }
                    }),
                    fetch('/api/appointments/me/stats', {
                        headers: { Authorization: `Bearer ${token}` }
                    })
                ]);

                if (reqRes.ok) {
                    const data = await reqRes.json();
                    setSessions(data.sort((a, b) => b.id - a.id));
                }
                if (statsRes.ok) {
                    setStats(await statsRes.json());
                }
            } catch (err) {
                console.error("Error fetching student data:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const upcomingSessions = sessions.filter(s => ['confirmada', 'confirmado'].includes(s.status.toLowerCase()));
    const pendingSessions = sessions.filter(s => s.status === 'pendiente');

    // Merge arrays with pending first, then upcoming, then others
    const otherSessions = sessions.filter(s => !['pendiente', 'confirmada', 'confirmado'].includes(s.status.toLowerCase()));
    const displaySessions = [...upcomingSessions, ...pendingSessions, ...otherSessions];

    const statCards = [
        { icon: 'pending_actions', label: 'Solicitudes en espera', value: stats?.pending ?? '-', accent: 'orange', extra: pendingSessions.length > 0 ? 'Por confirmar' : 'Sin pendientes', extraIcon: null },
        { icon: 'check_circle', label: 'Sesiones Completadas', value: stats?.completed ?? '-', accent: 'green', extra: `${stats?.total ?? 0} total`, extraIcon: 'star' },
        { icon: 'schedule', label: 'Sesiones Programadas', value: stats?.scheduled ?? '-', accent: 'purple', extra: stats?.nextSession ? `Próxima: ${stats.nextSession}` : 'Sin sesiones', extraIcon: null },
        { icon: 'explore', label: 'Mentores disponibles', value: stats?.total_mentors ?? '-', accent: 'blue', extra: '¡Conecta con expertos!', extraIcon: 'bolt' },
    ];

    const accentStyles = {
        blue: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-600 dark:text-blue-400', extraText: 'text-primary' },
        green: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-600 dark:text-green-400', extraText: 'text-green-500' },
        purple: { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-600 dark:text-purple-400', extraText: 'text-slate-400' },
        orange: { bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-600 dark:text-orange-400', extraText: 'text-amber-500' },
    };

    const statusBadge = {
        pendiente: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400',
        confirmada: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
        realizada: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
        cancelada: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
    };

    const statusLabel = {
        pendiente: 'Por confirmar',
        confirmada: 'Confirmada',
        realizada: 'Realizada',
        cancelada: 'Cancelada',
    };

    return (
        <div className="bg-background-light dark:bg-background-dark text-slate-800 dark:text-slate-200 min-h-screen font-sans transition-colors duration-300 relative">
            <LakeBackground blur="blur-[40px]" />
            <div className="relative z-10">
                <Navbar />

                <style>{`
                    @keyframes dashFadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
                    @keyframes dashSlideIn { from { opacity: 0; transform: translateX(-16px); } to { opacity: 1; transform: translateX(0); } }
                    @keyframes dashScaleIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
                    .dash-card { animation: dashFadeUp 0.5s ease-out both; }
                `}</style>

                {/* Incomplete Profile Banner */}
                {!isProfileComplete && user && (
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6" style={{ animation: 'dashFadeUp 0.4s ease-out both' }}>
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/50 text-amber-800 dark:text-amber-300 px-6 py-4 rounded-xl shadow-sm">
                            <div className="flex items-center gap-3 mb-3 sm:mb-0">
                                <span className="material-icons text-amber-500">warning_amber</span>
                                <div>
                                    <span className="font-bold block">Completa tu información</span>
                                    <span className="text-sm">Tu perfil está incompleto. Agrega tus datos faltantes (género, fecha de nacimiento, LinkedIn, etc.) para que los mentores te conozcan.</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 w-full sm:w-auto mt-2 sm:mt-0">
                                <Link
                                    to="/cuenta"
                                    className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-1.5 rounded-lg text-sm font-bold transition-colors active:scale-95 shadow-sm text-center w-full sm:w-auto"
                                >
                                    Completar Perfil
                                </Link>
                            </div>
                        </div>
                    </div>
                )}

                {/* Banner alert if they have an upcoming session very soon (optional enhancement) */}
                {upcomingSessions.length > 0 && !hideBanner && (
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6" style={{ animation: 'dashFadeUp 0.4s ease-out both' }}>
                        <div className="flex items-center justify-between bg-primary text-white px-6 py-4 rounded-xl shadow-lg shadow-primary/20">
                            <div className="flex items-center gap-3">
                                <span className="material-icons">event_available</span>
                                <span className="font-semibold">¡Tienes {upcomingSessions.length} Coffee Chat(s) programado(s)! Preparate para aprender.</span>
                            </div>
                            <div className="flex items-center gap-4">
                                <Link
                                    to="/sesiones"
                                    onClick={() => {
                                        setHideBanner(true);
                                        sessionStorage.setItem('hideCoffeeChatBanner', 'true');
                                    }}
                                    className="bg-white text-primary px-4 py-1.5 rounded-lg text-sm font-bold hover:bg-slate-100 transition-colors active:scale-95">
                                    Ver Detalle
                                </Link>
                                <button
                                    onClick={() => {
                                        setHideBanner(true);
                                        sessionStorage.setItem('hideCoffeeChatBanner', 'true');
                                    }}
                                    className="text-white/70 hover:text-white transition-colors"
                                >
                                    <span className="material-icons text-xl">close</span>
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8" style={{ animation: 'dashSlideIn 0.5s ease-out both' }}>
                        <div>
                            <div className="flex items-center flex-wrap gap-3 mb-1">
                                <h1 className="text-3xl font-bold text-slate-900 dark:text-white bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300">
                                    Hola, {firstName} 👋
                                </h1>
                                <span className="bg-gradient-to-r from-primary to-blue-600 text-white text-[10px] px-3 py-1 rounded-full font-bold uppercase tracking-[0.2em] shadow-lg shadow-primary/30 flex items-center gap-1.5 animate-fade-in">
                                    <span className="material-icons text-[14px]">verified</span>
                                    Cuenta Estudiante
                                </span>
                            </div>
                            <p className="text-slate-400 mt-1 font-medium text-sm">Este es tu espacio de red profesional. Descubre mentores y ten Coffee Chats.</p>
                        </div>
                        <div className="flex gap-3">
                            <Link to="/mentores" className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl hover:bg-blue-600 transition-all shadow-lg shadow-primary/20 active:scale-95 text-sm font-bold">
                                <span className="material-icons text-[20px]">search</span>
                                Explorar Mentores
                            </Link>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
                        {statCards.map((stat, idx) => {
                            const style = accentStyles[stat.accent];
                            return (
                                <div
                                    key={idx}
                                    className="dash-card bg-white dark:bg-slate-800/80 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1 transition-all duration-500 group"
                                    style={{ animationDelay: `${0.1 + idx * 0.08}s` }}
                                >
                                    <div className={`w-10 h-10 ${style.bg} ${style.text} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                                        <span className="material-icons">{stat.icon}</span>
                                    </div>
                                    <div className="text-3xl font-bold mb-1 text-slate-900 dark:text-white">
                                        {stat.value === '-' ? '-' : (stat.label === 'Mentores disponibles' ? '+' + String(stat.value).padStart(2, '0') : String(stat.value).padStart(2, '0'))}
                                    </div>
                                    <div className="text-slate-400 text-sm font-medium">{stat.label}</div>
                                    <div className={`mt-2 text-xs ${stat.extraIcon ? style.extraText : 'text-slate-400'} font-bold flex items-center gap-1`}>
                                        {stat.extraIcon && <span className="material-icons text-xs">{stat.extraIcon}</span>}
                                        {stat.extra}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Main Content Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Left Column: Requests */}
                        <div className="lg:col-span-2 space-y-6" id="solicitudes">
                            <div className="flex items-center justify-between" style={{ animation: 'dashFadeUp 0.5s ease-out both 0.4s' }}>
                                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Tus Sesiones Recientes</h2>
                                <span className="text-sm text-slate-400 font-medium">{sessions.length} en total</span>
                            </div>

                            {loading ? (
                                <div className="space-y-4">
                                    {[1, 2].map(i => (
                                        <div key={i} className="bg-white dark:bg-slate-800/80 rounded-2xl p-6 border border-slate-100 dark:border-slate-800 animate-pulse flex items-center gap-5">
                                            <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-700" />
                                            <div className="flex-1 space-y-2">
                                                <div className="h-4 w-40 bg-slate-100 dark:bg-slate-700 rounded-lg" />
                                                <div className="h-3 w-28 bg-slate-50 dark:bg-slate-700/50 rounded-lg" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : sessions.length === 0 ? (
                                <div className="dash-card bg-white dark:bg-slate-800/80 rounded-2xl p-10 border border-slate-100 dark:border-slate-800 text-center" style={{ animationDelay: '0.45s' }}>
                                    <span className="material-icons text-5xl text-slate-200 dark:text-slate-700 mb-3">explore</span>
                                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Aún no tienes sesiones</h3>
                                    <p className="text-slate-400 mb-6">Encuentra a un mentor en tu área y agenda tu primer Coffee Chat.</p>
                                    <Link to="/mentores" className="inline-block bg-primary text-white font-bold py-2.5 px-6 rounded-xl hover:bg-blue-600 transition-colors shadow-lg shadow-primary/20 active:scale-95">
                                        Explorar Mentores
                                    </Link>
                                </div>
                            ) : (
                                <>
                                    {displaySessions.slice(0, 4).map((req, idx) => {
                                        return (
                                            <div
                                                key={req.id}
                                                className="dash-card group bg-white dark:bg-slate-800/80 rounded-2xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-primary/30 dark:hover:border-primary/40 transition-all duration-300 cursor-pointer relative mb-4"
                                                style={{ animationDelay: `${0.45 + idx * 0.1}s` }}
                                                onClick={() => navigate(`/sesiones?highlight=${req.id}`)}
                                            >
                                                <div className="flex flex-col md:flex-row gap-6 items-center">
                                                    <div className="flex-shrink-0">
                                                        <img alt="Mentor" className="w-14 h-14 rounded-full object-cover border border-slate-200 dark:border-slate-700" src={req.mentor_image || req.image || 'https://via.placeholder.com/150'} />
                                                    </div>
                                                    <div className="flex-grow text-center md:text-left">
                                                        <div className="flex items-center justify-center md:justify-start gap-2 mb-2 flex-wrap">
                                                            <h3 className="font-bold text-slate-900 dark:text-white">{req.mentorName || 'Mentor'}</h3>
                                                            {/* Role Badge Minimalist */}
                                                            <div className="flex items-center gap-1 px-2 py-0.5 rounded border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800/50 text-slate-500 dark:text-slate-400">
                                                                <span className="material-icons text-[12px] opacity-70">workspace_premium</span>
                                                                <span className="text-[10px] font-bold uppercase tracking-widest">Mentor</span>
                                                            </div>
                                                            <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider ${statusBadge[req.status.toLowerCase()] || 'bg-slate-100 text-slate-600'}`}>
                                                                {statusLabel[req.status.toLowerCase()] || req.status}
                                                            </span>
                                                        </div>
                                                        <p className="text-slate-400 text-sm">
                                                            {req.date} {req.rawHora ? `• ${req.rawHora}` : ''} {req.tema ? `• ${req.tema}` : ''}
                                                        </p>
                                                    </div>
                                                    <div className="flex flex-col items-center md:items-end gap-2 md:ml-4">
                                                        {req.timeLabel && <div className="text-xs text-slate-400 font-medium">{req.timeLabel}</div>}
                                                        <div className="w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-700/50 flex items-center justify-center text-slate-400 group-hover:bg-primary/10 group-hover:text-primary transition-all duration-300 transform group-hover:translate-x-1 group-hover:scale-110">
                                                            <span className="material-icons text-[18px]">arrow_forward</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}

                                    {/* View All Sessions Button */}
                                    <Link
                                        to="/sesiones"
                                        className="dash-card group relative flex items-center justify-center gap-3 w-full py-5 bg-gradient-to-r from-primary to-blue-600 rounded-2xl text-white font-bold text-base shadow-xl shadow-primary/30 hover:shadow-2xl hover:shadow-primary/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 overflow-hidden"
                                        style={{ animationDelay: '0.7s' }}
                                    >
                                        <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                        <span className="relative flex items-center gap-3">
                                            <span className="material-icons text-xl">event_note</span>
                                            Ir a Mis Sesiones
                                            <span className="material-icons text-xl group-hover:translate-x-1.5 transition-transform duration-300">arrow_forward</span>
                                        </span>
                                    </Link>
                                </>
                            )}
                        </div>

                        {/* Right Column: Profile & Help */}
                        <div className="space-y-6">
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white" style={{ animation: 'dashFadeUp 0.5s ease-out both 0.4s' }}>Mi Perfil</h2>

                            {/* Profile Card */}
                            <div className="dash-card bg-white dark:bg-slate-800/80 rounded-2xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-lg hover:shadow-primary/5 transition-all duration-500" style={{ animationDelay: '0.5s' }}>
                                <div className="text-center mb-6">
                                    <div className="w-24 h-24 mx-auto bg-slate-50 dark:bg-slate-900 rounded-full mb-4 flex items-center justify-center overflow-hidden border-4 border-primary/10 hover:border-primary/30 transition-colors">
                                        <img
                                            alt="Estudiante"
                                            className="w-full h-full object-cover"
                                            src={user?.url_foto || `https://api.dicebear.com/9.x/notionists/svg?seed=${fullName.replace(/\s/g, '')}&backgroundColor=transparent`}
                                        />
                                    </div>
                                    <div className="flex items-center justify-center gap-2 mb-1">
                                        <h3 className="font-bold text-xl text-slate-900 dark:text-white">{fullName}</h3>
                                        <span className="material-icons text-primary text-lg" title="Cuenta Estudiante Verificada">verified</span>
                                    </div>
                                    <p className="text-slate-400 text-sm">{user?.carrera || 'Estudiante'}</p>
                                </div>
                                <div className="space-y-4">
                                    <Link to="/cuenta" className="w-full block text-center border-2 border-primary text-primary hover:bg-primary hover:text-white transition-colors font-bold py-2 rounded-xl text-sm">
                                        Editar mi información
                                    </Link>
                                    <div className="flex justify-between items-center text-sm py-2 border-t border-slate-50 dark:border-slate-700 mt-4">
                                        <span className="text-slate-400">Solicitudes enviadas</span>
                                        <span className="text-primary font-bold">{stats?.total ?? 0}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm py-2">
                                        <span className="text-slate-400">Pronto Coffee Chat</span>
                                        <span className="font-bold text-slate-900 dark:text-white">{stats?.nextSession || 'No registrado'}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Help CTA Card */}
                            <div className="dash-card bg-slate-900 dark:bg-primary rounded-2xl p-6 text-white overflow-hidden relative hover:shadow-xl transition-all duration-500 group" style={{ animationDelay: '0.6s' }}>
                                <div className="relative z-10">
                                    <h3 className="font-bold text-lg mb-2">¿Cómo agendar?</h3>
                                    <p className="text-slate-300 dark:text-white/80 text-sm mb-4">Aprende a tener un Coffee Chat efectivo con egresados.</p>
                                    <button
                                        onClick={() => setShowHelp(true)}
                                        className="w-full bg-white text-slate-900 font-bold py-2 rounded-lg hover:bg-slate-100 transition-colors active:scale-95">
                                        Ver guía rápida
                                    </button>
                                </div>
                                <span className="material-icons absolute -right-4 -bottom-4 text-[120px] text-white/10 group-hover:text-white/15 transition-colors">auto_stories</span>
                            </div>
                        </div>
                    </div>
                </main>
            </div>

            <HelpCenterModal
                isOpen={showHelp}
                onClose={() => setShowHelp(false)}
            />
        </div>
    );
};

export default StudentDashboardPage;
