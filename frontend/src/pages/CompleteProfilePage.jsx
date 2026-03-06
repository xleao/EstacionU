import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import WaveBackground from '../components/WaveBackground';
import { useAuth } from '../context/AuthContext';

const CompleteProfilePage = () => {
    const navigate = useNavigate();
    const { user, refreshUser } = useAuth();

    const [step, setStep] = useState(1); // 1 = datos personales, 2 = historial académico
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        nombre_completo: user?.nombre_completo || '',
        celular: user?.telefono_movil || '',
        fechaNacimiento: user?.fecha_nacimiento || '',
        genero: user?.genero || '',
        universidad: '',
        carrera: '',
        anioInicio: '',
        anioFin: '',
        linkedin: user?.url_linkedin || '',
    });

    // Academic history list
    const [educationList, setEducationList] = useState([]);
    const [newHistory, setNewHistory] = useState({
        universidad: '',
        carrera: '',
        anioInicio: '',
        anioFin: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleNewHistoryChange = (e) => {
        setNewHistory({ ...newHistory, [e.target.name]: e.target.value });
    };

    const handleAddHistory = () => {
        if (!newHistory.universidad || !newHistory.carrera) return;
        setEducationList([...educationList, { ...newHistory }]);
        setNewHistory({ universidad: '', carrera: '', anioInicio: '', anioFin: '' });
    };

    const handleRemoveHistory = (index) => {
        const updated = [...educationList];
        updated.splice(index, 1);
        setEducationList(updated);
    };

    const [tried, setTried] = useState(false);

    const isStep1Complete = formData.nombre_completo.trim() &&
        formData.celular.trim() &&
        formData.fechaNacimiento &&
        formData.genero;

    const validateStep1 = () => {
        if (!formData.nombre_completo.trim()) return 'El nombre completo es obligatorio.';
        if (!formData.celular.trim()) return 'El celular es obligatorio.';
        if (!formData.fechaNacimiento) return 'La fecha de nacimiento es obligatoria.';
        if (!formData.genero) return 'El género es obligatorio.';
        return null;
    };

    const handleNextStep = () => {
        setTried(true);
        const err = validateStep1();
        if (err) {
            setError(err);
            return;
        }
        setError('');
        setStep(2);
    };

    // Helper to get border class based on field validity
    const fieldBorder = (fieldValue) => {
        if (tried && !fieldValue) return 'border-red-400 dark:border-red-500';
        return 'border-slate-200 dark:border-slate-700';
    };

    const handleSubmit = async () => {
        setLoading(true);
        setError('');

        try {
            const token = localStorage.getItem('token');

            // Primary academic data from Historial Académico section
            const primaryEdu = educationList[0] || newHistory;

            // Use the main university/carrera from form for the profile save
            const response = await fetch('/api/users/me/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    nombre_completo: formData.nombre_completo,
                    telefono_movil: formData.celular,
                    fecha_nacimiento: formData.fechaNacimiento || null,
                    genero: formData.genero,
                    universidad: primaryEdu.universidad,
                    carrera: primaryEdu.carrera,
                    anio_inicio: primaryEdu.anioInicio ? parseInt(primaryEdu.anioInicio) : null,
                    anio_fin: primaryEdu.anioFin ? (primaryEdu.anioFin === 'cursando' ? -1 : parseInt(primaryEdu.anioFin)) : null,
                    url_linkedin: formData.linkedin,
                })
            });

            if (!response.ok) {
                throw new Error('Error al guardar el perfil.');
            }

            // Refresh user data
            await refreshUser();

            // Navigate to the appropriate dashboard
            const role = (user?.role || '').toLowerCase();
            if (['admin', 'administrador'].includes(role)) {
                navigate('/admin/dashboard');
            } else if (['mentor', 'graduate', 'egresado'].includes(role)) {
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

    const currentYear = new Date().getFullYear();

    return (
        <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 min-h-screen flex flex-col font-sans transition-colors duration-300 relative overflow-hidden">
            <WaveBackground />

            <main className="flex-grow flex items-center justify-center p-4 relative z-10 w-full py-12">
                <div className="w-full max-w-2xl transition-all duration-300">
                    <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/20 dark:border-slate-800 p-6 md:p-10 rounded-2xl md:rounded-3xl shadow-2xl animate-fade-in">

                        {/* Progress Indicator */}
                        <div className="flex items-center justify-center gap-3 mb-8">
                            <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all ${step === 1 ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'}`}>
                                <span className="material-icons text-sm">{step > 1 ? 'check_circle' : 'person'}</span>
                                Datos Personales
                            </div>
                            <div className="w-8 h-0.5 bg-slate-200 dark:bg-slate-700"></div>
                            <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all ${step === 2 ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500'}`}>
                                <span className="material-icons text-sm">school</span>
                                Historial Académico
                            </div>
                        </div>

                        {/* Header */}
                        <div className="text-center mb-8">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-blue-600 text-white mb-4 shadow-lg shadow-blue-500/20">
                                <span className="material-icons text-3xl">{step === 1 ? 'edit_note' : 'school'}</span>
                            </div>
                            <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                                {step === 1 ? 'Completa tu Perfil' : 'Historial Académico'}
                            </h1>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                {step === 1
                                    ? 'Todos los campos marcados con * son obligatorios'
                                    : 'Añade tu historial académico (opcional, puedes hacerlo luego)'
                                }
                            </p>
                        </div>

                        {/* Error */}
                        {error && (
                            <div className="bg-red-50 dark:bg-red-900/20 border border-red-300 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-xl relative mb-4 text-sm flex items-center gap-2 font-medium" role="alert">
                                <span className="material-icons text-lg">error_outline</span>
                                <span>{error}</span>
                            </div>
                        )}

                        {/* STEP 1: Datos Personales */}
                        {step === 1 && (
                            <div className="space-y-5 animate-fade-in">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    {/* Nombre Completo */}
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Nombre Completo *</label>
                                        <input
                                            name="nombre_completo"
                                            className={`w-full rounded-2xl border ${fieldBorder(formData.nombre_completo.trim())} bg-white dark:bg-slate-800/80 px-5 py-3 text-sm font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all placeholder:text-slate-400`}
                                            type="text"
                                            placeholder="Tu nombre completo"
                                            value={formData.nombre_completo}
                                            onChange={handleChange}
                                        />
                                    </div>

                                    {/* Email (read-only) */}
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Correo Electrónico</label>
                                        <div className="relative">
                                            <input
                                                className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 px-5 py-3 text-sm font-semibold text-slate-500 dark:text-slate-400 outline-none cursor-not-allowed pr-10"
                                                type="email"
                                                value={user?.email || ''}
                                                disabled
                                            />
                                            <span className="material-icons absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">lock</span>
                                        </div>
                                    </div>

                                    {/* Celular */}
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Celular / WhatsApp *</label>
                                        <div className="flex">
                                            <span className={`inline-flex items-center px-4 rounded-l-2xl border border-r-0 ${fieldBorder(formData.celular.trim())} font-semibold text-sm bg-slate-50 dark:bg-slate-900/60 text-primary`}>+51</span>
                                            <input
                                                name="celular"
                                                className={`w-full rounded-r-2xl border border-l-0 ${fieldBorder(formData.celular.trim())} bg-white dark:bg-slate-800/80 px-4 py-3 text-sm font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all`}
                                                type="tel"
                                                placeholder="999 999 999"
                                                value={formData.celular}
                                                onChange={handleChange}
                                            />
                                        </div>
                                    </div>

                                    {/* Fecha Nacimiento */}
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Fecha de Nacimiento *</label>
                                        <input
                                            name="fechaNacimiento"
                                            className={`w-full rounded-2xl border ${fieldBorder(formData.fechaNacimiento)} bg-white dark:bg-slate-800/80 px-5 py-3 text-sm font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all`}
                                            type="date"
                                            value={formData.fechaNacimiento}
                                            onChange={handleChange}
                                        />
                                    </div>

                                    {/* Género */}
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Género *</label>
                                        <select
                                            name="genero"
                                            className={`w-full rounded-2xl border ${fieldBorder(formData.genero)} bg-white dark:bg-slate-800/80 px-5 py-3 text-sm font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all`}
                                            value={formData.genero}
                                            onChange={handleChange}
                                        >
                                            <option value="">Seleccionar...</option>
                                            <option value="m">Masculino</option>
                                            <option value="f">Femenino</option>
                                            <option value="o">Otro / Prefiero no decirlo</option>
                                        </select>
                                    </div>



                                    {/* LinkedIn */}
                                    <div className="space-y-2 md:col-span-2">
                                        <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">LinkedIn URL</label>
                                        <input
                                            name="linkedin"
                                            className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 px-5 py-3 text-sm font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all placeholder:text-slate-400"
                                            type="url"
                                            placeholder="Ej. https://www.linkedin.com/in/tu-perfil/"
                                            value={formData.linkedin}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>

                                {/* Continue to step 2 */}
                                <button
                                    onClick={handleNextStep}
                                    disabled={tried && !isStep1Complete}
                                    className={`w-full font-bold py-3.5 px-6 rounded-xl shadow-lg transition-all active:scale-[0.98] text-base flex items-center justify-center gap-2 mt-4 ${isStep1Complete ? 'bg-primary hover:bg-primary/90 text-white shadow-primary/20' : 'bg-primary/60 text-white/80 shadow-primary/10 cursor-not-allowed'}`}
                                >
                                    Siguiente
                                    <span className="material-icons text-lg">arrow_forward</span>
                                </button>

                                {tried && !isStep1Complete && (
                                    <p className="text-center text-xs text-red-500 font-medium mt-2">
                                        Completa todos los campos obligatorios (*) para continuar.
                                    </p>
                                )}
                            </div>
                        )}

                        {/* STEP 2: Historial Académico */}
                        {step === 2 && (
                            <div className="space-y-5 animate-fade-in">
                                {/* Existing history entries */}
                                {educationList.length > 0 && (
                                    <div className="space-y-3">
                                        {educationList.map((edu, index) => (
                                            <div key={index} className="p-4 border border-slate-200 dark:border-slate-700 rounded-2xl flex justify-between items-start bg-white dark:bg-slate-800/80 group hover:border-primary/40 transition-all">
                                                <div>
                                                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">{edu.universidad}</h3>
                                                    <p className="text-primary font-semibold text-xs">{edu.carrera}</p>
                                                    <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                                                        {edu.anioInicio || '...'} - {edu.anioFin === 'cursando' ? 'Actualidad' : (edu.anioFin || '...')}
                                                    </span>
                                                </div>
                                                <button
                                                    onClick={() => handleRemoveHistory(index)}
                                                    className="p-1.5 text-slate-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                                                >
                                                    <span className="material-icons text-[18px]">delete</span>
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Add New History Form */}
                                <div className="p-5 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl space-y-4 bg-slate-50/50 dark:bg-slate-800/30">
                                    <h3 className="text-sm font-bold text-slate-600 dark:text-slate-300 flex items-center gap-2">
                                        <span className="material-icons text-primary text-lg">add_circle</span>
                                        Añadir historial académico
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Institución</label>
                                            <input
                                                name="universidad"
                                                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2.5 text-sm font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all placeholder:text-slate-400"
                                                type="text"
                                                placeholder="Ej. UNI, UPC..."
                                                value={newHistory.universidad}
                                                onChange={handleNewHistoryChange}
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Carrera</label>
                                            <input
                                                name="carrera"
                                                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2.5 text-sm font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all placeholder:text-slate-400"
                                                type="text"
                                                placeholder="Ej. Ingeniería"
                                                value={newHistory.carrera}
                                                onChange={handleNewHistoryChange}
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Año Inicio</label>
                                            <select
                                                name="anioInicio"
                                                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2.5 text-sm font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all"
                                                value={newHistory.anioInicio}
                                                onChange={handleNewHistoryChange}
                                            >
                                                <option value="">Año inicio</option>
                                                {Array.from({ length: 40 }, (_, i) => currentYear - i).map(year => (
                                                    <option key={year} value={year}>{year}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Año Fin</label>
                                            <select
                                                name="anioFin"
                                                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2.5 text-sm font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all"
                                                value={newHistory.anioFin}
                                                onChange={handleNewHistoryChange}
                                            >
                                                <option value="">Año fin</option>
                                                <option value="cursando">Cursando</option>
                                                {Array.from({ length: 45 }, (_, i) => currentYear + 5 - i).map(year => (
                                                    <option key={year} value={year}>{year}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                    <button
                                        onClick={handleAddHistory}
                                        disabled={!newHistory.universidad || !newHistory.carrera}
                                        className="w-full bg-slate-100 dark:bg-slate-800 hover:bg-primary/10 text-primary font-bold py-2.5 px-4 rounded-xl text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                                    >
                                        <span className="material-icons text-sm">add</span>
                                        Añadir al historial
                                    </button>
                                </div>

                                {/* Navigation */}
                                <div className="flex gap-3 mt-4">
                                    <button
                                        onClick={() => { setStep(1); setError(''); }}
                                        className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold py-3.5 px-6 rounded-xl text-base transition-all flex items-center justify-center gap-2 hover:bg-slate-200 dark:hover:bg-slate-700"
                                    >
                                        <span className="material-icons text-lg">arrow_back</span>
                                        Atrás
                                    </button>
                                    <button
                                        onClick={handleSubmit}
                                        disabled={loading}
                                        className="flex-[2] bg-primary hover:bg-primary/90 text-white font-bold py-3.5 px-6 rounded-xl shadow-lg shadow-primary/20 transition-all active:scale-[0.98] text-base flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {loading ? (
                                            <>
                                                <span className="material-icons animate-spin text-lg">autorenew</span>
                                                Guardando...
                                            </>
                                        ) : (
                                            <>
                                                Finalizar y Entrar
                                                <span className="material-icons text-lg">check_circle</span>
                                            </>
                                        )}
                                    </button>
                                </div>

                                <p className="text-center text-xs text-slate-400 dark:text-slate-500 mt-2">
                                    Podrás añadir o editar tu historial desde tu perfil más adelante.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default CompleteProfilePage;
