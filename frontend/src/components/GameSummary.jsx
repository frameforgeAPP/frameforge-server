import React, { useEffect, useState } from 'react';
import { Trophy, Clock, Activity, Thermometer, Cpu, CircuitBoard, X } from 'lucide-react';

export default function GameSummary({ data, onClose }) {
    const [timeLeft, setTimeLeft] = useState(10);

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    onClose();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [onClose]);

    if (!data) return null;

    const { gameName, duration, avgFps, maxFps, minFps, avgCpuTemp, maxCpuTemp, avgGpuTemp, maxGpuTemp } = data;

    const formatDuration = (ms) => {
        const seconds = Math.floor((ms / 1000) % 60);
        const minutes = Math.floor((ms / (1000 * 60)) % 60);
        const hours = Math.floor((ms / (1000 * 60 * 60)) % 24);
        return `${hours > 0 ? hours + 'h ' : ''}${minutes}m ${seconds}s`;
    };

    return (
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center animate-in fade-in duration-300">
            <div className="w-full max-w-4xl p-8 relative">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-0 right-0 p-2 text-gray-500 hover:text-white transition-colors"
                >
                    <X size={32} />
                </button>

                {/* Header */}
                <div className="text-center mb-12">
                    <div className="flex items-center justify-center gap-3 text-yellow-500 mb-2">
                        <Trophy size={32} />
                        <span className="text-xl font-bold tracking-widest uppercase">Session Complete</span>
                    </div>
                    <h1 className="text-6xl font-black text-white tracking-tighter uppercase italic text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-500">
                        {gameName || "Unknown Game"}
                    </h1>
                    <div className="flex items-center justify-center gap-2 mt-4 text-gray-400">
                        <Clock size={16} />
                        <span className="font-mono">{formatDuration(duration)}</span>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                    {/* FPS Card */}
                    <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6 flex flex-col items-center justify-center relative overflow-hidden group">
                        <div className="absolute inset-0 bg-blue-500/5 group-hover:bg-blue-500/10 transition-colors"></div>
                        <Activity className="text-blue-500 mb-4" size={32} />
                        <div className="text-5xl font-black text-white mb-1">{Math.round(avgFps)}</div>
                        <div className="text-sm text-blue-400 font-bold tracking-widest uppercase mb-4">AVG FPS</div>
                        <div className="flex w-full justify-between px-4 text-xs text-gray-500 font-mono">
                            <span>MIN: {minFps}</span>
                            <span>MAX: {maxFps}</span>
                        </div>
                    </div>

                    {/* CPU Card */}
                    <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6 flex flex-col items-center justify-center relative overflow-hidden group">
                        <div className="absolute inset-0 bg-orange-500/5 group-hover:bg-orange-500/10 transition-colors"></div>
                        <Cpu className="text-orange-500 mb-4" size={32} />
                        <div className="text-5xl font-black text-white mb-1">{Math.round(avgCpuTemp)}°</div>
                        <div className="text-sm text-orange-400 font-bold tracking-widest uppercase mb-4">AVG CPU TEMP</div>
                        <div className="flex w-full justify-center text-xs text-gray-500 font-mono">
                            <span>PEAK: {Math.round(maxCpuTemp)}°</span>
                        </div>
                    </div>

                    {/* GPU Card */}
                    <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6 flex flex-col items-center justify-center relative overflow-hidden group">
                        <div className="absolute inset-0 bg-purple-500/5 group-hover:bg-purple-500/10 transition-colors"></div>
                        <CircuitBoard className="text-purple-500 mb-4" size={32} />
                        <div className="text-5xl font-black text-white mb-1">{Math.round(avgGpuTemp)}°</div>
                        <div className="text-sm text-purple-400 font-bold tracking-widest uppercase mb-4">AVG GPU TEMP</div>
                        <div className="flex w-full justify-center text-xs text-gray-500 font-mono">
                            <span>PEAK: {Math.round(maxGpuTemp)}°</span>
                        </div>
                    </div>

                </div>

                {/* Progress Bar */}
                <div className="mt-12 w-full bg-gray-800 h-1 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-white transition-all duration-1000 ease-linear"
                        style={{ width: `${(timeLeft / 10) * 100}%` }}
                    ></div>
                </div>
                <div className="text-center mt-2 text-xs text-gray-600 font-mono">
                    Closing in {timeLeft}s
                </div>

            </div>
        </div>
    );
}
