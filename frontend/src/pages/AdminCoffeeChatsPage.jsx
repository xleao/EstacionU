import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Navbar from '../components/Navbar';
import FluidBackground from '../components/FluidBackground';

const AdminCoffeeChatsPage = () => {
    const [users, setUsers] = useState([]);
    const [stats, setStats] = useState([]);
    const [loadingUsers, setLoadingUsers] = useState(true);
    const [loadingStats, setLoadingStats] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [selectedUser, setSelectedUser] = useState(null);
    const [userChats, setUserChats] = useState([]);
    const [loadingChats, setLoadingChats] = useState(false);
    const [statusFilter, setStatusFilter] = useState('all');
    const [selectedChatModal, setSelectedChatModal] = useState(null);
    const [showTopMentorsModal, setShowTopMentorsModal] = useState(false);
    const [currentPageChats, setCurrentPageChats] = useState(1);
    const chatsPerPage = 4;
    const [currentPageMentors, setCurrentPageMentors] = useState(1);
    const mentorsPerPage = 10;

    useEffect(() => {
        fetchStats();
        fetchUsers();
    }, []);

    const fetchStats = async () => {
        try {
            setLoadingStats(true);
            const token = localStorage.getItem('token');
            const res = await fetch('/api/admin/coffee-chats/stats', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                setStats(await res.json());
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoadingStats(false);
        }
    };

    const fetchUsers = async () => {
        try {
            setLoadingUsers(true);
            const token = localStorage.getItem('token');
            const res = await fetch('/api/admin/coffee-chats/users', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                setUsers(await res.json());
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoadingUsers(false);
        }
    };

    const handleSelectUser = async (user) => {
        setSelectedUser(user);
        setCurrentPageChats(1);
        setStatusFilter('all');
        try {
            setLoadingChats(true);
            const token = localStorage.getItem('token');
            const res = await fetch(`/api/admin/coffee-chats/users/${user.id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                setUserChats(await res.json());
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoadingChats(false);
        }
    };

    const filteredUsers = users.filter(u => {
        const matchesSearch = (u.nombre_completo || '').toLowerCase().includes(searchTerm.toLowerCase()) || (u.correo || '').toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = roleFilter === 'all' ? true :
            roleFilter === 'mentor_egresado' ? ['mentor', 'egresado'].includes(u.tipo_usuario) :
                u.tipo_usuario === roleFilter;
        return matchesSearch && matchesRole;
    });

    const renderStars = (rating) => {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            stars.push(
                <span key={i} className={`material-icons text-sm ${i <= rating ? 'text-amber-400' : 'text-slate-300 dark:text-slate-600'}`}>
                    star
                </span>
            );
        }
        return <div className="flex" title={`${rating}/5`}>{stars}</div>;
    };

    // Filter chats by status
    const filteredUserChats = userChats.filter(chat => statusFilter === 'all' ? true : chat.estado === statusFilter);

    // Chat Pagination logic
    const indexOfLastChat = currentPageChats * chatsPerPage;
    const indexOfFirstChat = indexOfLastChat - chatsPerPage;
    const currentChats = filteredUserChats.slice(indexOfFirstChat, indexOfLastChat);
    const totalChatPages = Math.ceil(filteredUserChats.length / chatsPerPage);

    // Mentors Pagination logic
    const indexOfLastMentor = currentPageMentors * mentorsPerPage;
    const indexOfFirstMentor = indexOfLastMentor - mentorsPerPage;
    const currentMentors = stats.slice(indexOfFirstMentor, indexOfLastMentor);
    const totalMentorPages = Math.ceil(stats.length / mentorsPerPage);

    return (
        <div className="bg-background-light dark:bg-background-dark min-h-screen text-slate-800 dark:text-slate-200 font-sans transition-colors duration-300 relative">
            <FluidBackground />
            <div className="relative z-10">
                <Navbar />

                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in-up">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                        <div>
                            <h1 className="text-3xl font-black text-slate-900 dark:text-white flex items-center gap-3">
                                <span className="material-icons text-primary text-3xl">coffee</span>
                                Panel de Coffee Chats
                            </h1>
                            <p className="text-slate-500 font-medium mt-1">Supervisa todas las sesiones y evalúa a los mentores.</p>
                        </div>
                    </div>

                    {/* Stats Section: Top Mentors */}
                    <div className="mb-10">
                        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <span className="material-icons text-amber-500">workspace_premium</span>
                                Mentores Destacados por Reseñas
                            </h2>
                            {stats.length > 0 && (
                                <button
                                    onClick={() => setShowTopMentorsModal(true)}
                                    className="px-5 py-2.5 bg-primary hover:bg-blue-700 text-white font-bold text-sm rounded-xl transition-all shadow-md shadow-primary/25 hover:shadow-lg hover:scale-[1.02] flex items-center gap-2"
                                >
                                    Ver ranking completo <span className="material-icons text-[18px]">leaderboard</span>
                                </button>
                            )}
                        </div>
                        {loadingStats ? (
                            <div className="flex items-center gap-2 text-slate-400"><span className="material-icons animate-spin">refresh</span> Cargando estadísticas...</div>
                        ) : stats.length === 0 ? (
                            <div className="p-6 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 text-center text-slate-500">
                                Aún no hay reseñas registradas para generar estadísticas.
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                {stats.slice(0, 4).map((stat, idx) => (
                                    <div key={idx} className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col gap-3 relative overflow-hidden group hover:shadow-lg transition-all">
                                        {idx < 3 && (
                                            <div className="absolute -right-4 -top-4 w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-end justify-start p-2 text-amber-500">
                                                <span className="font-bold text-xs">{idx + 1}º</span>
                                            </div>
                                        )}
                                        <div className="flex items-center gap-3">
                                            <img
                                                src={stat.url_foto || `https://api.dicebear.com/9.x/notionists/svg?seed=${stat.mentor_name.replace(/\s/g, '')}&backgroundColor=transparent`}
                                                alt="Mentor"
                                                className="w-12 h-12 rounded-full border-2 border-primary/20 object-cover"
                                            />
                                            <div>
                                                <h3 className="font-bold text-slate-900 dark:text-white leading-tight truncate max-w-[150px]">{stat.mentor_name}</h3>
                                                <p className="text-[11px] text-slate-500 uppercase tracking-wider font-bold">Mentor</p>
                                            </div>
                                        </div>
                                        <div className="bg-slate-50 dark:bg-slate-700/50 p-3 rounded-xl mt-1 space-y-2">
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-slate-500 font-medium">Calificación Base</span>
                                                <div className="flex items-center gap-1">
                                                    <span className="font-bold text-slate-900 dark:text-white">{stat.avg_total}</span>
                                                    <span className="material-icons text-amber-500 text-sm">star</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-slate-500 font-medium">Recomendaciones</span>
                                                <span className="font-bold text-green-600 bg-green-100 dark:bg-green-900/30 px-2 py-0.5 rounded text-xs">{stat.total_recomendaciones} / {stat.total_reviews}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="flex flex-col lg:flex-row gap-6">
                        {/* Users List Column */}
                        <div className="w-full lg:w-1/3 bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-xl overflow-hidden flex flex-col h-[700px]">
                            <div className="p-5 border-b border-slate-100 dark:border-slate-700">
                                <h2 className="font-bold text-lg text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                                    <span className="material-icons text-primary text-xl">people</span>
                                    Usuarios y Chats
                                </h2>
                                <div className="space-y-3">
                                    <div className="relative">
                                        <span className="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
                                        <input
                                            type="text"
                                            placeholder="Buscar por nombre o correo..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-slate-900 dark:text-white transition-all"
                                        />
                                    </div>
                                    <div className="flex bg-slate-100 dark:bg-slate-900/50 p-1 rounded-lg">
                                        <button
                                            onClick={() => setRoleFilter('all')}
                                            className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${roleFilter === 'all' ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                                        >
                                            Todos
                                        </button>
                                        <button
                                            onClick={() => setRoleFilter('estudiante')}
                                            className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${roleFilter === 'estudiante' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                                        >
                                            Estudiantes
                                        </button>
                                        <button
                                            onClick={() => setRoleFilter('mentor_egresado')}
                                            className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${roleFilter === 'mentor_egresado' ? 'bg-white dark:bg-slate-700 text-purple-600 dark:text-purple-400 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                                        >
                                            Mentores
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="overflow-y-auto flex-1 p-2">
                                {loadingUsers ? (
                                    <div className="flex items-center justify-center h-40 text-slate-400"><span className="material-icons animate-spin text-2xl">refresh</span></div>
                                ) : filteredUsers.length === 0 ? (
                                    <div className="text-center p-6 text-slate-500 text-sm">No se encontraron usuarios.</div>
                                ) : (
                                    <div className="space-y-1">
                                        {filteredUsers.map(u => (
                                            <button
                                                key={u.id}
                                                onClick={() => handleSelectUser(u)}
                                                className={`w-full text-left p-3 rounded-xl flex items-center justify-between transition-all ${selectedUser?.id === u.id ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20' : 'hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'}`}
                                            >
                                                <div className="flex items-center gap-3 overflow-hidden">
                                                    <img
                                                        src={u.url_foto || `https://api.dicebear.com/9.x/notionists/svg?seed=${u.nombre_completo.replace(/\s/g, '')}&backgroundColor=transparent`}
                                                        alt="User"
                                                        className={`w-10 h-10 rounded-full object-cover border-2 flex-shrink-0 ${selectedUser?.id === u.id ? 'border-white/30' : 'border-slate-200 dark:border-slate-600'}`}
                                                    />
                                                    <div className="truncate">
                                                        <div className="font-bold text-sm truncate">{u.nombre_completo}</div>
                                                        <div className={`text-[10px] font-bold uppercase tracking-widest mt-0.5 ${selectedUser?.id === u.id ? 'text-white/80' : 'text-slate-400'}`}>
                                                            {u.tipo_usuario === 'mentor' ? 'Mentor' : u.tipo_usuario === 'egresado' ? 'Egresado' : 'Estudiante'}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className={`flex items-center justify-center px-2.5 py-1 rounded-lg text-xs font-bold w-10 ${selectedUser?.id === u.id ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-900 text-slate-500'}`}>
                                                    {u.total_chats}
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* User Chats Details Column */}
                        <div className="w-full lg:w-2/3 bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-xl p-6 md:p-8 h-[700px] flex flex-col relative overflow-hidden">
                            {!selectedUser ? (
                                <div className="flex-1 flex flex-col items-center justify-center text-center max-w-sm mx-auto animate-fade-in text-slate-400">
                                    <div className="w-24 h-24 bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-700 rounded-full flex items-center justify-center mb-6">
                                        <span className="material-icons text-5xl">person_search</span>
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Selecciona un usuario</h3>
                                    <p className="text-sm">Haz clic en un usuario de la lista a la izquierda para ver su historial completo de Coffee Chats y reseñas.</p>
                                </div>
                            ) : (
                                <>
                                    <div className="absolute top-0 right-0 p-8 z-0 opacity-5 pointer-events-none">
                                        <span className="material-icons text-[200px]">coffee</span>
                                    </div>
                                    <div className="relative z-10 flex flex-col h-full animate-fade-in">
                                        {/* Header */}
                                        <div className="flex items-start gap-5 mb-8 pb-6 border-b border-slate-100 dark:border-slate-700">
                                            <img
                                                src={selectedUser.url_foto || `https://api.dicebear.com/9.x/notionists/svg?seed=${selectedUser.nombre_completo.replace(/\s/g, '')}&backgroundColor=transparent`}
                                                alt="User"
                                                className="w-20 h-20 rounded-2xl object-cover border-4 border-slate-50 dark:border-slate-900 shadow-md"
                                            />
                                            <div>
                                                <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-1">{selectedUser.nombre_completo}</h2>
                                                <p className="text-slate-500 text-sm font-medium mb-3">{selectedUser.correo}</p>
                                                <div className="flex gap-4">
                                                    <div className="bg-slate-50 dark:bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                                                        <span className="material-icons text-sm text-primary">school</span>
                                                        {selectedUser.tipo_usuario.toUpperCase()}
                                                    </div>
                                                    <div className="bg-slate-50 dark:bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                                                        <span className="material-icons text-sm text-amber-500">coffee</span>
                                                        {selectedUser.total_chats} CHATS
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Chats List Header */}
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                                            <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                                                <span className="material-icons text-slate-400">history</span>
                                                Historial de Sesiones
                                            </h3>
                                            <div className="flex bg-slate-100 dark:bg-slate-900/50 p-1 rounded-lg self-start">
                                                <button
                                                    onClick={() => { setStatusFilter('all'); setCurrentPageChats(1); }}
                                                    className={`px-3 py-1.5 text-[10px] md:text-xs font-bold rounded-md transition-all ${statusFilter === 'all' ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                                                >
                                                    Todos
                                                </button>
                                                <button
                                                    onClick={() => { setStatusFilter('pendiente'); setCurrentPageChats(1); }}
                                                    className={`px-3 py-1.5 text-[10px] md:text-xs font-bold rounded-md transition-all ${statusFilter === 'pendiente' ? 'bg-white dark:bg-slate-700 text-amber-600 dark:text-amber-400 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                                                >
                                                    Pendientes
                                                </button>
                                                <button
                                                    onClick={() => { setStatusFilter('confirmada'); setCurrentPageChats(1); }}
                                                    className={`px-3 py-1.5 text-[10px] md:text-xs font-bold rounded-md transition-all ${statusFilter === 'confirmada' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                                                >
                                                    Confirmadas
                                                </button>
                                                <button
                                                    onClick={() => { setStatusFilter('realizada'); setCurrentPageChats(1); }}
                                                    className={`px-3 py-1.5 text-[10px] md:text-xs font-bold rounded-md transition-all ${statusFilter === 'realizada' ? 'bg-white dark:bg-slate-700 text-green-600 dark:text-green-400 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                                                >
                                                    Realizadas
                                                </button>
                                                <button
                                                    onClick={() => { setStatusFilter('cancelada'); setCurrentPageChats(1); }}
                                                    className={`px-3 py-1.5 text-[10px] md:text-xs font-bold rounded-md transition-all ${statusFilter === 'cancelada' ? 'bg-white dark:bg-slate-700 text-red-600 dark:text-red-400 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                                                >
                                                    Canceladas
                                                </button>
                                            </div>
                                        </div>
                                        <div className="flex-1 overflow-y-auto pr-2 space-y-4 pb-4">
                                            {loadingChats ? (
                                                <div className="flex items-center justify-center p-10"><span className="material-icons animate-spin text-3xl text-primary">refresh</span></div>
                                            ) : userChats.length === 0 ? (
                                                <div className="text-center p-10 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800 text-slate-500">
                                                    Este usuario no ha tenido ningún Coffee Chat aún.
                                                </div>
                                            ) : filteredUserChats.length === 0 ? (
                                                <div className="text-center p-10 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800 text-slate-500">
                                                    No hay sesiones con este estado.
                                                </div>
                                            ) : (
                                                <>
                                                    {currentChats.map((chat) => (
                                                        <div key={chat.id} onClick={() => setSelectedChatModal(chat)} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 shadow-sm hover:shadow-lg transition-all cursor-pointer">
                                                            <div className="flex flex-wrap items-start justify-between gap-4 mb-3">
                                                                <div>
                                                                    <div className="flex items-center gap-2 mb-1">
                                                                        <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded ${chat.rol_en_cita === 'Estudiante' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30' : 'bg-purple-100 text-purple-700 dark:bg-purple-900/30'}`}>
                                                                            Como {chat.rol_en_cita}
                                                                        </span>
                                                                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${chat.estado === 'realizada' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                                                            chat.estado === 'confirmada' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                                                                                chat.estado === 'pendiente' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                                                                                    'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                                                            }`}>
                                                                            {chat.estado}
                                                                        </span>
                                                                    </div>
                                                                    <h4 className="font-bold text-slate-900 dark:text-white text-lg">{chat.tema}</h4>
                                                                    <p className="text-slate-500 text-sm">con {chat.otra_persona}</p>
                                                                </div>
                                                                <div className="text-right flex flex-col items-end">
                                                                    <span className="flex items-center gap-1.5 text-xs font-bold text-slate-500 bg-slate-50 dark:bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-100 dark:border-slate-700">
                                                                        <span className="material-icons text-sm">calendar_today</span>
                                                                        {chat.fecha} • {chat.hora}
                                                                    </span>
                                                                </div>
                                                            </div>

                                                            {/* Feedback Section if Available */}
                                                            {chat.estado === 'realizada' && (chat.calificacion_general || chat.calificacion_utilidad) ? (
                                                                <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 -m-5 p-5 rounded-b-2xl">
                                                                    <h5 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-1">
                                                                        <span className="material-icons text-xs">rate_review</span> Reseña Registrada
                                                                    </h5>
                                                                    <div className="grid grid-cols-2 gap-4">
                                                                        <div>
                                                                            <div className="text-xs text-slate-500 mb-1">Calificación Mentor</div>
                                                                            {renderStars(chat.calificacion_general)}
                                                                        </div>
                                                                        <div>
                                                                            <div className="text-xs text-slate-500 mb-1">Utilidad Sesión</div>
                                                                            {renderStars(chat.calificacion_utilidad)}
                                                                        </div>
                                                                        <div className="col-span-2 flex items-center gap-3">
                                                                            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold ${chat.recomendaria ? 'bg-green-100 text-green-700 dark:bg-green-900/30' : 'bg-red-100 text-red-700 dark:bg-red-900/30'}`}>
                                                                                <span className="material-icons text-sm">{chat.recomendaria ? 'thumb_up' : 'thumb_down'}</span>
                                                                                {chat.recomendaria ? 'Recomienda al mentor' : 'No recomienda al mentor'}
                                                                            </div>
                                                                            {chat.se_dio_en_dia === false && (
                                                                                <span className="text-xs font-bold text-amber-500 bg-amber-50 dark:bg-amber-900/10 px-2 py-1 rounded">Fecha reprogramada</span>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            ) : chat.estado === 'realizada' ? (
                                                                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700 text-xs text-slate-400 italic">
                                                                    No hay reseña registrada para esta sesión.
                                                                </div>
                                                            ) : null}
                                                        </div>
                                                    ))}

                                                    {totalChatPages > 1 && (
                                                        <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-900/50 px-4 py-3 border border-slate-100 dark:border-slate-700 rounded-2xl mt-4">
                                                            <button
                                                                onClick={() => setCurrentPageChats(prev => Math.max(prev - 1, 1))}
                                                                disabled={currentPageChats === 1}
                                                                className={`px-3 py-1.5 text-sm font-bold rounded-lg flex items-center gap-1 transition-all ${currentPageChats === 1 ? 'text-slate-400 cursor-not-allowed opacity-50' : 'text-primary bg-primary/10 hover:bg-primary/20'}`}
                                                            >
                                                                <span className="material-icons text-sm">chevron_left</span> Anterior
                                                            </button>
                                                            <span className="text-xs font-bold text-slate-500">
                                                                Página {currentPageChats} de {totalChatPages}
                                                            </span>
                                                            <button
                                                                onClick={() => setCurrentPageChats(prev => Math.min(prev + 1, totalChatPages))}
                                                                disabled={currentPageChats === totalChatPages}
                                                                className={`px-3 py-1.5 text-sm font-bold rounded-lg flex items-center gap-1 transition-all ${currentPageChats === totalChatPages ? 'text-slate-400 cursor-not-allowed opacity-50' : 'text-primary bg-primary/10 hover:bg-primary/20'}`}
                                                            >
                                                                Siguiente <span className="material-icons text-sm">chevron_right</span>
                                                            </button>
                                                        </div>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </main>
            </div>

            {/* Chat Details Modal */}
            {selectedChatModal && createPortal(
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white dark:bg-slate-800 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-scale-in flex flex-col max-h-[90vh]">
                        <div className="p-5 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
                            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <span className="material-icons text-primary text-xl">coffee</span>
                                Detalles de la Sesión
                            </h2>
                            <button onClick={() => setSelectedChatModal(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
                                <span className="material-icons">close</span>
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-6">
                            {/* Status & Participants */}
                            <div className="flex flex-wrap items-center justify-between gap-4">
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-md ${selectedChatModal.rol_en_cita === 'Estudiante' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30' : 'bg-purple-100 text-purple-700 dark:bg-purple-900/30'}`}>
                                            Como {selectedChatModal.rol_en_cita}
                                        </span>
                                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md ${selectedChatModal.estado === 'realizada' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                            selectedChatModal.estado === 'confirmada' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                                                selectedChatModal.estado === 'pendiente' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                                                    'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                            }`}>
                                            {selectedChatModal.estado}
                                        </span>
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-800 dark:text-white leading-tight">
                                        {selectedChatModal.tema}
                                    </h3>
                                    <p className="text-slate-500 text-sm mt-1">Con <span className="font-semibold text-slate-700 dark:text-slate-300">{selectedChatModal.otra_persona}</span></p>
                                </div>
                                <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center justify-center gap-2">
                                    <span className="material-icons text-primary/70">event</span>
                                    <div className="text-sm">
                                        <div className="font-bold text-slate-800 dark:text-white">{selectedChatModal.fecha}</div>
                                        <div className="text-slate-500 text-xs">{selectedChatModal.hora}</div>
                                    </div>
                                </div>
                            </div>

                            {/* Message / Objectives */}
                            <div>
                                <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2 flex items-center gap-1.5">
                                    <span className="material-icons text-[14px]">comment</span> Motivo de la Cita
                                </h4>
                                <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700/50 text-sm text-slate-700 dark:text-slate-300 break-words whitespace-pre-wrap">
                                    {selectedChatModal.otro_texto || <span className="italic text-slate-400">Sin detalles adicionales proporcionados.</span>}
                                </div>
                            </div>

                            {/* Info if happened */}
                            {(selectedChatModal.estado === 'realizada' || selectedChatModal.estado === 'confirmada') && selectedChatModal.fecha_realizada && (
                                <div>
                                    <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2 flex items-center gap-1.5">
                                        <span className="material-icons text-[14px]">check_circle</span> Ejecución
                                    </h4>
                                    <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl border border-slate-100 dark:border-slate-700/50 flex flex-wrap gap-4">
                                        <div className="flex items-center gap-2 text-sm">
                                            <span className="material-icons text-slate-400 text-lg">calendar_today</span>
                                            <div>
                                                <div className="text-slate-500 text-[10px] uppercase font-bold">Fecha Realizada</div>
                                                <div className="font-medium text-slate-800 dark:text-white">{selectedChatModal.fecha_realizada} {selectedChatModal.hora_realizada}</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Feedback Block */}
                            {selectedChatModal.estado === 'realizada' && (selectedChatModal.calificacion_general || selectedChatModal.calificacion_utilidad) && (
                                <div>
                                    <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2 flex items-center gap-1.5">
                                        <span className="material-icons text-[14px]">star</span> Reseña Completa
                                    </h4>
                                    <div className="bg-amber-50/50 dark:bg-amber-900/10 p-5 rounded-xl border border-amber-100 dark:border-amber-900/30">
                                        <div className="grid grid-cols-2 gap-6 mb-4">
                                            <div>
                                                <div className="text-xs text-slate-500 mb-1.5 font-medium">Mentor / Desempeño</div>
                                                {renderStars(selectedChatModal.calificacion_general)}
                                            </div>
                                            <div>
                                                <div className="text-xs text-slate-500 mb-1.5 font-medium">Utilidad / Impacto</div>
                                                {renderStars(selectedChatModal.calificacion_utilidad)}
                                            </div>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-amber-200/50 dark:border-amber-700/30">
                                            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-bold ${selectedChatModal.recomendaria ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                                                <span className="material-icons text-base">{selectedChatModal.recomendaria ? 'thumb_up' : 'thumb_down'}</span>
                                                {selectedChatModal.recomendaria ? 'Recomendó al mentor' : 'No recomendó al mentor'}
                                            </div>
                                            {selectedChatModal.se_dio_en_dia === false ? (
                                                <span className="text-sm font-bold text-amber-600 bg-amber-100 dark:bg-amber-900/30 px-3 py-1.5 rounded-lg border border-amber-200 dark:border-amber-800">Se reprogramó la fecha original</span>
                                            ) : (
                                                <span className="text-sm font-bold text-green-600 bg-green-100 dark:bg-green-900/30 px-3 py-1.5 rounded-lg border border-green-200 dark:border-green-800">Se respetó la fecha original</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {selectedChatModal.estado === 'realizada' && !selectedChatModal.calificacion_general && !selectedChatModal.calificacion_utilidad && (
                                <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl text-center border border-slate-100 dark:border-slate-800">
                                    <p className="text-slate-500 text-sm italic">El estudiante no completó la encuesta de satisfacción para esta cita.</p>
                                </div>
                            )}

                        </div>
                    </div>
                </div>
                , document.body)}

            {/* All Mentors Rated Modal */}
            {showTopMentorsModal && createPortal(
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white dark:bg-slate-800 w-full max-w-5xl rounded-3xl shadow-2xl overflow-hidden animate-scale-in flex flex-col max-h-[90vh]">
                        <div className="p-5 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
                            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <span className="material-icons text-amber-500 text-xl">workspace_premium</span>
                                Ranking Completo de Mentores
                            </h2>
                            <button onClick={() => setShowTopMentorsModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
                                <span className="material-icons">close</span>
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto custom-scrollbar flex-1 bg-slate-50/50 dark:bg-slate-900/30">
                            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-slate-50 dark:bg-slate-900/80 text-slate-500 text-[10px] uppercase tracking-wider border-b border-slate-200 dark:border-slate-700">
                                                <th className="p-4 font-black text-center w-16">Rank</th>
                                                <th className="p-4 font-black">Mentor</th>
                                                <th className="p-4 font-black text-center">Total Reseñas</th>
                                                <th className="p-4 font-black text-center">Calificación</th>
                                                <th className="p-4 font-black text-center">Recomendado</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                                            {currentMentors.map((stat, idx) => {
                                                const globalIdx = indexOfFirstMentor + idx;
                                                return (
                                                    <tr key={globalIdx} className="hover:bg-slate-50/80 dark:hover:bg-slate-700/30 transition-colors">
                                                        <td className="p-4 text-center">
                                                            {globalIdx < 3 ? (
                                                                <div className={`inline-flex items-center justify-center w-8 h-8 rounded-xl font-black text-sm mx-auto shadow-sm
                                                                    ${globalIdx === 0 ? 'bg-gradient-to-br from-amber-300 to-amber-500 text-white' : ''}
                                                                    ${globalIdx === 1 ? 'bg-gradient-to-br from-slate-300 to-slate-400 text-white' : ''}
                                                                    ${globalIdx === 2 ? 'bg-gradient-to-br from-orange-300 to-orange-500 text-white' : ''}
                                                                `}>
                                                                    {globalIdx + 1}
                                                                </div>
                                                            ) : (
                                                                <div className="inline-flex items-center justify-center w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 font-bold text-sm mx-auto">
                                                                    {globalIdx + 1}
                                                                </div>
                                                            )}
                                                        </td>
                                                        <td className="p-4">
                                                            <div className="flex items-center gap-3">
                                                                <div className="relative">
                                                                    <img
                                                                        src={stat.url_foto || `https://api.dicebear.com/9.x/notionists/svg?seed=${stat.mentor_name.replace(/\s/g, '')}&backgroundColor=transparent`}
                                                                        alt="Mentor"
                                                                        className={`w-10 h-10 rounded-full object-cover bg-white dark:bg-slate-900 ${globalIdx === 0 ? 'border-2 border-amber-400 p-0.5' : globalIdx === 1 ? 'border-2 border-slate-300 p-0.5' : globalIdx === 2 ? 'border-2 border-orange-400 p-0.5' : 'border border-slate-200 dark:border-slate-700'}`}
                                                                    />
                                                                </div>
                                                                <div>
                                                                    <h3 className="font-bold text-slate-900 dark:text-white leading-tight">{stat.mentor_name}</h3>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="p-4 text-center">
                                                            <span className="text-slate-600 dark:text-slate-400 font-bold bg-slate-100 dark:bg-slate-900/50 px-2 py-1 rounded text-xs">{stat.total_reviews} reviews</span>
                                                        </td>
                                                        <td className="p-4 text-center">
                                                            <div className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg border border-amber-100 dark:border-amber-900/30 bg-amber-50 dark:bg-amber-900/10">
                                                                <span className="font-black text-slate-900 dark:text-white">{stat.avg_total}</span>
                                                                <span className="material-icons text-amber-500 text-[16px]">star</span>
                                                            </div>
                                                        </td>
                                                        <td className="p-4 text-center">
                                                            <div className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg border border-green-100 dark:border-green-800/30 bg-green-50 dark:bg-green-900/10">
                                                                <span className="material-icons text-green-500 text-[16px]">thumb_up</span>
                                                                <span className="font-bold text-green-700 dark:text-green-400">{stat.total_recomendaciones}</span>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Pagination Controls for Mentors Modal */}
                            {totalMentorPages > 1 && (
                                <div className="flex items-center justify-between mt-6 bg-white dark:bg-slate-800 p-3 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                                    <button
                                        onClick={() => setCurrentPageMentors(prev => Math.max(prev - 1, 1))}
                                        disabled={currentPageMentors === 1}
                                        className={`flex items-center gap-1 px-4 py-2 rounded-xl font-bold text-sm transition-all ${currentPageMentors === 1 ? 'text-slate-400 bg-slate-50 dark:bg-slate-900 cursor-not-allowed' : 'text-slate-700 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600'}`}
                                    >
                                        <span className="material-icons text-sm">chevron_left</span> Anterior
                                    </button>
                                    <span className="text-sm font-bold text-slate-500 bg-slate-50 dark:bg-slate-900/50 px-4 py-2 rounded-xl border border-slate-100 dark:border-slate-800">
                                        Pág {currentPageMentors} / {totalMentorPages}
                                    </span>
                                    <button
                                        onClick={() => setCurrentPageMentors(prev => Math.min(prev + 1, totalMentorPages))}
                                        disabled={currentPageMentors === totalMentorPages}
                                        className={`flex items-center gap-1 px-4 py-2 rounded-xl font-bold text-sm transition-all ${currentPageMentors === totalMentorPages ? 'text-slate-400 bg-slate-50 dark:bg-slate-900 cursor-not-allowed' : 'text-slate-700 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600'}`}
                                    >
                                        Siguiente <span className="material-icons text-sm">chevron_right</span>
                                    </button>
                                </div>
                            )}

                        </div>
                    </div>
                </div>
                , document.body)}
        </div>
    );
};

export default AdminCoffeeChatsPage;
