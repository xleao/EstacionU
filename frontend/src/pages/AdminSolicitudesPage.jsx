import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Navbar from '../components/Navbar';
import FluidBackground from '../components/FluidBackground';

const STATUS_CONFIG = {
    pendiente: { label: 'Pendiente', color: 'text-amber-600 bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-700', dot: 'bg-amber-500' },
    aprobado: { label: 'Aprobado', color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-700', dot: 'bg-emerald-500' },
    rechazado: { label: 'Rechazado', color: 'text-red-600 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700', dot: 'bg-red-500' },
};

const DetailsModal = ({ sol, isOpen, onClose, onAction }) => {
    const [notasAdmin, setNotasAdmin] = useState(sol.notas_admin || '');
    const [loading, setLoading] = useState(null);
    const m = sol.mentor;
    const cfg = STATUS_CONFIG[sol.status] || STATUS_CONFIG.pendiente;

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

    const handleAction = async (action) => {
        setLoading(action);
        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`/api/admin/solicitudes/${sol.id}/${action}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ notas_admin: notasAdmin || null }),
            });
            if (res.ok) {
                onAction();
                onClose();
            }
        } finally {
            setLoading(null);
        }
    };

    const fmtDate = (dt) => dt ? new Date(dt).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
    const fmtDateTime = (dt) => dt ? new Date(dt).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 md:p-8 backdrop-blur-[24px] bg-white/5 animate-fade-in" onClick={onClose}>
            <div
                className="bg-white dark:bg-slate-900 w-full max-w-6xl max-h-[92vh] rounded-[3rem] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.15)] border border-white/20 overflow-hidden flex flex-col animate-scale-in relative"
                onClick={e => e.stopPropagation()}
            >
                {/* Close Button - More subtle and professional */}
                <button
                    onClick={onClose}
                    className="absolute top-8 right-8 z-50 w-12 h-12 rounded-full bg-slate-100/50 dark:bg-slate-800/50 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all flex items-center justify-center text-slate-500"
                >
                    <span className="material-icons text-[24px]">close</span>
                </button>

                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    {/* Header Section */}
                    <div className="px-10 pt-16 pb-12 border-b border-slate-50 dark:border-slate-800/50">
                        <div className="flex flex-col md:flex-row items-center md:items-start gap-10">
                            {/* Profile Image with Ring */}
                            <div className="relative shrink-0">
                                <div className="absolute inset-0 bg-primary/20 rounded-[3rem] blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                                {m.url_foto ? (
                                    <div className="w-44 h-44 rounded-[3.2rem] p-1.5 bg-gradient-to-tr from-primary/30 to-transparent border border-white/50 shadow-2xl">
                                        <img src={m.url_foto} alt={m.nombre_completo} className="w-full h-full rounded-[2.8rem] object-cover" />
                                    </div>
                                ) : (
                                    <div className="w-44 h-44 rounded-[3.2rem] bg-slate-50 dark:bg-slate-800 flex items-center justify-center shadow-xl border border-slate-100 dark:border-slate-700">
                                        <span className="material-icons text-slate-300 text-7xl">person</span>
                                    </div>
                                )}
                                <div className={`absolute -bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap px-4 py-1.5 rounded-full border shadow-lg text-[10px] font-black tracking-widest ${cfg.color}`}>
                                    {cfg.label.toUpperCase()}
                                </div>
                            </div>

                            <div className="flex-1 text-center md:text-left pt-2">
                                <h2 className="text-5xl md:text-6xl font-black text-slate-900 dark:text-white mb-6 tracking-tight leading-[1.1]">
                                    {m.nombre_completo || 'Sin nombre'}
                                </h2>

                                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                                    <div className="flex items-center gap-2 px-5 py-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-300">
                                        <span className="material-icons text-[20px] text-primary/60">alternate_email</span>
                                        <span className="text-base font-bold">{m.correo}</span>
                                    </div>
                                    {m.telefono && (
                                        <div className="flex items-center gap-2 px-5 py-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-300">
                                            <span className="material-icons text-[20px] text-primary/60">phone_iphone</span>
                                            <span className="text-base font-bold">{m.telefono}</span>
                                        </div>
                                    )}
                                    <div className="flex items-center gap-2 px-5 py-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-300">
                                        <span className="material-icons text-[20px] text-primary/60">calendar_month</span>
                                        <span className="text-base font-bold">Pedido: {fmtDateTime(sol.fecha_solicitud)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Content Body */}
                    <div className="p-10 md:p-14">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                            {/* Personal Card */}
                            <div className="group relative p-8 rounded-[2.5rem] bg-white dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 hover:border-primary/20 transition-all duration-500">
                                <div className="w-12 h-12 rounded-2xl bg-primary/5 flex items-center justify-center mb-6 text-primary">
                                    <span className="material-icons">person</span>
                                </div>
                                <h4 className="text-sm font-black text-slate-500 uppercase tracking-widest mb-6">Datos Personales</h4>
                                <div className="space-y-6">
                                    <div>
                                        <p className="text-xs font-black text-slate-400 uppercase tracking-tighter mb-1.5">Género</p>
                                        <p className="text-xl font-black text-slate-900 dark:text-white capitalize">{m.genero || '—'}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-black text-slate-400 uppercase tracking-tighter mb-1.5">Fecha de Nacimiento</p>
                                        <p className="text-xl font-black text-slate-900 dark:text-white">{fmtDate(m.fecha_nacimiento)}</p>
                                    </div>
                                    {m.url_linkedin && (
                                        <div className="pt-2">
                                            <p className="text-xs font-black text-slate-400 uppercase tracking-tighter mb-2.5">Presencia Digital</p>
                                            <a
                                                href={m.url_linkedin}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-3 px-5 py-3 rounded-xl bg-[#0A66C2]/5 text-[#0A66C2] hover:bg-[#0A66C2]/10 transition-all font-black text-sm tracking-wider uppercase border border-[#0A66C2]/10"
                                            >
                                                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                                                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                                                </svg>
                                                Perfil Profesional
                                            </a>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Academic Card */}
                            <div className="group relative p-8 rounded-[2.5rem] bg-white dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 hover:border-indigo-500/20 transition-all duration-500">
                                <div className="w-12 h-12 rounded-2xl bg-indigo-500/5 flex items-center justify-center mb-6 text-indigo-500">
                                    <span className="material-icons">school</span>
                                </div>
                                <h4 className="text-sm font-black text-slate-500 uppercase tracking-widest mb-6">Historial Académico</h4>
                                <div className="space-y-6">
                                    <div>
                                        <p className="text-xs font-black text-slate-400 uppercase tracking-tighter mb-1.5">Institución / Centro de estudios</p>
                                        <p className="text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">{m.universidad || 'No indicado'}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-black text-slate-400 uppercase tracking-tighter mb-1.5">Carrera / Programa</p>
                                        <p className="text-xl font-bold text-primary dark:text-primary-light italic">"{m.carrera || 'Carrera pendiente'}"</p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-black text-slate-400 uppercase tracking-tighter mb-1.5">Periodo Académico</p>
                                        <div className="inline-flex px-4 py-1.5 bg-indigo-100 dark:bg-indigo-950/30 text-indigo-600 text-xs font-black rounded-xl uppercase tracking-wider">
                                            {m.anio_inicio ? `${m.anio_inicio} — ${m.anio_fin === -1 ? 'Cursando' : (m.anio_fin || '—')}` : 'Sin periodo'}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Career Card */}
                            <div className="group relative p-8 rounded-[2.5rem] bg-white dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 hover:border-emerald-500/20 transition-all duration-500">
                                <div className="w-12 h-12 rounded-2xl bg-emerald-500/5 flex items-center justify-center mb-6 text-emerald-500">
                                    <span className="material-icons">work</span>
                                </div>
                                <h4 className="text-sm font-black text-slate-500 uppercase tracking-widest mb-6">Trayectoria Profesional</h4>
                                <div className="flex items-center gap-5 mb-8">
                                    {m.url_logo_empresa ? (
                                        <div className="w-16 h-16 p-2 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 flex items-center justify-center shadow-sm">
                                            <img src={m.url_logo_empresa} alt="empresa" className="w-full h-full object-contain" />
                                        </div>
                                    ) : (
                                        <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-slate-400">
                                            <span className="material-icons text-3xl">business</span>
                                        </div>
                                    )}
                                    <div>
                                        <p className="text-2xl font-black text-slate-900 dark:text-white uppercase leading-tight tracking-tight">{m.empresa || 'Empresa'}</p>
                                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest leading-none mt-1.5">{m.sector || 'Giro del negocio'}</p>
                                    </div>
                                </div>
                                <div className="pt-6 border-t border-slate-100 dark:border-slate-800/50">
                                    <p className="text-xs font-black text-slate-400 uppercase tracking-tighter mb-1.5">Cargo / Posición</p>
                                    <p className="text-lg font-black text-slate-800 dark:text-slate-200">{m.area || '—'}</p>
                                </div>
                            </div>
                        </div>

                        {/* Mentorship Box */}
                        <div className="bg-slate-50 dark:bg-slate-800/20 rounded-[3rem] p-10 md:p-14 relative overflow-hidden group mb-12 border border-slate-100 dark:border-slate-800">
                            <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
                            <div className="relative z-10">
                                <h4 className="flex items-center gap-3 text-primary text-[12px] font-black uppercase tracking-[0.4em] mb-8">
                                    <span className="material-icons text-[20px]">format_quote</span> Propuesta de Valor
                                </h4>
                                <p className="text-3xl md:text-4xl text-slate-800 dark:text-white font-extrabold italic leading-relaxed tracking-tighter">
                                    "{m.biografia || 'Sin mensaje adicional.'}"
                                </p>
                            </div>
                        </div>

                        {/* Availability Grid */}
                        <div className="mb-12">
                            <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em] mb-8 flex items-center gap-4">
                                <span className="w-12 h-px bg-slate-200 dark:bg-slate-800" /> Agenda Disponible
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                {m.disponibilidades?.length > 0 ? (
                                    m.disponibilidades.map((d, i) => (
                                        <div key={i} className="p-8 bg-white dark:bg-slate-800/50 rounded-3xl border border-slate-100 dark:border-slate-800 hover:border-primary/20 transition-all flex flex-col gap-2 shadow-sm">
                                            <span className="text-xs font-black text-primary/60 uppercase tracking-widest">{d.dia}</span>
                                            <span className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter">{d.hora_inicio} — {d.hora_fin}</span>
                                        </div>
                                    ))
                                ) : (
                                    <div className="col-span-full p-12 text-center bg-slate-50 dark:bg-slate-800/20 rounded-[2.5rem] border-2 border-dashed border-slate-200 dark:border-slate-800 text-slate-400 font-bold italic">
                                        No hay horarios configurados en esta solicitud
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Professional Decision Panel */}
                        <div className="p-16 md:p-20 bg-slate-900 rounded-[4.5rem] relative overflow-hidden shadow-[0_40px_80px_-20px_rgba(0,0,0,0.4)] border border-white/5">
                            <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-transparent to-emerald-500/20 opacity-40" />
                            <div className="relative z-10 max-w-2xl mx-auto flex flex-col items-center text-center">
                                <div className="w-20 h-20 rounded-3xl bg-white/5 flex items-center justify-center text-amber-400 border border-white/10 mb-8 shadow-2xl">
                                    <span className="material-icons text-4xl">gavel</span>
                                </div>
                                <h4 className="text-3xl md:text-4xl font-black text-white tracking-tighter mb-4">Resolución Final</h4>
                                <p className="text-slate-400 text-lg font-bold uppercase tracking-[0.3em] mb-14">Panel de Control Administrativo</p>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                                    {sol.status === 'pendiente' ? (
                                        <>
                                            <button
                                                onClick={() => handleAction('aprobar')}
                                                disabled={loading !== null}
                                                className="group relative flex items-center justify-center gap-4 py-8 rounded-[2.5rem] bg-emerald-500 hover:bg-emerald-400 text-white font-black text-xl tracking-tight shadow-[0_25px_50px_-12px_rgba(16,185,129,0.5)] transition-all active:scale-95 disabled:opacity-50 overflow-hidden"
                                            >
                                                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/30 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                                                <span className="material-icons text-3xl">{loading === 'aprobar' ? 'sync' : 'verified'}</span>
                                                {loading === 'aprobar' ? 'Procesando...' : 'APROBAR PERFIL'}
                                            </button>
                                            <button
                                                onClick={() => handleAction('rechazar')}
                                                disabled={loading !== null}
                                                className="flex items-center justify-center gap-4 py-8 rounded-[2.5rem] bg-white/5 border-2 border-red-500/30 text-red-500 font-black text-xl tracking-tight hover:bg-red-500/10 hover:border-red-500/60 transition-all active:scale-95 disabled:opacity-50"
                                            >
                                                <span className="material-icons text-3xl">{loading === 'rechazar' ? 'sync' : 'block'}</span>
                                                {loading === 'rechazar' ? 'Cancelando...' : 'RECHAZAR'}
                                            </button>
                                        </>
                                    ) : (
                                        <div className={`col-span-full p-12 rounded-[3.5rem] border-2 flex flex-col items-center gap-4 shadow-2xl ${cfg.color.replace('bg-', 'bg-opacity-20 bg-')}`}>
                                            <span className="material-icons text-6xl">{sol.status === 'aprobado' ? 'verified_user' : 'cancel'}</span>
                                            <span className="font-black text-3xl tracking-tighter uppercase">Resultado: {sol.status}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
};

const ConfirmModal = ({ isOpen, title, message, onConfirm, onCancel, confirmText, cancelText, type }) => {
    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-fade-in" onClick={onCancel} />
            <div className="relative bg-white dark:bg-slate-900 w-full max-w-sm rounded-[24px] shadow-2xl overflow-hidden p-6 animate-scale-in border border-slate-100 dark:border-slate-800">
                <div className={`w-16 h-16 rounded-full mx-auto flex items-center justify-center mb-5 ${type === 'danger' ? 'bg-red-50 text-red-500 dark:bg-red-900/20' :
                    type === 'success' ? 'bg-emerald-50 text-emerald-500 dark:bg-emerald-900/20' :
                        'bg-amber-50 text-amber-500 dark:bg-amber-900/20'
                    }`}>
                    <span className="material-icons text-[32px]">
                        {type === 'danger' ? 'warning' : type === 'success' ? 'check_circle' : 'help_outline'}
                    </span>
                </div>

                <h3 className="text-xl font-black text-center text-slate-900 dark:text-white mb-2">{title}</h3>
                <p className="text-sm font-medium text-center text-slate-500 dark:text-slate-400 mb-8 leading-relaxed px-2">{message}</p>

                <div className="flex gap-3">
                    <button onClick={onCancel} className="flex-1 py-3.5 px-4 rounded-xl font-bold text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-sm">
                        {cancelText || 'Cancelar'}
                    </button>
                    <button onClick={onConfirm} className={`flex-1 py-3.5 px-4 rounded-xl font-black text-white transition-all active:scale-[0.98] shadow-lg text-sm ${type === 'danger' ? 'bg-red-500 hover:bg-red-600 shadow-red-500/30' :
                        type === 'success' ? 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/30' :
                            'bg-amber-500 hover:bg-amber-600 shadow-amber-500/30'
                        }`}>
                        {confirmText || 'Confirmar'}
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
};

const SolicitudCard = ({ sol, onAction }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const m = sol.mentor;
    const cfg = STATUS_CONFIG[sol.status] || STATUS_CONFIG.pendiente;
    const [loadingLocal, setLoadingLocal] = useState(null);
    const [confirmConfig, setConfirmConfig] = useState(null);

    const executeAction = async (actionType, isBlockAction = false) => {
        setLoadingLocal(actionType);
        const token = localStorage.getItem('token');
        try {
            if (isBlockAction) {
                const res = await fetch(`/api/admin/solicitudes/${sol.id}/${actionType}`, {
                    method: 'POST',
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (res.ok) onAction();
            } else {
                const res = await fetch(`/api/admin/solicitudes/${sol.id}/${actionType}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
                });
                if (res.ok) onAction();
            }
        } finally {
            setLoadingLocal(null);
            setConfirmConfig(null);
        }
    };

    const handleQuickAction = (action) => {
        setConfirmConfig({
            isOpen: true,
            title: action === 'aprobar' ? 'Aprobar Solicitud' : 'Rechazar Solicitud',
            message: `¿Está seguro de que desea ${action} la solicitud de ${m.nombre_completo || 'este mentor'}?`,
            type: action === 'aprobar' ? 'success' : 'danger',
            confirmText: 'Sí, continuar',
            onConfirm: () => executeAction(action, false),
            onCancel: () => setConfirmConfig(null)
        });
    };

    const handleBlockToggle = () => {
        const isCurrentlyBlocked = m.bloqueado_destacado;
        const msg = !isCurrentlyBlocked
            ? "¿Está seguro de que desea BLOQUEAR a este mentor? No podrá enviar más solicitudes para ser mentor destacado hasta que lo desbloquees."
            : "¿Desea DESBLOQUEAR a este mentor? Podrá volver a postular a mentor destacado.";

        setConfirmConfig({
            isOpen: true,
            title: !isCurrentlyBlocked ? 'Bloquear Mentor' : 'Desbloquear Mentor',
            message: msg,
            type: !isCurrentlyBlocked ? 'danger' : 'success',
            confirmText: !isCurrentlyBlocked ? 'Bloquear' : 'Desbloquear',
            onConfirm: () => executeAction(!isCurrentlyBlocked ? 'bloquear' : 'desbloquear', true),
            onCancel: () => setConfirmConfig(null)
        });
    };

    // Formatear nombre a primer nombre y primer apellido
    const formatName = (fullName) => {
        if (!fullName) return 'Sin nombre';
        const parts = fullName.trim().split(/\s+/);
        if (parts.length <= 2) return fullName;
        return `${parts[0]} ${parts[parts.length - 1]}`; // Tomamos el primer y último elemento asumiendo primer nombre y primer apellido (o simplemente el primero y el segundo si prefieres)
        // O mejor: parts.slice(0, 2).join(' ')
    };

    const displayName = m.nombre_completo ? m.nombre_completo.split(' ').slice(0, 2).join(' ') : 'Sin nombre';

    return (
        <>
            <div className="group bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 animate-scale-in">
                <div className={`h-1.5 w-full ${sol.status === 'pendiente' ? 'bg-amber-400' : sol.status === 'aprobado' ? 'bg-emerald-500' : 'bg-red-500'}`} />

                <div className="p-6">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="relative">
                            {m.url_foto ? (
                                <img src={m.url_foto} alt={m.nombre_completo} className="w-16 h-16 rounded-2xl object-cover border-2 border-white dark:border-slate-700 shadow-md group-hover:scale-110 transition-transform duration-500" />
                            ) : (
                                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center border-2 border-white dark:border-slate-700 shadow-md">
                                    <span className="material-icons text-primary text-3xl">person</span>
                                </div>
                            )}
                            <span className={`absolute -top-1 -right-1 w-5 h-5 rounded-full border-2 border-white dark:border-slate-800 flex items-center justify-center shadow-sm ${cfg.dot} animate-pulse`} />
                        </div>
                        <div className="flex-1 min-w-0 text-left">
                            <h3 className="text-lg font-black text-slate-900 dark:text-white truncate leading-tight" title={m.nombre_completo}>{displayName}</h3>
                            <p className="text-sm text-slate-400 dark:text-slate-500 font-medium truncate">{m.correo}</p>
                        </div>
                    </div>

                    <div className="flex flex-col gap-2 mb-6">
                        <div className="flex items-center justify-between text-xs font-bold px-4 py-2.5 bg-slate-50 dark:bg-slate-700/40 rounded-xl text-slate-600 dark:text-slate-300">
                            <span className="flex items-center gap-1.5"><span className="material-icons text-[14px]">school</span> Universidad</span>
                            <span className="text-slate-900 dark:text-white truncate max-w-[120px]">{m.universidad || 'Pendiente'}</span>
                        </div>
                        <div className="flex items-center justify-between text-xs font-bold px-4 py-2.5 bg-slate-50 dark:bg-slate-700/40 rounded-xl text-slate-600 dark:text-slate-300">
                            <span className="flex items-center gap-1.5"><span className="material-icons text-[14px]">business</span> Empresa</span>
                            <span className="text-slate-900 dark:text-white truncate max-w-[120px] uppercase text-[10px]">{m.empresa || 'Empresa'}</span>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="w-full py-3 rounded-2xl bg-slate-50 dark:bg-slate-700 border border-slate-100 dark:border-slate-600 text-slate-900 dark:text-white font-black text-sm hover:border-primary hover:text-primary transition-all active:scale-95 shadow-sm"
                        >
                            Ver Información
                        </button>

                        {sol.status === 'pendiente' && (
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleQuickAction('aprobar')}
                                    disabled={loadingLocal !== null}
                                    className="flex-1 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs uppercase tracking-wider transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
                                >
                                    <span className="material-icons text-sm">{loadingLocal === 'aprobar' ? 'sync' : 'done'}</span>
                                    {loadingLocal === 'aprobar' ? '...' : 'Aprobar'}
                                </button>
                                <button
                                    onClick={() => handleQuickAction('rechazar')}
                                    disabled={loadingLocal !== null}
                                    className="px-4 py-3 rounded-2xl bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 text-red-500 hover:bg-red-100 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center"
                                    title="Rechazar"
                                >
                                    <span className="material-icons text-sm">{loadingLocal === 'rechazar' ? 'sync' : 'close'}</span>
                                </button>
                            </div>
                        )}

                        {/* Botón de Bloqueo/Desbloqueo siempre visible */}
                        <button
                            onClick={handleBlockToggle}
                            disabled={loadingLocal !== null}
                            className={`w-full py-2.5 rounded-xl border-2 flex items-center justify-center gap-2 font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 disabled:opacity-50 ${m.bloqueado_destacado
                                ? 'bg-slate-100 border-slate-200 text-slate-500 hover:bg-slate-200 dark:bg-slate-700/50 dark:border-slate-700 dark:text-slate-400'
                                : 'bg-white border-red-100 text-red-400 hover:bg-red-50 dark:bg-transparent dark:border-red-900/30'
                                }`}
                        >
                            <span className="material-icons text-sm">{m.bloqueado_destacado ? 'lock_open' : 'block'}</span>
                            {m.bloqueado_destacado ? 'Desbloquear Mentor' : 'Bloquear Postulaciones'}
                        </button>
                    </div>
                </div>
            </div>

            <DetailsModal
                sol={sol}
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onAction={onAction}
            />
            {confirmConfig && (
                <ConfirmModal
                    {...confirmConfig}
                />
            )}
        </>
    );
};

