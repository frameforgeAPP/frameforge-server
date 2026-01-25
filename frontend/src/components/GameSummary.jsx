import React, { useEffect, useState, useRef } from 'react';
import { Trophy, Clock, Activity, Thermometer, Cpu, CircuitBoard, X, Share2, Download } from 'lucide-react';
import { toPng } from 'html-to-image';
import { Share } from '@capacitor/share';
import { Capacitor } from '@capacitor/core';
import { t } from '../utils/i18n';

export default function GameSummary({ data, onClose }) {
    const [timeLeft, setTimeLeft] = useState(10);
    const [isPaused, setIsPaused] = useState(false);
    const cardRef = useRef(null);

    useEffect(() => {
        if (isPaused) return;

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
    }, [onClose, isPaused]);

    if (!data) return null;

    const { gameName, duration, avgFps, maxFps, minFps, avgCpuTemp, maxCpuTemp, avgGpuTemp, maxGpuTemp } = data;

    const formatDuration = (ms) => {
        const seconds = Math.floor((ms / 1000) % 60);
        const minutes = Math.floor((ms / (1000 * 60)) % 60);
        const hours = Math.floor((ms / (1000 * 60 * 60)) % 24);
        return `${hours > 0 ? hours + 'h ' : ''}${minutes}m ${seconds}s`;
    };

    const handleShare = async () => {
        if (!cardRef.current) return;
        setIsPaused(true); // Pause timer while sharing

        try {
            const dataUrl = await toPng(cardRef.current, {
                backgroundColor: '#000000',
                pixelRatio: 2,
                cacheBust: true,
                filter: (node) => !node.hasAttribute?.('data-html2canvas-ignore')
            });

            if (Capacitor.isNativePlatform()) {
                const { Filesystem, Directory } = await import('@capacitor/filesystem');
                const fileName = `summary_${Date.now()}.png`;

                await Filesystem.writeFile({
                    path: fileName,
                    data: dataUrl,
                    directory: Directory.Cache
                });

                const uri = await Filesystem.getUri({
                    directory: Directory.Cache,
                    path: fileName
                });

                await Share.share({
                    title: 'Game Session Summary',
                    text: `Just finished playing ${gameName}! Avg FPS: ${Math.round(avgFps)}`,
                    url: uri.uri,
                });
            } else {
                const link = document.createElement('a');
                link.download = `summary-${Date.now()}.png`;
                link.href = dataUrl;
                link.click();
            }
        } catch (error) {
            console.error("Share failed", error);
            alert("Erro ao compartilhar");
        }
        setIsPaused(false);
    };

    return (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex items-center justify-center animate-in fade-in duration-300 p-4">
            <div ref={cardRef} className="w-full max-w-lg relative bg-gray-900/80 rounded-[2rem] border border-gray-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">

                {/* Background Glow */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-32 bg-blue-500/20 blur-[100px] pointer-events-none"></div>

                {/* Header */}
                <div className="relative p-6 pb-2 text-center shrink-0">
                    <button
                        onClick={onClose}
                        data-html2canvas-ignore="true"
                        className="absolute top-6 right-6 p-2 bg-gray-800/50 hover:bg-gray-700 rounded-full text-gray-400 hover:text-white transition-colors z-50"
                    >
                        <X size={20} />
                    </button>

                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 text-xs font-bold tracking-widest uppercase mb-4">
                        <Trophy size={12} />
                        {t('session_complete')}
                    </div>

                    <h1 className="text-3xl md:text-4xl font-black text-white tracking-tighter uppercase italic leading-tight mb-2 px-4 break-words">
                        {gameName || t('unknown_game')}
                    </h1>

                    <div className="flex items-center justify-center gap-2 text-gray-400 text-sm font-mono">
                        <Clock size={14} />
                        {formatDuration(duration)}
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="p-6 grid grid-cols-2 gap-3 overflow-y-auto">
                    {/* FPS (Large) */}
                    <div className="col-span-2 bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20 rounded-2xl p-5 flex items-center justify-between relative overflow-hidden group">
                        <div className="absolute right-0 top-0 w-24 h-24 bg-blue-500/10 blur-2xl rounded-full -mr-10 -mt-10"></div>
                        <div className="flex flex-col">
                            <span className="text-blue-400 text-xs font-bold tracking-wider uppercase mb-1">{t('avg_fps')}</span>
                            <span className="text-5xl font-black text-white tracking-tighter">{Math.round(avgFps)}</span>
                        </div>
                        <div className="flex flex-col items-end gap-1 text-xs font-mono text-blue-200/70">
                            <div className="bg-blue-950/50 px-2 py-1 rounded-md border border-blue-500/20">
                                MAX: <span className="text-white font-bold">{maxFps}</span>
                            </div>
                            <div className="bg-blue-950/50 px-2 py-1 rounded-md border border-blue-500/20">
                                MIN: <span className="text-white font-bold">{minFps}</span>
                            </div>
                        </div>
                    </div>

                    {/* CPU */}
                    <div className="bg-gray-800/40 border border-gray-700/50 rounded-2xl p-4 flex flex-col items-center justify-center relative overflow-hidden">
                        <Cpu className="text-orange-500 mb-2" size={24} />
                        <span className="text-3xl font-bold text-white mb-1">{Math.round(avgCpuTemp)}°</span>
                        <span className="text-orange-400/80 text-[10px] font-bold uppercase tracking-wider">{t('avg_cpu_temp')}</span>
                        <span className="text-gray-500 text-[10px] mt-1 font-mono">PEAK: {Math.round(maxCpuTemp)}°</span>
                    </div>

                    {/* GPU */}
                    <div className="bg-gray-800/40 border border-gray-700/50 rounded-2xl p-4 flex flex-col items-center justify-center relative overflow-hidden">
                        <CircuitBoard className="text-purple-500 mb-2" size={24} />
                        <span className="text-3xl font-bold text-white mb-1">{Math.round(avgGpuTemp)}°</span>
                        <span className="text-purple-400/80 text-[10px] font-bold uppercase tracking-wider">{t('avg_gpu_temp')}</span>
                        <span className="text-gray-500 text-[10px] mt-1 font-mono">PEAK: {Math.round(maxGpuTemp)}°</span>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="p-6 pt-2 mt-auto shrink-0 flex flex-col gap-4">
                    <button
                        onClick={handleShare}
                        data-html2canvas-ignore="true"
                        className="w-full py-3 bg-white text-black hover:bg-gray-200 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors"
                    >
                        <Share2 size={18} />
                        {t('share_stats') || "Compartilhar"}
                    </button>

                    {/* Progress Bar */}
                    <div className="w-full bg-gray-800 h-1 rounded-full overflow-hidden" data-html2canvas-ignore="true">
                        <div
                            className="h-full bg-gray-500 transition-all duration-1000 ease-linear"
                            style={{ width: `${(timeLeft / 10) * 100}%` }}
                        ></div>
                    </div>
                    <div className="text-center text-[10px] text-gray-600 font-mono uppercase tracking-widest" data-html2canvas-ignore="true">
                        {isPaused ? t('paused') : `${t('closing_in')} ${timeLeft}s`}
                    </div>
                </div>
            </div>
        </div>
    );
}
