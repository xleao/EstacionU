import { useCallback } from 'react';
import { Link } from 'react-router-dom';
import useIntersectionObserver from '../hooks/useIntersectionObserver';
import Particles from "react-tsparticles";
import { loadSlim } from "tsparticles-slim";

const HowItWorks = () => {
    const [ref, isVisible] = useIntersectionObserver({ threshold: 0.1, triggerOnce: true });
    const [refTitle, isTitleVisible] = useIntersectionObserver({ threshold: 0.3, triggerOnce: true });

    const steps = [
        { icon: "person_add", title: "Regístrate", description: "Como alumno o egresado" },
        { icon: "hub", title: "Conecta", description: "Acceda a más de 100+ expertos en diversas industrias" },
        { icon: "chat", title: "Conversa", description: "Obtén guía y mentoría para tu desarrollo profesional" }
    ];

    const particlesInit = useCallback(async engine => {
        await loadSlim(engine);
    }, []);

    const particlesOptions = {
        fullScreen: { enable: false, zIndex: 0 },
        fpsLimit: 120,
        interactivity: {
            events: {
                onHover: {
                    enable: true,
                    mode: "grab",
                },
                resize: true,
            },
            modes: {
                grab: {
                    distance: 180,
                    links: {
                        opacity: 0.8,
                        color: "#2A86D1"
                    }
                },
            },
        },
        particles: {
            color: {
                value: "#3C96E0",
            },
            links: {
                color: "#94a3b8", // slate-400
                distance: 150,
                enable: true,
                opacity: 0.4,
                width: 1,
            },
            move: {
                direction: "none",
                enable: true,
                outModes: {
                    default: "bounce",
                },
                random: true,
                speed: 1,
                straight: false,
            },
            number: {
                density: {
                    enable: true,
                    area: 800,
                },
                value: 40,
            },
            opacity: {
                value: 0.6,
            },
            shape: {
                type: "circle",
            },
            size: {
                value: { min: 1, max: 3 },
            },
        },
        detectRetina: true,
    };

    return (
        <section className="py-20 bg-slate-50 dark:bg-slate-900/50 relative overflow-hidden">
            {/* Constellation interactive background */}
            <div className="absolute inset-0 pointer-events-auto z-0">
                <Particles
                    id="tsparticles-how-it-works"
                    init={particlesInit}
                    options={particlesOptions}
                    className="h-full w-full"
                />
            </div>

            {/* Ambient blobs */}
            <div className="absolute top-10 right-10 w-64 h-64 rounded-full bg-primary/5 blur-3xl pointer-events-none z-0" style={{ animation: 'hiwBlob 8s ease-in-out infinite' }} />
            <div className="absolute bottom-10 left-10 w-48 h-48 rounded-full bg-blue-300/5 blur-3xl pointer-events-none z-0" style={{ animation: 'hiwBlob 10s ease-in-out infinite 2s' }} />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 pointer-events-none">
                {/* Title with fade-in */}
                <div ref={refTitle} className={`text-center mb-16 transition-all duration-700 ${isTitleVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                    <h2 className="text-3xl md:text-5xl font-light text-slate-800 dark:text-slate-100">
                        ¿Cómo funciona?
                    </h2>
                </div>

                <div ref={ref} className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center relative">
                    {/* Animated connecting line */}
                    <div className={`hidden md:block absolute top-16 left-[20%] right-[20%] h-[2px] bg-gradient-to-r from-transparent via-primary/30 to-transparent origin-left transition-all duration-1000 delay-500 ${isVisible ? 'opacity-100 scale-x-100' : 'opacity-0 scale-x-0'}`} />

                    {steps.map((step, index) => (
                        <div key={index}
                            className={`flex flex-col items-center group transition-all duration-700 ease-out transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
                            style={{ transitionDelay: `${index * 200}ms` }}
                        >
                            <div className="relative w-32 h-32 mb-8 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center shadow-xl border-4 border-primary transition-all duration-500 group-hover:scale-110 group-hover:shadow-2xl group-hover:shadow-primary/20">
                                <span className="material-icons text-5xl text-primary transition-all duration-500 group-hover:scale-110">{step.icon}</span>
                                {/* Ripple ring */}
                                <div className="absolute inset-0 rounded-full border-2 border-primary/20 pointer-events-none" style={{ animation: 'hiwRipple 2.5s ease-out infinite' }} />
                            </div>
                            <h3 className="text-2xl font-bold mb-4 group-hover:text-primary transition-colors duration-300">{step.title}</h3>
                            <p className="text-slate-600 dark:text-slate-400">{step.description}</p>
                        </div>
                    ))}
                </div>

                <div className={`mt-20 transition-all duration-700 delay-[800ms] ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'} pointer-events-auto`}>
                    <div className="flex flex-col items-center">
                        <Link to="/login"
                            className="inline-flex items-center px-10 py-5 bg-primary text-white text-xl font-bold rounded-full shadow-2xl hover:bg-blue-600 transition-all hover:scale-105 active:scale-95 hover:shadow-primary/30 group">
                            Únete
                            <span className="material-icons ml-2 group-hover:translate-x-1 transition-transform">ads_click</span>
                        </Link>
                        <p className="mt-4 text-slate-500 font-medium bg-slate-50/80 dark:bg-slate-900/80 inline-block px-3 py-1 rounded backdrop-blur-sm">Únete a nuestro primer piloto</p>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes hiwRipple { 0% { transform: scale(1); opacity: 0.4; } 100% { transform: scale(1.6); opacity: 0; } }
                @keyframes hiwBlob { 0%, 100% { transform: translateY(0) scale(1); } 50% { transform: translateY(-20px) scale(1.05); } }
            `}</style>
        </section>
    );
};

export default HowItWorks;
