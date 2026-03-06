import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { SECTOR_OPTIONS, AREA_OPTIONS, CustomCombobox } from './CustomCombobox';

// Step 1: Info card – shows requirements
const StepInfo = ({ onNext, onClose }) => (
    <div className="relative bg-white dark:bg-slate-900 w-[580px] max-w-[95vw] rounded-[24px] shadow-2xl overflow-hidden" style={{ animation: 'modalEnter 0.45s cubic-bezier(0.34, 1.56, 0.64, 1) both' }}>
        {/* Golden header */}
        <div className="bg-gradient-to-br from-amber-400 via-yellow-500 to-orange-400 px-8 pt-9 pb-14 relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(255,255,255,0.25),_transparent_60%)]" />
            <button
                onClick={onClose}
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-all"
            >
                <span className="material-icons text-[18px]">close</span>
            </button>
            <div className="relative z-10 text-center">
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-inner">
                    <span className="material-icons text-white text-[32px]">workspace_premium</span>
                </div>
                <h2 className="text-[22px] font-black text-white mb-1.5">Mentor Destacado</h2>
                <p className="text-white/85 text-sm font-medium max-w-[340px] mx-auto leading-relaxed">
                    Aparece en el directorio y conecta con estudiantes que buscan tu experiencia.
                </p>
            </div>
        </div>

        {/* White card */}
        <div className="-mt-5 relative z-10">
            <div className="bg-white dark:bg-slate-900 rounded-t-[24px] pt-5 px-7 pb-7">
                <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3">
                    Para aplicar, debes completar:
                </p>

                {/* Row 1: 2 items */}
                <div className="grid grid-cols-2 gap-3 mb-3">
                    {[
                        { icon: 'work', label: 'Sector Económico', desc: 'Ej. Technology, Finance…' },
                        { icon: 'category', label: 'Área de Funciones', desc: 'Ej. Marketing, Strategy…' },
                    ].map((item, i) => (
                        <div key={i} className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl px-4 py-4">
                            <span className="material-icons text-amber-500 text-[22px] flex-shrink-0">{item.icon}</span>
                            <div className="min-w-0">
                                <p className="text-[16px] font-bold text-slate-800 dark:text-white leading-tight">{item.label}</p>
                                <p className="text-[13px] text-slate-400 dark:text-slate-500 mt-0.5 truncate">{item.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Row 2: 2 items */}
                <div className="grid grid-cols-2 gap-3 mb-3">
                    {[
                        { icon: 'chat_bubble_outline', label: 'Mensaje de Mentoría', desc: 'Hasta 80 caracteres' },
                        { icon: 'business', label: 'Empresa donde trabajas', desc: 'Nombre + logo opcional' },
                    ].map((item, i) => (
                        <div key={i} className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl px-4 py-4">
                            <span className="material-icons text-amber-500 text-[20px] flex-shrink-0">{item.icon}</span>
                            <div className="min-w-0">
                                <p className="text-[14px] font-bold text-slate-800 dark:text-white leading-tight">{item.label}</p>
                                <p className="text-[12px] text-slate-400 dark:text-slate-500 mt-0.5 truncate">{item.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Row 3: 1 item centered */}
                <div className="flex justify-center mb-5">
                    <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl px-5 py-4 w-[55%]">
                        <span className="material-icons text-amber-500 text-[22px] flex-shrink-0">schedule</span>
                        <div className="min-w-0">
                            <p className="text-[16px] font-bold text-slate-800 dark:text-white leading-tight">Horario disponible</p>
                            <p className="text-[13px] text-slate-400 dark:text-slate-500 mt-0.5">Día y rango de horas</p>
                        </div>
                    </div>
                </div>

                <button
                    onClick={onNext}
                    className="relative overflow-hidden w-full py-3.5 rounded-xl font-black text-white bg-gradient-to-r from-amber-400 via-yellow-500 to-orange-400 shadow-lg shadow-amber-500/30 hover:shadow-amber-500/50 hover:-translate-y-0.5 active:scale-[0.98] transition-all flex items-center justify-center gap-2 text-[15px] group"
                >
                    <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-[1.2s] bg-gradient-to-r from-transparent via-white/30 to-transparent" />
                    <span className="material-icons text-[18px]">stars</span>
                    Solicitar ser Mentor Destacado
                </button>
            </div>
        </div>
    </div>
);



// Step 2: Form card
const StepForm = ({ onClose, onSuccess }) => {
    const { user } = useAuth();
    const scrollRef = React.useRef(null);
    const [formData, setFormData] = useState({
        sector_nombre: '',
        area_nombre: '',
        biografia: '',
        empresa: '',
        url_logo_empresa: '',
        disponibilidades: []
    });
    const [isSaving, setIsSaving] = useState(false);
    const [companyLogoLoading, setCompanyLogoLoading] = useState(false);
    const [error, setError] = useState(null);

    const showError = (msg) => {
        setError(msg);
        // Scroll the modal body to the top so the error banner is visible
        if (scrollRef.current) scrollRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    };

    useEffect(() => {
        if (user) {
            setFormData({
                sector_nombre: user.sector_nombre || '',
                area_nombre: user.area_nombre || '',
                biografia: user.biografia || '',
                empresa: user.empresa || '',
                url_logo_empresa: user.url_logo_empresa || '',
                disponibilidades: user.disponibilidades?.length ? user.disponibilidades : []
            });
        }
    }, [user]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleLogoChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validate by both MIME type and extension (Windows may send wrong content-type)
        const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
        const validExts = ['.jpg', '.jpeg', '.png'];
        const ext = '.' + file.name.split('.').pop().toLowerCase();
        if (!validTypes.includes(file.type) && !validExts.includes(ext)) {
            showError('Solo se permiten imágenes en formato PNG o JPEG.');
            return;
        }
        if (file.size > 50 * 1024 * 1024) {
            showError('El logo no debe superar los 50MB.');
            return;
        }
        const token = localStorage.getItem('token');
        setCompanyLogoLoading(true);
        setError(null);
        const fd = new FormData();
        fd.append('file', file);
        try {
            const res = await fetch('/api/users/me/company-logo', {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
                body: fd
            });
            const data = await res.json();
            if (res.ok) setFormData(prev => ({ ...prev, url_logo_empresa: data.url_logo_empresa }));
            else showError(data.detail || 'Error al subir el logo.');
        } catch { showError('Error de conexión.'); }
        finally { setCompanyLogoLoading(false); }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.sector_nombre || !formData.area_nombre || !formData.biografia?.trim() || !formData.empresa?.trim() || !formData.url_logo_empresa || !formData.disponibilidades?.length) {
            showError('Completa todos los campos obligatorios (*), incluyendo el logo de la empresa.');
            return;
        }
        setIsSaving(true);
        setError(null);
        const token = localStorage.getItem('token');
        try {
            const profileRes = await fetch('/api/users/me/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify(formData)
            });
            if (!profileRes.ok) {
                const d = await profileRes.json();
                showError(d.detail || 'Error al guardar perfil.');
                setIsSaving(false);
                return;
            }
            const destRes = await fetch('/api/users/me/destacado', {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` }
            });
            const destData = await destRes.json();
            if (destRes.ok) {
                onSuccess();
            } else {
                showError(destData.detail || 'Error al enviar solicitud.');
            }
        } catch { showError('Error de conexión.'); }
        finally { setIsSaving(false); }
    };

    return (
        <div className="relative bg-white dark:bg-slate-900 w-[520px] max-w-[95vw] max-h-[90vh] rounded-[22px] shadow-2xl flex flex-col overflow-hidden" style={{ animation: 'modalEnter 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) both' }}>
            {/* Header */}
            <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/30 flex-shrink-0">
                <div>
                    <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                        <span className="material-icons text-amber-500">workspace_premium</span>
                        Completa tu Perfil de Mentor
                    </h2>
                    <p className="text-slate-400 dark:text-slate-500 text-xs mt-0.5 font-medium">Todos los campos marcados con * son obligatorios</p>
                </div>
                <button onClick={onClose} className="w-9 h-9 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all">
                    <span className="material-icons text-[20px]">close</span>
                </button>
            </div>

            {/* Form */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto px-8 py-6 custom-scrollbar">
                {error && (
                    <div className="mb-5 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 flex items-center gap-2 text-red-600 dark:text-red-400 text-sm font-semibold">
                        <span className="material-icons text-[18px]">error_outline</span>
                        {error}
                    </div>
                )}

                <form id="destacado-form" onSubmit={handleSubmit}>
                    <fieldset disabled={isSaving} className="space-y-5 border-none p-0 m-0">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Sector Económico *</label>
                                <CustomCombobox name="sector_nombre" options={SECTOR_OPTIONS} placeholder="Ej. Consumer & Retail" value={formData.sector_nombre} onChange={handleChange} />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Área de Funciones / Rol *</label>
                                <CustomCombobox name="area_nombre" options={AREA_OPTIONS} placeholder="Ej. Marketing/Communications" value={formData.area_nombre} onChange={handleChange} />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <div className="flex justify-between items-center">
                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Mensaje de Mentoría *</label>
                                <span className="text-xs font-semibold text-slate-300 dark:text-slate-600">{formData.biografia?.length || 0}/80</span>
                            </div>
                            <textarea
                                name="biografia"
                                maxLength={80}
                                className="w-full rounded-2xl border bg-[#F4FAFF] dark:bg-slate-800/80 border-[#3C96E0]/40 dark:border-primary/40 px-5 py-3 text-sm font-semibold text-slate-800 dark:text-white focus:ring-2 focus:ring-[#3C96E0]/30 focus:border-[#3C96E0] outline-none transition-all placeholder:text-slate-400 resize-none min-h-[90px]"
                                placeholder='Ej. "Quiero que me consulten sobre: estrategia de carrera y liderazgo."'
                                value={formData.biografia}
                                onChange={handleChange}
                            />
                        </div>

                        {/* Company */}
                        <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5 mb-3">
                                <span className="material-icons text-[15px]">business</span> Empresa donde trabajas *
                            </label>
                            <div className="flex items-start gap-4">
                                <div
                                    onClick={() => document.getElementById('logo-input-modal').click()}
                                    className="relative flex-shrink-0 w-20 h-20 rounded-2xl border-2 border-dashed border-[#3C96E0]/40 hover:border-[#3C96E0] bg-slate-50 dark:bg-slate-800 flex items-center justify-center cursor-pointer group transition-all overflow-hidden"
                                >
                                    {companyLogoLoading && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-white/60 z-10">
                                            <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                                        </div>
                                    )}
                                    {formData.url_logo_empresa ? (
                                        <>
                                            <img src={formData.url_logo_empresa} alt="Logo" className="w-full h-full object-contain p-1" />
                                            <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                <span className="material-icons text-white text-[20px]">photo_camera</span>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="flex flex-col items-center gap-1 text-slate-400">
                                            <span className="material-icons text-[24px]">add_photo_alternate</span>
                                            <span className="text-[10px] font-black">Logo</span>
                                        </div>
                                    )}
                                </div>
                                <input id="logo-input-modal" type="file" accept="image/png,image/jpeg" className="hidden" onChange={handleLogoChange} />
                                <div className="flex-grow space-y-1.5">
                                    <input
                                        name="empresa"
                                        className="w-full rounded-2xl border bg-[#F4FAFF] dark:bg-slate-800/80 border-[#3C96E0]/40 dark:border-primary/40 px-5 py-3 text-sm font-semibold text-slate-800 dark:text-white focus:ring-2 focus:ring-[#3C96E0]/30 focus:border-[#3C96E0] outline-none transition-all placeholder:text-slate-400"
                                        type="text"
                                        placeholder="Ej. Google, BCP, Interbank..."
                                        value={formData.empresa}
                                        onChange={handleChange}
                                    />
                                    <p className="text-[10px] text-slate-400 font-medium ml-1">Empresa donde trabajas actualmente.</p>
                                    <p className="text-[10px] font-bold text-amber-500 ml-1 flex items-center gap-1 mt-0.5">
                                        <span className="material-icons text-[12px]">info</span>
                                        Logo obligatorio · PNG o JPEG · Máx. 50 MB
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Schedule */}
                        <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                            <div className="flex items-center justify-between mb-3">
                                <div>
                                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Horarios Disponibles *</label>
                                    <p className="text-[10px] text-slate-400 mt-0.5">Mínimo 1 horario requerido</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setFormData(p => ({ ...p, disponibilidades: [...(p.disponibilidades || []), { dia: 'Lunes', hora_inicio: '09:00', hora_fin: '10:00' }] }))}
                                    className="flex items-center gap-1 px-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary text-xs font-bold rounded-lg transition-all"
                                >
                                    <span className="material-icons text-sm">add</span> Añadir
                                </button>
                            </div>
                            <div className="space-y-2">
                                {formData.disponibilidades?.length > 0 ? formData.disponibilidades.map((disp, i) => (
                                    <div key={i} className="flex flex-wrap sm:flex-nowrap items-center gap-2 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700">
                                        <select
                                            className="flex-1 min-w-[110px] rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm font-semibold outline-none focus:border-primary"
                                            value={disp.dia}
                                            onChange={e => { const nd = [...formData.disponibilidades]; nd[i].dia = e.target.value; setFormData(p => ({ ...p, disponibilidades: nd })); }}
                                        >
                                            {['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'].map(d => (
                                                <option key={d} value={d}>{d}</option>
                                            ))}
                                        </select>
                                        <input type="time" className="flex-1 min-w-[100px] rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm font-semibold outline-none focus:border-primary" value={disp.hora_inicio}
                                            onChange={e => { const nd = [...formData.disponibilidades]; nd[i].hora_inicio = e.target.value; setFormData(p => ({ ...p, disponibilidades: nd })); }} />
                                        <span className="text-slate-400 font-bold text-sm">–</span>
                                        <input type="time" className="flex-1 min-w-[100px] rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm font-semibold outline-none focus:border-primary" value={disp.hora_fin}
                                            onChange={e => { const nd = [...formData.disponibilidades]; nd[i].hora_fin = e.target.value; setFormData(p => ({ ...p, disponibilidades: nd })); }} />
                                        <button type="button" onClick={() => setFormData(p => ({ ...p, disponibilidades: p.disponibilidades.filter((_, j) => j !== i) }))}
                                            className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-all">
                                            <span className="material-icons text-[18px]">delete_outline</span>
                                        </button>
                                    </div>
                                )) : (
                                    <div className="text-center py-5 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl">
                                        <p className="text-xs text-slate-400 font-semibold">Sin horarios. Añade al menos uno.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </fieldset>
                </form>
            </div>

            {/* Footer */}
            <div className="px-8 py-5 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3 bg-slate-50/50 dark:bg-slate-800/30 flex-shrink-0">
                <button type="button" onClick={onClose} className="px-6 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-sm">
                    Cancelar
                </button>
                <button
                    type="submit"
                    form="destacado-form"
                    disabled={isSaving}
                    className="flex items-center gap-2 px-7 py-3 rounded-xl font-black text-white bg-gradient-to-r from-amber-400 via-yellow-500 to-orange-400 hover:shadow-xl hover:shadow-amber-500/30 hover:-translate-y-0.5 active:scale-95 transition-all disabled:opacity-60 text-sm"
                >
                    {isSaving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <span className="material-icons text-[18px]">send</span>}
                    {isSaving ? 'Enviando…' : 'Enviar Solicitud'}
                </button>
            </div>
        </div>
    );
};

// Step 3: Confirmation
const StepConfirmation = ({ onClose }) => (
    <div className="relative bg-white dark:bg-slate-900 w-[360px] max-w-[92vw] rounded-[22px] shadow-2xl overflow-hidden text-center" style={{ animation: 'modalEnter 0.45s cubic-bezier(0.34, 1.56, 0.64, 1) both' }}>
        <div className="bg-gradient-to-br from-emerald-400 via-green-500 to-teal-500 px-6 pt-9 pb-12 relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_rgba(255,255,255,0.2),_transparent_60%)]" />
            <div className="relative z-10">
                <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3 shadow-inner">
                    <span className="material-icons text-white text-[36px]">check_circle</span>
                </div>
                <h2 className="text-xl font-black text-white mb-1">¡Solicitud Enviada!</h2>
                <p className="text-white/85 text-xs font-medium leading-relaxed max-w-xs mx-auto">
                    Tu solicitud fue recibida correctamente. Nuestro equipo la revisará pronto.
                </p>
            </div>
        </div>

        <div className="-mt-5 relative z-10">
            <div className="bg-white dark:bg-slate-900 rounded-t-[28px] px-6 pt-6 pb-6">
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/50 rounded-xl p-3 mb-5 flex items-start gap-2.5 text-left">
                    <span className="material-icons text-amber-500 text-[18px] mt-0.5 flex-shrink-0">access_time</span>
                    <div>
                        <p className="text-xs font-bold text-amber-700 dark:text-amber-400">Tiempo de revisión: 24h – 72h</p>
                        <p className="text-[11px] text-amber-600/80 dark:text-amber-500 mt-0.5 leading-relaxed">
                            Recibirás una notificación cuando tu perfil sea aprobado como Mentor Destacado.
                        </p>
                    </div>
                </div>
                <button
                    onClick={onClose}
                    className="w-full py-3 rounded-xl font-black text-white bg-gradient-to-r from-emerald-400 to-teal-500 shadow-lg shadow-green-500/20 hover:shadow-xl hover:shadow-green-500/30 hover:-translate-y-0.5 transition-all active:scale-[0.98] text-sm"
                >
                    Entendido, gracias
                </button>
            </div>
        </div>
    </div>
);

// Main modal wrapper
const MentorDestacadoModal = ({ isOpen, onClose, onApplySuccess }) => {
    const [step, setStep] = useState(1); // 1: info, 2: form, 3: confirm

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            setStep(1);
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [isOpen]);

    if (!isOpen) return null;

    const handleSuccess = () => {
        setStep(3);
        if (onApplySuccess) onApplySuccess();
    };

    const handleClose = () => {
        onClose();
        setTimeout(() => setStep(1), 300);
    };

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <style>{`
                @keyframes modalEnter {
                    0%   { opacity: 0; transform: scale(0.80) translateY(30px); }
                    60%  { opacity: 1; }
                    100% { opacity: 1; transform: scale(1) translateY(0); }
                }
                @keyframes backdropIn {
                    from { opacity: 0; }
                    to   { opacity: 1; }
                }
            `}</style>
            <div
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm cursor-pointer"
                style={{ animation: 'backdropIn 0.25s ease both' }}
                onClick={step !== 3 ? handleClose : undefined}
            />
            <div className="relative z-10 w-full flex justify-center">
                {step === 1 && <StepInfo onNext={() => setStep(2)} onClose={handleClose} />}
                {step === 2 && <StepForm onClose={handleClose} onSuccess={handleSuccess} />}
                {step === 3 && <StepConfirmation onClose={handleClose} />}
            </div>
        </div>
    );
};

export default MentorDestacadoModal;