const AdminSolicitudesPage = () => {
    const [solicitudes, setSolicitudes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('todas');
    const counts = {
        todas: solicitudes.length,
        pendiente: solicitudes.filter(s => s.status === 'pendiente').length,
        aprobado: solicitudes.filter(s => s.status === 'aprobado').length,
        rechazado: solicitudes.filter(s => s.status === 'rechazado').length,
    };
    const filtered = filter === 'todas' ? solicitudes : solicitudes.filter(s => s.status === filter);

    const fetchSolicitudes = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/admin/solicitudes', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) setSolicitudes(await res.json());
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchSolicitudes(); }, []);

    const TABS = [
        { key: 'todas', label: 'Todas', icon: 'list' },
        { key: 'pendiente', label: 'Pendientes', icon: 'hourglass_empty', color: 'text-amber-500' },
        { key: 'aprobado', label: 'Aprobadas', icon: 'check_circle', color: 'text-emerald-500' },
        { key: 'rechazado', label: 'Rechazadas', icon: 'cancel', color: 'text-red-500' },
    ];

    return (
        <div className="text-slate-900 dark:text-slate-100 min-h-screen transition-colors duration-300 flex flex-col font-sans relative overflow-x-hidden">
            <FluidBackground />
            <Navbar />

            <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full relative z-10">
                {/* Header */}
                <header className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 animate-slide-down">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-2xl">
                                <span className="material-icons text-amber-500 text-3xl">workspace_premium</span>
                            </div>
                            <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Solicitudes</h1>
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 font-medium">Revisa y gestiona los nuevos perfiles de Mentores Destacados</p>
                    </div>
                    <button
                        onClick={fetchSolicitudes}
                        className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl text-sm font-black text-slate-600 dark:text-slate-300 hover:border-primary hover:text-primary transition-all shadow-xl shadow-slate-200/50 dark:shadow-none active:scale-95"
                    >
                        <span className="material-icons text-[18px]">refresh</span>
                        Actualizar Panel
                    </button>
                </header>

                {/* Filter tabs */}
                <div className="flex gap-3 mb-8 flex-wrap">
                    {TABS.map(tab => (
                        <button
                            key={tab.key}
                            onClick={() => setFilter(tab.key)}
                            className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-black transition-all ${filter === tab.key
                                ? 'bg-primary text-white shadow-xl shadow-primary/30 scale-105'
                                : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700'
                                }`}
                        >
                            <span className={`material-icons text-[18px] ${filter === tab.key ? 'text-white' : (tab.color || '')}`}>{tab.icon}</span>
                            {tab.label}
                            <span className={`ml-2 text-[10px] px-2 py-0.5 rounded-full font-black ${filter === tab.key ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-400'}`}>
                                {counts[tab.key]}
                            </span>
                        </button>
                    ))}
                </div>

                {/* Content */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center h-[50vh] gap-4">
                        <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                        <p className="text-slate-400 font-bold animate-pulse">Cargando solicitudes...</p>
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-[50vh] text-slate-400 dark:text-slate-600 animate-fade-in">
                        <div className="w-24 h-24 bg-slate-100 dark:bg-slate-800/50 rounded-[2.5rem] flex items-center justify-center mb-6">
                            <span className="material-icons text-6xl">inbox</span>
                        </div>
                        <h3 className="text-2xl font-black mb-2 italic">¡Todo al día!</h3>
                        <p className="max-w-xs text-center font-medium">No hay solicitudes {filter !== 'todas' ? `con estado "${filter}"` : ''} por ahora.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filtered.map(sol => (
                            <SolicitudCard key={sol.id} sol={sol} onAction={fetchSolicitudes} />
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
};

export default AdminSolicitudesPage;
