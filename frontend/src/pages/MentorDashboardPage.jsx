import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import LakeBackground from '../components/LakeBackground';
import { useAuth } from '../context/AuthContext';
import { MentorCard } from './MentorsPage';
import HelpCenterModal from '../components/HelpCenterModal';
import MentorDestacadoModal from '../components/MentorDestacadoModal';

const MentorDashboardPage = () => {
    const { user, refreshUser } = useAuth();
    const navigate = useNavigate();
    const [showBanner, setShowBanner] = useState(false);
    const [requests, setRequests] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showPreview, setShowPreview] = useState(false);
    const [showHelp, setShowHelp] = useState(false);
    const [showDestacadoModal, setShowDestacadoModal] = useState(false);
    const [error, setError] = useState('');

    const formatShortName = (fullName) => {
        if (!fullName) return '';
        const parts = fullName.trim().split(/\s+/);
        if (parts.length === 1) return parts[0];
        if (parts.length === 2 || parts.length === 3) return `${parts[0]} ${parts[1]}`;
        return `${parts[0]} ${parts[2]}`;
    };


    // A profile is considered incomplete if essential fields are missing
    const isProfileComplete = user?.carrera && user?.telefono_movil && user?.fecha_nacimiento && user?.genero && user?.url_linkedin && user?.universidad;

    const fullName = user?.nombre_completo || `${user?.nombre || ''} ${user?.apellidos || ''}`.trim() || 'Mentor';
    const firstName = fullName.split(' ')[0];

    useEffect(() => {
        const fetchData = async () => {
            const token = localStorage.getItem('token');
            if (!token) { setLoading(false); return; }

            try {
                const [reqRes, meRes, statsRes] = await Promise.all([
                    fetch('/api/appointments/mentor', {
                        headers: { Authorization: `Bearer ${token}` }
                    }),
                    fetch('/api/appointments/me', {
                        headers: { Authorization: `Bearer ${token}` }
                    }),
                    fetch('/api/appointments/mentor/stats', {
                        headers: { Authorization: `Bearer ${token}` }
                    })
                ]);

                let allRequests = [];

                if (reqRes.ok) {
                    const data = await reqRes.json();
                    allRequests = [...allRequests, ...data.map(r => ({ ...r, asMentor: true }))];
                }

                if (meRes.ok) {
                    const meData = await meRes.json();
                    allRequests = [...allRequests, ...meData.map(r => ({
                        ...r,
                        asMentor: false,
                        menteeName: r.mentorName,
                        menteeImage: r.image || r.mentor_image,
                        menteeRole: 'mentor',
                        menteeCareer: r.otherProfile?.career || r.sector || '',
                        menteeUniversity: r.otherProfile?.university || ''
                    }))];
                }

                // Sort descending by ID
                const sortedData = allRequests.sort((a, b) => b.id - a.id);
                setRequests(sortedData);
                // Show banner if there's a new pending request received
                const hasNew = sortedData.some(r => r.isNew && r.status === 'pendiente' && r.asMentor);
                setShowBanner(hasNew);

                if (statsRes.ok) {
                    setStats(await statsRes.json());
                }
            } catch (err) {
                console.error("Error fetching mentor data:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleStatusChange = async (id, newStatus) => {
        const token = localStorage.getItem('token');
        if (!token) return;
        try {
            const res = await fetch(`/api/appointments/${id}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ estado: newStatus })
            });
            if (res.ok) {
                setRequests(prev => prev.map(r => r.id === id ? { ...r, status: newStatus } : r));
            }
        } catch (err) { console.error(err); }
    };

    const handleApplyDestacado = () => {
        setShowDestacadoModal(true);
    };



    const pendingRequests = requests.filter(r => r.status === 'pendiente');
    const otherRequests = requests.filter(r => r.status !== 'pendiente');

    const statCards = [
        { icon: 'pending_actions', label: 'Solicitudes en espera', value: stats?.pending ?? '-', accent: 'blue', extra: pendingRequests.length > 0 ? `${pendingRequests.filter(r => r.isNew).length} por confirmar` : 'Sin pendientes', extraIcon: pendingRequests.length > 0 ? 'arrow_upward' : null },
        { icon: 'check_circle', label: 'Sesiones Completadas', value: stats?.completed ?? '-', accent: 'green', extra: `${stats?.total ?? 0} total`, extraIcon: 'star' },
        { icon: 'schedule', label: 'Sesiones Programadas', value: stats?.scheduled ?? '-', accent: 'purple', extra: stats?.nextSession ? `Próxima: ${stats.nextSession}` : 'Sin sesiones', extraIcon: null },
        { icon: 'visibility', label: 'Total de Citas', value: stats?.total ?? '-', accent: 'orange', extra: 'Todas las solicitudes', extraIcon: null },
    ];

    const accentStyles = {
        blue: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-600 dark:text-blue-400', extraText: 'text-primary' },
        green: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-600 dark:text-green-400', extraText: 'text-green-500' },
        purple: { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-600 dark:text-purple-400', extraText: 'text-slate-400' },
        orange: { bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-600 dark:text-orange-400', extraText: 'text-slate-400' },
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
                    
                    .speech-bubble {
                        position: relative;
                        background-color: #F8FAFC;
                        border: 1px solid #E2E8F0;
                    }
                    .speech-bubble::after {
                        content: '';
                        position: absolute;
                        top: -9px;
                        left: 50%;
                        transform: translateX(-50%);
                        border-left: 9px solid transparent;
                        border-right: 9px solid transparent;
                        border-bottom: 9px solid #E2E8F0;
                    }
                    .speech-bubble::before {
                        content: '';
                        position: absolute;
                        top: -8px;
                        left: 50%;
                        transform: translateX(-50%);
                        border-left: 8px solid transparent;
                        border-right: 8px solid transparent;
                        border-bottom: 8px solid #F8FAFC;
                        z-index: 1;
                    }
                    @keyframes mentorCardEnter {
                        from { opacity: 0; transform: translateY(24px) scale(0.97); }
                        to { opacity: 1; transform: translateY(0) scale(1); }
                    }
                    .mentor-card-enter {
                        animation: mentorCardEnter 0.6s ease-out both;
                    }
                    @keyframes spin-pulse {
                        0% { transform: rotate(0deg) scale(1); }
                        50% { transform: rotate(180deg) scale(1.2); }
                        100% { transform: rotate(360deg) scale(1); }
                    }
                    @keyframes shimmer {
                        from { transform: translateX(-100%); }
                        to { transform: translateX(100%); }
                    }
                    .animate-spin-pulse {
                        animation: spin-pulse 2s infinite ease-in-out;
                    }
                `}</style>

                {/* Incomplete Profile Banner */}
                {!isProfileComplete && user && (
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6" style={{ animation: 'dashFadeUp 0.4s ease-out both' }}>
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/50 text-amber-800 dark:text-amber-300 px-6 py-4 rounded-xl shadow-sm">
                            <div className="flex items-center gap-3 mb-3 sm:mb-0">
                                <span className="material-icons text-amber-500">warning_amber</span>
                                <div>
                                    <span className="font-bold block">Completa tu información</span>
                                    <span className="text-sm">Tu perfil está incompleto. Agrega tus datos faltantes (género, fecha de nacimiento, LinkedIn, etc.) para destacar como mentor.</span>
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

                {/* Notification Banner */}
                {showBanner && (
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6" style={{ animation: 'dashFadeUp 0.4s ease-out both' }}>
                        <div className="flex items-center justify-between bg-primary text-white px-6 py-4 rounded-xl shadow-lg shadow-primary/20">
                            <div className="flex items-center gap-3">
                                <span className="material-icons">coffee</span>
                                <span className="font-semibold">¡Tienes {pendingRequests.filter(r => r.isNew).length} solicitud(es) nueva(s) de Coffee Chat!</span>
                            </div>
                            <div className="flex items-center gap-4">
                                <a
                                    href="#solicitudes"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        const el = document.getElementById('solicitudes');
                                        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                        setShowBanner(false);
                                    }}
                                    className="bg-white text-primary px-4 py-1.5 rounded-lg text-sm font-bold hover:bg-slate-100 transition-colors active:scale-95"
                                >
                                    Ver Solicitudes
                                </a>
                                <button onClick={() => setShowBanner(false)} className="text-white/80 hover:text-white transition-colors">
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
                                    Bienvenido de nuevo, {firstName}
                                </h1>
                                <span className="bg-gradient-to-r from-primary to-blue-600 text-white text-[10px] px-3 py-1 rounded-full font-bold uppercase tracking-[0.2em] shadow-lg shadow-primary/30 flex items-center gap-1.5 animate-fade-in">
                                    <span className="material-icons text-[14px]">verified</span>
                                    Cuenta Mentor
                                </span>
                            </div>
                            <p className="text-slate-400 mt-1 font-medium text-sm">Aquí tienes un resumen de tu actividad exclusiva como egresado.</p>
                        </div>
                        <div className="flex gap-3 items-center flex-wrap">
                            {user?.bloqueado_destacado ? (
                                <div className="flex items-center gap-2 px-4 py-2 bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl border border-red-200 dark:border-red-800/50 text-xs font-bold cursor-default max-w-[200px]">
                                    <span className="material-icons text-[18px]">block</span>
                                    Acceso Restringido
                                </div>
                            ) : user?.destacado ? (
                                <div className="group/golden relative overflow-hidden flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-400 via-yellow-500 to-orange-400 text-white rounded-xl shadow-lg shadow-amber-500/20 text-sm font-bold cursor-default border border-amber-300">
                                    <div className="absolute inset-0 -translate-x-full animate-[shimmer_3s_infinite] bg-gradient-to-r from-transparent via-white/30 to-transparent" />
                                    <span className="material-icons text-[20px] animate-pulse">workspace_premium</span>
                                    Mentor Destacado
                                </div>
                            ) : user?.solicitud_status === 'pendiente' ? (
                                <div
                                    className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-bold cursor-default"
                                    title="Tu solicitud está siendo revisada por el equipo"
                                >
                                    <span className="material-icons text-[20px] animate-spin-pulse">hourglass_empty</span>
                                    <span>Solicitud Pendiente</span>
                                </div>
                            ) : (
                                <button
                                    onClick={handleApplyDestacado}
                                    className="flex items-center gap-2 px-4 py-2 border-2 border-amber-500 text-amber-600 dark:text-amber-400 rounded-xl hover:bg-amber-500 hover:text-white dark:hover:text-white transition-all shadow-sm active:scale-95 text-sm font-bold bg-transparent"
                                    title="Destaca tu perfil en la sección de mentores"
                                >
                                    <span className="material-icons text-[20px]">stars</span>
                                    Ser Mentor Destacado
                                </button>
                            )}
                            <button
                                onClick={() => setShowPreview(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-sm active:scale-95 text-sm font-medium"
                            >
                                <span className="material-icons text-[20px]">visibility</span>
                                Vista Previa
                            </button>
                            <Link to="/cuenta" className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl hover:bg-blue-600 transition-all shadow-lg shadow-primary/20 active:scale-95 text-sm font-medium">
                                <span className="material-icons text-[20px]">edit</span>
                                Editar Perfil
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
                                    <div className="text-3xl font-bold mb-1 text-slate-900 dark:text-white">{String(stat.value).padStart(2, '0')}</div>
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
                                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Últimas Solicitudes</h2>
                                <span className="text-sm text-slate-400 font-medium">{requests.length} total</span>
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
                            ) : requests.length === 0 ? (
                                <div className="dash-card bg-white dark:bg-slate-800/80 rounded-2xl p-10 border border-slate-100 dark:border-slate-800 text-center" style={{ animationDelay: '0.45s' }}>
                                    <span className="material-icons text-5xl text-slate-200 dark:text-slate-700 mb-3">inbox</span>
                                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Sin solicitudes aún</h3>
                                    <p className="text-slate-400">Las solicitudes de mentoría de los estudiantes aparecerán aquí.</p>
                                </div>
                            ) : (
                                <>
                                    {/* Show max 4: latest appointments (sent + received) */}
                                    {requests.slice(0, 4).map((req, idx) => (
                                        <div
                                            key={`${req.id}-${req.asMentor ? 'r' : 's'}`}
                                            className="dash-card group bg-white dark:bg-slate-800/80 rounded-2xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-primary/30 dark:hover:border-primary/40 transition-all duration-300 cursor-pointer relative"
                                            style={{ animationDelay: `${0.45 + idx * 0.1}s` }}
                                            onClick={() => navigate(`/sesiones?highlight=${req.id}`)}
                                        >
                                            <div className="flex flex-col md:flex-row gap-5 items-center">
                                                <div className="flex-shrink-0">
                                                    <img alt="User" className="w-14 h-14 rounded-full object-cover border-2 border-slate-200 dark:border-slate-700" src={req.menteeImage || 'https://via.placeholder.com/150'} />
                                                </div>
                                                <div className="flex-grow">
                                                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                                                        <h3 className="font-bold text-slate-900 dark:text-white">{formatShortName(req.menteeName)}</h3>
                                                        <div className="flex items-center gap-1 px-2 py-0.5 rounded border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800/50 text-slate-500 dark:text-slate-400">
                                                            <span className="material-icons text-[12px] opacity-70">
                                                                {req.menteeRole === 'estudiante' ? 'school' : 'workspace_premium'}
                                                            </span>
                                                            <span className="text-[10px] font-bold uppercase tracking-widest">
                                                                {req.menteeRole === 'estudiante' ? 'Estudiante' : (req.menteeRole === 'mentor' ? 'Mentor' : 'Egresado')}
                                                            </span>
                                                        </div>
                                                        <span className={`inline-block text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${req.asMentor ? 'bg-[#f4e8ff] text-[#9333ea] dark:bg-purple-900/30 dark:text-purple-300' : 'bg-[#e0f2fe] text-[#0284c7] dark:bg-blue-900/30 dark:text-blue-300'}`}>
                                                            {req.asMentor ? 'Recibida' : 'Enviada'}
                                                        </span>
                                                        <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider ${statusBadge[req.status.toLowerCase()] || ''}`}>
                                                            {statusLabel[req.status.toLowerCase()] || req.status}
                                                        </span>
                                                    </div>
                                                    <p className="text-slate-400 text-sm">
                                                        {req.date} {req.time ? `• ${req.time}` : ''} {req.tema ? `• ${req.tema}` : ''}
                                                    </p>
                                                </div>
                                                <div className="flex flex-col items-end gap-2 md:ml-4">
                                                    <div className="text-xs text-slate-400 font-medium">{req.timeLabel}</div>
                                                    <div className="w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-700/50 flex items-center justify-center text-slate-400 group-hover:bg-primary/10 group-hover:text-primary transition-all duration-300 transform group-hover:translate-x-1 group-hover:scale-110">
                                                        <span className="material-icons text-[18px]">arrow_forward</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}

                                    {/* View All Sessions Button */}
                                    <Link
                                        to="/sesiones"
                                        className="dash-card group relative flex items-center justify-center gap-3 w-full py-5 bg-gradient-to-r from-primary to-blue-600 rounded-2xl text-white font-bold text-base shadow-xl shadow-primary/30 hover:shadow-2xl hover:shadow-primary/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 overflow-hidden"
                                        style={{ animationDelay: '0.7s' }}
                                    >
                                        <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                        <span className="relative flex items-center gap-3">
                                            <span className="material-icons text-xl">event_note</span>
                                            Ver todas las sesiones
                                            <span className="material-icons text-xl group-hover:translate-x-1.5 transition-transform duration-300">arrow_forward</span>
                                        </span>
                                        <span className="absolute right-5 top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-white/40 rounded-full animate-ping"></span>
                                        <span className="absolute right-5 top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-white rounded-full"></span>
                                    </Link>
                                </>
                            )}
                        </div>

                        {/* Right Column: Profile & Help */}
                        <div className="space-y-6">
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white" style={{ animation: 'dashFadeUp 0.5s ease-out both 0.4s' }}>Perfil Público</h2>

                            {/* Profile Card */}
                            <div className="dash-card bg-white dark:bg-slate-800/80 rounded-2xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-lg hover:shadow-primary/5 transition-all duration-500" style={{ animationDelay: '0.5s' }}>
                                <div className="text-center mb-6">
                                    <div className="w-24 h-24 mx-auto bg-slate-50 dark:bg-slate-900 rounded-full mb-4 flex items-center justify-center overflow-hidden border-4 border-primary/10 hover:border-primary/30 transition-colors">
                                        <img
                                            alt="Mentor"
                                            className="w-full h-full object-cover"
                                            src={user?.url_foto || `https://api.dicebear.com/9.x/notionists/svg?seed=${fullName.replace(/\s/g, '')}&backgroundColor=transparent`}
                                        />
                                    </div>
                                    <div className="flex items-center justify-center gap-2 mb-1">
                                        <h3 className="font-bold text-xl text-slate-900 dark:text-white">{fullName}</h3>
                                        <span className="material-icons text-primary text-lg" title="Cuenta Mentor Verificada">verified</span>
                                    </div>
                                    <p className="text-slate-400 text-sm">{user?.carrera || 'Mentor'}</p>
                                </div>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center text-sm py-2 border-b border-slate-50 dark:border-slate-700">
                                        <span className="text-slate-400">Estado</span>
                                        <span className="flex items-center gap-1 text-green-500 font-bold">
                                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                            Activo
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm py-2 border-b border-slate-50 dark:border-slate-700">
                                        <span className="text-slate-400">Solicitudes</span>
                                        <span className="text-primary font-bold">{stats?.pending ?? 0} por confirmar</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm py-2">
                                        <span className="text-slate-400">Siguiente Sesión</span>
                                        <span className="font-bold text-slate-900 dark:text-white">{stats?.nextSession || 'Sin programar'}</span>
                                    </div>
                                </div>
                            </div>


                            {/* Help CTA Card */}
                            <div className="dash-card bg-slate-900 dark:bg-primary rounded-2xl p-6 text-white overflow-hidden relative hover:shadow-xl transition-all duration-500 group" style={{ animationDelay: '0.6s' }}>
                                <div className="relative z-10">
                                    <h3 className="font-bold text-lg mb-2">¿Necesitas ayuda?</h3>
                                    <p className="text-slate-300 dark:text-white/80 text-sm mb-4">Consulta nuestra guía para mentores o contacta a soporte.</p>
                                    <button
                                        onClick={() => setShowHelp(true)}
                                        className="w-full bg-white text-slate-900 font-bold py-2 rounded-lg hover:bg-slate-100 transition-colors active:scale-95">
                                        Centro de Ayuda
                                    </button>
                                </div>
                                <span className="material-icons absolute -right-4 -bottom-4 text-[120px] text-white/10 group-hover:text-white/15 transition-colors">support_agent</span>
                            </div>
                        </div>
                    </div>
                </main>
            </div>

            <PreviewModal
                isOpen={showPreview}
                onClose={() => setShowPreview(false)}
                user={user}
                fullName={fullName}
            />

            <HelpCenterModal
                isOpen={showHelp}
                onClose={() => setShowHelp(false)}
            />

            <MentorDestacadoModal
                isOpen={showDestacadoModal}
                onClose={() => setShowDestacadoModal(false)}
                onApplySuccess={() => { if (refreshUser) refreshUser(); }}
            />
        </div>
    );
};

const PreviewModal = ({ isOpen, onClose, user, fullName }) => {
    // Lock body scroll when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 overflow-hidden cursor-pointer"
            onClick={onClose}
        >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-md transition-opacity" />

            {/* Close Button - Fixed in corner for maximum visibility */}
            <button
                onClick={onClose}
                className="fixed top-8 right-8 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all border border-white/20 z-[110] shadow-2xl active:scale-90 hover:rotate-90 duration-300"
                title="Cerrar vista previa"
            >
                <span className="material-icons text-[32px]">close</span>
            </button>

            {/* Interactive Content Wrapper - Stop propagation here so clicking the card/info DOES NOT close */}
            <div
                className="relative flex flex-col md:flex-row items-center justify-center gap-12 w-full max-w-5xl transform transition-all animate-fade-in-up md:translate-x-12 z-10 cursor-default"
                onClick={(e) => e.stopPropagation()}
            >
                {/* The card */}
                <div className="w-full max-w-[380px] scale-[0.85] sm:scale-90 md:scale-100 origin-center transition-all duration-300">
                    <MentorCard
                        name={fullName}
                        role={user?.carrera || 'Tu Carrera'}
                        area={user?.sector_nombre || 'Tu Sector'}
                        bio={user?.biografia || 'Cuéntales a los alumnos por qué deberían hablar contigo.'}
                        image={user?.url_foto}
                        schedule={user?.horario_sugerido || 'Horario por definir'}
                        disponibilidades={user?.disponibilidades || []}
                        url_logo_empresa={user?.url_logo_empresa}
                        empresa={user?.empresa}
                        onBookChat={() => { }}
                        index={0}
                    />
                </div>

                {/* Info Text to the right */}
                <div className="hidden md:block w-72">
                    <div className="bg-primary/95 backdrop-blur-xl px-10 py-10 rounded-[3rem] shadow-2xl shadow-primary/40 border border-white/20 relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
                        <div className="relative z-10 flex flex-col items-center text-center">
                            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mb-6 shadow-inner">
                                <span className="material-icons text-white text-[32px]">visibility</span>
                            </div>
                            <h4 className="text-white text-sm font-black uppercase tracking-[0.3em] mb-3">Vista Previa</h4>
                            <p className="text-white/90 text-sm font-medium leading-relaxed">
                                Este es el diseño exacto que verán los alumnos cuando busquen mentores. ¡Tu perfil luce excelente!
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MentorDashboardPage;
