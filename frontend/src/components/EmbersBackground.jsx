import React, { useEffect, useRef } from 'react';

export default function EmbersBackground() {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        // Create embers
        const embers = [];
        for (let i = 0; i < 100; i++) {
            embers.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                size: Math.random() * 3 + 1,
                speedX: (Math.random() - 0.5) * 0.5,
                speedY: -(Math.random() * 1 + 0.5),
                opacity: Math.random() * 0.8 + 0.2,
                hue: Math.random() * 40 + 10 // Orange to red range
            });
        }

        let animationId;
        const animate = () => {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            embers.forEach(ember => {
                // Draw ember glow
                const gradient = ctx.createRadialGradient(
                    ember.x, ember.y, 0,
                    ember.x, ember.y, ember.size * 2
                );
                gradient.addColorStop(0, `hsla(${ember.hue}, 100%, 60%, ${ember.opacity})`);
                gradient.addColorStop(0.5, `hsla(${ember.hue}, 100%, 50%, ${ember.opacity * 0.5})`);
                gradient.addColorStop(1, 'transparent');

                ctx.beginPath();
                ctx.arc(ember.x, ember.y, ember.size * 2, 0, Math.PI * 2);
                ctx.fillStyle = gradient;
                ctx.fill();

                // Core
                ctx.beginPath();
                ctx.arc(ember.x, ember.y, ember.size * 0.5, 0, Math.PI * 2);
                ctx.fillStyle = `hsla(${ember.hue}, 100%, 80%, ${ember.opacity})`;
                ctx.fill();

                // Move ember upward
                ember.x += ember.speedX + Math.sin(Date.now() / 1000 + ember.y) * 0.3;
                ember.y += ember.speedY;
                ember.opacity -= 0.002;

                // Reset ember
                if (ember.y < -20 || ember.opacity <= 0) {
                    ember.y = canvas.height + 20;
                    ember.x = Math.random() * canvas.width;
                    ember.opacity = Math.random() * 0.8 + 0.2;
                    ember.hue = Math.random() * 40 + 10;
                }
            });

            animationId = requestAnimationFrame(animate);
        };
        animate();

        return () => {
            window.removeEventListener('resize', resizeCanvas);
            cancelAnimationFrame(animationId);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 pointer-events-none z-0"
            style={{ background: 'transparent' }}
        />
    );
}
