import React, { useEffect, useRef } from 'react';

const FluidBackground = () => {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        let animationFrameId;
        let particles = [];
        let ripples = [];
        let width, height;

        // Configuration - estilo gotas de lluvia
        const particleCount = 120;
        const mouseDistance = 220;

        // Brand Colors (azules suaves tipo lluvia)
        const lightColors = ['#3C96E0', '#63B3ED', '#BFDBFE'];
        const darkColors = ['#38BDF8', '#60A5FA', '#E5E7EB'];
        let colors = lightColors;

        const resize = () => {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
        };

        class Particle {
            constructor() {
                this.reset(true);
            }

            reset(initial = false) {
                this.x = Math.random() * width;
                this.y = initial ? Math.random() * height : (-Math.random() * 50);
                // Pequeñas gotas que caen
                this.vx = (Math.random() - 0.5) * 0.1;
                this.vy = Math.random() * 1.5 + 0.8;
                this.size = Math.random() * 4 + 2.5; // un poco más grandes para que se noten
                this.color = colors[Math.floor(Math.random() * colors.length)];
                this.density = (Math.random() * 20) + 1;
                this.angle = Math.random() * 360;
            }

            update(mouse) {
                // Ligera oscilación horizontal
                this.angle += 0.01;
                this.vx += Math.cos(this.angle) * 0.002;

                // Interacción con click (salpicadura)
                let dx = mouse.x - this.x;
                let dy = mouse.y - this.y;
                let distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < mouseDistance && mouse.active) {
                    let forceDirectionX = dx / distance;
                    let forceDirectionY = dy / distance;
                    let maxDistance = mouseDistance;
                    let force = (maxDistance - distance) / maxDistance;
                    let directionX = forceDirectionX * force * this.density;
                    let directionY = forceDirectionY * force * this.density;
                    this.vx -= directionX * 0.15;
                    this.vy -= directionY * 0.15;
                }

                // Apply velocity (gota cayendo)
                this.x += this.vx;
                this.y += this.vy;

                // Friction suave
                this.vx *= 0.99;

                // Si sale por abajo, reiniciar desde arriba
                if (this.y - this.size > height) {
                    this.reset(false);
                }
            }

            draw() {
                ctx.beginPath();
                // Gota alargada (línea vertical suave)
                const gradient = ctx.createLinearGradient(this.x, this.y - this.size * 2, this.x, this.y + this.size * 2);
                gradient.addColorStop(0, `${this.color}00`);
                gradient.addColorStop(0.5, this.color);
                gradient.addColorStop(1, `${this.color}00`);
                ctx.strokeStyle = gradient;
                ctx.lineWidth = this.size * 0.7;
                ctx.globalAlpha = 0.9;
                ctx.moveTo(this.x, this.y - this.size * 2);
                ctx.lineTo(this.x, this.y + this.size * 2);
                ctx.stroke();
                ctx.globalAlpha = 1;
            }
        }

        class Ripple {
            constructor(x, y) {
                this.x = x;
                this.y = y;
                this.radius = 0;
                this.alpha = 0.35;
            }

            update() {
                this.radius += 2.4;
                this.alpha *= 0.94;
            }

            draw() {
                if (this.alpha <= 0.02) return;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
                ctx.strokeStyle = `rgba(60,150,224,${this.alpha})`;
                ctx.lineWidth = 2;
                ctx.stroke();
            }

            isAlive() {
                return this.alpha > 0.02;
            }
        }

        const init = () => {
            particles = [];
            for (let i = 0; i < particleCount; i++) {
                particles.push(new Particle());
            }
        };

        const mouse = { x: null, y: null, active: false };

        // Click Interaction (solo botón izquierdo)
        const handleMouseDown = (e) => {
            if (e.button !== 0) return; // solo click izquierdo
            mouse.x = e.clientX;
            mouse.y = e.clientY;
            mouse.active = true;
            ripples.push(new Ripple(mouse.x, mouse.y));
            setTimeout(() => { mouse.active = false; }, 200); // Pulse effect
        };

        window.addEventListener('mousedown', handleMouseDown);

        const animate = () => {
            ctx.clearRect(0, 0, width, height);

            // Detectar tema actual (claro / oscuro)
            const isDark = document.documentElement.classList.contains('dark');
            colors = isDark ? darkColors : lightColors;

            // Fondo de degradado (cielo claro u oscuro)
            const gradient = ctx.createLinearGradient(0, 0, 0, height);
            if (isDark) {
                gradient.addColorStop(0, '#020617');
                gradient.addColorStop(0.4, '#0B1120');
                gradient.addColorStop(1, '#020617');
            } else {
                gradient.addColorStop(0, '#E5F0FF');
                gradient.addColorStop(0.4, '#F9FAFB');
                gradient.addColorStop(1, '#DDEBFF');
            }
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, width, height);

            // Draw particles (rain drops)
            particles.forEach(particle => {
                particle.update(mouse);
                particle.draw();
            });

            // Draw ripples
            ripples.forEach(r => {
                r.update();
                r.draw();
            });
            ripples = ripples.filter(r => r.isAlive());

            // Connect them slightly if needed, but blur does the work
            // Let's rely on the CSS blur for the "liquid" look

            animationFrameId = requestAnimationFrame(animate);
        };

        resize();
        init();
        animate();

        window.addEventListener('resize', resize);

        return () => {
            window.removeEventListener('resize', resize);
            window.removeEventListener('mousedown', handleMouseDown);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="fixed top-0 left-0 w-full h-full pointer-events-none"
            style={{
                zIndex: 0,
                filter: 'blur(8px)', // menos blur para que se vean las gotas
                opacity: 1,
                background: 'transparent'
            }}
        />
    );
};

export default FluidBackground;
