import React from 'react';
import AnimatedNumber from '../AnimatedNumber';

const FraggerTheme = ({ data, theme }) => {
    const { fps, cpu, gpus, ram } = data;
    const gpu = gpus[0] || {};

    // Critical thresholds
    const isCpuCritical = cpu.temp > 85;
    const isGpuCritical = gpu.temperature > 85;

    return (
        <div className="w-full h-full flex flex-col items-center justify-center relative p-8">
            {/* CENTER: MASSIVE FPS */}
            <div className="flex flex-col items-center justify-center z-10">
                <div
                    className="font-black leading-none tracking-tighter text-[40vw] md:text-[25vw]"
                    style={{
                        fontFamily: 'Impact, sans-serif',
                        color: theme.colors.accent,
                        textShadow: `0 0 50px ${theme.colors.accent}66`
                    }}
                >
                    <AnimatedNumber value={fps || 0} />
                </div>
                <div className="text-2xl md:text-4xl font-bold tracking-[0.5em] text-gray-500 uppercase mt-[-2vh]">
                    FPS
                </div>
            </div>

            {/* CORNERS: CRITICAL STATS ONLY */}
            {/* Top Left: CPU Temp */}
            <div className="absolute top-8 left-8 flex flex-col items-start">
                <span className="text-sm text-gray-500 font-bold tracking-widest uppercase">CPU</span>
                <span className={`text-4xl md:text-6xl font-black ${isCpuCritical ? 'text-red-500 animate-pulse' : 'text-white'}`}>
                    {Math.round(cpu.temp)}°
                </span>
            </div>

            {/* Top Right: GPU Temp */}
            <div className="absolute top-8 right-8 flex flex-col items-end">
                <span className="text-sm text-gray-500 font-bold tracking-widest uppercase">GPU</span>
                <span className={`text-4xl md:text-6xl font-black ${isGpuCritical ? 'text-red-500 animate-pulse' : 'text-white'}`}>
                    {Math.round(gpu.temperature)}°
                </span>
            </div>

            {/* Bottom Left: RAM (Only if high usage) */}
            <div className="absolute bottom-8 left-8 flex flex-col items-start opacity-50">
                <span className="text-xs text-gray-600 font-bold tracking-widest uppercase">RAM</span>
                <span className="text-2xl font-bold text-gray-400">
                    {Math.round(ram.used_gb)} GB
                </span>
            </div>

            {/* Bottom Right: Game Name */}
            {data.game && (
                <div className="absolute bottom-8 right-8 max-w-[300px] text-right">
                    <div className={`text-xl font-bold uppercase tracking-widest ${theme.colors.accent} animate-pulse`}>
                        {data.game}
                    </div>
                </div>
            )}
        </div>
    );
};

export default FraggerTheme;
