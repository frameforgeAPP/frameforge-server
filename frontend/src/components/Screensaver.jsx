import React, { useState, useEffect } from 'react';

export default function Screensaver({ data, onWake }) {
    const [position, setPosition] = useState({ x: 10, y: 10 });

    useEffect(() => {
        const move = () => {
            const maxX = window.innerWidth - 200; // Approximate width of text
            const maxY = window.innerHeight - 100; // Approximate height of text
            const newX = Math.random() * maxX;
            const newY = Math.random() * maxY;
            setPosition({ x: newX, y: newY });
        };

        move(); // Initial move
        const interval = setInterval(move, 60000); // Move every minute

        return () => clearInterval(interval);
    }, []);

    if (!data) return null;

    const { fps, cpu, gpus } = data;
    const gpuTemp = gpus[0]?.temperature || 0;

    return (
        <div
            onClick={onWake}
            className="fixed inset-0 bg-black z-[9999] cursor-none flex items-start justify-start overflow-hidden"
        >
            <div
                className="absolute transition-all duration-[2000ms] ease-in-out flex flex-col gap-2"
                style={{
                    transform: `translate(${position.x}px, ${position.y}px)`
                }}
            >
                <div className="text-6xl font-bold text-gray-800 font-mono">
                    {fps} <span className="text-2xl">FPS</span>
                </div>
                <div className="flex gap-4 text-gray-900 font-mono text-xl">
                    <span>CPU: {Math.round(cpu.temp)}°</span>
                    <span>GPU: {Math.round(gpuTemp)}°</span>
                </div>
            </div>
        </div>
    );
}
