import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const CoffeeChatModal = ({ isOpen, onClose, mentor }) => {
    const [formData, setFormData] = useState({
        fecha: '',
        hora: '',
        tema: '',
        descripcion: '',
        selectedSlotLabel: ''
    });
    const [selectedDisp, setSelectedDisp] = useState(null);
    const [dateDropdownOpen, setDateDropdownOpen] = useState(false);

    const [status, setStatus] = useState(null); // 'loading', 'success', 'error'
    const navigate = useNavigate();
    const { user } = useAuth();

    // Reset form when modal opens or mentor changes
    useEffect(() => {
        if (isOpen) {
            setFormData({
                fecha: '',
                hora: '',
                tema: '',
                descripcion: '',
                selectedSlotLabel: ''
            });
            setSelectedDisp(null);
            setDateDropdownOpen(false);
            setStatus(null);
        }
    }, [isOpen, mentor?.id]);

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

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setStatus('loading');
            const token = localStorage.getItem('token');
            // Ensure the appointment is saved in the database before continuing
            const response = await fetch('/api/appointments', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    mentor_user_id: mentor.id,
                    fecha: formData.fecha,
                    hora: formData.hora,
                    tema: formData.tema,
                    mensaje: formData.descripcion
                })
            });

            if (!response.ok) {
                console.error("Error guardando cita en backend:", await response.text());
                setStatus('error');
                return;
            }

            // Open WhatsApp immediately
            if (mentor.celular) {
                const mentorName = mentor.name ? mentor.name.split(' ')[0] : 'Mentor';
                const userInfo = user?.nombre_completo || 'un estudiante';
                const carreraInfo = user?.carrera ? ` de ${user.carrera}` : '';

                const textMessage = [
                    `Hola ${mentorName}! 👋 ☕`,
                    '',
                    `Soy ${userInfo}, y acabo de solicitar una sesión de Coffee Chat contigo a través de EstaciónU. 🚀 ✨`,
                    '',
                    `📅 Detalles de la sesión:`,
                    `* Horario: ${formData.selectedSlotLabel}`,
                    `* Tema principal: ${formData.tema}`,
                    '',
                    `🎯 Un poco más sobre lo que busco:`,
                    `"${formData.descripcion || 'Me gustaría conocer más sobre tu trayectoria profesional.'}"`,
                    '',
                    `Quedo a la espera de tu confirmación. ¡Muchas gracias por tu tiempo y disposición! 🙌`
                ].join('\n');

                const cleanPhone = mentor.celular.replace(/\D/g, '');
                const finalPhone = cleanPhone.length === 9 && cleanPhone.startsWith('9') ? `51${cleanPhone}` : cleanPhone;

                const wpUrl = `https://api.whatsapp.com/send?phone=${finalPhone}&text=${encodeURIComponent(textMessage)}`;
                window.open(wpUrl, '_blank');
            }

            // Show confirmation screen
            setStatus('success');

        } catch (error) {
            setStatus('error');
        }
    };

    const getFutureDatesForDay = (dayName, count = 52) => {
        const days = {
            'lunes': 1, 'martes': 2, 'miercoles': 3, 'miércoles': 3,
            'jueves': 4, 'viernes': 5, 'sabado': 6, 'sábado': 6, 'domingo': 0
        };
        const targetDay = days[dayName.toLowerCase()];
        if (targetDay === undefined) return [];

        const now = new Date();
        const firstDate = new Date(now);
        let daysToAdd = (targetDay + 7 - now.getDay()) % 7;
        if (daysToAdd === 0) daysToAdd = 0; // include today
        firstDate.setDate(now.getDate() + daysToAdd);

        const dates = [];
        const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
        const diasSemana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
        for (let i = 0; i < count; i++) {
            const d = new Date(firstDate);
            d.setDate(firstDate.getDate() + (i * 7));
            dates.push({
                value: d.toLocaleDateString('en-CA'),
                label: `${diasSemana[d.getDay()]} ${d.getDate()} de ${meses[d.getMonth()]}`,
                short: `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`
            });
        }
        return dates;
    };

    const handleSelectSlot = (disp) => {
        setSelectedDisp(disp);
        setDateDropdownOpen(true);
        // Auto-select the first available date
        const futureDates = getFutureDatesForDay(disp.dia);
        const firstDate = futureDates.length > 0 ? futureDates[0] : null;
        setFormData({
            ...formData,
            hora: disp.hora_inicio,
            fecha: firstDate ? firstDate.value : '',
            selectedSlotLabel: firstDate
                ? `${disp.dia} ${firstDate.short} a las ${disp.hora_inicio}`
                : `${disp.dia} a las ${disp.hora_inicio}`
        });
    };

    const handleDateChange = (dateValue) => {
        if (!selectedDisp) return;
        const futureDates = getFutureDatesForDay(selectedDisp.dia);
        const found = futureDates.find(d => d.value === dateValue);
        setFormData({
            ...formData,
            fecha: dateValue,
            selectedSlotLabel: found
                ? `${selectedDisp.dia} ${found.short} a las ${selectedDisp.hora_inicio}`
                : formData.selectedSlotLabel
        });
        setDateDropdownOpen(false);
    };

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Modal Container */}
            <div className="relative bg-white dark:bg-slate-900 w-full max-w-[520px] max-h-[calc(100vh-3rem)] rounded-[32px] shadow-[0_20px_50px_rgba(0,0,0,0.2)] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-300">
                <div className="overflow-y-auto custom-scrollbar flex-1 p-1">
                    {status === 'success' ? (
                        <div className="p-8 animate-in fade-in zoom-in-95 duration-300">
                            <div className="text-center">
                                <div className="w-20 h-20 rounded-full bg-[#25D366]/10 flex items-center justify-center mx-auto mb-6 relative group">
                                    <div className="absolute inset-0 bg-[#25D366]/20 rounded-full animate-ping opacity-75"></div>
                                    <svg className="w-9 h-9 text-[#25D366] relative z-10 transition-transform duration-300 group-hover:scale-110" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="20 6 9 17 4 12"></polyline>
                                    </svg>
                                </div>
                                <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">{String.fromCodePoint(0x2705)} Solicitud Enviada</h3>
                                <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-[220px] mx-auto text-sm">
                                    Tu Coffee Chat con <span className="font-bold text-slate-700 dark:text-slate-200">{mentor?.name ? mentor.name.split(' ')[0] : 'tu mentor'}</span> fue agendado correctamente.
                                </p>
                                <div className="flex space-x-3">
                                    <button
                                        onClick={() => {
                                            onClose();
                                            setStatus(null);
                                            setFormData({ fecha: '', hora: '', tema: '', descripcion: '', selectedSlotLabel: '' });
                                        }}
                                        className="flex-1 py-3.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 active:scale-95 transition-all"
                                    >
                                        Cerrar
                                    </button>
                                    <button
                                        onClick={() => {
                                            onClose();
                                            setTimeout(() => {
                                                setStatus(null);
                                                setFormData({ fecha: '', hora: '', tema: '', descripcion: '', selectedSlotLabel: '' });
                                                navigate('/sesiones');
                                            }, 300);
                                        }}
                                        className="flex-1 py-3.5 px-4 rounded-xl bg-[#25D366] hover:bg-[#1EBE5A] text-white font-semibold active:scale-95 transition-all shadow-lg shadow-[#25D366]/30"
                                    >
                                        Ver Sesiones
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <>

                            <div className="px-5 sm:px-8 pt-6 sm:pt-8 pb-4 flex items-center justify-between sticky top-0 bg-white dark:bg-slate-900 z-20">
                                <div>
                                    <h3 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Agendar Cita</h3>
                                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Selecciona un horario para tu sesión con {mentor?.name ? mentor.name.split(' ')[0] : 'tu mentor'}</p>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="w-10 h-10 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600 dark:hover:text-slate-200 transition-all"
                                >
                                    <span className="material-icons">close</span>
                                </button>
                            </div>

                            <form className="px-5 sm:px-8 pb-8 space-y-6" onSubmit={handleSubmit}>
                                <div className="space-y-3">
                                    <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.1em] ml-1">Horarios Disponibles</label>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                                        {(mentor?.disponibilidades && mentor.disponibilidades.length > 0) ? (
                                            mentor.disponibilidades.map((disp, idx) => {
                                                const isSelected = formData.hora === disp.hora_inicio && formData.selectedSlotLabel?.includes(disp.dia);
                                                return (
                                                    <button
                                                        key={idx}
                                                        type="button"
                                                        onClick={() => handleSelectSlot(disp)}
                                                        className={`group relative px-4 py-3 rounded-2xl border-2 transition-all text-left flex flex-col gap-0.5 ${isSelected
                                                            ? 'bg-primary/5 border-primary text-primary shadow-md shadow-primary/10'
                                                            : 'bg-white dark:bg-slate-800/40 border-slate-100 dark:border-800 text-slate-500 hover:border-primary/30 hover:bg-primary/[0.02]'}`}
                                                    >
                                                        <span className={`text-[10px] font-bold uppercase tracking-wider ${isSelected ? 'text-primary' : 'text-slate-400 group-hover:text-primary/60 transition-colors'}`}>{disp.dia}</span>
                                                        <span className="text-sm font-bold">{disp.hora_inicio} - {disp.hora_fin}</span>
                                                        {isSelected && (
                                                            <div className="absolute top-2 right-2">
                                                                <span className="material-icons text-primary text-[14px]">check_circle</span>
                                                            </div>
                                                        )}
                                                    </button>
                                                );
                                            })
                                        ) : (
                                            <div className="col-span-2 py-4 px-6 bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-800/50 rounded-2xl text-amber-700 dark:text-amber-400 text-xs font-medium flex items-center gap-3">
                                                <span className="material-icons text-sm">info</span>
                                                Este mentor no ha definido horarios específicos. Por favor contáctalo por LinkedIn.
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {selectedDisp && (
                                    <div className="space-y-3">
                                        <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.1em] ml-1">Selecciona la Fecha</label>
                                        <div className="relative">
                                            <button
                                                type="button"
                                                onClick={() => setDateDropdownOpen(!dateDropdownOpen)}
                                                className="w-full px-4 py-3.5 rounded-2xl border-2 border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 text-left text-sm font-medium flex items-center gap-3 hover:border-primary/30 transition-all"
                                            >
                                                <span className="material-icons text-slate-400 text-[20px]">calendar_month</span>
                                                <span className="flex-1 text-slate-900 dark:text-white font-bold truncate">
                                                    {formData.fecha
                                                        ? getFutureDatesForDay(selectedDisp.dia).find(d => d.value === formData.fecha)?.label || 'Fecha seleccionada'
                                                        : 'Selecciona una fecha...'}
                                                </span>
                                                <span className={`material-icons text-slate-400 text-[20px] transition-transform ${dateDropdownOpen ? 'rotate-180' : ''}`}>expand_more</span>
                                            </button>
                                            {dateDropdownOpen && (
                                                <div className="absolute z-30 left-0 right-0 mt-1 rounded-2xl border-2 border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl shadow-slate-200/50 dark:shadow-black/30 overflow-hidden">
                                                    <div className="max-h-[180px] overflow-y-auto custom-scrollbar">
                                                        {getFutureDatesForDay(selectedDisp.dia).map((d, i) => (
                                                            <button
                                                                key={i}
                                                                type="button"
                                                                onClick={() => handleDateChange(d.value)}
                                                                className={`w-full px-4 py-2.5 text-left text-sm font-medium transition-all flex items-center gap-3 ${formData.fecha === d.value
                                                                        ? 'bg-primary/10 text-primary font-bold'
                                                                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50'
                                                                    }`}
                                                            >
                                                                <span className={`material-icons text-[16px] ${formData.fecha === d.value ? 'text-primary' : 'text-slate-300 dark:text-slate-600'}`}>
                                                                    {formData.fecha === d.value ? 'radio_button_checked' : 'radio_button_unchecked'}
                                                                </span>
                                                                {d.label}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 ml-1" htmlFor="tema">Tema a tratar</label>
                                    <div className="relative group/input">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 material-icons text-slate-400 text-[20px] group-focus-within/input:text-primary transition-colors">topic</span>
                                        <select
                                            className="custom-select w-full pl-12 pr-10 py-3.5 rounded-2xl border-2 border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:border-primary/40 focus:ring-4 focus:ring-primary/5 transition-all outline-none text-sm font-medium"
                                            id="tema" name="tema" value={formData.tema} onChange={handleChange} required>
                                            <option disabled value="">Selecciona un tema...</option>
                                            <option value="Revisión de CV / Portfolio">Revisión de CV / Portfolio</option>
                                            <option value="Orientación de Carrera">Orientación de Carrera</option>
                                            <option value="Desarrollo de Habilidades Soft">Desarrollo de Habilidades Soft</option>
                                            <option value="Networking Estratégico">Networking Estratégico</option>
                                            <option value="Insight del Sector Industrial">Insight del Sector Industrial</option>
                                            <option value="Tu trabajo y/o línea de carrera">Tu trabajo y/o linea de carrera</option>
                                            <option value="Experiencia en un sector o industria">Experiencia en un sector o industria</option>
                                            <option value="Orientación universitaria y/o posgrado">Orientacion universitaria y/o posgrado</option>
                                            <option value="Otro">Otro</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 ml-1" htmlFor="descripcion">Descripción adicional</label>
                                    <textarea
                                        className="w-full px-5 py-4 rounded-2xl border-2 border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:border-primary/40 focus:ring-4 focus:ring-primary/5 transition-all resize-none outline-none text-sm font-medium"
                                        id="descripcion" name="descripcion"
                                        placeholder="Cuéntale un poco más a tu mentor sobre qué esperas lograr en esta sesión..."
                                        rows="3" value={formData.descripcion} onChange={handleChange}></textarea>
                                </div>

                                <div className="pt-2 sticky bottom-0 bg-white dark:bg-slate-900 pb-2 z-10">
                                    <button
                                        className={`w-full py-4 px-8 bg-[#25D366] text-white font-bold rounded-2xl shadow-xl shadow-[#25D366]/25 transition-all transform flex items-center justify-center gap-3 overflow-hidden group ${status === 'loading' ? 'opacity-70 cursor-not-allowed' : 'hover:bg-[#1EBE5A] hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]'}`}
                                        type="submit"
                                        disabled={status === 'loading'}>
                                        {status === 'loading' ? (
                                            <span className="relative z-10">Procesando solicitud...</span>
                                        ) : (
                                            <>
                                                <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
                                                <span className="relative z-10">Enviar por WhatsApp</span>
                                            </>
                                        )}
                                    </button>
                                    {status === 'error' && <p className="mt-3 text-red-500 text-xs text-center font-bold flex items-center justify-center gap-1"><span className="material-icons text-sm">error</span> Error al enviar. Intenta de nuevo.</p>}
                                </div>
                            </form >
                        </>
                    )}
                </div >
            </div >

            <style>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #E2E8F0;
                    border-radius: 10px;
                }
                .dark .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #334155;
                }
                @keyframes scale-check {
                    0% { transform: scale(0.5); opacity: 0; }
                    50% { transform: scale(1.1); }
                    100% { transform: scale(1); opacity: 1; }
                }
                .animate-scale-check {
                    animation: scale-check 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) both;
                }
                .py-4\.5 { padding-top: 1.125rem; padding-bottom: 1.125rem; }
            `}</style>
        </div >
    );
};

export default CoffeeChatModal;
