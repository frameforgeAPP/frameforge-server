import React, { useEffect, useRef } from 'react';

const ParticleBackground = ({ type, customUrl }) => {
    const canvasRef = useRef(null);

    useEffect(() => {
        if (type === 'custom') return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        let animationFrameId;

        // Set canvas size
        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        // --- MATRIX EFFECT ---
        const matrixEffect = () => {
            const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ@#$%^&*';
            const fontSize = 14;
            const columns = canvas.width / fontSize;
            const drops = Array(Math.ceil(columns)).fill(1);

            const draw = () => {
                ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.fillStyle = '#0F0';
                ctx.font = `${fontSize}px monospace`;

                for (let i = 0; i < drops.length; i++) {
                    const text = chars.charAt(Math.floor(Math.random() * chars.length));
                    ctx.fillText(text, i * fontSize, drops[i] * fontSize);
                    if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
                        drops[i] = 0;
                    }
                    drops[i]++;
                }
                animationFrameId = requestAnimationFrame(draw);
            };
            draw();
        };

        // --- EMBERS EFFECT ---
        const embersEffect = () => {
            const particles = [];
            const particleCount = 100;

            for (let i = 0; i < particleCount; i++) {
                particles.push({
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height,
                    size: Math.random() * 3 + 1,
                    speedY: Math.random() * 1 + 0.5,
                    opacity: Math.random(),
                    color: `rgba(255, ${Math.floor(Math.random() * 100) + 50}, 0,`
                });
            }

            const draw = () => {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                // Dark background handled by CSS/Parent, but we can add a subtle overlay

                particles.forEach(p => {
                    ctx.fillStyle = `${p.color} ${p.opacity})`;
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                    ctx.fill();

                    p.y -= p.speedY;
                    p.opacity -= 0.005;

                    if (p.y < 0 || p.opacity <= 0) {
                        p.y = canvas.height;
                        p.x = Math.random() * canvas.width;
                        p.opacity = 1;
                    }
                });
                animationFrameId = requestAnimationFrame(draw);
            };
            draw();
        };

        // --- STARS EFFECT ---
        const starsEffect = () => {
            const stars = [];
            const starCount = 200;

            for (let i = 0; i < starCount; i++) {
                stars.push({
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height,
                    size: Math.random() * 2,
                    opacity: Math.random()
                });
            }

            const draw = () => {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.fillStyle = 'white';

                stars.forEach(s => {
                    ctx.globalAlpha = s.opacity;
                    ctx.beginPath();
                    ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
                    ctx.fill();

                    // Twinkle
                    if (Math.random() > 0.99) {
                        s.opacity = Math.random();
                    }
                });
                animationFrameId = requestAnimationFrame(draw);
            };
            draw();
        };

        // Initialize based on type
        if (type === 'matrix') matrixEffect();
        else if (type === 'embers') embersEffect();
        else if (type === 'stars') starsEffect();

        return () => {
            cancelAnimationFrame(animationFrameId);
            window.removeEventListener('resize', resizeCanvas);
        };
    }, [type]);

    if (type === 'custom' && customUrl) {
        return (
            <div
                className="absolute inset-0 z-0 pointer-events-none opacity-50 bg-cover bg-center"
                style={{ backgroundImage: `url(${customUrl})` }}
            />
        );
    }

    if (type === 'carbon') {
        return (
            <div className="absolute inset-0 z-0 pointer-events-none opacity-20" style={{
                backgroundImage: `
                    linear-gradient(27deg, #151515 5px, transparent 5px),
                    linear-gradient(207deg, #151515 5px, transparent 5px),
                    linear-gradient(27deg, #222 5px, transparent 5px),
                    linear-gradient(207deg, #222 5px, transparent 5px),
                    linear-gradient(90deg, #1b1b1b 10px, transparent 10px),
                    linear-gradient(#1d1d1d 25%, #1a1a1a 25%, #1a1a1a 50%, transparent 50%, transparent 75%, #242424 75%, #242424)
                `,
                backgroundColor: '#131313',
                backgroundSize: '20px 20px'
            }} />
        );
    }

    if (type === 'none') return null;

    return (
        <canvas
            ref={canvasRef}
            className="absolute inset-0 z-0 pointer-events-none opacity-30"
        />
    );
};

export default ParticleBackground;
