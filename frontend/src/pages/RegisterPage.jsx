import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import WaveBackground from '../components/WaveBackground';
import { useAuth } from '../context/AuthContext';
import { useGoogleLogin } from '@react-oauth/google';
import { CustomCombobox } from '../components/CustomCombobox';

const UNIVERSITY_OPTIONS = ['UNI', 'Otros'];
const CAREER_OPTIONS = [
    'Ingeniería Industrial',
    'Ingeniería de Inteligencia Artificial',
    'Ingeniería de Software',
    'Ingeniería de Sistemas',
    'Otros'
];

const RegisterPage = () => {
    const navigate = useNavigate();
    const { register, loginWithGoogle } = useAuth();

    // Steps: 'role' → 'profile' → 'academic'
    const [currentStep, setCurrentStep] = useState('role');
    const [selectedRole, setSelectedRole] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [showTerms, setShowTerms] = useState(false);
    const [tried, setTried] = useState(false);

    const [formData, setFormData] = useState({
        nombre_completo: '',
        email: '',
        password: '',
        confirmPassword: '',
        celular: '',
        fechaNacimiento: '',
        genero: '',
        universidad: '',
        carrera: '',
        anioInicio: '',
        anioFin: '',
        linkedin: '',
        terms: false,
    });

    // Academic history list (optional)
    const [educationList, setEducationList] = useState([]);
    const [newHistory, setNewHistory] = useState({
        universidad: '',
        carrera: '',
        anioInicio: '',
        anioFin: ''
    });

    const currentYear = new Date().getFullYear();

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
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

    // Password strength
    const getPasswordStrength = (pass) => {
        if (!pass) return { score: 0, label: '', color: 'bg-slate-200' };
        let score = 0;
        if (pass.length > 5) score++;
        if (pass.length > 7) score++;
        if (/[0-9]/.test(pass)) score++;
        if (/[^A-Za-z0-9]/.test(pass) || /[A-Z]/.test(pass)) score++;
        switch (score) {
            case 0: case 1: return { score: 1, label: 'Insegura', color: 'bg-red-500' };
            case 2: return { score: 2, label: 'Débil', color: 'bg-orange-500' };
            case 3: return { score: 3, label: 'Media', color: 'bg-yellow-500' };
            case 4: return { score: 4, label: 'Fuerte', color: 'bg-green-500' };
            default: return { score: 0, label: '', color: 'bg-slate-200' };
        }
    };
    const strength = getPasswordStrength(formData.password);

    // Validation
    const isProfileComplete =
        formData.nombre_completo.trim() &&
        formData.email.trim() &&
        formData.password.length >= 8 &&
        formData.password === formData.confirmPassword &&
        formData.celular.trim() &&
        formData.fechaNacimiento &&
        formData.genero &&
        formData.terms;

    const validateProfile = () => {
        if (!formData.nombre_completo.trim()) return 'El nombre completo es obligatorio.';
        if (!formData.email.trim()) return 'El correo electrónico es obligatorio.';
        if (formData.password.length < 8) return 'La contraseña debe tener al menos 8 caracteres.';
        if (formData.password !== formData.confirmPassword) return 'Las contraseñas no coinciden.';
        if (!formData.celular.trim()) return 'El celular es obligatorio.';
        if (!formData.fechaNacimiento) return 'La fecha de nacimiento es obligatoria.';
        if (!formData.genero) return 'El género es obligatorio.';
        if (!formData.terms) return 'Debes aceptar los términos y condiciones.';
        return null;
    };

    const handleNextToAcademic = () => {
        setTried(true);
        const err = validateProfile();
        if (err) {
            setError(err);
            return;
        }
        setError('');
        setCurrentStep('academic');
    };

    const fieldBorder = (fieldValue) => {
        if (tried && !fieldValue) return 'border-red-400 dark:border-red-500';
        return 'border-slate-200 dark:border-slate-700';
    };

    // Final submit: Register → set role → update profile → navigate to dashboard
    const handleSubmit = async () => {
        setLoading(true);
        setError('');

        try {
            // Split nombre_completo into nombre and apellidos
            const parts = formData.nombre_completo.trim().split(' ');
            const nombre = parts[0] || '';
            const apellidos = parts.slice(1).join(' ') || '';

            // 1. Register account
            // This will create account, set role, update profile in AuthContext

            // Primary academic data from Historial Académico section
            const primaryEdu = educationList[0] || newHistory;

            await register(
                nombre,
                apellidos,
                formData.email,
                formData.password,
                selectedRole,
                {
                    nombre_completo: formData.nombre_completo,
                    telefono_movil: formData.celular,
                    fecha_nacimiento: formData.fechaNacimiento || null,
                    genero: formData.genero,
                    universidad: primaryEdu.universidad,
                    carrera: primaryEdu.carrera,
                    anio_inicio: primaryEdu.anioInicio ? parseInt(primaryEdu.anioInicio) : null,
                    anio_fin: primaryEdu.anioFin ? (primaryEdu.anioFin === 'cursando' ? -1 : parseInt(primaryEdu.anioFin)) : null,
                    url_linkedin: formData.linkedin,
                }
            );
            // register() handles navigation
        } catch (err) {
            console.error(err);
            setError(err.message || 'Ocurrió un error en el registro');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = useGoogleLogin({
        onSuccess: async tokenResponse => {
            try {
                setError('');
                await loginWithGoogle(tokenResponse.access_token);
            } catch (err) {
                setError(err.message || 'Error en la autenticación con Google');
            }
        },
        onError: () => {
            setError('Error en la autenticación con Google');
        },
        prompt: 'select_account consent'
    });

    return (
        <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 min-h-screen flex flex-col font-sans transition-colors duration-300 relative overflow-hidden">
            <WaveBackground />

            <main className="flex-grow flex items-center justify-center p-4 relative z-10 w-full py-8">

                {/* ========== STEP 1: Role Selection ========== */}
                {currentStep === 'role' && (
                    <div className="w-full max-w-md mx-4 animate-fade-in">
                        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl shadow-slate-200/60 dark:shadow-black/30 border border-slate-100 dark:border-slate-800 px-8 py-10 md:px-10 md:py-12 transition-all duration-300">
                            <div className="text-center mb-8">
                                <h1 className="text-[28px] font-extrabold text-slate-900 dark:text-white tracking-tight mb-2">
                                    Selecciona tu perfil
                                </h1>
                                <p className="text-[15px] text-slate-400 dark:text-slate-500 font-medium">
                                    Elige tu tipo de perfil para continuar
                                </p>
                            </div>

                            {error && (
                                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-2xl mb-5 text-sm flex items-center gap-2 font-medium">
                                    <span className="material-icons text-lg">error_outline</span>
                                    <span>{error}</span>
                                </div>
                            )}

                            <div className="space-y-3 mb-8">
                                <button
                                    onClick={() => { setSelectedRole('estudiante'); setError(''); setCurrentStep('profile'); }}
                                    className="w-full group flex items-center gap-4 p-5 rounded-2xl border-2 border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-800/50 hover:border-[#3C96E0]/40 dark:hover:border-primary/40 hover:bg-[#f8fbff] dark:hover:bg-slate-800 transition-all duration-200 text-left active:scale-[0.98]"
                                >
                                    <div className="w-12 h-12 rounded-2xl bg-[#EBF5FF] dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform duration-200">
                                        <span className="material-icons text-[#3C96E0] text-[22px]">school</span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-[15px] font-bold text-slate-900 dark:text-white">Soy Estudiante</h3>
                                        <p className="text-[13px] text-slate-400 dark:text-slate-500 font-medium mt-0.5">Accede a mentorías y recursos</p>
                                    </div>
                                    <span className="material-icons text-slate-300 dark:text-slate-600 text-[20px] group-hover:text-[#3C96E0] group-hover:translate-x-0.5 transition-all duration-200">arrow_forward_ios</span>
                                </button>

                                <button
                                    onClick={() => { setSelectedRole('mentor'); setError(''); setCurrentStep('profile'); }}
                                    className="w-full group flex items-center gap-4 p-5 rounded-2xl border-2 border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-800/50 hover:border-emerald-300/60 dark:hover:border-emerald-700/40 hover:bg-[#f6fdf9] dark:hover:bg-slate-800 transition-all duration-200 text-left active:scale-[0.98]"
                                >
                                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform duration-200">
                                        <span className="material-icons text-emerald-500 text-[22px]">work</span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-[15px] font-bold text-slate-900 dark:text-white">Soy Egresado</h3>
                                        <p className="text-[13px] text-slate-400 dark:text-slate-500 font-medium mt-0.5">Comparte experiencia y conecta</p>
                                    </div>
                                    <span className="material-icons text-slate-300 dark:text-slate-600 text-[20px] group-hover:text-emerald-500 group-hover:translate-x-0.5 transition-all duration-200">arrow_forward_ios</span>
                                </button>
                            </div>

                            <div className="text-center">
                                <p className="text-[13px] text-slate-400 dark:text-slate-500 font-medium">
                                    ¿Ya tienes cuenta?{' '}
                                    <Link to="/login" className="text-[#3C96E0] dark:text-primary font-bold hover:underline">
                                        Iniciar Sesión
                                    </Link>
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* ========== STEP 2: Datos Personales (same as CompleteProfilePage step 1) ========== */}
                {currentStep === 'profile' && (
                    <div className="w-full max-w-2xl transition-all duration-300 animate-fade-in">
                        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/20 dark:border-slate-800 p-6 md:p-10 rounded-2xl md:rounded-3xl shadow-2xl">

                            {/* Progress Indicator */}
                            <div className="flex items-center justify-center gap-3 mb-8">
                                <div className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold bg-primary text-white shadow-lg shadow-primary/30">
                                    <span className="material-icons text-sm">person</span>
                                    Datos Personales
                                </div>
                                <div className="w-8 h-0.5 bg-slate-200 dark:bg-slate-700"></div>
                                <div className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500">
                                    <span className="material-icons text-sm">school</span>
                                    Historial Académico
                                </div>
                            </div>

                            {/* Header */}
                            <div className="text-center mb-8">
                                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-blue-600 text-white mb-4 shadow-lg shadow-blue-500/20">
                                    <span className="material-icons text-3xl">edit_note</span>
                                </div>
                                <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Completa tu Perfil</h1>
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                    Todos los campos marcados con * son obligatorios
                                </p>
                            </div>

                            {/* Error */}
                            {error && (
                                <div className="bg-red-50 dark:bg-red-900/20 border border-red-300 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-xl relative mb-4 text-sm flex items-center gap-2 font-medium" role="alert">
                                    <span className="material-icons text-lg">error_outline</span>
                                    <span>{error}</span>
                                </div>
                            )}

                            <div className="space-y-5">
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

                                    {/* Email */}
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Correo Electrónico *</label>
                                        <div className="relative">
                                            <input
                                                name="email"
                                                className={`w-full rounded-2xl border ${fieldBorder(formData.email.trim())} bg-white dark:bg-slate-800/80 px-5 py-3 text-sm font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all placeholder:text-slate-400`}
                                                type="email"
                                                placeholder="tu_correo@ejemplo.com"
                                                value={formData.email}
                                                onChange={handleChange}
                                            />
                                        </div>
                                    </div>

                                    {/* Contraseña */}
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center">
                                            <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Contraseña *</label>
                                            {formData.password && <span className={`text-xs font-bold px-2 py-0.5 rounded ${strength.color.replace('bg-', 'text-')}`}>{strength.label}</span>}
                                        </div>
                                        <div className="relative">
                                            <input
                                                name="password"
                                                className={`w-full rounded-2xl border ${fieldBorder(formData.password.length >= 8 ? 'ok' : '')} bg-white dark:bg-slate-800/80 px-5 py-3 pr-12 text-sm font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all placeholder:text-slate-400`}
                                                type={showPassword ? "text" : "password"}
                                                placeholder="Mínimo 8 caracteres"
                                                value={formData.password}
                                                onChange={handleChange}
                                            />
                                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                                                <span className="material-icons text-xl">{showPassword ? 'visibility_off' : 'visibility'}</span>
                                            </button>
                                        </div>
                                        {formData.password && (
                                            <div className="flex gap-1 h-1">
                                                {[1, 2, 3, 4].map((i) => (
                                                    <div key={i} className={`h-full flex-1 rounded-full transition-all duration-300 ${i <= strength.score ? strength.color : 'bg-slate-200 dark:bg-slate-700'}`}></div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Confirmar Contraseña */}
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Confirmar Contraseña *</label>
                                        <div className="relative">
                                            <input
                                                name="confirmPassword"
                                                className={`w-full rounded-2xl border ${tried && formData.password !== formData.confirmPassword ? 'border-red-400 dark:border-red-500' : 'border-slate-200 dark:border-slate-700'} bg-white dark:bg-slate-800/80 px-5 py-3 pr-12 text-sm font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all placeholder:text-slate-400`}
                                                type={showConfirmPassword ? "text" : "password"}
                                                placeholder="••••••••"
                                                value={formData.confirmPassword}
                                                onChange={handleChange}
                                            />
                                            <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                                                <span className="material-icons text-xl">{showConfirmPassword ? 'visibility_off' : 'visibility'}</span>
                                            </button>
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

                                    {/* Terms */}
                                    <div className="md:col-span-2 flex items-center pt-1">
                                        <input
                                            className="w-4 h-4 rounded text-primary focus:ring-primary border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 transition-all cursor-pointer"
                                            name="terms"
                                            type="checkbox"
                                            checked={formData.terms}
                                            onChange={handleChange}
                                            id="terms-check"
                                        />
                                        <label className="ml-2 text-sm text-slate-600 dark:text-slate-400 cursor-pointer" htmlFor="terms-check">
                                            Acepto{' '}
                                            <button type="button" onClick={(e) => { e.preventDefault(); setShowTerms(true); }} className="text-primary hover:underline font-medium">
                                                Términos y Condiciones
                                            </button>
                                        </label>
                                    </div>
                                </div>

                                {/* Navigation */}
                                <div className="flex gap-3 mt-4">
                                    <button
                                        onClick={() => { setCurrentStep('role'); setError(''); setTried(false); }}
                                        className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold py-3.5 px-6 rounded-xl text-base transition-all flex items-center justify-center gap-2 hover:bg-slate-200 dark:hover:bg-slate-700"
                                    >
                                        <span className="material-icons text-lg">arrow_back</span>
                                        Atrás
                                    </button>
                                    <button
                                        onClick={handleNextToAcademic}
                                        className={`flex-[2] font-bold py-3.5 px-6 rounded-xl shadow-lg transition-all active:scale-[0.98] text-base flex items-center justify-center gap-2 ${isProfileComplete ? 'bg-primary hover:bg-primary/90 text-white shadow-primary/20' : 'bg-primary/60 text-white/80 shadow-primary/10'}`}
                                    >
                                        Siguiente
                                        <span className="material-icons text-lg">arrow_forward</span>
                                    </button>
                                </div>

                                {tried && !isProfileComplete && (
                                    <p className="text-center text-xs text-red-500 font-medium mt-2">
                                        Completa todos los campos obligatorios (*) para continuar.
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* ========== STEP 3: Historial Académico (same as CompleteProfilePage step 2) ========== */}
                {currentStep === 'academic' && (
                    <div className="w-full max-w-2xl transition-all duration-300 animate-fade-in">
                        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/20 dark:border-slate-800 p-6 md:p-10 rounded-2xl md:rounded-3xl shadow-2xl">

                            {/* Progress Indicator */}
                            <div className="flex items-center justify-center gap-3 mb-8">
                                <div className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400">
                                    <span className="material-icons text-sm">check_circle</span>
                                    Datos Personales
                                </div>
                                <div className="w-8 h-0.5 bg-slate-200 dark:bg-slate-700"></div>
                                <div className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold bg-primary text-white shadow-lg shadow-primary/30">
                                    <span className="material-icons text-sm">school</span>
                                    Historial Académico
                                </div>
                            </div>

                            {/* Header */}
                            <div className="text-center mb-8">
                                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-blue-600 text-white mb-4 shadow-lg shadow-blue-500/20">
                                    <span className="material-icons text-3xl">school</span>
                                </div>
                                <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Historial Académico</h1>
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                    Añade tu historial académico (opcional, puedes hacerlo luego)
                                </p>
                            </div>

                            {/* Error */}
                            {error && (
                                <div className="bg-red-50 dark:bg-red-900/20 border border-red-300 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-xl relative mb-4 text-sm flex items-center gap-2 font-medium" role="alert">
                                    <span className="material-icons text-lg">error_outline</span>
                                    <span>{error}</span>
                                </div>
                            )}

                            <div className="space-y-5">
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
                                            <CustomCombobox
                                                name="universidad"
                                                options={UNIVERSITY_OPTIONS}
                                                placeholder="Ej. UNI, UPC..."
                                                value={newHistory.universidad}
                                                onChange={handleNewHistoryChange}
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Carrera</label>
                                            <CustomCombobox
                                                name="carrera"
                                                options={CAREER_OPTIONS}
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
                                        onClick={() => { setCurrentStep('profile'); setError(''); }}
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
                                                Registrando...
                                            </>
                                        ) : (
                                            <>
                                                Registrarme
                                                <span className="material-icons text-lg">check_circle</span>
                                            </>
                                        )}
                                    </button>
                                </div>

                                <p className="text-center text-xs text-slate-400 dark:text-slate-500 mt-2">
                                    Podrás añadir o editar tu historial desde tu perfil más adelante.
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </main>

            {/* Terms Modal */}
            {showTerms && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={() => setShowTerms(false)}>
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
                    <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] flex flex-col border border-slate-200 dark:border-slate-700" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                                    <span className="material-icons text-primary">gavel</span>
                                </div>
                                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Términos y Condiciones</h2>
                            </div>
                            <button onClick={() => setShowTerms(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
                                <span className="material-icons">close</span>
                            </button>
                        </div>
                        <div className="overflow-y-auto px-6 py-5 space-y-4 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                            <p className="text-xs text-slate-400 font-medium">Última actualización: Febrero 2026</p>
                            <div><h3 className="font-bold text-slate-900 dark:text-white mb-1">1. Aceptación de los Términos</h3><p>Al registrarte en EstacionU+, aceptas estos términos y condiciones en su totalidad.</p></div>
                            <div><h3 className="font-bold text-slate-900 dark:text-white mb-1">2. Descripción del Servicio</h3><p>EstacionU+ es una plataforma que conecta estudiantes universitarios con egresados profesionales para sesiones de mentoría. El servicio es gratuito y tiene fines educativos.</p></div>
                            <div><h3 className="font-bold text-slate-900 dark:text-white mb-1">3. Registro y Cuenta</h3><ul className="list-disc pl-5 space-y-1 mt-1"><li>Debes proporcionar información veraz y actualizada.</li><li>Eres responsable de mantener la confidencialidad de tu contraseña.</li><li>No puedes crear cuentas falsas ni suplantar identidades.</li></ul></div>
                            <div><h3 className="font-bold text-slate-900 dark:text-white mb-1">4. Privacidad</h3><ul className="list-disc pl-5 space-y-1 mt-1"><li>Tus datos no serán vendidos ni compartidos con terceros.</li><li>Se utilizan exclusivamente para facilitar conexiones de mentoría.</li><li>Puedes solicitar la eliminación de tu cuenta en cualquier momento.</li></ul></div>
                        </div>
                        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                            <button onClick={() => setShowTerms(false)} className="px-6 py-2.5 bg-primary hover:bg-blue-600 text-white font-bold rounded-xl transition-all active:scale-95 shadow-lg shadow-primary/20 text-sm">Entendido</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RegisterPage;
