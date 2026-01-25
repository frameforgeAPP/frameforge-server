import React, { useState, useEffect } from 'react';
import { X, History, Trash2, ChevronRight, Gamepad2, Clock, Thermometer, Gauge, Calendar, AlertCircle, Download, Filter, Layers, ChevronDown, ChevronUp } from 'lucide-react';
import { getSessionHistory, deleteSession, clearAllSessions, formatDuration, formatDate } from '../utils/sessionStorage';
import { t } from '../utils/i18n';

export default function SessionHistory({ isOpen, onClose, onSelectSession, onCompare }) {
    const [sessions, setSessions] = useState([]);
    const [selectedForCompare, setSelectedForCompare] = useState([]);
    const [compareMode, setCompareMode] = useState(false);
    const [groupByGame, setGroupByGame] = useState(false);
    const [dateFilter, setDateFilter] = useState('all'); // 'all', '7days', '30days'
    const [expandedGames, setExpandedGames] = useState({});

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

    const handleExportCSV = async () => {
        if (sessions.length === 0) return;

        const headers = ["Game", "Date", "Duration", "Avg FPS", "Max CPU Temp", "Max GPU Temp"];
        const rows = sessions.map(s => [
            s.gameName || "Unknown",
            new Date(s.savedAt).toLocaleString(),
            formatDuration(s.duration),
            Math.round(s.avgFps),
            Math.round(s.maxCpuTemp),
            Math.round(s.maxGpuTemp)
        ]);

        const csvContent = [
            headers.join(","),
            ...rows.map(r => r.join(","))
        ].join("\n");

        try {
            // Try Capacitor Share first (Mobile)
            const { Share } = await import('@capacitor/share');
            const { Filesystem, Directory, Encoding } = await import('@capacitor/filesystem');

            const fileName = `frameforge_history_${new Date().toISOString().slice(0, 10)}.csv`;

            await Filesystem.writeFile({
                path: fileName,
                data: csvContent,
                directory: Directory.Cache,
                encoding: Encoding.UTF8
            });

            const uri = await Filesystem.getUri({
                directory: Directory.Cache,
                path: fileName
            });

            await Share.share({
                title: 'Export Session History',
                text: 'Here is my FrameForge session history.',
                url: uri.uri,
            });
        } catch (e) {
            console.log("Mobile export failed, trying web fallback", e);
            try {
                // Web Fallback
                const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                const url = URL.createObjectURL(blob);
                const link = document.createElement("a");
                link.setAttribute("href", url);
                link.setAttribute("download", `frameforge_history_${new Date().toISOString().slice(0, 10)}.csv`);
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            } catch (webError) {
                console.log("Web export failed, trying clipboard", webError);
                // Clipboard Fallback
                try {
                    await navigator.clipboard.writeText(csvContent);
                    alert(t('export_clipboard_success') || "CSV copiado para a área de transferência!");
                } catch (clipboardError) {
                    alert(t('export_failed') || "Falha ao exportar CSV.");
                }
            }
        }
    };

    const toggleGameExpand = (gameName) => {
        setExpandedGames(prev => ({ ...prev, [gameName]: !prev[gameName] }));
    };

    // Filter Logic
    const filteredSessions = sessions.filter(session => {
        if (dateFilter === 'all') return true;
        const date = new Date(session.savedAt);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (dateFilter === '7days') return diffDays <= 7;
        if (dateFilter === '30days') return diffDays <= 30;
        return true;
    });

    // Grouping Logic
    const groupedSessions = filteredSessions.reduce((acc, session) => {
        const game = session.gameName || t('unknown_game') || 'Unknown Game';
        if (!acc[game]) acc[game] = [];
        acc[game].push(session);
        return acc;
    }, {});

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
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



                {/* Filters & Tools */}
                <div className="px-6 py-3 border-b border-gray-800 flex flex-wrap gap-2 items-center justify-between bg-gray-900/50">
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setGroupByGame(!groupByGame)}
                            className={`p-2 rounded-lg transition-colors ${groupByGame ? 'bg-blue-600/20 text-blue-400' : 'bg-gray-800 text-gray-400'}`}
                            title={t('group_by_game') || "Agrupar por Jogo"}
                        >
                            <Layers size={18} />
                        </button>
                        <div className="relative">
                            <select
                                value={dateFilter}
                                onChange={(e) => setDateFilter(e.target.value)}
                                className="bg-gray-800 text-gray-300 text-xs rounded-lg px-3 py-2 outline-none border border-gray-700 focus:border-blue-500 appearance-none pr-8"
                            >
                                <option value="all">{t('all_time') || "Todo o período"}</option>
                                <option value="7days">{t('last_7_days') || "Últimos 7 dias"}</option>
                                <option value="30days">{t('last_30_days') || "Últimos 30 dias"}</option>
                            </select>
                            <Filter size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                        </div>
                    </div>
                    <button
                        onClick={handleExportCSV}
                        className="flex items-center gap-2 px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-xs font-medium text-gray-300 transition-colors"
                    >
                        <Download size={14} />
                        CSV
                    </button>
                </div>

                {/* Session List */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {filteredSessions.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                            <AlertCircle className="w-12 h-12 mb-4 opacity-50" />
                            <p className="text-center">{t('no_sessions') || 'Nenhuma sessão registrada'}</p>
                        </div>
                    ) : groupByGame ? (
                        // Grouped View
                        Object.entries(groupedSessions).map(([gameName, gameSessions]) => (
                            <div key={gameName} className="border border-gray-800 rounded-xl overflow-hidden">
                                <button
                                    onClick={() => toggleGameExpand(gameName)}
                                    className="w-full flex items-center justify-between p-4 bg-gray-800/30 hover:bg-gray-800/50 transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <Gamepad2 className="w-5 h-5 text-blue-400" />
                                        <span className="font-bold text-white">{gameName}</span>
                                        <span className="text-xs text-gray-500 bg-gray-800 px-2 py-0.5 rounded-full">{gameSessions.length}</span>
                                    </div>
                                    {expandedGames[gameName] ? <ChevronUp size={18} className="text-gray-500" /> : <ChevronDown size={18} className="text-gray-500" />}
                                </button>

                                {expandedGames[gameName] && (
                                    <div className="p-2 space-y-2 bg-black/20">
                                        {gameSessions.map(session => {
                                            const isSelected = selectedForCompare.find(s => s.id === session.id);
                                            return (
                                                <div
                                                    key={session.id}
                                                    onClick={() => compareMode ? toggleCompareSelection(session) : onSelectSession?.(session)}
                                                    className={`p-3 rounded-lg border transition-all cursor-pointer flex items-center justify-between ${isSelected
                                                        ? 'bg-purple-600/20 border-purple-500'
                                                        : 'bg-gray-800/50 border-gray-700 hover:border-gray-600'
                                                        }`}
                                                >
                                                    <div className="flex flex-col gap-1">
                                                        <div className="flex items-center gap-2 text-xs text-gray-400">
                                                            <Calendar size={12} />
                                                            {formatDate(session.savedAt)}
                                                        </div>
                                                        <div className="flex items-center gap-3">
                                                            <span className="text-sm font-bold text-green-400">{Math.round(session.avgFps)} FPS</span>
                                                            <div className="flex items-center gap-2 text-xs">
                                                                <span className="text-orange-400 flex items-center gap-0.5"><Thermometer size={10} /> {Math.round(session.maxCpuTemp)}°</span>
                                                                <span className="text-red-400 flex items-center gap-0.5"><Thermometer size={10} /> {Math.round(session.maxGpuTemp)}°</span>
                                                            </div>
                                                            <span className="text-xs text-gray-500">{formatDuration(session.duration)}</span>
                                                        </div>
                                                    </div>
                                                    {compareMode && isSelected && (
                                                        <div className="w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center text-xs font-bold">
                                                            {selectedForCompare.indexOf(session) + 1}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        ))
                    ) : (
                        // Flat View (Original)
                        filteredSessions.map((session) => {
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
