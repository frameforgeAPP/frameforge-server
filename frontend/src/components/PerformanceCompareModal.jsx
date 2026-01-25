import React from 'react';
import { X, TrendingUp, TrendingDown, Minus, Activity, Thermometer, Cpu, CircuitBoard } from 'lucide-react';
import { t } from '../utils/i18n';

export default function PerformanceCompareModal({ isOpen, onClose, currentSession, previousSession }) {
    if (!isOpen || !currentSession || !previousSession) return null;

    const renderDiff = (current, previous, suffix = '', inverse = false) => {
        const diff = current - previous;
        const percent = previous > 0 ? ((diff / previous) * 100).toFixed(1) : 0;
        const isPositive = diff > 0;
        const isNeutral = diff === 0;

        // For FPS: Higher is better (Green)
        // For Temps: Lower is better (Green)
        let colorClass = 'text-gray-400';
        let Icon = Minus;

        if (!isNeutral) {
            if (inverse) {
                // Lower is better (Temps)
                colorClass = isPositive ? 'text-red-400' : 'text-green-400';
            } else {
                // Higher is better (FPS)
                colorClass = isPositive ? 'text-green-400' : 'text-red-400';
            }
            Icon = isPositive ? TrendingUp : TrendingDown;
        }

        return (
            <div className={`flex items-center gap-1 text-xs font-bold ${colorClass}`}>
                {!isNeutral && <Icon size={12} />}
                <span>{diff > 0 ? '+' : ''}{diff.toFixed(0)}{suffix} ({percent}%)</span>
            </div>
        );
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-gray-900 border border-gray-700 rounded-2xl max-w-md w-full shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-800 bg-gray-800/50">
                    <div className="flex items-center gap-3">
                        <Activity className="w-6 h-6 text-green-400" />
                        <div>
                            <h2 className="text-lg font-bold text-white">Comparativo de Desempenho</h2>
                            <p className="text-xs text-gray-400 uppercase tracking-wider">{currentSession.gameName}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-700 rounded-lg transition-colors">
                        <X className="w-5 h-5 text-gray-400" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* FPS Comparison */}
                    <div className="bg-gray-800/30 p-4 rounded-xl border border-gray-700">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-sm font-bold text-gray-400">FPS Médio</span>
                            {renderDiff(currentSession.avgFps, previousSession.avgFps)}
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="text-center">
                                <span className="text-xs text-gray-500 block mb-1">Anterior</span>
                                <span className="text-2xl font-bold text-gray-300">{previousSession.avgFps.toFixed(0)}</span>
                            </div>
                            <div className="h-8 w-px bg-gray-700" />
                            <div className="text-center">
                                <span className="text-xs text-green-400 block mb-1 font-bold">Atual</span>
                                <span className="text-3xl font-bold text-white">{currentSession.avgFps.toFixed(0)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Temps Comparison */}
                    <div className="grid grid-cols-2 gap-4">
                        {/* CPU */}
                        <div className="bg-gray-800/30 p-4 rounded-xl border border-gray-700">
                            <div className="flex items-center gap-2 mb-2">
                                <Cpu className="w-4 h-4 text-orange-400" />
                                <span className="text-xs font-bold text-gray-400">CPU</span>
                            </div>
                            <div className="flex flex-col gap-2">
                                {/* Max */}
                                <div>
                                    <span className="text-[10px] text-gray-500 uppercase">Max</span>
                                    <div className="flex justify-between items-end">
                                        <span className="text-xl font-bold text-white">{currentSession.maxCpuTemp.toFixed(0)}°</span>
                                        <span className="text-xs text-gray-500 mb-1">{previousSession.maxCpuTemp.toFixed(0)}°</span>
                                    </div>
                                    {renderDiff(currentSession.maxCpuTemp, previousSession.maxCpuTemp, '°', true)}
                                </div>
                                {/* Avg */}
                                <div className="pt-2 border-t border-gray-700/50">
                                    <span className="text-[10px] text-gray-500 uppercase">Méd</span>
                                    <div className="flex justify-between items-end">
                                        <span className="text-xl font-bold text-white">{currentSession.avgCpuTemp.toFixed(0)}°</span>
                                        <span className="text-xs text-gray-500 mb-1">{previousSession.avgCpuTemp.toFixed(0)}°</span>
                                    </div>
                                    {renderDiff(currentSession.avgCpuTemp, previousSession.avgCpuTemp, '°', true)}
                                </div>
                            </div>
                        </div>

                        {/* GPU */}
                        <div className="bg-gray-800/30 p-4 rounded-xl border border-gray-700">
                            <div className="flex items-center gap-2 mb-2">
                                <CircuitBoard className="w-4 h-4 text-green-400" />
                                <span className="text-xs font-bold text-gray-400">GPU</span>
                            </div>
                            <div className="flex flex-col gap-2">
                                {/* Max */}
                                <div>
                                    <span className="text-[10px] text-gray-500 uppercase">Max</span>
                                    <div className="flex justify-between items-end">
                                        <span className="text-xl font-bold text-white">{currentSession.maxGpuTemp.toFixed(0)}°</span>
                                        <span className="text-xs text-gray-500 mb-1">{previousSession.maxGpuTemp.toFixed(0)}°</span>
                                    </div>
                                    {renderDiff(currentSession.maxGpuTemp, previousSession.maxGpuTemp, '°', true)}
                                </div>
                                {/* Avg */}
                                <div className="pt-2 border-t border-gray-700/50">
                                    <span className="text-[10px] text-gray-500 uppercase">Méd</span>
                                    <div className="flex justify-between items-end">
                                        <span className="text-xl font-bold text-white">{currentSession.avgGpuTemp.toFixed(0)}°</span>
                                        <span className="text-xs text-gray-500 mb-1">{previousSession.avgGpuTemp.toFixed(0)}°</span>
                                    </div>
                                    {renderDiff(currentSession.avgGpuTemp, previousSession.avgGpuTemp, '°', true)}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
