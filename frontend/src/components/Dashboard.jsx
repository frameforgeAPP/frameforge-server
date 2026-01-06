import React, { useState, useEffect } from 'react';
import { Cpu, CircuitBoard, HardDrive, MonitorPlay, Maximize, Minimize, Clock as ClockIcon, Circle, Smartphone, X, Heart, Palette } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer, YAxis } from 'recharts';
import { ScreenBrightness } from '@capacitor-community/screen-brightness';
import QRCode from 'react-qr-code';
import GameSummary from './GameSummary';
import DonationModal from './DonationModal';
import ThemeSelector from './ThemeSelector';
import { themes } from '../utils/themes';

export default function Dashboard({ data, toggleFullScreen, isFullscreen, connected, serverAddress, setServerAddress, isDemo }) {
    // Initialize viewMode from localStorage or default to 'default'
    const [viewMode, setViewMode] = useState(() => {
        return localStorage.getItem('dashboardViewMode') || 'default';
    });
    const [history, setHistory] = useState([]);
    const [isRecording, setIsRecording] = useState(false);
    const [showConnectModal, setShowConnectModal] = useState(false);
    const [showDonationModal, setShowDonationModal] = useState(false);
    const [showThemeSelector, setShowThemeSelector] = useState(false);
    const [currentTheme, setCurrentTheme] = useState(() => {
        return localStorage.getItem('dashboardTheme') || 'default';
    });
    const [localIp, setLocalIp] = useState("");

    const theme = themes[currentTheme] || themes.default;

    // Performance Analyzer State
    const [recordingSession, setRecordingSession] = useState([]);
    const [summaryData, setSummaryData] = useState(null);
    const [showSummary, setShowSummary] = useState(false);
    const [lastGameName, setLastGameName] = useState("");

    // Fetch Local IP for QR Code
    useEffect(() => {
        if (showConnectModal) {
            fetch('/api/ip')
                .then(res => res.json())
                .then(data => setLocalIp(data.ip))
                .catch(err => console.error("Failed to fetch IP", err));
        }
    }, [showConnectModal]);

    // Update History & Data Logic
    useEffect(() => {
        if (!data) return;

        setHistory(prev => {
            const newPoint = {
                timestamp: Date.now(),
                cpuTemp: data.cpu.temp,
                gpuTemp: data.gpus[0]?.temperature || 0,
                gpuLoad: data.gpus[0]?.load || 0
            };
            const newHistory = [...prev, newPoint];
            if (newHistory.length > 30) newHistory.shift(); // Keep last 30 points
            return newHistory;
        });

        // Recording Logic
        if (isRecording) {
            setRecordingSession(prev => [...prev, {
                timestamp: Date.now(),
                fps: data.fps,
                cpuTemp: data.cpu.temp,
                gpuTemp: data.gpus[0]?.temperature || 0
            }]);
        }
    }, [data, isRecording]);

    // Automatic Game Detection
    useEffect(() => {
        if (!data) return;

        if (data.game && data.game !== lastGameName && !isRecording) {
            // Game Started
            console.log("Game detected:", data.game);
            setLastGameName(data.game);
            setRecordingSession([]);
            setIsRecording(true);
        } else if (!data.game && isRecording && lastGameName) {
            // Game Ended
            console.log("Game ended");
            setIsRecording(false);
        }
    }, [data, isRecording, lastGameName]);

    // Stop Recording & Calculate Stats
    useEffect(() => {
        if (!isRecording && recordingSession.length > 5) { // Minimum 5 data points to show summary
            console.log("Processing Session Stats...");

            const count = recordingSession.length;
            const avgFps = recordingSession.reduce((acc, curr) => acc + curr.fps, 0) / count;
            const minFps = Math.min(...recordingSession.map(d => d.fps));
            const maxFps = Math.max(...recordingSession.map(d => d.fps));

            const avgCpuTemp = recordingSession.reduce((acc, curr) => acc + curr.cpuTemp, 0) / count;
            const maxCpuTemp = Math.max(...recordingSession.map(d => d.cpuTemp));

            const avgGpuTemp = recordingSession.reduce((acc, curr) => acc + curr.gpuTemp, 0) / count;
            const maxGpuTemp = Math.max(...recordingSession.map(d => d.gpuTemp));

            const duration = recordingSession[count - 1].timestamp - recordingSession[0].timestamp;

            setSummaryData({
                gameName: lastGameName || "Manual Session",
                duration,
                avgFps, minFps, maxFps,
                avgCpuTemp, maxCpuTemp,
                avgGpuTemp, maxGpuTemp
            });
            setShowSummary(true);
            setLastGameName(""); // Reset
        } else if (!isRecording) {
            // Reset if too short
            setRecordingSession([]);
        }
    }, [isRecording]);

    // Brightness Control Logic (Night Mode)
    useEffect(() => {
        const checkBrightness = async () => {
            const now = new Date();
            const hour = now.getHours();
            const isNight = hour >= 22 || hour < 6;

            if (isNight) {
                try {
                    await ScreenBrightness.setBrightness({ brightness: 0.1 });
                } catch (e) {
                    console.error("Failed to set brightness", e);
                }
            }
        };

        checkBrightness(); // Check on mount
        const interval = setInterval(checkBrightness, 60000); // Check every minute

        return () => clearInterval(interval);
    }, []);

    if (!data) return (
        <div className="flex items-center justify-center h-screen bg-gray-900 text-gray-500 font-mono">
            <div className="text-xl animate-pulse">INITIALIZING SYSTEM...</div>
        </div>
    );

    const { cpu, ram, gpus, system, fps, rtss_connected } = data;

    // Danger Logic
    const isDanger = cpu.temp > 90 || gpus.some(g => g.temperature > 90);

    // Color Logic
    const getTempColor = (temp, threshold = 75) => temp > threshold ? "#ef4444" : "#f97316"; // Red > 75, else Orange
    const getCpuColor = (temp) => temp > 80 ? "#ef4444" : "#f97316";

    // Pulse Logic
    const getPulseClass = (load) => {
        if (load > 90) return "animate-pulse duration-75"; // Fast
        if (load > 70) return "animate-pulse duration-300"; // Medium
        return ""; // Normal
    };

    // FPS Color Logic
    const getFpsColor = (fpsVal) => {
        if (!fpsVal) return "#ef4444"; // Default Red if 0/null
        if (fpsVal < 60) return "#ef4444"; // Red
        if (fpsVal < 120) return "#22c55e"; // Green
        return "#3b82f6"; // Blue
    };

    const fpsColor = getFpsColor(fps);

    const toggleView = (mode) => {
        const newMode = viewMode === mode ? 'default' : mode;
        setViewMode(newMode);
        localStorage.setItem('dashboardViewMode', newMode);
    };

    const handleThemeChange = (newTheme) => {
        setCurrentTheme(newTheme);
        localStorage.setItem('dashboardTheme', newTheme);
        setShowThemeSelector(false);
    };

    return (
        <div className={`h-screen w-screen flex ${theme.colors.bg} ${theme.colors.text} overflow-hidden font-sans selection:bg-orange-500 selection:text-black relative transition-all duration-500 ${isDanger ? 'border-4 border-red-600 shadow-[inset_0_0_50px_rgba(220,38,38,0.5)]' : ''}`}>

            {/* Demo Mode Indicator */}
            {isDemo && (
                <div className="absolute top-4 right-4 z-50 bg-purple-600/20 border border-purple-500/50 text-purple-400 px-3 py-1 rounded-full text-xs font-bold tracking-widest animate-pulse pointer-events-none">
                    DEMO MODE
                </div>
            )}

            {/* LEFT SIDEBAR BUTTONS */}
            <div className="absolute left-4 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-4">
                {/* Connect Mobile Button */}
                <button
                    onClick={() => setShowConnectModal(true)}
                    className="p-3 bg-gray-800/50 hover:bg-gray-700/80 rounded-full text-gray-400 hover:text-white transition-all backdrop-blur-sm border border-gray-700/50"
                    title="Connect Mobile"
                >
                    <Smartphone size={24} />
                </button>

                {/* Record Button */}
                <button
                    onClick={() => setIsRecording(!isRecording)}
                    className={`p-3 rounded-full transition-all backdrop-blur-sm border ${isRecording
                        ? 'bg-red-500/20 hover:bg-red-500/30 text-red-500 border-red-500/50 animate-pulse'
                        : 'bg-gray-800/50 hover:bg-gray-700/80 text-gray-400 hover:text-white border-gray-700/50'
                        }`}
                    title="Record Session"
                >
                    <Circle size={24} fill={isRecording ? "currentColor" : "none"} />
                </button>

                {/* Donation Button */}
                <button
                    onClick={() => setShowDonationModal(true)}
                    className="p-3 bg-gray-800/50 hover:bg-gray-700/80 rounded-full text-red-400 hover:text-red-500 transition-all backdrop-blur-sm border border-gray-700/50 group"
                    title="Support Us"
                >
                    <Heart size={24} className="group-hover:scale-110 transition-transform" />
                </button>

                {/* Theme Button */}
                <button
                    onClick={() => setShowThemeSelector(true)}
                    className="p-3 bg-gray-800/50 hover:bg-gray-700/80 rounded-full text-blue-400 hover:text-blue-500 transition-all backdrop-blur-sm border border-gray-700/50 group"
                    title="Change Theme"
                >
                    <Palette size={24} className="group-hover:scale-110 transition-transform" />
                </button>
            </div>

            {/* CONNECT MOBILE MODAL */}
            {showConnectModal && (
                <div className="absolute inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowConnectModal(false)}>
                    <div className="bg-gray-900 border border-gray-700 rounded-2xl p-8 max-w-sm w-full flex flex-col items-center shadow-2xl" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between w-full items-center mb-6">
                            <h2 className="text-xl font-bold text-white">Connect Mobile</h2>
                            <button onClick={() => setShowConnectModal(false)} className="text-gray-400 hover:text-white">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="bg-white p-4 rounded-xl mb-6">
                            {localIp ? (
                                <QRCode
                                    value={`http://${localIp}:8000`}
                                    size={200}
                                />
                            ) : (
                                <div className="w-[200px] h-[200px] flex items-center justify-center text-black">
                                    Loading IP...
                                </div>
                            )}
                        </div>

                        <p className="text-gray-400 text-center text-sm mb-2">
                            Scan this code with the Antigravity app on your phone.
                        </p>
                        <p className="text-blue-400 font-mono text-xs bg-blue-900/20 px-3 py-1 rounded-full">
                            {localIp ? `http://${localIp}:8000` : "Detecting..."}
                        </p>
                    </div>
                </div>
            )}

            {/* LEFT PANEL: FPS (Green Focus) */}
            <div
                onDoubleClick={() => toggleView('fps')}
                className={`h-full relative flex flex-col items-center justify-center transition-all duration-500 ease-in-out cursor-pointer select-none
                    ${viewMode === 'fps' ? 'w-full bg-black border-none' : viewMode === 'stats' ? 'hidden' : `w-[45%] ${theme.colors.panelBg} border-r-4 ${theme.colors.border}`}`}
            >
                {/* Background Grid */}
                <div className="absolute inset-0 opacity-20" style={{
                    backgroundImage: `linear-gradient(${theme.colors.grid} 1px, transparent 1px), linear-gradient(90deg, ${theme.colors.grid} 1px, transparent 1px)`,
                    backgroundSize: viewMode === 'fps' ? '100px 100px' : '40px 40px',
                    opacity: viewMode === 'fps' ? 0.05 : 0.2
                }}></div>

                {/* Header - Hidden in Focus Mode */}
                {viewMode === 'default' && (
                    <div className="absolute top-4 left-4 flex items-center gap-2 opacity-70 ml-16">
                        <MonitorPlay className="text-green-400 animate-pulse" size={20} />
                        <span className="text-xs font-bold tracking-[0.2em] text-green-400">FPS // LIVE</span>
                    </div>
                )}

                <div className="z-10 flex flex-col items-center justify-center h-full">
                    <div
                        className={`font-black leading-none tracking-tighter transition-all duration-500
                            ${viewMode === 'fps'
                                ? 'text-[35vw]'
                                : 'text-[8rem] lg:text-[12rem]'
                            }`}
                        style={{
                            fontFamily: 'Impact, sans-serif',
                            color: fpsColor,
                            filter: `drop-shadow(0 0 ${viewMode === 'fps' ? '50px' : '25px'} ${fpsColor}66)` // 66 is ~40% opacity
                        }}
                    >
                        {fps || 0}
                    </div>

                    <div className={`flex items-center gap-3 mt-2 ${viewMode === 'fps' ? 'opacity-50' : ''}`}>
                        <div className={`h-2 w-2 rounded-full ${fps > 0 ? 'animate-ping' : ''}`} style={{ backgroundColor: fpsColor }}></div>
                        <div className="text-lg text-gray-400 font-bold tracking-widest uppercase">
                            {!rtss_connected ? "NO SIGNAL" : fps > 0 ? "ACTIVE" : "IDLE"}
                        </div>
                    </div>
                </div>
            </div>

            {/* RIGHT PANEL: STATS (Blue Focus) */}
            <div
                onDoubleClick={() => toggleView('stats')}
                className={`h-full p-4 ${theme.colors.bg} flex flex-col justify-between gap-3 transition-all duration-500 cursor-pointer select-none
                    ${viewMode === 'stats' ? 'w-full items-center justify-center' : viewMode === 'fps' ? 'w-0 p-0 overflow-hidden opacity-0' : 'w-[55%] opacity-100'}`}
            >
                {viewMode === 'stats' ? (
                    // BLUE MODE LAYOUT (Steam Blue #1a9fff)
                    // Layout: RAM (Left) - FPS (Center) - CPU/GPU Stack (Right)
                    <div className="flex flex-row items-center justify-between w-full h-full px-8 lg:px-16">

                        {/* LEFT: RAM */}
                        <div className="flex flex-col items-center justify-center min-w-[150px]">
                            <HardDrive className={`${theme.colors.secondary} mb-4`} size={48} />
                            <span className={`text-6xl font-bold ${theme.colors.text} tracking-tighter`}>{Math.floor(ram.used_gb)}</span>
                            <span className="text-xl text-gray-500 tracking-widest mt-2">GB RAM</span>
                        </div>

                        {/* CENTER: Big Blue FPS & Game Name */}
                        <div className="flex flex-col items-center justify-center">
                            {data.game && (
                                <div className={`${theme.colors.accent} font-bold tracking-[0.2em] text-lg mb-[-2vh] uppercase animate-pulse`}>
                                    {data.game}
                                </div>
                            )}
                            <div
                                className="font-black leading-none tracking-tighter text-[35vw]"
                                style={{
                                    fontFamily: 'Impact, sans-serif',
                                    color: fpsColor,
                                    filter: `drop-shadow(0 0 50px ${fpsColor}99)` // 99 is ~60% opacity
                                }}
                            >
                                {fps || 0}
                            </div>
                        </div>

                        {/* RIGHT: CPU & GPU STACK */}
                        <div className="flex flex-col gap-8 justify-center min-w-[150px]">
                            {/* CPU */}
                            <div className="flex flex-col items-center w-48">
                                <div className="flex items-center gap-2 mb-1">
                                    <Cpu className={`${theme.colors.highlight} ${getPulseClass(cpu.load)}`} size={24} />
                                    <span className="text-sm text-gray-500 tracking-widest">CPU</span>
                                </div>
                                <span className="text-5xl font-bold mb-2" style={{ color: getCpuColor(cpu.temp) }}>{Math.round(cpu.temp)}°</span>
                                {/* Sparkline */}
                                <div className="w-full h-12">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={history}>
                                            <Line type="monotone" dataKey="cpuTemp" stroke={getCpuColor(cpu.temp)} strokeWidth={2} dot={false} isAnimationActive={false} />
                                            <YAxis domain={['dataMin - 5', 'dataMax + 5']} hide />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* GPU (Primary Only) */}
                            {gpus.length > 0 && (() => {
                                const gpu = gpus[0];
                                return (
                                    <div key={gpu.id} className="flex flex-col items-center w-48">
                                        <div className="flex items-center gap-2 mb-1">
                                            <CircuitBoard className={`${theme.colors.highlight} ${getPulseClass(gpu.load)}`} size={24} />
                                            <span className="text-sm text-gray-500 tracking-widest">GPU</span>
                                        </div>
                                        <div className="flex gap-4 items-baseline mb-2">
                                            <span className="text-5xl font-bold" style={{ color: getTempColor(gpu.temperature) }}>{Math.round(gpu.temperature)}°</span>
                                            <span className="text-2xl font-bold text-gray-400">{gpu.load.toFixed(0)}%</span>
                                        </div>
                                        {/* Sparkline */}
                                        <div className="w-full h-12">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <LineChart data={history}>
                                                    <Line type="monotone" dataKey="gpuTemp" stroke={getTempColor(gpu.temperature)} strokeWidth={2} dot={false} isAnimationActive={false} />
                                                    <YAxis domain={['dataMin - 5', 'dataMax + 5']} hide />
                                                </LineChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>
                                );
                            })()}
                        </div>
                    </div>
                ) : (
                    // DEFAULT LAYOUT (Bars)
                    <>
                        {/* RAM MODULE */}
                        <div className={`flex-1 rounded-xl border ${theme.colors.border} p-4 flex flex-col justify-center relative overflow-hidden group hover:border-purple-500/50 transition-all`} style={{ backgroundColor: 'rgba(17, 24, 39, 0.4)' }}>
                            <div className="flex justify-between items-center mb-2">
                                <div className={`flex items-center gap-2 ${theme.colors.secondary}`}>
                                    <HardDrive size={20} />
                                    <span className="font-bold tracking-wider">RAM</span>
                                </div>
                                <div className="text-right">
                                    <span className={`text-2xl font-bold ${theme.colors.text}`}>{Math.round(ram.percent)}%</span>
                                    <span className="text-xs text-gray-500 ml-2">{ram.used_gb}/{ram.total_gb}GB</span>
                                </div>
                            </div>
                            <div className="w-full bg-gray-800 rounded-full h-3 overflow-hidden">
                                <div className={`h-full shadow-[0_0_10px_rgba(168,85,247,0.5)] transition-all duration-500 ${theme.colors.secondaryBg}`} style={{ width: `${ram.percent}%` }}></div>
                            </div>
                        </div>

                        {/* GPU MODULE (Primary Only) */}
                        {gpus.length > 0 && (() => {
                            const gpu = gpus[0]; // Only show primary GPU
                            return (
                                <div key={gpu.id} className={`flex-1 rounded-xl border ${theme.colors.border} p-4 flex flex-col justify-center relative overflow-hidden group hover:border-orange-500/50 transition-all`} style={{ backgroundColor: 'rgba(17, 24, 39, 0.4)' }}>
                                    <div className="flex justify-between items-center mb-2">
                                        <div className={`flex items-center gap-2 ${theme.colors.highlight}`}>
                                            <CircuitBoard size={20} className={getPulseClass(gpu.load)} />
                                            <span className="font-bold tracking-wider">GPU</span>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="text-right">
                                                <span className="text-xs text-gray-500 block">TEMP</span>
                                                <span className="text-xl font-bold transition-colors" style={{ color: getTempColor(gpu.temperature, 75) }}>{Math.round(gpu.temperature)}°C</span>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-xs text-gray-500 block">LOAD</span>
                                                <span className={`text-xl font-bold ${theme.colors.text}`}>{gpu.load.toFixed(0)}%</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="w-full bg-gray-800 rounded-full h-3 overflow-hidden">
                                        <div className={`h-full shadow-[0_0_10px_rgba(249,115,22,0.5)] transition-all duration-500 ${theme.colors.highlightBg}`} style={{ width: `${gpu.load}%` }}></div>
                                    </div>
                                </div>
                            );
                        })()}

                        {/* CPU MODULE */}
                        <div className={`flex-1 rounded-xl border ${theme.colors.border} p-4 flex flex-col justify-center relative overflow-hidden group hover:border-red-500/50 transition-all`} style={{ backgroundColor: 'rgba(17, 24, 39, 0.4)' }}>
                            <div className="flex justify-between items-center mb-2">
                                <div className={`flex items-center gap-2 ${theme.colors.highlight}`}>
                                    <Cpu size={20} className={getPulseClass(cpu.load)} />
                                    <span className="font-bold tracking-wider">CPU</span>
                                </div>
                                <div className="text-right">
                                    <span className="text-xs text-gray-500 block">TEMP</span>
                                    <span className="text-2xl font-bold transition-colors" style={{ color: getCpuColor(cpu.temp) }}>{Math.round(cpu.temp)}°C</span>
                                </div>
                            </div>
                            <div className="w-full bg-gray-800 rounded-full h-3 overflow-hidden">
                                <div
                                    className="h-full transition-all duration-500 shadow-[0_0_10px_rgba(249,115,22,0.5)]"
                                    style={{
                                        width: `${Math.min(cpu.temp, 100)}%`,
                                        backgroundColor: getCpuColor(cpu.temp)
                                    }}
                                ></div>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* MODALS */}
            {showSummary && summaryData && (
                <GameSummary data={summaryData} onClose={() => setShowSummary(false)} />
            )}

            {showDonationModal && (
                <DonationModal onClose={() => setShowDonationModal(false)} />
            )}

            {showThemeSelector && (
                <ThemeSelector currentTheme={currentTheme} onSelectTheme={handleThemeChange} onClose={() => setShowThemeSelector(false)} />
            )}
        </div>
    );
}

