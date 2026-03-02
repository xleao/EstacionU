import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import WaveBackground from '../components/WaveBackground';
import { useAuth } from '../context/AuthContext';

const RegisterPage = () => {
    const [selectedRole, setSelectedRole] = useState(null); // 'student' | 'graduate' | null
    const [isTransitioning, setIsTransitioning] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth();
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        firstName: '',
        lastName: '',
        university: '',
        career: '',
        customCareer: '',
        phone: '',
        gender: '',
        anioInicio: '',
        anioFin: '',
        password: '',
        confirmPassword: '',
        terms: false
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [showTerms, setShowTerms] = useState(false);
    const [progress, setProgress] = useState(0);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const getPasswordStrength = (pass) => {
        if (!pass) return { score: 0, label: '', color: 'bg-slate-200' };
        let score = 0;
        if (pass.length > 5) score++;
        if (pass.length > 7) score++;
        if (/[0-9]/.test(pass)) score++;
        if (/[^A-Za-z0-9]/.test(pass) || /[A-Z]/.test(pass)) score++;

        switch (score) {
            case 0:
            case 1: return { score: 1, label: 'Insegura', color: 'bg-red-500' };
            case 2: return { score: 2, label: 'Débil', color: 'bg-orange-500' };
            case 3: return { score: 3, label: 'Media', color: 'bg-yellow-500' };
            case 4: return { score: 4, label: 'Fuerte', color: 'bg-green-500' };
            default: return { score: 0, label: '', color: 'bg-slate-200' };
        }
    };

    const strength = getPasswordStrength(formData.password);

    useEffect(() => {
        if (success) {
            // Start progress animation
            const progressTimer = setTimeout(() => setProgress(100), 100);

            // Auto-login after showing success page for a few seconds
            const timer = setTimeout(async () => {
                try {
                    await login(formData.email, formData.password);
                    // The login function in AuthContext already handles the redirect to the dashboard
                } catch (err) {
                    // Fallback to login page if auto-login fails
                    navigate('/login');
                }
            }, 3000);

            return () => {
                clearTimeout(timer);
                clearTimeout(progressTimer);
            };
        }
    }, [success, navigate]);

    const handleChange = (e) => {
        const { id, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [id === 'confirm-password' ? 'confirmPassword' : id]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (formData.password.length < 8) {
            setError('La contraseña debe tener al menos 8 caracteres');
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setError('Las contraseñas no coinciden');
            return;
        }

        if (!formData.terms) {
            setError('Debes aceptar los términos y condiciones');
            return;
        }

        setLoading(true);

        try {
            // Prepare payload (handle custom career)
            const payload = {
                ...formData,
                role: selectedRole,
                apellidos: formData.lastName, // Map to Backend Pydantic Schema 'apellidos'
                nombre: formData.firstName,   // Map to Backend 'nombre'
                career: formData.career === 'Otro' ? formData.customCareer : formData.career,
                username: formData.email ? formData.email.split('@')[0] : 'user'
            };

            // Remove helper fields not in schema
            delete payload.firstName;
            delete payload.lastName;
            delete payload.confirmPassword;
            delete payload.terms;
            delete payload.customCareer;
            // Map period fields
            payload.anio_inicio = payload.anioInicio ? parseInt(payload.anioInicio) : null;
            payload.anio_fin = payload.anioFin ? parseInt(payload.anioFin) : null;
            delete payload.anioInicio;
            delete payload.anioFin;

            const response = await fetch('/api/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (!response.ok) {
                if (response.status === 422) {
                    console.error("Validation Error:", data); // Log detailed validation errors
                    throw new Error("Error de validación. Verifica los campos.");
                }
                throw new Error(data.detail || 'Error al registrar');
            }

            // Success
            // Success
            // alert('Cuenta creada exitosamente');
            // navigate('/login');
            setSuccess(true);

        } catch (err) {
            console.error(err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="bg-background-light dark:bg-background-dark min-h-screen flex flex-col font-sans transition-colors duration-300 relative overflow-hidden">
                <WaveBackground />
                <Navbar />
                <main className="flex-grow flex items-center justify-center p-4 relative z-10 w-full h-full">
                    <div className="max-w-md w-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl p-6 md:p-10 rounded-3xl shadow-2xl text-center animate-fade-in border border-white/20 dark:border-slate-800 transform transition-all hover:scale-105 duration-500">
                        <div className="w-24 h-24 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-8 shadow-green-500/30 shadow-lg animate-bounce-slow">
                            <span className="material-icons text-6xl text-green-500 drop-shadow-sm">check_circle</span>
                        </div>
                        <h2 className="text-3xl font-bold text-slate-800 dark:text-white mb-4 tracking-tight">¡Registro Exitoso!</h2>
                        <p className="text-slate-600 dark:text-slate-400 mb-8 text-lg font-medium">Tu cuenta ha sido creada correctamente.<br />Te estamos redirigiendo al inicio de sesión.</p>

                        <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden shadow-inner relative">
                            <div
                                className="h-full bg-gradient-to-r from-green-400 to-emerald-600 rounded-full shadow-lg shadow-green-500/40 relative overflow-hidden"
                                style={{ width: `${progress}%`, transition: 'width 4.8s linear' }}
                            >
                                <div className="absolute inset-0 bg-white/20 animate-[shimmer_2s_infinite] w-full h-full skew-x-12"></div>
                            </div>
                        </div>
                        <p className="text-xs text-slate-400 mt-4 animate-pulse">Por favor espere...</p>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="bg-background-light dark:bg-background-dark h-screen flex flex-col font-sans transition-colors duration-300 relative overflow-hidden">
            <WaveBackground />
            <Navbar />
            <main className="flex-grow flex items-center justify-center p-4 relative z-10 w-full h-full">
                <style>{`
                    @keyframes regSlideOutLeft { from { opacity: 1; transform: translateX(0) scale(1); } to { opacity: 0; transform: translateX(-40px) scale(0.97); } }
                    @keyframes regSlideInRight { from { opacity: 0; transform: translateX(40px) scale(0.97); } to { opacity: 1; transform: translateX(0) scale(1); } }
                    @keyframes regFadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
                    @keyframes regScaleIn { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
                    @keyframes regFieldIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                    .reg-slide-out { animation: regSlideOutLeft 0.3s ease-in forwards; }
                    .reg-slide-in { animation: regSlideInRight 0.5s ease-out both; }
                    .reg-field { animation: regFieldIn 0.4s ease-out both; }
                `}</style>
                <div className={`w-full transition-all duration-500 ease-in-out ${selectedRole ? 'max-w-4xl' : 'max-w-lg'}`}>

                    {!selectedRole ? (
                        // SELECTION SCREEN (Expanded)
                        <div className={`bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/20 dark:border-slate-800 p-6 rounded-2xl shadow-2xl ${isTransitioning ? 'reg-slide-out' : ''}`} style={{ animation: isTransitioning ? undefined : 'regFadeUp 0.5s ease-out both' }}>
                            <div className="text-center mb-8" style={{ animation: 'regScaleIn 0.5s ease-out both 0.1s' }}>
                                <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Crear cuenta</h1>
                                <p className="text-slate-400">Selecciona tu tipo de perfil</p>
                            </div>

                            <div className="space-y-4">
                                <button
                                    onClick={() => {
                                        setIsTransitioning(true);
                                        setTimeout(() => { setSelectedRole('student'); setIsTransitioning(false); }, 300);
                                    }}
                                    className="w-full group flex items-center p-4 border-2 border-slate-200 dark:border-slate-700 rounded-xl hover:border-primary hover:bg-primary/5 dark:hover:bg-slate-800 transition-all duration-300 active:scale-[0.98]"
                                    style={{ animation: 'regFieldIn 0.4s ease-out both 0.2s' }}
                                >
                                    <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mr-4 group-hover:bg-primary group-hover:text-white text-primary transition-colors">
                                        <span className="material-icons text-2xl">school</span>
                                    </div>
                                    <div className="text-left">
                                        <h3 className="font-bold text-slate-900 dark:text-white text-lg">Soy Estudiante</h3>
                                        <p className="text-sm text-slate-500 dark:text-slate-400">Accede a mentorías y recursos</p>
                                    </div>
                                    <div className="ml-auto w-8 h-8 rounded-full flex items-center justify-center text-slate-300 group-hover:text-primary group-hover:bg-white/80 dark:group-hover:bg-slate-800/80 transition-all">
                                        <span className="material-icons text-xl">arrow_forward</span>
                                    </div>
                                </button>

                                <button
                                    onClick={() => {
                                        setIsTransitioning(true);
                                        setTimeout(() => { setSelectedRole('graduate'); setIsTransitioning(false); }, 300);
                                    }}
                                    className="w-full group flex items-center p-4 border-2 border-slate-200 dark:border-slate-700 rounded-xl hover:border-emerald-500 hover:bg-emerald-500/5 dark:hover:bg-slate-800 transition-all duration-300 active:scale-[0.98]"
                                    style={{ animation: 'regFieldIn 0.4s ease-out both 0.3s' }}
                                >
                                    <div className="flex-shrink-0 w-12 h-12 bg-emerald-500/10 rounded-full flex items-center justify-center mr-4 group-hover:bg-emerald-500 group-hover:text-white text-emerald-600 transition-colors">
                                        <span className="material-icons text-2xl">business_center</span>
                                    </div>
                                    <div className="text-left">
                                        <h3 className="font-bold text-slate-900 dark:text-white text-lg">Soy Egresado</h3>
                                        <p className="text-sm text-slate-500 dark:text-slate-400">Comparte experiencia y conecta</p>
                                    </div>
                                    <div className="ml-auto w-8 h-8 rounded-full flex items-center justify-center text-slate-300 group-hover:text-emerald-500 group-hover:bg-white/80 dark:group-hover:bg-slate-800/80 transition-all">
                                        <span className="material-icons text-xl">arrow_forward</span>
                                    </div>
                                </button>
                            </div>

                            <p className="mt-8 text-center text-sm text-slate-400" style={{ animation: 'regFieldIn 0.4s ease-out both 0.4s' }}>
                                ¿Ya tienes cuenta? <Link to="/login" className="text-primary font-bold hover:underline">Iniciar Sesión</Link>
                            </p>
                        </div>
                    ) : (
                        // FORM SCREEN (Expanded)
                        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/20 dark:border-slate-800 rounded-2xl shadow-2xl overflow-y-auto reg-slide-in max-h-[calc(100vh-100px)] w-full flex flex-col relative z-20">
                            {/* Header */}
                            <div className={`py-2.5 px-5 text-center border-b border-gray-100 dark:border-gray-700 ${selectedRole === 'student' ? 'bg-primary/5' : 'bg-emerald-500/5'}`}>
                                <div className="relative flex items-center justify-center">
                                    <button
                                        onClick={() => setSelectedRole(null)}
                                        className="absolute left-0 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-all flex items-center justify-center w-9 h-9 rounded-full hover:bg-slate-100/80 dark:hover:bg-slate-800/80 active:scale-95"
                                        style={{ animation: 'regFieldIn 0.3s ease-out both 0.2s' }}
                                        aria-label="Volver"
                                        type="button"
                                    >
                                        <span className="material-icons text-lg">arrow_back</span>
                                    </button>
                                    <h1 className="text-xl font-bold text-slate-900 dark:text-white" style={{ animation: 'regScaleIn 0.4s ease-out both 0.15s' }}>
                                        {selectedRole === 'student' ? 'Registro Estudiante' : 'Registro Egresado'}
                                    </h1>
                                </div>
                            </div>

                            {/* Form Content */}
                            <div className="px-5 py-3">
                                <form className="space-y-1" onSubmit={handleSubmit}>
                                    {error && (
                                        <div className="bg-red-50 text-red-500 p-3 rounded-lg text-sm font-medium border border-red-200">
                                            {error}
                                        </div>
                                    )}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-3 gap-y-1.5">
                                        {/* Row 1: Correo */}
                                        <div className="reg-field md:col-span-2" style={{ animationDelay: '0.2s' }}>
                                            <label className="block text-sm font-semibold text-slate-600 dark:text-slate-300 mb-0.5" htmlFor="email">
                                                Correo Institucional o Profesional
                                            </label>
                                            <input
                                                className="w-full px-4 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors dark:text-white outline-none"
                                                id="email"
                                                placeholder="tu_correo@ejemplo.com"
                                                required
                                                type="email"
                                                value={formData.email}
                                                onChange={handleChange}
                                                disabled={loading}
                                            />
                                        </div>

                                        {/* Row 2: Nombre & Apellidos */}
                                        <div className="reg-field" style={{ animationDelay: '0.25s' }}>
                                            <label className="block text-sm font-semibold text-slate-600 dark:text-slate-300 mb-0.5" htmlFor="firstName">Nombre</label>
                                            <input
                                                className="w-full px-4 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors dark:text-white outline-none"
                                                id="firstName"
                                                placeholder="Tu nombre"
                                                required
                                                type="text"
                                                value={formData.firstName}
                                                onChange={handleChange}
                                                disabled={loading}
                                            />
                                        </div>
                                        <div className="reg-field" style={{ animationDelay: '0.3s' }}>
                                            <label className="block text-sm font-semibold text-slate-600 dark:text-slate-300 mb-0.5" htmlFor="lastName">Apellidos</label>
                                            <input
                                                className="w-full px-4 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors dark:text-white outline-none"
                                                id="lastName"
                                                placeholder="Tus apellidos"
                                                required
                                                type="text"
                                                value={formData.lastName}
                                                onChange={handleChange}
                                                disabled={loading}
                                            />
                                        </div>

                                        {/* Row 3: Universidad & Carrera */}
                                        <div className="reg-field" style={{ animationDelay: '0.35s' }}>
                                            <label className="block text-sm font-semibold text-slate-600 dark:text-slate-300 mb-0.5" htmlFor="university">Universidad</label>
                                            <div className="relative">
                                                <select
                                                    className="custom-select w-full px-4 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors dark:text-white outline-none cursor-pointer"
                                                    id="university"
                                                    required
                                                    value={formData.university}
                                                    onChange={handleChange}
                                                    disabled={loading}
                                                >
                                                    <option value="" disabled>Selecciona una opción</option>
                                                    <option value="UNI">UNI</option>
                                                    <option value="UNMSM">UNMSM</option>
                                                    <option value="UNAC">UNAC</option>
                                                    <option value="PUCP">PUCP</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div className="reg-field" style={{ animationDelay: '0.4s' }}>
                                            <label className="block text-sm font-semibold text-slate-600 dark:text-slate-300 mb-0.5" htmlFor="career">Carrera</label>
                                            <div className="relative">
                                                <select
                                                    className="custom-select w-full px-4 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors dark:text-white outline-none cursor-pointer"
                                                    id="career"
                                                    required
                                                    value={formData.career}
                                                    onChange={handleChange}
                                                    disabled={loading}
                                                >
                                                    <option value="" disabled>Selecciona tu carrera</option>
                                                    <option value="Ing. Sistemas">Ing. Sistemas</option>
                                                    <option value="Ing. Industrial">Ing. Industrial</option>
                                                    <option value="Otro">Otro</option>
                                                </select>
                                            </div>
                                            {formData.career === 'Otro' && (
                                                <div className="relative mt-2">
                                                    <input
                                                        className="w-full px-4 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors dark:text-white outline-none animate-fade-in"
                                                        id="customCareer"
                                                        placeholder="Escribe el nombre de tu carrera"
                                                        required
                                                        type="text"
                                                        value={formData.customCareer}
                                                        onChange={handleChange}
                                                        disabled={loading}
                                                    />
                                                </div>
                                            )}
                                        </div>

                                        {/* Row 4: Phone & Gender */}
                                        <div className="reg-field" style={{ animationDelay: '0.45s' }}>
                                            <label className="block text-sm font-semibold text-slate-600 dark:text-slate-300 mb-0.5" htmlFor="phone">Teléfono</label>
                                            <input
                                                className="w-full px-4 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors dark:text-white outline-none"
                                                id="phone"
                                                placeholder="987 654 321"
                                                required
                                                type="tel"
                                                value={formData.phone}
                                                onChange={handleChange}
                                                disabled={loading}
                                            />
                                        </div>
                                        <div className="reg-field" style={{ animationDelay: '0.5s' }}>
                                            <label className="block text-sm font-semibold text-slate-600 dark:text-slate-300 mb-0.5" htmlFor="gender">Género</label>
                                            <div className="relative">
                                                <select
                                                    className="custom-select w-full px-4 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors dark:text-white outline-none cursor-pointer"
                                                    id="gender"
                                                    required
                                                    value={formData.gender}
                                                    onChange={handleChange}
                                                    disabled={loading}
                                                >
                                                    <option value="" disabled>Selecciona tu género</option>
                                                    <option value="masculino">Masculino</option>
                                                    <option value="femenino">Femenino</option>
                                                    <option value="otro">Otro</option>
                                                    <option value="prefiero_no_decir">Prefiero no decir</option>
                                                </select>
                                            </div>
                                        </div>

                                        {/* Row 5: Academic Period */}
                                        <div className="reg-field" style={{ animationDelay: '0.55s' }}>
                                            <label className="block text-sm font-semibold text-slate-600 dark:text-slate-300 mb-0.5" htmlFor="anioInicio">Año de Inicio</label>
                                            <input
                                                className="w-full px-4 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors dark:text-white outline-none"
                                                id="anioInicio"
                                                placeholder="2020"
                                                required
                                                type="number"
                                                min="2000"
                                                max="2030"
                                                value={formData.anioInicio}
                                                onChange={handleChange}
                                                disabled={loading}
                                            />
                                        </div>
                                        <div className="reg-field" style={{ animationDelay: '0.6s' }}>
                                            <label className="block text-sm font-semibold text-slate-600 dark:text-slate-300 mb-0.5" htmlFor="anioFin">Año de Fin (estimado)</label>
                                            <input
                                                className="w-full px-4 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors dark:text-white outline-none"
                                                id="anioFin"
                                                placeholder="2025"
                                                required
                                                type="number"
                                                min="2000"
                                                max="2035"
                                                value={formData.anioFin}
                                                onChange={handleChange}
                                                disabled={loading}
                                            />
                                        </div>

                                        {/* Row 6: Password & Confirm */}
                                        <div className="reg-field" style={{ animationDelay: '0.65s' }}>
                                            <div className="flex justify-between items-center mb-1">
                                                <div className="flex items-center gap-1">
                                                    <label className="block text-sm font-semibold text-slate-600 dark:text-slate-300" htmlFor="password">Contraseña</label>
                                                    <div className="relative group">
                                                        <span className="material-icons text-slate-400 text-sm cursor-help hover:text-primary transition-colors">info</span>
                                                        <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-48 bg-slate-800 text-white text-xs rounded-lg p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-20 shadow-xl">
                                                            <p className="font-bold mb-1">Requisitos:</p>
                                                            <ul className="list-disc pl-3 space-y-0.5 text-slate-300">
                                                                <li>Mínimo 8 caracteres</li>
                                                                <li>Al menos 1 número</li>
                                                                <li>1 Mayúscula o símbolo</li>
                                                            </ul>
                                                            <div className="absolute left-1/2 -translate-x-1/2 top-full w-2 h-2 bg-slate-800 rotate-45"></div>
                                                        </div>
                                                    </div>
                                                </div>
                                                {formData.password && <span className={`text-xs font-bold px-2 py-0.5 rounded ${strength.color.replace('bg-', 'text-')} bg-opacity-10`}>{strength.label}</span>}
                                            </div>
                                            <div className="relative">
                                                <input
                                                    className="w-full px-4 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors dark:text-white outline-none pr-12"
                                                    id="password"
                                                    placeholder="••••••••"
                                                    required
                                                    type={showPassword ? "text" : "password"}
                                                    value={formData.password}
                                                    onChange={handleChange}
                                                    disabled={loading}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1"
                                                >
                                                    <span className="material-icons text-xl">{showPassword ? 'visibility_off' : 'visibility'}</span>
                                                </button>
                                            </div>
                                            {/* Strength Bar */}
                                            {formData.password && (
                                                <div className="mt-2 flex gap-1 h-1">
                                                    {[1, 2, 3, 4].map((i) => (
                                                        <div
                                                            key={i}
                                                            className={`h-full flex-1 rounded-full transition-all duration-300 ${i <= strength.score ? strength.color : 'bg-slate-200 dark:bg-slate-700'}`}
                                                        ></div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                        <div className="reg-field" style={{ animationDelay: '0.7s' }}>
                                            <div>
                                                <label className="block text-sm font-semibold text-slate-600 dark:text-slate-300 mb-1" htmlFor="confirm-password">Confirmar Contraseña</label>
                                                <div className="relative">
                                                    <input
                                                        className="w-full px-4 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors dark:text-white outline-none pr-12"
                                                        id="confirm-password"
                                                        placeholder="••••••••"
                                                        required
                                                        type={showConfirmPassword ? "text" : "password"}
                                                        value={formData.confirmPassword}
                                                        onChange={handleChange}
                                                        disabled={loading}
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1"
                                                    >
                                                        <span className="material-icons text-xl">{showConfirmPassword ? 'visibility_off' : 'visibility'}</span>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-1 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 reg-field" style={{ animationDelay: '0.75s' }}>
                                        <div className="flex items-center">
                                            <input
                                                className="w-4 h-4 text-primary border-slate-300 rounded focus:ring-primary dark:bg-slate-700 dark:border-slate-600 cursor-pointer"
                                                id="terms"
                                                required
                                                type="checkbox"
                                                checked={formData.terms}
                                                onChange={handleChange}
                                                disabled={loading}
                                            />
                                            <label className="ml-2 text-sm text-slate-600 dark:text-slate-400 cursor-pointer" htmlFor="terms">
                                                Acepto <button type="button" onClick={(e) => { e.preventDefault(); setShowTerms(true); }} className="text-primary hover:underline font-medium">Términos y Condiciones</button>
                                            </label>
                                        </div>

                                        <button
                                            className={`w-full md:w-auto px-6 py-2.5 text-white font-bold rounded-xl shadow-lg transition-all transform hover:-translate-y-0.5 active:scale-95 text-sm ${selectedRole === 'student' ? 'bg-primary hover:bg-blue-600 shadow-primary/30' : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/30'} ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                            type="submit"
                                            disabled={loading}
                                        >
                                            {loading ? 'Registrando...' : 'Registrarme'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}
                </div>
            </main>

            {/* Terms Modal */}
            {showTerms && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={() => setShowTerms(false)}>
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
                    <div
                        className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] flex flex-col border border-slate-200 dark:border-slate-700"
                        onClick={(e) => e.stopPropagation()}
                        style={{ animation: 'regScaleIn 0.3s ease-out both' }}
                    >
                        {/* Modal Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                                    <span className="material-icons text-primary">gavel</span>
                                </div>
                                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Términos y Condiciones</h2>
                            </div>
                            <button
                                onClick={() => setShowTerms(false)}
                                className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                            >
                                <span className="material-icons">close</span>
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="overflow-y-auto px-6 py-5 space-y-4 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                            <p className="text-xs text-slate-400 font-medium">Última actualización: Febrero 2026</p>

                            <div>
                                <h3 className="font-bold text-slate-900 dark:text-white mb-1">1. Aceptación de los Términos</h3>
                                <p>Al registrarte en EstacionU+, aceptas estos términos y condiciones en su totalidad. Si no estás de acuerdo con alguna parte, no debes utilizar la plataforma.</p>
                            </div>

                            <div>
                                <h3 className="font-bold text-slate-900 dark:text-white mb-1">2. Descripción del Servicio</h3>
                                <p>EstacionU+ es una plataforma que conecta estudiantes universitarios con egresados profesionales para sesiones de mentoría y orientación profesional (Coffee Chats). El servicio es gratuito y tiene fines educativos.</p>
                            </div>

                            <div>
                                <h3 className="font-bold text-slate-900 dark:text-white mb-1">3. Registro y Cuenta</h3>
                                <ul className="list-disc pl-5 space-y-1 mt-1">
                                    <li>Debes proporcionar información veraz y actualizada al momento de registrarte.</li>
                                    <li>Eres responsable de mantener la confidencialidad de tu contraseña.</li>
                                    <li>No puedes crear cuentas falsas ni suplantar identidades.</li>
                                    <li>Debes usar un correo electrónico institucional válido.</li>
                                </ul>
                            </div>

                            <div>
                                <h3 className="font-bold text-slate-900 dark:text-white mb-1">4. Uso de la Plataforma</h3>
                                <ul className="list-disc pl-5 space-y-1 mt-1">
                                    <li>Las sesiones de mentoría deben mantenerse en un marco de respeto profesional.</li>
                                    <li>No se permite el uso de la plataforma con fines comerciales, publicitarios o ilegales.</li>
                                    <li>Los usuarios se comprometen a asistir a las sesiones agendadas o cancelarlas con anticipación.</li>
                                </ul>
                            </div>

                            <div>
                                <h3 className="font-bold text-slate-900 dark:text-white mb-1">5. Privacidad y Datos Personales</h3>
                                <p>Recopilamos información personal necesaria para el funcionamiento de la plataforma (nombre, correo, universidad, carrera, teléfono). Tus datos:</p>
                                <ul className="list-disc pl-5 space-y-1 mt-1">
                                    <li>No serán vendidos ni compartidos con terceros.</li>
                                    <li>Se utilizan exclusivamente para facilitar conexiones de mentoría.</li>
                                    <li>Están protegidos mediante medidas de seguridad adecuadas.</li>
                                    <li>Puedes solicitar la eliminación de tu cuenta y datos en cualquier momento.</li>
                                </ul>
                            </div>

                            <div>
                                <h3 className="font-bold text-slate-900 dark:text-white mb-1">6. Responsabilidades del Mentor</h3>
                                <p>Los egresados que participan como mentores se comprometen a brindar orientación de buena fe, sin garantizar resultados específicos. Las opiniones compartidas son personales y no representan a ninguna institución.</p>
                            </div>

                            <div>
                                <h3 className="font-bold text-slate-900 dark:text-white mb-1">7. Modificaciones</h3>
                                <p>EstacionU+ se reserva el derecho de modificar estos términos en cualquier momento. Los cambios serán notificados a través de la plataforma.</p>
                            </div>

                            <div>
                                <h3 className="font-bold text-slate-900 dark:text-white mb-1">8. Contacto</h3>
                                <p>Para cualquier consulta sobre estos términos, puedes contactarnos a través de la plataforma o al correo de soporte.</p>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                            <button
                                onClick={() => setShowTerms(false)}
                                className="px-6 py-2.5 bg-primary hover:bg-blue-600 text-white font-bold rounded-xl transition-all active:scale-95 shadow-lg shadow-primary/20 text-sm"
                            >
                                Entendido
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RegisterPage;

