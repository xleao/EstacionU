import React, { useState, useEffect, useRef } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import LakeBackground from '../components/LakeBackground';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const MySessionsPage = () => {
    const { user } = useAuth();
    const isMentor = user && ['mentor', 'graduate', 'egresado'].includes((user.role || '').toLowerCase());

    const [activeTab, setActiveTab] = useState('Todos');
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingSession, setEditingSession] = useState(null);
    const [editForm, setEditForm] = useState({ fecha: '', hora: '', tema: '', mensaje: '' });
    const [deletingId, setDeletingId] = useState(null);
    const [completingId, setCompletingId] = useState(null);
    const [completingAsMentor, setCompletingAsMentor] = useState(false);
    const [feedbackForm, setFeedbackForm] = useState({
        seDioEnDiaAcordado: null,
        fechaRealizada: '',
        horaRealizada: '',
        calificacionGeneral: 0,
        calificacionUtilidad: 0,
        recomendaria: null
    });
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 4;
    const [highlightId, setHighlightId] = useState(null);
    const location = useLocation();

    const formatShortName = (fullName) => {
        if (!fullName) return '';
        const parts = fullName.trim().split(/\s+/);
        if (parts.length === 1) return parts[0];
        return `${parts[0]} ${parts[1]}`;
    };

    useEffect(() => {
        const fetchSessions = async () => {
            const token = localStorage.getItem('token');
            if (!token) { setLoading(false); return; }
            try {
                let allSessions = [];

                if (isMentor) {
                    // Mentors fetch both: sessions they act as mentor, and sessions they requested as mentee
                    const [resMentor, resMe] = await Promise.all([
                        fetch('/api/appointments/mentor', { headers: { Authorization: `Bearer ${token}` } }),
                        fetch('/api/appointments/me', { headers: { Authorization: `Bearer ${token}` } })
                    ]);

                    if (resMentor.ok) {
                        const mentorData = await resMentor.json();
                        const mappedMentor = mentorData.map(s => ({
                            ...s,
                            mentorName: s.menteeName,
                            image: s.menteeImage,
                            sector: s.menteeCareer || 'Estudiante',
                            date: s.date + ' ' + s.time,
                            rawDate: s.rawDate,
                            rawHora: s.rawHora,
                            tema: s.tema,
                            mensaje: s.mensaje,
                            asMentor: true
                        }));
                        allSessions = [...allSessions, ...mappedMentor];
                    }

                    if (resMe.ok) {
                        const meData = await resMe.json();
                        const mappedMe = meData.map(s => ({
                            ...s,
                            asMentor: false // They requested it
                        }));
                        allSessions = [...allSessions, ...mappedMe];
                    }
                } else {
                    // Students only fetch /me
                    const response = await fetch('/api/appointments/me', {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    if (response.ok) {
                        const meData = await response.json();
                        allSessions = meData.map(s => ({
                            ...s,
                            asMentor: false // They requested it
                        }));
                    }
                }

                // Sort by ID descending (newest first)
                allSessions.sort((a, b) => b.id - a.id);
                setSessions(allSessions);

            } catch (error) {
                console.error("Error fetching sessions:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchSessions();
    }, [isMentor]);

    // Lock body scroll when details modal is open
    useEffect(() => {
        if (editingSession || completingId) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [editingSession, completingId]);

    const getToken = () => localStorage.getItem('token');

    const handleStatusChange = async (id, newStatus) => {
        // If trying to cancel, show confirmation modal first
        if (newStatus === 'cancelada') {
            setDeletingId(id);
            return;
        }

        // If trying to mark as completed, show feedback form first (only if student)
        if (newStatus === 'realizada') {
            const session = sessions.find(s => s.id === id);
            const isSessionAsMentor = session ? session.asMentor : false;

            setCompletingId(id);
            setCompletingAsMentor(isSessionAsMentor);

            if (!isSessionAsMentor) {
                setFeedbackForm({
                    seDioEnDiaAcordado: null,
                    fechaRealizada: '',
                    horaRealizada: '',
                    calificacionGeneral: 0,
                    calificacionUtilidad: 0,
                    recomendaria: null
                });
            }
            return;
        }

        const token = getToken();
        if (!token) return;
        try {
            const res = await fetch(`/api/appointments/${id}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ estado: newStatus })
            });
            if (res.ok) {
                setSessions(prev => prev.map(s => s.id === id ? { ...s, status: newStatus } : s));
            }
        } catch (err) { console.error(err); }
    };

    const isFeedbackValid = feedbackForm.seDioEnDiaAcordado !== null
        && feedbackForm.calificacionGeneral > 0
        && feedbackForm.calificacionUtilidad > 0
        && feedbackForm.recomendaria !== null
        && (feedbackForm.seDioEnDiaAcordado === true || (feedbackForm.fechaRealizada && feedbackForm.horaRealizada));

    const confirmComplete = async () => {
        if (!completingId) return;
        if (!completingAsMentor && !isFeedbackValid) return;

        const token = getToken();
        if (!token) return;

        try {
            const bodyData = completingAsMentor ? { estado: 'realizada' } : {
                estado: 'realizada',
                se_dio_en_dia_acordado: feedbackForm.seDioEnDiaAcordado,
                fecha_realizada: feedbackForm.seDioEnDiaAcordado ? null : feedbackForm.fechaRealizada,
                hora_realizada: feedbackForm.seDioEnDiaAcordado ? null : feedbackForm.horaRealizada,
                calificacion_general: feedbackForm.calificacionGeneral,
                calificacion_utilidad: feedbackForm.calificacionUtilidad,
                recomendaria_mentor: feedbackForm.recomendaria
            };

            const res = await fetch(`/api/appointments/${completingId}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify(bodyData)
            });
            if (res.ok) {
                setSessions(prev => prev.map(s => s.id === completingId ? { ...s, status: 'realizada' } : s));
            }
        } catch (err) { console.error(err); }
        setCompletingId(null);
    };
    const confirmDelete = async () => {
        if (!deletingId) return;
        const token = getToken();
        if (!token) return;
        try {
            // Instead of deleting, change status to 'cancelada'
            const res = await fetch(`/api/appointments/${deletingId}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ estado: 'cancelada' })
            });
            if (res.ok) {
                setSessions(prev => prev.map(s => s.id === deletingId ? { ...s, status: 'cancelada' } : s));
            }
        } catch (err) { console.error(err); }
        setDeletingId(null);
    };

    const openEdit = (session) => {
        setEditingSession(session);
        setEditForm({
            fecha: session.rawDate || '',
            hora: session.rawHora || '',
            tema: session.tema || '',
            mensaje: session.mensaje || ''
        });
    };

    const handleEditSave = async () => {
        const token = getToken();
        if (!token || !editingSession) return;
        try {
            const res = await fetch(`/api/appointments/${editingSession.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify(editForm)
            });
            if (res.ok) {
                setSessions(prev => prev.map(s => s.id === editingSession.id ? {
                    ...s,
                    tema: editForm.tema,
                    mensaje: editForm.mensaje,
                    rawDate: editForm.fecha,
                    rawHora: editForm.hora,
                    date: editForm.fecha + ' ' + editForm.hora
                } : s));
                setEditingSession(null);
            }
        } catch (err) { console.error(err); }
    };

    const filteredSessions = sessions.filter(session => {
        const s = (session.status || '').toLowerCase();
        if (activeTab === 'Todos') return true;
        if (activeTab === 'Confirmados') return s === 'confirmada' || s === 'confirmado';
        if (activeTab === 'Por confirmar') return s === 'pendiente';
        if (activeTab === 'Historial') return s === 'realizada' || s === 'cancelada';
        return true;
    });

    const totalPages = Math.ceil(filteredSessions.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentSessions = filteredSessions.slice(indexOfFirstItem, indexOfLastItem);

    useEffect(() => {
        setCurrentPage(1);
    }, [activeTab]);

    const statusConfig = {
        pendiente: { label: 'Por confirmar', bg: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400' },
        confirmada: { label: 'Confirmado', bg: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' },
        realizada: { label: 'Finalizado', bg: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' },
        cancelada: { label: 'Cancelado', bg: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' },
    };

    const getStatusBadge = (status) => {
        const s = (status || '').toLowerCase();
        const config = statusConfig[s];
        if (!config) return null;
        return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg}`}>{config.label}</span>;
    };

    const isConfirmed = (status) => {
        const s = (status || '').toLowerCase();
        return s === 'confirmada' || s === 'confirmado';
    };

    // Highlight effect from dashboard click
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const hId = params.get('highlight');
        if (hId && !loading && sessions.length > 0) {
            const numId = parseInt(hId);
            setHighlightId(numId);

            // Find which page this session is on
            const sessionIndex = filteredSessions.findIndex(s => s.id === numId);
            if (sessionIndex !== -1) {
                const pageNum = Math.floor(sessionIndex / itemsPerPage) + 1;
                setCurrentPage(pageNum);
            }

            // Scroll to card after a short delay for render
            setTimeout(() => {
                const el = document.getElementById(`session-${numId}`);
                if (el) {
                    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }, 300);
        }
    }, [loading, sessions, location.search, filteredSessions.length]);

    // Helper to get optimized image URL
    const getAvatarUrl = (session) => {
        const img = session.mentor_image || session.image;
        if (img && img !== "https://via.placeholder.com/150") {
            // Optimization for Google Images to ensure high quality
            if (img.includes('googleusercontent.com')) {
                // Check if it already has size param
                if (img.match(/=s\d+/)) {
                    return img.replace(/=s\d+(-c)?/g, '=s400-c');
                }
                // If no size param, append it
                return `${img}=s400-c`;
            }
            return img;
        }
        return `https://api.dicebear.com/9.x/notionists/svg?seed=${(session.mentorName || 'User').replace(/\s/g, '')}&backgroundColor=transparent`;
    };

    return (
        <div className="bg-background-light dark:bg-background-dark text-[#111417] dark:text-slate-100 min-h-screen font-sans selection:bg-[#3C96E0]/20 transition-colors duration-300 relative">
            <LakeBackground blur="blur-[40px]" />
            <div className="relative z-10">
                <Navbar />

                <main className="max-w-5xl mx-auto px-4 py-12">
                    <style>{`
                        @keyframes sessFadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
                        @keyframes sessSlideIn { from { opacity: 0; transform: translateX(-16px); } to { opacity: 1; transform: translateX(0); } }
                        @keyframes sessScaleIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
                        @keyframes modalFadeIn { from { opacity: 0; } to { opacity: 1; } }
                        @keyframes modalScaleUp { from { opacity: 0; transform: scale(0.92) translateY(12px); } to { opacity: 1; transform: scale(1) translateY(0); } }
                        .sess-card { animation: sessFadeUp 0.5s ease-out both; }
                        .modal-backdrop-anim { animation: modalFadeIn 0.25s ease-out both; }
                        .modal-card-anim { animation: modalScaleUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) both; }
                        @keyframes sessHighlight {
                            0% { border-color: #4ade80; box-shadow: 0 0 0 0 rgba(74, 222, 128, 0.4); }
                            25% { border-color: #22c55e; box-shadow: 0 0 20px 4px rgba(34, 197, 94, 0.25); }
                            50% { border-color: #4ade80; box-shadow: 0 0 10px 2px rgba(74, 222, 128, 0.15); }
                            75% { border-color: #22c55e; box-shadow: 0 0 20px 4px rgba(34, 197, 94, 0.2); }
                            100% { border-color: #e2e8f0; box-shadow: none; }
                        }
                        .sess-highlight { animation: sessHighlight 2.5s ease-out forwards !important; }
                    `}</style>

                    <header className="mb-10 text-center md:text-left" style={{ animation: 'sessSlideIn 0.5s ease-out both' }}>
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center justify-center md:justify-start gap-3">
                            <span className="material-icons text-4xl text-primary">coffee</span>
                            Mis Coffee Chats
                        </h1>
                        <p className="text-slate-400 mt-2 font-medium">{isMentor ? 'Gestiona las solicitudes de tus estudiantes.' : 'Gestiona tus solicitudes de mentoría y conexiones directas.'}</p>
                    </header>

                    {/* Tabs */}
                    <div className="flex border-b border-slate-200 dark:border-zinc-800 mb-8 overflow-x-auto" style={{ animation: 'sessFadeUp 0.5s ease-out both 0.1s' }}>
                        {['Todos', 'Confirmados', 'Por confirmar', 'Historial'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-6 py-3 whitespace-nowrap transition-all duration-300 relative ${activeTab === tab
                                    ? 'font-semibold text-primary'
                                    : 'font-medium text-slate-400 hover:text-primary'
                                    }`}
                            >
                                {tab}
                                {activeTab === tab && (
                                    <span className="absolute bottom-0 left-2 right-2 h-[2px] bg-primary rounded-full" style={{ animation: 'sessScaleIn 0.2s ease-out both' }} />
                                )}
                            </button>
                        ))}
                    </div>

                    {/* Cards */}
                    <div className="space-y-4">
                        {loading ? (
                            <div className="space-y-4">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-slate-100 dark:border-zinc-800 animate-pulse flex items-center gap-5">
                                        <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-zinc-800" />
                                        <div className="flex-1 space-y-2">
                                            <div className="h-4 w-40 bg-slate-100 dark:bg-zinc-800 rounded-lg" />
                                            <div className="h-3 w-28 bg-slate-50 dark:bg-zinc-800/50 rounded-lg" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : filteredSessions.length === 0 ? (
                            <div className="bg-white dark:bg-zinc-900 p-10 rounded-2xl shadow-sm border border-slate-100 dark:border-zinc-800 text-center" style={{ animation: 'sessFadeUp 0.5s ease-out both' }}>
                                <span className="material-icons text-5xl text-slate-200 dark:text-zinc-700 mb-3">event_busy</span>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No hay sesiones en esta pestaña</h3>
                                <p className="text-slate-400">{isMentor ? 'Las solicitudes de los estudiantes aparecerán aquí.' : 'Las sesiones de mentoría que agendes desde el catálogo aparecerán aquí.'}</p>
                            </div>
                        ) : (
                            <>
                                {currentSessions.map((session, idx) => {
                                    // Role shown next to the name:
                                    // - For estudiantes viendo sus citas: siempre mostrar al Mentor
                                    // - Para mentores: mostrar el rol del estudiante (menteeRole)
                                    const rawRole = isMentor
                                        ? (session.menteeRole || 'estudiante')
                                        : (session.otherProfile?.role || 'mentor');
                                    const roleLower = (rawRole || '').toLowerCase();
                                    const isStudentProfile = roleLower.includes('estudiante') || roleLower.includes('student');
                                    const isMentorProfile = roleLower.includes('mentor') || roleLower.includes('egresado') || roleLower.includes('graduate');
                                    const roleLabel = isStudentProfile
                                        ? 'Estudiante'
                                        : (isMentorProfile ? 'Mentor' : 'Egresado');

                                    return (
                                        <div
                                            key={session.id}
                                            id={`session-${session.id}`}
                                            className={`sess-card bg-white dark:bg-zinc-900 p-4 md:py-3.5 md:px-6 rounded-2xl shadow-sm border-2 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5 group ${highlightId === session.id
                                                ? 'border-green-400 shadow-lg shadow-green-400/20 sess-highlight'
                                                : 'border-slate-100 dark:border-zinc-800 hover:border-slate-200'
                                                }`}
                                            style={{ animationDelay: `${idx * 60}ms` }}
                                        >
                                            {/* Left: Avatar + Info */}
                                            <div className="flex items-center gap-4">
                                                <div className="relative flex-shrink-0">
                                                    <img
                                                        alt="Mentor"
                                                        className={`w-14 h-14 rounded-full object-cover border-2 transition-all duration-300 group-hover:scale-105 ${isConfirmed(session.status) ? 'border-primary/20 group-hover:border-primary/40' : 'border-slate-200 dark:border-zinc-700 group-hover:border-slate-300'}`}
                                                        src={getAvatarUrl(session)}
                                                    />
                                                    {isConfirmed(session.status) && (
                                                        <span className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-white dark:border-zinc-900 rounded-full"></span>
                                                    )}
                                                </div>
                                                <div className="flex flex-col gap-1">
                                                    {/* Line 1: Name & Role Badge */}
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors duration-300">
                                                            {formatShortName(session.mentorName)}
                                                        </h3>

                                                        <div className="flex items-center gap-1 px-2 py-0.5 rounded border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800/50 text-slate-500 dark:text-slate-400">
                                                            <span className="material-icons text-[12px] opacity-70">
                                                                {isStudentProfile ? 'school' : 'workspace_premium'}
                                                            </span>
                                                            <span className="text-[10px] font-bold uppercase tracking-widest">
                                                                {roleLabel}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    {/* Line 2: Enviada / Recibida Badge (Only if applicable) */}
                                                    {session.asMentor !== undefined && (
                                                        <div>
                                                            <span className={`inline-block text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${session.asMentor ? 'bg-[#f4e8ff] text-[#9333ea] dark:bg-purple-900/30 dark:text-purple-300' : 'bg-[#e0f2fe] text-[#0284c7] dark:bg-blue-900/30 dark:text-blue-300'}`}>
                                                                {session.asMentor ? 'Recibida' : 'Enviada'}
                                                            </span>
                                                        </div>
                                                    )}

                                                    {/* Line 3: Sector/Career */}
                                                    <p className="text-sm text-slate-500 dark:text-slate-400">
                                                        {session.otherProfile?.career || session.sector}
                                                    </p>

                                                    {/* Line 4: Status Badge & Date */}
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        {getStatusBadge(session.status)}
                                                        {session.date && (
                                                            <span className="text-xs text-slate-400 dark:text-slate-500 flex items-center gap-1.5 ml-1">
                                                                <span className="material-icons text-[14px]">calendar_today</span>
                                                                {session.date}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Right: Actions */}
                                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 md:flex-shrink-0">
                                                <div className="relative">
                                                    <select
                                                        value={(session.status || '').toLowerCase()}
                                                        onChange={(e) => handleStatusChange(session.id, e.target.value)}
                                                        disabled={(session.status || '').toLowerCase() === 'cancelada' || (session.status || '').toLowerCase() === 'realizada'}
                                                        className={`custom-select w-full border-2 text-sm font-bold rounded-xl px-4 py-2.5 pr-10 outline-none shadow-sm min-w-[140px] ${(session.status || '').toLowerCase() === 'cancelada' || (session.status || '').toLowerCase() === 'realizada'
                                                            ? 'bg-slate-100 dark:bg-zinc-800/50 border-slate-200 dark:border-zinc-700 text-slate-400 dark:text-slate-500 cursor-not-allowed'
                                                            : 'bg-white dark:bg-zinc-800 border-slate-100 dark:border-zinc-800 text-slate-700 dark:text-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/5'
                                                            }`}
                                                    >
                                                        <option value="pendiente">Por confirmar</option>
                                                        <option value="confirmada">Confirmada</option>
                                                        <option value="realizada">Realizada</option>
                                                        <option value="cancelada">Cancelada</option>
                                                    </select>
                                                </div>

                                                {/* WhatsApp / Blocked */}
                                                {isConfirmed(session.status) ? (
                                                    <button
                                                        onClick={() => {
                                                            const phone = session.otherProfile?.phone;
                                                            if (phone) {
                                                                const cleanPhone = phone.replace(/\D/g, '');
                                                                const finalPhone = cleanPhone.length === 9 && cleanPhone.startsWith('9') ? `51${cleanPhone}` : cleanPhone;
                                                                window.open(`https://api.whatsapp.com/send?phone=${finalPhone}`, '_blank');
                                                            } else {
                                                                alert('El número de WhatsApp no está disponible.');
                                                            }
                                                        }}
                                                        className="flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#128C7E] text-white px-5 py-2.5 rounded-xl font-semibold transition-all text-sm active:scale-95 hover:shadow-lg hover:shadow-[#25D366]/20"
                                                    >
                                                        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.771-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.512-2.96-2.626-.087-.114-.694-.925-.694-1.763 0-.838.441-1.249.598-1.417.157-.168.343-.21.458-.21.114 0 .229.001.328.005.105.004.246-.04.385.293.144.344.487 1.189.529 1.274.043.085.071.184.014.3-.056.115-.085.184-.171.285-.085.101-.186.226-.265.304-.101.099-.205.206-.086.411.119.205.529.873 1.139 1.415.787.699 1.448.916 1.653 1.02.205.103.324.085.441-.051.115-.136.486-.567.615-.761.129-.193.258-.163.441-.095.186.069 1.172.553 1.372.652.2.099.333.146.382.23.049.084.049.49-.095.895z"></path></svg>
                                                        Chat WhatsApp
                                                    </button>
                                                ) : (
                                                    <button className="bg-slate-50 dark:bg-zinc-800 text-slate-400 dark:text-slate-500 px-5 py-2.5 rounded-xl font-medium cursor-not-allowed border border-slate-100 dark:border-zinc-700 text-sm">
                                                        Chat bloqueado
                                                    </button>
                                                )}

                                                {/* Info & Edit */}
                                                <button
                                                    onClick={() => openEdit(session)}
                                                    className="group flex items-center justify-center gap-2 bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 hover:bg-primary hover:text-white px-5 py-2.5 rounded-xl font-bold transition-all duration-300 active:scale-95 shadow-sm hover:shadow-lg hover:shadow-primary/30 border border-blue-100 dark:border-blue-800/50 hover:border-transparent"
                                                    title="Ver perfil completo e información de cita"
                                                >
                                                    <span className="text-sm">Detalles</span>
                                                    <span className="material-icons text-[18px] group-hover:scale-110 group-hover:rotate-6 transition-transform">visibility</span>
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                                {/* Pagination Controls */}
                                {totalPages > 1 && (
                                    <div className="flex items-center justify-center gap-4 mt-12 py-4" style={{ animation: 'sessFadeUp 0.6s ease-out both' }}>
                                        <button
                                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                            disabled={currentPage === 1}
                                            className={`w-12 h-12 flex items-center justify-center rounded-2xl border-2 transition-all duration-300 ${currentPage === 1
                                                ? 'border-slate-100 dark:border-zinc-800 text-slate-300 dark:text-zinc-700 cursor-not-allowed'
                                                : 'border-slate-100 dark:border-zinc-800 text-primary hover:border-primary hover:bg-primary/5 active:scale-90'
                                                }`}
                                        >
                                            <span className="material-icons">chevron_left</span>
                                        </button>
                                        <div className="flex items-center gap-2">
                                            {[...Array(totalPages)].map((_, i) => (
                                                <button
                                                    key={i}
                                                    onClick={() => setCurrentPage(i + 1)}
                                                    className={`w-10 h-10 rounded-xl text-sm font-bold transition-all duration-300 ${currentPage === i + 1
                                                        ? 'bg-primary text-white shadow-lg shadow-primary/30 scale-110'
                                                        : 'text-slate-400 hover:text-primary hover:bg-primary/5'
                                                        }`}
                                                >
                                                    {i + 1}
                                                </button>
                                            ))}
                                        </div>
                                        <button
                                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                            disabled={currentPage === totalPages}
                                            className={`w-12 h-12 flex items-center justify-center rounded-2xl border-2 transition-all duration-300 ${currentPage === totalPages
                                                ? 'border-slate-100 dark:border-zinc-800 text-slate-300 dark:text-zinc-700 cursor-not-allowed'
                                                : 'border-slate-100 dark:border-zinc-800 text-primary hover:border-primary hover:bg-primary/5 active:scale-90'
                                                }`}
                                        >
                                            <span className="material-icons">chevron_right</span>
                                        </button>
                                    </div>
                                )
                                }
                            </>
                        )}
                    </div>

                    {/* CTA Section */}
                    <div className="mt-16 bg-slate-50/80 dark:bg-zinc-800/50 p-10 rounded-3xl text-center border border-slate-200/60 dark:border-zinc-700 hover:shadow-lg hover:shadow-primary/5 transition-all duration-500" style={{ animation: 'sessFadeUp 0.6s ease-out both 0.4s' }}>
                        <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white">¿Buscas más consejos?</h2>
                        <p className="text-slate-400 mb-8 max-w-lg mx-auto">Continúa conectando con expertos en diversas industrias para impulsar tu carrera profesional.</p>
                        <Link className="inline-flex items-center justify-center bg-primary hover:bg-blue-600 text-white px-8 py-3 rounded-2xl font-bold transition-all hover:-translate-y-0.5 active:scale-95 shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 group" to="/mentores">
                            Explorar Catálogo de Mentores
                            <span className="material-icons ml-2 group-hover:translate-x-1 transition-transform">arrow_forward</span>
                        </Link>
                    </div>
                </main>

                {/* Expanded Info & Edit Modal */}
                {
                    editingSession && (
                        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 overflow-hidden" onClick={() => setEditingSession(null)}>
                            <div
                                className="bg-white dark:bg-[#0f172a] rounded-[2.5rem] shadow-2xl w-full max-w-xl p-0 border border-white/20 dark:border-slate-800/50 max-h-[92vh] flex flex-col overflow-hidden transform transition-all animate-in fade-in zoom-in duration-300"
                                onClick={(e) => e.stopPropagation()}
                            >
                                {/* Top Banner/Header */}
                                <div className="relative h-28 sm:h-32 bg-gradient-to-br from-primary/20 via-primary/5 to-transparent dark:from-primary/20 dark:via-slate-900/60 dark:to-transparent overflow-hidden">
                                    <div className="absolute top-0 right-0 p-4 sm:p-6 z-20">
                                        <button
                                            onClick={() => setEditingSession(null)}
                                            className="w-10 h-10 rounded-full bg-black/5 hover:bg-black/10 dark:bg-white/5 dark:hover:bg-white/10 backdrop-blur-md flex items-center justify-center text-slate-500 dark:text-slate-400 transition-all active:scale-90"
                                        >
                                            <span className="material-icons text-xl">close</span>
                                        </button>
                                    </div>
                                    {/* Soft decorative blur */}
                                    <div className="absolute top-[-20%] right-[-10%] w-40 h-40 bg-primary/15 rounded-full blur-3xl"></div>
                                </div>

                                {/* Profile Area (Overlapping the banner) */}
                                <div className="px-6 sm:px-10 -mt-6 sm:-mt-8 relative z-10 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 flex-wrap sm:flex-nowrap">
                                    <div className="relative shrink-0">
                                        <div className="absolute -inset-1 bg-gradient-to-tr from-primary to-blue-400 rounded-[2.2rem] blur opacity-25"></div>
                                        <img
                                            src={editingSession.otherProfile?.image || editingSession.menteeImage || editingSession.mentor_image || 'https://via.placeholder.com/150'}
                                            alt="Profile"
                                            className="w-24 h-24 sm:w-28 sm:h-28 rounded-[1.6rem] object-cover border-4 border-white dark:border-slate-900 shadow-xl relative z-10"
                                        />
                                        <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-xl bg-primary text-white flex items-center justify-center shadow-lg border-2 border-white dark:border-slate-900 z-20">
                                            <span className="material-icons text-lg">
                                                {editingSession.otherProfile?.role?.toLowerCase().includes('mentor') ? 'workspace_premium' : 'school'}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="pb-2 sm:pb-4 text-center sm:text-left flex-grow min-w-[180px] sm:min-w-0 space-y-1.5">
                                        <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white leading-tight truncate max-w-full">
                                            {formatShortName(editingSession.otherProfile?.name || editingSession.mentorName || editingSession.menteeName)}
                                        </h2>
                                        <div className="flex flex-wrap items-center gap-2">
                                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 dark:bg-primary/20 text-primary text-[10px] font-bold uppercase tracking-[0.18em]">
                                                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
                                                {editingSession.otherProfile?.role || 'Usuario'}
                                            </div>
                                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/70 text-[11px] font-medium text-slate-600 dark:text-slate-300">
                                                {editingSession.otherProfile?.company_logo ? (
                                                    <span className="w-6 h-6 rounded-full bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-700 overflow-hidden flex items-center justify-center">
                                                        <img
                                                            src={editingSession.otherProfile.company_logo}
                                                            alt={editingSession.otherProfile.company || 'Logo de empresa'}
                                                            className="w-full h-full object-contain"
                                                        />
                                                    </span>
                                                ) : (
                                                    <span className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-700 border border-slate-200/70 dark:border-slate-700 flex items-center justify-center">
                                                        <span className="material-icons text-[14px] text-slate-400 dark:text-slate-300">business</span>
                                                    </span>
                                                )}
                                                <span className="truncate max-w-[140px] sm:max-w-[180px]">
                                                    {editingSession.otherProfile?.company || 'Empresa no especificada'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Main Content (Scrollable) */}
                                <div className="px-6 sm:px-10 py-6 sm:py-8 overflow-y-auto flex-grow space-y-8 custom-scrollbar">

                                    {/* Contact Section */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="flex items-center gap-4 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-700/50 transition-all hover:border-primary/20">
                                            <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-primary/10 text-primary">
                                                <span className="material-icons text-lg">alternate_email</span>
                                            </div>
                                            <div className="flex flex-col min-w-0">
                                                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none mb-1">Email</span>
                                                <span className="text-sm font-bold text-slate-700 dark:text-slate-300 truncate">
                                                    {editingSession.otherProfile?.email || 'No disponible'}
                                                </span>
                                            </div>
                                        </div>
                                        {editingSession.otherProfile?.phone && (
                                            <div className="flex items-center gap-4 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-700/50 transition-all hover:border-primary/20">
                                                <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-green-500/10 text-green-500">
                                                    <span className="material-icons text-lg">chat_bubble</span>
                                                </div>
                                                <div className="flex flex-col min-w-0">
                                                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none mb-1">WhatsApp</span>
                                                    <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                                                        {editingSession.otherProfile.phone}
                                                    </span>
                                                </div>
                                            </div>
                                        )}
                                        {editingSession.otherProfile?.linkedin && (
                                            <a
                                                href={editingSession.otherProfile.linkedin}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="sm:col-span-2 flex items-center justify-between p-3 rounded-2xl bg-blue-50/50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/50 transition-all hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:shadow-md group"
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-blue-500 text-white shadow-lg shadow-blue-500/20">
                                                        <span className="material-icons text-lg">link</span>
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-[10px] font-bold text-blue-400 dark:text-blue-500 uppercase tracking-widest leading-none mb-1">LinkedIn</span>
                                                        <span className="text-sm font-bold text-blue-600 dark:text-blue-400">Ver Perfil Profesional</span>
                                                    </div>
                                                </div>
                                                <span className="material-icons text-blue-400 group-hover:translate-x-1 transition-transform">arrow_forward</span>
                                            </a>
                                        )}
                                    </div>

                                    {/* Career & Bio Cards */}
                                    <div className="space-y-4">
                                        {(editingSession.otherProfile?.career || editingSession.otherProfile?.university) && (
                                            <div className="bg-white dark:bg-slate-900/50 rounded-3xl p-6 border-2 border-slate-50 dark:border-slate-800 shadow-sm relative overflow-hidden group">
                                                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                                    <span className="material-icons text-6xl text-primary">school</span>
                                                </div>
                                                <div className="flex items-center gap-3 mb-4">
                                                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                                                        <span className="material-icons text-sm">workspace_premium</span>
                                                    </div>
                                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">Trayectoria Académica</span>
                                                </div>
                                                <div className="space-y-2 relative z-10">
                                                    <p className="text-xl font-black text-slate-800 dark:text-slate-100 leading-tight">
                                                        {editingSession.otherProfile?.career}
                                                    </p>
                                                    <p className="text-xs font-bold text-slate-400 dark:text-slate-500 flex items-center gap-1">
                                                        <span className="material-icons text-sm opacity-50">location_on</span>
                                                        {editingSession.otherProfile?.university}
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                        {editingSession.otherProfile?.bio && (
                                            <div className="bg-slate-50/50 dark:bg-slate-800/20 rounded-3xl p-6 border border-slate-100 dark:border-slate-800/50">
                                                <div className="flex items-center gap-3 mb-4">
                                                    <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-500">
                                                        <span className="material-icons text-sm">auto_awesome</span>
                                                    </div>
                                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">Sobre {editingSession.otherProfile?.name?.split(' ')[0]}</span>
                                                </div>
                                                <p className="text-sm text-slate-600 dark:text-slate-400 italic leading-relaxed font-medium">
                                                    "{editingSession.otherProfile.bio}"
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Appointment Details */}
                                    <div className="space-y-6 pt-2">
                                        <div className="flex items-center gap-4">
                                            <div className="h-px bg-slate-100 dark:bg-slate-800 flex-grow"></div>
                                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-300 dark:text-slate-600">Gestión de Cita</span>
                                            <div className="h-px bg-slate-100 dark:bg-slate-800 flex-grow"></div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-100 dark:border-slate-700/50">
                                                <label className="text-[9px] font-bold uppercase tracking-widest text-slate-400 block mb-1">Fecha</label>
                                                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                                                    <span className="material-icons text-sm text-primary">calendar_today</span>
                                                    <span className="text-sm font-bold">{editForm.fecha || 'N/A'}</span>
                                                </div>
                                            </div>
                                            <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-100 dark:border-slate-700/50">
                                                <label className="text-[9px] font-bold uppercase tracking-widest text-slate-400 block mb-1">Horario</label>
                                                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                                                    <span className="material-icons text-sm text-primary">schedule</span>
                                                    <span className="text-sm font-bold">{editForm.hora || 'N/A'}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <div>
                                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-2 mb-2 block">Tema Principal</label>
                                                <div className="relative group">
                                                    <span className="material-icons absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors text-lg">topic</span>
                                                    <input
                                                        type="text"
                                                        value={editForm.tema}
                                                        onChange={(e) => setEditForm({ ...editForm, tema: e.target.value })}
                                                        placeholder="Asunto de la sesión"
                                                        className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white dark:bg-slate-800 border-2 border-slate-50 dark:border-slate-800 text-slate-700 dark:text-slate-200 text-sm font-bold outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all"
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-2 mb-2 block">Mensaje / Notas</label>
                                                <div className="relative group">
                                                    <span className="material-icons absolute left-4 top-4 text-slate-300 group-focus-within:text-primary transition-colors text-lg">notes</span>
                                                    <textarea
                                                        value={editForm.mensaje}
                                                        onChange={(e) => setEditForm({ ...editForm, mensaje: e.target.value })}
                                                        placeholder="Detalles adicionales..."
                                                        rows="3"
                                                        className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white dark:bg-slate-800 border-2 border-slate-50 dark:border-slate-800 text-slate-700 dark:text-slate-200 text-sm font-semibold outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all resize-none"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Actions Footer */}
                                <div className="p-6 sm:p-8 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row gap-3">
                                    <button
                                        onClick={() => setEditingSession(null)}
                                        className="flex-1 py-4 px-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 font-bold text-xs uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-slate-700 transition-all active:scale-95"
                                    >
                                        Cerrar
                                    </button>
                                    <button
                                        onClick={handleEditSave}
                                        className="flex-[2] py-4 px-6 rounded-2xl bg-primary hover:bg-blue-600 text-white font-bold text-xs uppercase tracking-widest shadow-xl shadow-primary/20 hover:shadow-2xl hover:shadow-primary/30 transition-all active:scale-95 flex items-center justify-center gap-2"
                                    >
                                        <span className="material-icons text-sm">save</span>
                                        Actualizar Cita
                                    </button>
                                </div>
                            </div>
                        </div>
                    )
                }






                {/* Simple Confirmation Modal for Mentors */}
                {completingId && completingAsMentor && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-md animate-fade-in" onClick={() => setCompletingId(null)}>
                        <div
                            className="bg-white dark:bg-slate-800 p-8 rounded-[2rem] shadow-2xl border border-slate-100 dark:border-slate-700 max-w-sm w-full mx-4 transform transition-all"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="text-center">
                                <div className="w-20 h-20 rounded-full bg-green-50 dark:bg-green-500/10 flex items-center justify-center mx-auto mb-6 relative group">
                                    <div className="absolute inset-0 bg-green-500/20 rounded-full animate-ping opacity-75"></div>
                                    <span className="material-icons text-4xl text-green-500 relative z-10 transition-transform duration-300 group-hover:scale-110">check_circle</span>
                                </div>
                                <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">¡Marcar como Realizada!</h3>
                                <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-[280px] mx-auto text-sm">
                                    Confirma que esta sesión se llevó a cabo exitosamente. <strong>Este estado no podrá revertirse.</strong>
                                </p>
                                <div className="flex space-x-3">
                                    <button
                                        onClick={() => setCompletingId(null)}
                                        className="flex-1 py-3.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 active:scale-95 transition-all"
                                    >
                                        Volver
                                    </button>
                                    <button
                                        onClick={confirmComplete}
                                        className="flex-1 py-3.5 px-4 rounded-xl bg-green-500 hover:bg-green-600 text-white font-semibold active:scale-95 transition-all shadow-lg shadow-green-500/30"
                                    >
                                        Confirmar
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Complete Feedback Form Modal (For Students) */}
                {
                    completingId && !completingAsMentor && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-md modal-backdrop-anim overflow-hidden" onClick={() => setCompletingId(null)}>
                            <div
                                className="modal-card-anim bg-white dark:bg-slate-800 rounded-[2rem] shadow-2xl border border-slate-100 dark:border-slate-700 max-w-md w-full mx-4 max-h-[85vh] flex flex-col overflow-hidden"
                                onClick={(e) => e.stopPropagation()}
                            >
                                {/* Header */}
                                <div className="p-6 pb-4 border-b border-slate-100 dark:border-slate-700">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-2xl bg-green-50 dark:bg-green-500/10 flex items-center justify-center">
                                            <span className="material-icons text-2xl text-green-500">task_alt</span>
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-slate-800 dark:text-white">Coffee Chat Realizado</h3>
                                            <p className="text-xs text-slate-400">Completa el formulario para finalizar</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Scrollable Content */}
                                <div className="overflow-y-auto flex-1 p-6 space-y-6 custom-scrollbar">

                                    {/* Question 1: Did it happen on the scheduled date? */}
                                    <div className="space-y-3">
                                        <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">¿La cita se dio en el día acordado?</label>
                                        <div className="grid grid-cols-2 gap-3">
                                            <button
                                                type="button"
                                                onClick={() => setFeedbackForm({ ...feedbackForm, seDioEnDiaAcordado: true })}
                                                className={`py-3 px-4 rounded-2xl border-2 font-bold text-sm transition-all ${feedbackForm.seDioEnDiaAcordado === true
                                                    ? 'border-green-500 bg-green-50 dark:bg-green-500/10 text-green-600'
                                                    : 'border-slate-100 dark:border-slate-700 text-slate-500 hover:border-green-300'
                                                    }`}
                                            >
                                                <span className="material-icons text-lg align-middle mr-1">check_circle</span>
                                                Sí, en el día acordado
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setFeedbackForm({ ...feedbackForm, seDioEnDiaAcordado: false })}
                                                className={`py-3 px-4 rounded-2xl border-2 font-bold text-sm transition-all ${feedbackForm.seDioEnDiaAcordado === false
                                                    ? 'border-amber-500 bg-amber-50 dark:bg-amber-500/10 text-amber-600'
                                                    : 'border-slate-100 dark:border-slate-700 text-slate-500 hover:border-amber-300'
                                                    }`}
                                            >
                                                <span className="material-icons text-lg align-middle mr-1">event_busy</span>
                                                No, otro día
                                            </button>
                                        </div>
                                    </div>

                                    {/* Date/Time fields if NOT on scheduled date */}
                                    {feedbackForm.seDioEnDiaAcordado === false && (
                                        <div className="space-y-3 p-4 bg-amber-50/50 dark:bg-amber-900/10 rounded-2xl border border-amber-100 dark:border-amber-800/30">
                                            <label className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">¿En qué fecha y hora se realizó?</label>
                                            <div className="grid grid-cols-2 gap-3">
                                                <div>
                                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Fecha</label>
                                                    <input
                                                        type="date"
                                                        value={feedbackForm.fechaRealizada}
                                                        onChange={(e) => setFeedbackForm({ ...feedbackForm, fechaRealizada: e.target.value })}
                                                        className="w-full px-3 py-2.5 rounded-xl border-2 border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-bold text-slate-700 dark:text-slate-200 outline-none focus:border-primary/40"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Hora</label>
                                                    <input
                                                        type="time"
                                                        value={feedbackForm.horaRealizada}
                                                        onChange={(e) => setFeedbackForm({ ...feedbackForm, horaRealizada: e.target.value })}
                                                        className="w-full px-3 py-2.5 rounded-xl border-2 border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-bold text-slate-700 dark:text-slate-200 outline-none focus:border-primary/40"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Divider */}
                                    <div className="flex items-center gap-3">
                                        <div className="h-px bg-slate-100 dark:bg-slate-700 flex-grow"></div>
                                        <span className="text-[9px] font-bold text-slate-300 dark:text-slate-600 uppercase tracking-widest">Conformidad</span>
                                        <div className="h-px bg-slate-100 dark:bg-slate-700 flex-grow"></div>
                                    </div>

                                    {/* Question 2: General Rating */}
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">¿Cómo fue la experiencia de plataforma?</label>
                                        <p className="text-[10px] text-slate-400 font-medium -mt-1">(agendar, notificaciones, etc.)</p>
                                        <div className="flex gap-2">
                                            {[1, 2, 3, 4, 5].map(star => (
                                                <button
                                                    key={star}
                                                    type="button"
                                                    onClick={() => setFeedbackForm({ ...feedbackForm, calificacionGeneral: star })}
                                                    className={`w-12 h-12 rounded-xl border-2 flex items-center justify-center transition-all text-lg ${feedbackForm.calificacionGeneral >= star
                                                        ? 'border-yellow-400 bg-yellow-50 dark:bg-yellow-500/10 text-yellow-500 scale-110 shadow-md shadow-yellow-400/20'
                                                        : 'border-slate-100 dark:border-slate-700 text-slate-300 dark:text-slate-600 hover:border-yellow-300 hover:text-yellow-400'
                                                        }`}
                                                >
                                                    <span className="material-icons">star</span>
                                                </button>
                                            ))}
                                        </div>
                                        <p className="text-[10px] text-slate-400 font-medium">
                                            {feedbackForm.calificacionGeneral === 0 ? 'Selecciona una calificación' :
                                                feedbackForm.calificacionGeneral <= 2 ? 'Necesita mejorar' :
                                                    feedbackForm.calificacionGeneral <= 3 ? 'Regular' :
                                                        feedbackForm.calificacionGeneral === 4 ? 'Buena sesión' : '¡Excelente sesión!'}
                                        </p>
                                    </div>

                                    {/* Question 3: Usefulness Rating */}
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">¿Cómo fue la experiencia del contenido del Coffee Chat?</label>
                                        <p className="text-[10px] text-slate-400 font-medium -mt-1">(tiempo suficiente, el mentor respondió bien sus preguntas, etc.)</p>
                                        <div className="flex gap-2">
                                            {[1, 2, 3, 4, 5].map(star => (
                                                <button
                                                    key={star}
                                                    type="button"
                                                    onClick={() => setFeedbackForm({ ...feedbackForm, calificacionUtilidad: star })}
                                                    className={`w-12 h-12 rounded-xl border-2 flex items-center justify-center transition-all text-lg ${feedbackForm.calificacionUtilidad >= star
                                                        ? 'border-blue-400 bg-blue-50 dark:bg-blue-500/10 text-blue-500 scale-110 shadow-md shadow-blue-400/20'
                                                        : 'border-slate-100 dark:border-slate-700 text-slate-300 dark:text-slate-600 hover:border-blue-300 hover:text-blue-400'
                                                        }`}
                                                >
                                                    <span className="material-icons">star</span>
                                                </button>
                                            ))}
                                        </div>
                                        <p className="text-[10px] text-slate-400 font-medium">
                                            {feedbackForm.calificacionUtilidad === 0 ? 'Selecciona una calificación' :
                                                feedbackForm.calificacionUtilidad <= 2 ? 'Poco útil' :
                                                    feedbackForm.calificacionUtilidad <= 3 ? 'Moderadamente útil' :
                                                        feedbackForm.calificacionUtilidad === 4 ? 'Muy útil' : '¡Extremadamente útil!'}
                                        </p>
                                    </div>

                                    {/* Question 4: Would you recommend? */}
                                    <div className="space-y-3">
                                        <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">¿Recomendarías a este mentor?</label>
                                        <div className="grid grid-cols-2 gap-3">
                                            <button
                                                type="button"
                                                onClick={() => setFeedbackForm({ ...feedbackForm, recomendaria: true })}
                                                className={`py-3 px-4 rounded-2xl border-2 font-bold text-sm transition-all ${feedbackForm.recomendaria === true
                                                    ? 'border-green-500 bg-green-50 dark:bg-green-500/10 text-green-600'
                                                    : 'border-slate-100 dark:border-slate-700 text-slate-500 hover:border-green-300'
                                                    }`}
                                            >
                                                <span className="material-icons text-lg align-middle mr-1">thumb_up</span>
                                                Sí, lo recomiendo
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setFeedbackForm({ ...feedbackForm, recomendaria: false })}
                                                className={`py-3 px-4 rounded-2xl border-2 font-bold text-sm transition-all ${feedbackForm.recomendaria === false
                                                    ? 'border-red-500 bg-red-50 dark:bg-red-500/10 text-red-600'
                                                    : 'border-slate-100 dark:border-slate-700 text-slate-500 hover:border-red-300'
                                                    }`}
                                            >
                                                <span className="material-icons text-lg align-middle mr-1">thumb_down</span>
                                                No lo recomiendo
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Footer Actions */}
                                <div className="p-6 pt-4 border-t border-slate-100 dark:border-slate-700 space-y-3">
                                    {!isFeedbackValid && (
                                        <p className="text-[10px] text-amber-500 font-bold text-center flex items-center justify-center gap-1">
                                            <span className="material-icons text-xs">info</span>
                                            Completa todas las preguntas para continuar
                                        </p>
                                    )}
                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => setCompletingId(null)}
                                            className="flex-1 py-3.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 active:scale-95 transition-all"
                                        >
                                            Volver
                                        </button>
                                        <button
                                            onClick={confirmComplete}
                                            disabled={!isFeedbackValid}
                                            className={`flex-1 py-3.5 px-4 rounded-xl font-semibold active:scale-95 transition-all flex items-center justify-center gap-2 ${isFeedbackValid
                                                ? 'bg-green-500 hover:bg-green-600 text-white shadow-lg shadow-green-500/30'
                                                : 'bg-slate-100 dark:bg-slate-700 text-slate-400 cursor-not-allowed'
                                                }`}
                                        >
                                            <span className="material-icons text-sm">check</span>
                                            Coffee Chat Realizado
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )
                }

                {/* Delete/Cancel Confirmation Modal */}
                {
                    deletingId && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-md animate-fade-in">
                            <div
                                className="bg-white dark:bg-slate-800 p-8 rounded-[2rem] shadow-2xl border border-slate-100 dark:border-slate-700 max-w-sm w-full mx-4 transform transition-all"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div className="text-center">
                                    <div className="w-20 h-20 rounded-full bg-red-50 dark:bg-red-500/10 flex items-center justify-center mx-auto mb-6 relative group">
                                        <div className="absolute inset-0 bg-red-500/20 rounded-full animate-ping opacity-75"></div>
                                        <span className="material-icons text-4xl text-red-500 relative z-10 transition-transform duration-300 group-hover:scale-110">event_busy</span>
                                    </div>
                                    <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">¿Cancelar Cita?</h3>
                                    <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-[280px] mx-auto text-sm">
                                        Una vez cancelada, <strong>no podrás cambiar el estado</strong> de esta cita nuevamente.
                                    </p>
                                    <div className="flex space-x-3">
                                        <button
                                            onClick={() => setDeletingId(null)}
                                            className="flex-1 py-3.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 active:scale-95 transition-all"
                                        >
                                            No, mantener
                                        </button>
                                        <button
                                            onClick={confirmDelete}
                                            className="flex-1 py-3.5 px-4 rounded-xl bg-red-500 hover:bg-red-600 text-white font-semibold active:scale-95 transition-all shadow-lg shadow-red-500/30"
                                        >
                                            Sí, cancelar
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )
                }
            </div >
        </div >
    );
};

export default MySessionsPage;
