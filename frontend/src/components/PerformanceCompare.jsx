import React from 'react';
import { X, ArrowUpRight, ArrowDownRight, Minus, GitCompare, Gamepad2, Clock, Gauge, Thermometer, Cpu, CircuitBoard } from 'lucide-react';
import { formatDuration, formatDate } from '../utils/sessionStorage';
import { t } from '../utils/i18n';

export default function PerformanceCompare({ session1, session2, onClose }) {
    if (!session1 || !session2) return null;

    const getDiff = (val1, val2, lowerIsBetter = false) => {
        const diff = val2 - val1;
        if (Math.abs(diff) < 0.5) return { value: 0, percent: 0, icon: Minus, color: 'text-gray-500' };

        const isPositive = lowerIsBetter ? diff < 0 : diff > 0;
        const percent = val1 !== 0 ? ((diff / val1) * 100) : 0;

        return {
            value: Math.abs(diff),
            percent: Math.abs(percent),
            icon: isPositive ? ArrowUpRight : ArrowDownRight,
            color: isPositive ? 'text-green-400' : 'text-red-400'
        };
    };

    const comparisons = [
        {
            label: 'FPS ' + (t('average') || 'Média'),
            icon: Gauge,
            iconColor: 'text-green-400',
            val1: Math.round(session1.avgFps),
            val2: Math.round(session2.avgFps),
            unit: '',
            lowerIsBetter: false
        },
        {
            label: 'FPS ' + (t('minimum') || 'Mínimo'),
            icon: Gauge,
            iconColor: 'text-yellow-400',
            val1: Math.round(session1.minFps),
            val2: Math.round(session2.minFps),
            unit: '',
            lowerIsBetter: false
        },
        {
            label: 'CPU ' + (t('max_temp') || 'Temp Max'),
            icon: Cpu,
            iconColor: 'text-orange-400',
            val1: Math.round(session1.maxCpuTemp),
            val2: Math.round(session2.maxCpuTemp),
            unit: '°C',
            lowerIsBetter: true
        },
        {
            label: 'GPU ' + (t('max_temp') || 'Temp Max'),
            icon: CircuitBoard,
            iconColor: 'text-red-400',
            val1: Math.round(session1.maxGpuTemp),
            val2: Math.round(session2.maxGpuTemp),
            unit: '°C',
            lowerIsBetter: true
        }
    ];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-gray-900 border border-gray-800 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-800 bg-gradient-to-r from-purple-600/20 to-pink-600/20">
                    <div className="flex items-center gap-3">
                        <GitCompare className="w-6 h-6 text-purple-400" />
                        <h2 className="text-xl font-bold text-white">{t('compare_performance') || 'Comparar'}</h2>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded-lg transition-colors">
                        <X className="w-5 h-5 text-gray-400" />
                    </button>
                </div>

                {/* Session Headers */}
                <div className="grid grid-cols-3 gap-2 p-4 border-b border-gray-800">
                    <div className="col-span-1" />
                    <div className="text-center p-3 bg-blue-600/10 rounded-xl border border-blue-600/30">
                        <Gamepad2 className="w-4 h-4 mx-auto mb-1 text-blue-400" />
                        <span className="text-xs font-medium text-blue-400 truncate block">{session1.gameName || 'Session 1'}</span>
                        <span className="text-[10px] text-gray-500">{formatDate(session1.savedAt)}</span>
                    </div>
                    <div className="text-center p-3 bg-purple-600/10 rounded-xl border border-purple-600/30">
                        <Gamepad2 className="w-4 h-4 mx-auto mb-1 text-purple-400" />
                        <span className="text-xs font-medium text-purple-400 truncate block">{session2.gameName || 'Session 2'}</span>
                        <span className="text-[10px] text-gray-500">{formatDate(session2.savedAt)}</span>
                    </div>
                </div>

                {/* Comparison Rows */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {comparisons.map((comp, index) => {
                        const diff = getDiff(comp.val1, comp.val2, comp.lowerIsBetter);
                        const DiffIcon = diff.icon;

                        return (
                            <div key={index} className="grid grid-cols-3 gap-2 items-center">
                                {/* Label */}
                                <div className="flex items-center gap-2">
                                    <comp.icon className={`w-4 h-4 ${comp.iconColor}`} />
                                    <span className="text-sm text-gray-400">{comp.label}</span>
                                </div>

                                {/* Session 1 Value */}
                                <div className="text-center p-3 bg-gray-800/50 rounded-xl">
                                    <span className="text-xl font-bold text-white">{comp.val1}</span>
                                    <span className="text-gray-500">{comp.unit}</span>
                                </div>

                                {/* Session 2 Value + Diff */}
                                <div className="text-center p-3 bg-gray-800/50 rounded-xl relative">
                                    <span className="text-xl font-bold text-white">{comp.val2}</span>
                                    <span className="text-gray-500">{comp.unit}</span>

                                    {diff.value > 0 && (
                                        <div className={`absolute -top-2 -right-2 flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-black ${diff.color}`}>
                                            <DiffIcon className="w-3 h-3" />
                                            <span className="text-xs font-bold">{Math.round(diff.value)}</span>
                                            <span className="text-[10px] opacity-80">({Math.round(diff.percent)}%)</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}

                    {/* Duration Comparison */}
                    <div className="grid grid-cols-3 gap-2 items-center pt-3 border-t border-gray-800">
                        <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-400">{t('duration') || 'Duração'}</span>
                        </div>
                        <div className="text-center p-3 bg-gray-800/50 rounded-xl">
                            <span className="text-sm text-gray-300">{formatDuration(session1.duration)}</span>
                        </div>
                        <div className="text-center p-3 bg-gray-800/50 rounded-xl">
                            <span className="text-sm text-gray-300">{formatDuration(session2.duration)}</span>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-800">
                    <button
                        onClick={onClose}
                        className="w-full py-3 bg-gray-800 hover:bg-gray-700 rounded-xl font-bold text-white transition-colors"
                    >
                        {t('close') || 'Fechar'}
                    </button>
                </div>
            </div>
        </div>
    );
}
