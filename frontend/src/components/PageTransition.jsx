import { useState, useLayoutEffect } from 'react';
import { useLocation } from 'react-router-dom';
import logo from '../assets/fotos/logo.png';

const PageTransition = ({ setLoading }) => {
    const location = useLocation();
    const [isVisible, setIsVisible] = useState(true);

    useLayoutEffect(() => {
        // Immediately show the transition on location change (before paint)
        setIsVisible(true);
        if (setLoading) setLoading(true);

        const timer = setTimeout(() => {
            setIsVisible(false);
            if (setLoading) setLoading(false);
        }, 400); // 0.4s fast transition

        return () => clearTimeout(timer);
    }, [location.pathname]);

    return (
        <div
            className={`fixed inset-0 z-[100] flex items-center justify-center bg-white dark:bg-slate-900 transition-opacity ease-in-out ${isVisible ? 'opacity-100 pointer-events-auto duration-0' : 'opacity-0 pointer-events-none duration-500'}`}
        >
            <div className={`transform transition-all ${isVisible ? 'scale-100 opacity-100 duration-0' : 'scale-110 opacity-0 duration-500'}`}>
                <img
                    src={logo}
                    alt="Loading..."
                    className="h-24 w-auto dark:invert dark:brightness-0 animate-pulse"
                />
            </div>
        </div>
    );
};

export default PageTransition;
