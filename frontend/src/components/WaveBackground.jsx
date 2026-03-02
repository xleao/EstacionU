import React, { useEffect, useRef } from 'react';

const WaveBackground = () => {
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
            time += 0.01; // Slower time for calmness
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Subtle colors
            const isDark = document.documentElement.classList.contains('dark');
            ctx.fillStyle = isDark ? 'rgba(96, 165, 250, 0.4)' : 'rgba(37, 99, 235, 0.3)';

            const spacing = 50; // More spacing for minimalism

            for (let x = 0; x < canvas.width + spacing; x += spacing) {
                for (let y = 0; y < canvas.height + spacing; y += spacing) {
                    // Very subtle base movement
                    const xAngle = (x * 0.002) + time;
                    const yAngle = (y * 0.002) + time;

                    // Gentle undulation
                    let yOffset = Math.sin(xAngle + yAngle) * 8;
                    let size = 1.8;

                    // Mouse Interaction
                    const dx = x - mouseX;
                    const dy = y - mouseY;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    const maxDist = 300;

                    if (dist < maxDist) {
                        const force = (maxDist - dist) / maxDist; // 0 to 1

                        // Gentle ripple (wider waves, less chaotic)
                        const ripple = Math.sin(dist * 0.03 - time * 3) * 15 * force;
                        yOffset += ripple;

                        // Slightly larger near mouse
                        size += force * 1.5;
                    }

                    ctx.beginPath();
                    ctx.arc(x, y + yOffset, size, 0, Math.PI * 2);
                    ctx.fill();
                }
            }

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
        <canvas
            ref={canvasRef}
            className="fixed inset-0 pointer-events-none z-0"
            style={{ opacity: 0.7 }}
        />
    );
};

export default WaveBackground;
