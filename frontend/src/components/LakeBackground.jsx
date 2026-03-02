import React, { useEffect, useRef } from 'react';

const LakeBackground = ({ blur = 'blur-[4px]' }) => {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        let animationFrameId;
        let time = 0;
        let mouseX = -1000;
        let mouseY = -1000;

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        window.addEventListener('resize', resize);
        resize();

        const handleMouseMove = (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
        };
        window.addEventListener('mousemove', handleMouseMove);

        const render = () => {
            time += 0.003; // Very slow and calm
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            const isDark = document.documentElement.classList.contains('dark');

            // Soft minimalist oceanic hues
            const color1 = isDark ? 'rgba(14, 165, 233, 0.2)' : 'rgba(186, 230, 253, 0.5)';
            const color2 = isDark ? 'rgba(56, 189, 248, 0.15)' : 'rgba(224, 242, 254, 0.6)';
            const color3 = isDark ? 'rgba(2, 132, 199, 0.1)' : 'rgba(240, 249, 255, 0.7)';

            const w = canvas.width;
            const h = canvas.height;
            const minDim = Math.min(w, h);

            // Large abstract flowing masses (like underwater currents)
            const x1 = w * 0.3 + Math.sin(time) * w * 0.25;
            const y1 = h * 0.4 + Math.cos(time * 0.8) * h * 0.2;

            const x2 = w * 0.7 + Math.sin(time * 0.7 + 2) * w * 0.3;
            const y2 = h * 0.6 + Math.cos(time * 1.1 + 1) * h * 0.25;

            const x3 = w * 0.5 + Math.cos(time * 0.5) * w * 0.35;
            const y3 = h * 0.5 + Math.sin(time * 0.6) * h * 0.2;

            // Interactive offset based on mouse (very subtle)
            const mouseOffsetX = (mouseX - w / 2) * 0.03;
            const mouseOffsetY = (mouseY - h / 2) * 0.03;

            // Draw fluid mass 1
            ctx.beginPath();
            ctx.arc(x1 - mouseOffsetX, y1 - mouseOffsetY, minDim * 0.5, 0, Math.PI * 2);
            ctx.fillStyle = color1;
            ctx.fill();

            // Draw fluid mass 2
            ctx.beginPath();
            ctx.arc(x2 + mouseOffsetX, y2 + mouseOffsetY, minDim * 0.6, 0, Math.PI * 2);
            ctx.fillStyle = color2;
            ctx.fill();

            // Draw fluid mass 3
            ctx.beginPath();
            ctx.arc(x3, y3, minDim * 0.7, 0, Math.PI * 2);
            ctx.fillStyle = color3;
            ctx.fill();

            animationFrameId = requestAnimationFrame(render);
        };

        render();

        return () => {
            window.removeEventListener('resize', resize);
            window.removeEventListener('mousemove', handleMouseMove);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return (
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
            {/* Gradient Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-sky-50 dark:from-slate-950 dark:via-slate-900 dark:to-cyan-950 opacity-100 transition-colors duration-500" />

            <canvas
                ref={canvasRef}
                className={`absolute inset-0 blur-3xl opacity-90 transition-all duration-700 pointer-events-none mix-blend-multiply dark:mix-blend-screen`}
            />
        </div>
    );
};

export default LakeBackground;
