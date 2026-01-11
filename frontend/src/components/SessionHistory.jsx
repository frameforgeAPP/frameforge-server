import React, { useState, useEffect } from 'react';
import { X, History, Trash2, ChevronRight, Gamepad2, Clock, Thermometer, Gauge, Calendar, AlertCircle } from 'lucide-react';
import { getSessionHistory, deleteSession, clearAllSessions, formatDuration, formatDate } from '../utils/sessionStorage';
import { t } from '../utils/i18n';

export default function SessionHistory({ isOpen, onClose, onSelectSession, onCompare }) {
    const [sessions, setSessions] = useState([]);
    const [selectedForCompare, setSelectedForCompare] = useState([]);
    const [compareMode, setCompareMode] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setSessions(getSessionHistory());
        }
    }, [isOpen]);

    const handleDelete = (sessionId, e) => {
        e.stopPropagation();
        if (deleteSession(sessionId)) {
            setSessions(prev => prev.filter(s => s.id !== sessionId));
        }
    };

    const handleClearAll = () => {
        if (window.confirm(t('confirm_clear_all') || 'Limpar todo o histórico?')) {
            clearAllSessions();
            setSessions([]);
        }
    };

    const toggleCompareSelection = (session) => {
        if (selectedForCompare.find(s => s.id === session.id)) {
            setSelectedForCompare(prev => prev.filter(s => s.id !== session.id));
        } else if (selectedForCompare.length < 2) {
            setSelectedForCompare(prev => [...prev, session]);
        }
    };

    const handleCompare = () => {
        if (selectedForCompare.length === 2) {
            onCompare(selectedForCompare[0], selectedForCompare[1]);
            setCompareMode(false);
            setSelectedForCompare([]);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-gray-900 border border-gray-800 rounded-2xl max-w-lg w-full max-h-[85vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-800">
                    <div className="flex items-center gap-3">
                        <History className="w-6 h-6 text-blue-400" />
                        <h2 className="text-xl font-bold text-white">{t('session_history') || 'Histórico'}</h2>
                        <span className="text-sm text-gray-500">({sessions.length})</span>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded-lg transition-colors">
                        <X className="w-5 h-5 text-gray-400" />
                    </button>
                </div>

                {/* Compare Mode Toggle */}
                {sessions.length >= 2 && (
                    <div className="px-6 py-3 border-b border-gray-800 flex items-center justify-between">
                        <button
                            onClick={() => {
                                setCompareMode(!compareMode);
                                setSelectedForCompare([]);
                            }}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${compareMode ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-300'}`}
                        >
                            {compareMode ? t('cancel_compare') || 'Cancelar' : t('compare_sessions') || 'Comparar'}
                        </button>
                        {compareMode && selectedForCompare.length === 2 && (
                            <button
                                onClick={handleCompare}
                                className="px-4 py-2 bg-green-600 hover:bg-green-500 rounded-lg text-sm font-bold text-white transition-colors"
                            >
                                {t('compare_selected') || 'Comparar Selecionadas'}
                            </button>
                        )}
                        {compareMode && (
                            <span className="text-sm text-gray-500">{selectedForCompare.length}/2</span>
                        )}
                    </div>
                )}

                {/* Session List */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {sessions.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                            <AlertCircle className="w-12 h-12 mb-4 opacity-50" />
                            <p className="text-center">{t('no_sessions') || 'Nenhuma sessão registrada'}</p>
                            <p className="text-sm text-center mt-2 text-gray-600">
                                {t('sessions_info') || 'As sessões são salvas automaticamente quando você joga'}
                            </p>
                        </div>
                    ) : (
                        sessions.map((session) => {
                            const isSelected = selectedForCompare.find(s => s.id === session.id);
                            return (
                                <div
                                    key={session.id}
                                    onClick={() => compareMode ? toggleCompareSelection(session) : onSelectSession?.(session)}
                                    className={`p-4 rounded-xl border transition-all cursor-pointer ${isSelected
                                            ? 'bg-purple-600/20 border-purple-500'
                                            : 'bg-gray-800/50 border-gray-700 hover:border-gray-600'
                                        }`}
                                >
                                    {/* Game Name & Date */}
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-2">
                                            <Gamepad2 className="w-4 h-4 text-green-400" />
                                            <span className="font-bold text-white truncate max-w-[200px]">
                                                {session.gameName || t('unknown_game') || 'Jogo Desconhecido'}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {!compareMode && (
                                                <button
                                                    onClick={(e) => handleDelete(session.id, e)}
                                                    className="p-1.5 hover:bg-red-600/20 rounded-lg transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4 text-red-400" />
                                                </button>
                                            )}
                                            {compareMode && isSelected && (
                                                <div className="w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center text-xs font-bold">
                                                    {selectedForCompare.indexOf(session) + 1}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Stats Grid */}
                                    <div className="grid grid-cols-4 gap-2 text-center">
                                        {/* Duration */}
                                        <div className="bg-black/30 rounded-lg p-2">
                                            <Clock className="w-3 h-3 mx-auto mb-1 text-gray-500" />
                                            <span className="text-xs text-gray-300">{formatDuration(session.duration)}</span>
                                        </div>
                                        {/* FPS */}
                                        <div className="bg-black/30 rounded-lg p-2">
                                            <Gauge className="w-3 h-3 mx-auto mb-1 text-green-400" />
                                            <span className="text-xs text-green-400 font-bold">{Math.round(session.avgFps)}</span>
                                        </div>
                                        {/* CPU */}
                                        <div className="bg-black/30 rounded-lg p-2">
                                            <Thermometer className="w-3 h-3 mx-auto mb-1 text-orange-400" />
                                            <span className="text-xs text-orange-400">{Math.round(session.maxCpuTemp)}°</span>
                                        </div>
                                        {/* GPU */}
                                        <div className="bg-black/30 rounded-lg p-2">
                                            <Thermometer className="w-3 h-3 mx-auto mb-1 text-red-400" />
                                            <span className="text-xs text-red-400">{Math.round(session.maxGpuTemp)}°</span>
                                        </div>
                                    </div>

                                    {/* Date */}
                                    <div className="flex items-center gap-1 mt-3 text-xs text-gray-500">
                                        <Calendar className="w-3 h-3" />
                                        <span>{formatDate(session.savedAt)}</span>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Footer */}
                {sessions.length > 0 && (
                    <div className="p-4 border-t border-gray-800">
                        <button
                            onClick={handleClearAll}
                            className="w-full py-3 bg-red-600/10 hover:bg-red-600/20 border border-red-600/30 rounded-xl text-red-400 font-medium transition-colors"
                        >
                            {t('clear_all_history') || 'Limpar Todo Histórico'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
