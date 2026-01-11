import React, { useState, useEffect } from 'react';

export default function SplashScreen({ onComplete }) {
    const [progress, setProgress] = useState(0);
    const [showText, setShowText] = useState(false);
    const [fadeOut, setFadeOut] = useState(false);

    useEffect(() => {
        // Show text immediately
        const textTimer = setTimeout(() => setShowText(true), 200);

        // Smooth progress bar animation
        const progressInterval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) {
                    clearInterval(progressInterval);
                    return 100;
                }
                return prev + 5; // Faster increment for 2s duration
            });
        }, 50); // Faster interval

        // Start fade out at 1.7s
        const fadeTimer = setTimeout(() => setFadeOut(true), 1700);

        // Complete splash at 2s
        const completeTimer = setTimeout(() => onComplete(), 2000);

        return () => {
            clearTimeout(textTimer);
            clearTimeout(fadeTimer);
            clearTimeout(completeTimer);
            clearInterval(progressInterval);
        };
    }, [onComplete]);

    return (
        <div
            className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black transition-opacity duration-300 ${fadeOut ? 'opacity-0' : 'opacity-100'}`}
        >
            {/* Background Grid - Tron Style */}
            <div
                className="absolute inset-0 opacity-15"
                style={{
                    backgroundImage: 'linear-gradient(rgba(0,243,255,0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(0,243,255,0.2) 1px, transparent 1px)',
                    backgroundSize: '40px 40px'
                }}
            />

            {/* Glow Effect Background */}
            <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-64 h-64 bg-cyan-500/20 rounded-full blur-[100px] animate-pulse" />
            </div>

            {/* Logo Container */}
            <div className="z-10 flex flex-col items-center">
                {/* FF Logo */}
                <div
                    className="relative mb-4"
                    style={{
                        animation: 'logoAppear 0.4s ease-out'
                    }}
                >
                    <div className="relative">
                        <div
                            className="text-8xl font-black tracking-tighter"
                            style={{
                                fontFamily: 'Impact, sans-serif',
                                color: '#00f3ff',
                                textShadow: '0 0 30px rgba(0,243,255,0.8), 0 0 60px rgba(0,243,255,0.4), 0 0 90px rgba(0,243,255,0.2)',
                            }}
                        >
                            FF
                        </div>
                        {/* Glow ring */}
                        <div className="absolute -inset-4 border-2 border-cyan-500/30 rounded-xl animate-ping" style={{ animationDuration: '1.5s' }} />
                    </div>
                </div>

                {/* App Name */}
                <div
                    className={`transition-all duration-300 ${showText ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                >
                    <h1
                        className="text-3xl font-black tracking-[0.15em] mb-1 bg-gradient-to-r from-cyan-400 via-blue-500 to-cyan-400 bg-clip-text text-transparent"
                        style={{
                            textShadow: '0 0 30px rgba(0,243,255,0.3)'
                        }}
                    >
                        FrameForge
                    </h1>
                    <p className="text-center text-cyan-500/60 text-sm tracking-widest uppercase">
                        FPS Monitor
                    </p>
                </div>

                {/* Progress Bar */}
                <div className="mt-6 w-48">
                    <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-cyan-500 via-blue-500 to-cyan-400 transition-all duration-75 ease-out"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>
            </div>

            {/* Version */}
            <div className="absolute bottom-8 text-cyan-600/50 text-xs tracking-widest">
                v1.2.0
            </div>

            {/* CSS Animations */}
            <style>{`
                @keyframes logoAppear {
                    0% { transform: scale(0.5); opacity: 0; }
                    100% { transform: scale(1); opacity: 1; }
                }
            `}</style>
        </div>
    );
}
