
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import imagen1 from '../assets/fotos/imagen1.png';
import imagen2 from '../assets/fotos/imagen2.jpg';
import imagen3 from '../assets/fotos/imagen3.jpg';
import useIntersectionObserver from '../hooks/useIntersectionObserver';

const Hero = () => {
    const images = [imagen1, imagen2, imagen3];
    const [currentImage, setCurrentImage] = useState(0);
    const [ref, isVisible] = useIntersectionObserver({ triggerOnce: true });
    const [typedText, setTypedText] = useState('');
    const fullText = 'cambiar realidades';

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentImage((prev) => (prev + 1) % images.length);
        }, 5000);
        return () => clearInterval(timer);
    }, [images.length]);

    useEffect(() => {
        if (!isVisible) return;
        let i = 0;
        const t = setInterval(() => {
            setTypedText(fullText.slice(0, i + 1));
            i++;
            if (i >= fullText.length) clearInterval(t);
        }, 60);
        return () => clearInterval(t);
    }, [isVisible]);

    const nextImage = () => setCurrentImage((prev) => (prev + 1) % images.length);
    const prevImage = () => setCurrentImage((prev) => (prev - 1 + images.length) % images.length);

    return (
        <main className="relative hero-pattern overflow-hidden min-h-[calc(100vh-5rem)] flex items-center">
            {/* Floating particles */}
            {[
                { top: '15%', left: '5%', size: 'w-3 h-3', dur: '6s', del: '0s' },
                { top: '35%', right: '10%', size: 'w-2 h-2', dur: '4.5s', del: '1s' },
                { bottom: '25%', left: '20%', size: 'w-4 h-4', dur: '5s', del: '0.5s' },
                { top: '55%', right: '35%', size: 'w-2 h-2', dur: '7s', del: '2s' },
                { bottom: '15%', right: '8%', size: 'w-3 h-3', dur: '5.5s', del: '0.8s' },
                { top: '10%', left: '45%', size: 'w-1.5 h-1.5', dur: '4s', del: '1.5s' },
                { top: '70%', left: '8%', size: 'w-2 h-2', dur: '6.5s', del: '3s' },
            ].map((p, i) => (
                <div key={i}
                    className={`absolute ${p.size} rounded-full bg-primary/20`}
                    style={{ top: p.top, bottom: p.bottom, left: p.left, right: p.right, animation: `heroFloat ${p.dur} ease-in-out infinite ${p.del}` }}
                />
            ))}

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12" ref={ref}>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    <div className="space-y-8">
                        <h1 className={`text-4xl md:text-6xl font-extrabold text-slate-900 dark:text-white leading-tight transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                            Conectamos estudiantes y egresados para{' '}
                            <span className="text-primary">
                                {typedText}
                            </span>
                        </h1>
                        <p className={`text-lg text-slate-600 dark:text-slate-400 max-w-xl transition-all duration-700 delay-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
                            Lanzamos nuestro primer reporte sobre inserción laboral y desarrollo profesional: conoce los
                            desafíos reales y cómo, juntos, podemos cambiar la historia.
                        </p>
                        <div className={`flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 transition-all duration-700 delay-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
                            <Link to="/register"
                                className="group px-8 py-4 bg-primary hover:bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all transform hover:-translate-y-1 inline-flex items-center justify-center gap-2 text-center">
                                Únete a nuestro primer piloto
                                <span className="material-icons text-lg transition-transform group-hover:translate-x-1">arrow_forward</span>
                            </Link>
                        </div>
                    </div>

                    <div className={`relative rounded-3xl overflow-hidden shadow-2xl bg-white dark:bg-slate-800 p-2 group h-[350px] md:h-[450px] border-2 animate-border-pulse hover:animate-none hover:border-primary transition-all duration-1000 delay-300 ease-out transform ${isVisible ? 'opacity-100 translate-x-0 rotate-0' : 'opacity-0 translate-x-12 rotate-2'}`}>
                        <div className="relative w-full h-full bg-white rounded-2xl flex items-center justify-center overflow-hidden">
                            {images.map((img, index) => (
                                <img key={index} alt={`Slide ${index + 1}`}
                                    className={`absolute inset-0 w-full h-full object-contain p-2 transition-all duration-1000 mix-blend-multiply brightness-105 contrast-105 ${index === currentImage ? 'opacity-100 scale-100' : 'opacity-0 scale-105'}`}
                                    src={img} />
                            ))}

                            <div className="absolute inset-0 flex items-center justify-between px-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
                                <button onClick={prevImage} className="w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center text-primary hover:scale-110 transition-all cursor-pointer">
                                    <span className="material-icons">chevron_left</span>
                                </button>
                                <button onClick={nextImage} className="w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center text-primary hover:scale-110 transition-all cursor-pointer">
                                    <span className="material-icons">chevron_right</span>
                                </button>
                            </div>

                            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2 z-10">
                                {images.map((_, index) => (
                                    <button key={index} onClick={() => setCurrentImage(index)}
                                        className={`h-2 rounded-full transition-all duration-500 ${index === currentImage ? 'bg-primary w-6' : 'bg-slate-300 dark:bg-slate-600 hover:bg-primary/50 w-2'}`} />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes heroBlink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
                @keyframes heroFloat { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-18px); } }
            `}</style>
        </main>
    );
};

export default Hero;
