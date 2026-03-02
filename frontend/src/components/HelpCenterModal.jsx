import React, { useEffect } from 'react';

const HelpCenterModal = ({ isOpen, onClose }) => {
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

    const faqs = [
        {
            q: '¿Cómo contacto a un mentor?',
            a: 'Busca al mentor ideal en la sección "Explorar Mentores", revisa su perfil y selecciona un horario disponible para agendar un Coffee Chat.'
        },
        {
            q: '¿Qué es un Coffee Chat?',
            a: 'Es una reunión informal de 15 a 30 minutos donde puedes recibir consejos, orientación de carrera o feedback sobre tu perfil de parte de un egresado.'
        },
        {
            q: '¿Cómo me preparo para la sesión?',
            a: 'Ten claras tus preguntas, revisa el perfil del mentor con antelación y asegúrate de tener una buena conexión a internet.'
        },
        {
            q: '¿Mi solicitud fue aceptada?',
            a: 'Recibirás una notificación y podrás ver el estado actualizado en la sección "Mis Sesiones". Los mentores suelen responder en 24-48 horas.'
        }
    ];

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity cursor-pointer"
                onClick={onClose}
            />

            {/* Modal Container */}
            <div className="relative bg-white dark:bg-slate-900 w-full max-w-2xl max-h-[90vh] rounded-[32px] shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in duration-300">
                {/* Header */}
                <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/30">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                            <span className="material-icons text-primary">auto_stories</span>
                            Centro de Ayuda Estación U
                        </h2>
                        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Todo lo que necesitas saber para empezar</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-10 h-10 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600 dark:hover:text-white transition-all"
                    >
                        <span className="material-icons">close</span>
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                        {faqs.map((faq, i) => (
                            <div key={i} className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50 hover:border-primary/30 transition-colors">
                                <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-2 flex items-start gap-2">
                                    <span className="text-primary mt-0.5 text-sm">●</span>
                                    {faq.q}
                                </h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{faq.a}</p>
                            </div>
                        ))}
                    </div>

                    {/* Support Section */}
                    <div className="bg-gradient-to-br from-primary to-blue-700 rounded-3xl p-8 text-white relative overflow-hidden shadow-xl shadow-primary/20">
                        <div className="relative z-10">
                            <h3 className="text-xl font-bold mb-2">¿Aún tienes dudas?</h3>
                            <p className="text-white/80 text-sm mb-6 max-w-md">Nuestro equipo técnico está listo para ayudarte con cualquier problema en la plataforma.</p>
                            <a
                                href="mailto:soporte@estacionu.com"
                                className="inline-flex items-center gap-2 bg-white text-primary px-6 py-3 rounded-xl font-bold hover:bg-slate-100 transition-colors active:scale-95 shadow-lg"
                            >
                                <span className="material-icons text-sm">mail</span>
                                Contactar Soporte
                            </a>
                        </div>
                        <span className="material-icons absolute -right-6 -bottom-6 text-[140px] text-white/10 rotate-12">support_agent</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HelpCenterModal;
