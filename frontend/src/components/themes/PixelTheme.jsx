import React from 'react';

export default function PixelTheme({ data, theme }) {
    const { cpu, ram, gpus, fps } = data;
    const gpu = gpus[0] || { temperature: 0, load: 0 };

    const PixelBox = ({ label, value, unit, color }) => (
        <div className={`border-4 p-4 flex flex-col items-center justify-center bg-black/50 backdrop-blur-sm`} style={{ borderColor: color, imageRendering: 'pixelated' }}>
            <div className="text-xs mb-2 uppercase tracking-widest" style={{ color: color }}>{label}</div>
            <div className="text-2xl md:text-4xl" style={{ color: 'white', textShadow: `2px 2px 0px ${color}` }}>
                {Math.round(value)}{unit}
            </div>
        </div>
    );

    return (
        <div className="flex flex-col items-center justify-center h-full w-full p-4 gap-8 font-['Press_Start_2P']">
            <h1 className="text-2xl md:text-4xl text-white mb-8 animate-pulse text-center" style={{ textShadow: '4px 4px 0px #000' }}>
                SYSTEM STATUS
            </h1>

            <div className="grid grid-cols-2 gap-8 w-full max-w-4xl">
                <div className="col-span-2 flex justify-center">
                    <div className="border-8 border-white p-8 bg-black text-center">
                        <div className="text-sm text-green-400 mb-4">FPS</div>
                        <div className="text-6xl md:text-8xl text-green-400 animate-bounce">
                            {fps}
                        </div>
                    </div>
                </div>

                <PixelBox label="CPU TEMP" value={cpu.temp} unit="°C" color="#ef4444" />
                <PixelBox label="GPU TEMP" value={gpu.temperature} unit="°C" color="#f97316" />
                <PixelBox label="RAM" value={ram.percent} unit="%" color="#a855f7" />
                <PixelBox label="GPU LOAD" value={gpu.load} unit="%" color="#3b82f6" />
            </div>
        </div>
    );
}
