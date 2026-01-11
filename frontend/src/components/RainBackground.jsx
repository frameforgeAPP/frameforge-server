import React, { useEffect, useRef } from 'react';

export default function RainBackground() {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        let animationId;
        let drops = [];

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        const createDrop = () => ({
            x: Math.random() * canvas.width,
            y: Math.random() * -canvas.height,
            length: Math.random() * 20 + 10,
            speed: Math.random() * 15 + 10,
            opacity: Math.random() * 0.4 + 0.1,
        });

        const init = () => {
            resize();
            drops = Array.from({ length: 150 }, createDrop);
        };

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            drops.forEach((drop, i) => {
                ctx.beginPath();
                ctx.moveTo(drop.x, drop.y);
                ctx.lineTo(drop.x, drop.y + drop.length);
                ctx.strokeStyle = `rgba(100, 180, 255, ${drop.opacity})`;
                ctx.lineWidth = 1;
                ctx.stroke();

                drop.y += drop.speed;

                if (drop.y > canvas.height) {
                    drops[i] = createDrop();
                    drops[i].y = -drop.length;
                }
            });

            animationId = requestAnimationFrame(animate);
        };

        init();
        animate();
        window.addEventListener('resize', resize);

        return () => {
            cancelAnimationFrame(animationId);
            window.removeEventListener('resize', resize);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 pointer-events-none z-0"
            style={{ opacity: 0.6 }}
        />
    );
}
