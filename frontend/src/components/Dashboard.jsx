import React, { useState, useEffect } from 'react';
import { Cpu, CircuitBoard, HardDrive, MonitorPlay, Maximize, Minimize, Clock as ClockIcon, Circle, Smartphone, X, Heart, Palette, ChevronLeft, Sun, Moon, Bell, History, Home } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer, YAxis } from 'recharts';
import { ScreenBrightness } from '@capacitor-community/screen-brightness';
import { Capacitor } from '@capacitor/core';
import QRCode from 'react-qr-code';
import GameSummary from './GameSummary';
import DonationModal from './DonationModal';
import ThemeSelector from './ThemeSelector';
import MatrixRain from './MatrixRain';
import StarsBackground from './StarsBackground';
import EmbersBackground from './EmbersBackground';
import RainBackground from './RainBackground';
import ParticlesBackground from './ParticlesBackground';
import GradientBackground from './GradientBackground';
import PulseBackground from './PulseBackground';
import ColorPickerModal from './ColorPickerModal';
import Clock from './Clock';
import { themes } from '../utils/themes';
import { t } from '../utils/i18n';
import { getAlertsSettings, triggerVibration, triggerSound } from '../utils/alertsUtils';

export default function Dashboard({ data, toggleFullScreen, isFullscreen, connected, serverAddress, setServerAddress, isDemo, exitDemo, onOpenAlerts, onOpenHistory, onReturnToConfig }) {
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
    const [isDarkMode, setIsDarkMode] = useState(() => {
        const saved = localStorage.getItem('dashboardDarkMode');
        return saved !== null ? JSON.parse(saved) : true;
    });
    const [localIp, setLocalIp] = useState("");

    // Custom Theme State
    const [customColors, setCustomColors] = useState(() => {
        try {
            const saved = localStorage.getItem('dashboardCustomColors');
            return saved ? JSON.parse(saved) : {};
        } catch (e) {
            return {};
        }
    });
    const [showColorPicker, setShowColorPicker] = useState(false);
    const [colorPickerTarget, setColorPickerTarget] = useState(null);
    const [showClock, setShowClock] = useState(false);
    const [showControls, setShowControls] = useState(false);

    // Background Effects State
    const [currentBackground, setCurrentBackground] = useState(() => {
        return localStorage.getItem('dashboardBackground') || 'none';
    });
    const [customBackgroundImage, setCustomBackgroundImage] = useState(() => {
        return localStorage.getItem('dashboardCustomBgImage') || null;
    });
    const [globalSettings, setGlobalSettings] = useState(() => {
        try {
            const saved = localStorage.getItem('dashboardGlobalSettings');
            return saved ? JSON.parse(saved) : { accent: '#3b82f6', text: '#ffffff', bg: '#111827' };
        } catch (e) {
            return { accent: '#3b82f6', text: '#ffffff', bg: '#111827' };
        }
    });

    const handleSelectBackground = (bgId) => {
        setCurrentBackground(bgId);
        localStorage.setItem('dashboardBackground', bgId);
    };

    const handleUploadBackground = (imageData) => {
        setCustomBackgroundImage(imageData);
        localStorage.setItem('dashboardCustomBgImage', imageData);
    };

    const handleUpdateGlobalSettings = (key, value) => {
        const newSettings = { ...globalSettings, [key]: value };
        setGlobalSettings(newSettings);
        localStorage.setItem('dashboardGlobalSettings', JSON.stringify(newSettings));
    };

    const handleLongPress = (target) => {
        if (currentTheme === 'custom') {
            setColorPickerTarget(target);
            setShowColorPicker(true);
        }
    };

    const saveCustomColor = (color) => {
        const newColors = { ...customColors, [colorPickerTarget]: color };
        setCustomColors(newColors);
        localStorage.setItem('dashboardCustomColors', JSON.stringify(newColors));
        setShowColorPicker(false);
    };

    const baseTheme = themes[currentTheme] || themes.default;

    // Apply Dark/Light Mode Overrides
    const theme = {
        ...baseTheme,
        colors: {
            ...baseTheme.colors,
            bg: isDarkMode ? baseTheme.colors.bg : "bg-gray-100",
            panelBg: isDarkMode ? baseTheme.colors.panelBg : "bg-white",
            text: isDarkMode ? baseTheme.colors.text : "text-gray-900",
            border: isDarkMode ? baseTheme.colors.border : "border-gray-200",
            grid: isDarkMode ? baseTheme.colors.grid : "rgba(0,0,0,0.1)"
        }
    };

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

    // Alerts Checking
    const [lastAlertTime, setLastAlertTime] = useState(0);
    useEffect(() => {
        if (!data) return;

        const alertSettings = getAlertsSettings();
        if (!alertSettings.enabled) return;

        const now = Date.now();
        const cooldownMs = (alertSettings.cooldownSeconds || 30) * 1000;

        // Check if we're still in cooldown
        if (now - lastAlertTime < cooldownMs) return;

        const cpuTemp = data.cpu?.temp || 0;
        const gpuTemp = data.gpus?.[0]?.temperature || 0;
        const fps = data.fps || 0;

        let shouldAlert = false;

        // Check thresholds
        if (cpuTemp > alertSettings.cpuTempLimit) {
            console.log('Alert: CPU temp exceeded', cpuTemp, '>', alertSettings.cpuTempLimit);
            shouldAlert = true;
        }
        if (gpuTemp > alertSettings.gpuTempLimit) {
            console.log('Alert: GPU temp exceeded', gpuTemp, '>', alertSettings.gpuTempLimit);
            shouldAlert = true;
        }
        if (fps > 0 && fps < alertSettings.fpsLowLimit) {
            console.log('Alert: FPS too low', fps, '<', alertSettings.fpsLowLimit);
            shouldAlert = true;
        }

        if (shouldAlert) {
            setLastAlertTime(now);
            if (alertSettings.vibrate) {
                triggerVibration([200, 100, 200, 100, 200]);
            }
            if (alertSettings.sound) {
                triggerSound();
            }
        }
    }, [data, lastAlertTime]);

    // Automatic Game Detection
    useEffect(() => {
        if (!data) return;

        // Start Recording if game is detected and not already recording
        if (data.game && !isRecording) {
            console.log("Game detected:", data.game);
            setLastGameName(data.game);
            setRecordingSession([]);
            setIsRecording(true);
        }
        // Stop Recording if game is no longer detected and currently recording
        else if (!data.game && isRecording) {
            console.log("Game ended");
            setIsRecording(false);
        }
    }, [data, isRecording]);

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
                gameName: lastGameName || t('manual_session'),
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

    // Auto-hide controls after 4 seconds
    useEffect(() => {
        if (showControls) {
            const timer = setTimeout(() => {
                setShowControls(false);
            }, 4000);
            return () => clearTimeout(timer);
        }
    }, [showControls]);

    if (!data) return (
        <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
            {/* Animated Background Glow */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-pulse" />
                <div className="absolute top-1/3 left-1/3 w-64 h-64 bg-purple-500/10 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '1s' }} />
            </div>

            {/* Logo */}
            <div className="relative z-10 mb-8">
                <div className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 tracking-tighter">
                    FF
                </div>
                <div className="absolute -inset-4 bg-cyan-500/20 rounded-full blur-xl animate-pulse" />
            </div>

            {/* Spinner */}
            <div className="relative z-10 mb-6">
                <div className="w-16 h-16 border-4 border-gray-700 border-t-cyan-500 rounded-full animate-spin" />
            </div>

            {/* Text */}
            <div className="relative z-10 text-center">
                <div className="text-xl font-bold text-white mb-2 tracking-widest uppercase">
                    {t('initializing')}
                </div>
                <div className="text-sm text-gray-500 animate-pulse">
                    {connected ? 'Aguardando dados do servidor...' : 'Conectando ao servidor...'}
                </div>
            </div>

            {/* Dots Animation */}
            <div className="relative z-10 flex gap-2 mt-8">
                <div className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
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
        <div
            onClick={(e) => {
                // Toggle controls on tap (but not on buttons or modals)
                const isButton = e.target.closest('button');
                const isModal = e.target.closest('[class*="modal"]') || e.target.closest('[class*="z-[100]"]');
                if (!isButton && !isModal) {
                    setShowControls(prev => !prev);
                }
            }}
            onContextMenu={(e) => {
                if (e.target === e.currentTarget) {
                    e.preventDefault();
                    handleLongPress('bg');
                }
            }}
            className={`h-screen w-screen flex flex-col md:flex-row ${theme.colors.bg} ${theme.colors.text} overflow-hidden font-sans selection:bg-orange-500 selection:text-black relative transition-all duration-500 ${isDanger ? 'border-4 border-red-600 shadow-[inset_0_0_50px_rgba(220,38,38,0.5)]' : ''}`}
            style={{ backgroundColor: currentTheme === 'custom' ? customColors.bg : undefined }}
        >

            {/* Background Effects */}
            {(currentBackground === 'matrix' || currentTheme === 'matrix') && <MatrixRain />}
            {currentBackground === 'stars' && <StarsBackground />}
            {currentBackground === 'embers' && <EmbersBackground />}
            {currentBackground === 'rain' && <RainBackground />}
            {currentBackground === 'particles' && <ParticlesBackground />}
            {currentBackground === 'gradient' && <GradientBackground />}
            {currentBackground === 'pulse' && <PulseBackground />}
            {currentBackground === 'custom' && customBackgroundImage && (
                <div
                    className="fixed inset-0 z-0 bg-cover bg-center opacity-30"
                    style={{ backgroundImage: `url(${customBackgroundImage})` }}
                />
            )}

            {/* Server Disconnection Warning */}
            {!connected && !isDemo && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 animate-pulse">
                    <div className="bg-red-600/90 backdrop-blur-sm border border-red-500 text-white px-4 py-3 rounded-xl shadow-lg shadow-red-900/50 flex items-center gap-3">
                        <div className="w-3 h-3 bg-red-300 rounded-full animate-ping" />
                        <div className="flex flex-col">
                            <span className="font-bold text-sm">⚠️ Servidor Desconectado</span>
                            <span className="text-xs text-red-200">Abra o FrameForgeServer.exe no PC</span>
                        </div>
                    </div>
                </div>
            )}

            {/* TOP RIGHT SYSTEM ACTIONS (Exit Demo & Exit Fullscreen) */}
            <div className="absolute top-4 right-4 z-50 flex flex-col items-end gap-2">
                {/* Demo Mode Indicator */}
                {isDemo && (
                    <div className="bg-purple-600/20 border border-purple-500/50 text-purple-400 px-3 py-1 rounded-full text-xs font-bold tracking-widest animate-pulse pointer-events-none mb-1">
                        DEMO MODE
                    </div>
                )}

                {/* Exit Fullscreen Button (Universal) */}
                {isFullscreen && (
                    <button
                        onClick={(e) => toggleFullScreen(e)}
                        className="bg-gray-800/80 hover:bg-gray-700 text-gray-200 px-4 py-2 rounded-lg font-bold shadow-lg border border-gray-600 transition-transform hover:scale-105 active:scale-95 flex items-center gap-2 backdrop-blur-sm"
                        title={t('exit_fullscreen')}
                    >
                        <Minimize size={16} />
                        {t('exit_fullscreen')}
                    </button>
                )}
            </div>

            {/* Exit Demo Button - ALWAYS VISIBLE when in demo mode (not affected by showControls) */}
            {isDemo && onReturnToConfig && (
                <button
                    onClick={onReturnToConfig}
                    className="absolute top-16 right-4 z-50 bg-red-600/90 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-bold shadow-lg border border-red-500 transition-transform hover:scale-105 active:scale-95 flex items-center gap-2 backdrop-blur-sm"
                    title="Sair do Demo"
                >
                    <X size={16} />
                    <span className="text-sm">Sair Demo</span>
                </button>
            )}

            {/* LEFT SIDEBAR BUTTONS - Hidden until tap */}
            <div className={`absolute left-3 top-1/2 -translate-y-1/2 z-40 flex flex-col gap-2 hidden md:flex transition-all duration-300 ${showControls ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4 pointer-events-none'}`}>
                {/* Back to Config Button */}
                {onReturnToConfig && (
                    <button
                        onClick={onReturnToConfig}
                        className="p-2 bg-gray-800/50 hover:bg-gray-700/80 rounded-full text-cyan-400 hover:text-cyan-300 transition-all backdrop-blur-sm border border-cyan-700/50 group"
                        title="Voltar à Configuração"
                    >
                        <Home size={18} className="group-hover:scale-110 transition-transform" />
                    </button>
                )}

                {/* Connect Mobile Button - Only show on Web/PC */}
                {Capacitor.getPlatform() === 'web' && (
                    <button
                        onClick={() => setShowConnectModal(true)}
                        className="p-2 bg-gray-800/50 hover:bg-gray-700/80 rounded-full text-gray-400 hover:text-white transition-all backdrop-blur-sm border border-gray-700/50"
                        title={t('connect_mobile')}
                    >
                        <Smartphone size={18} />
                    </button>
                )}

                {/* Record Button */}
                <button
                    onClick={() => setIsRecording(!isRecording)}
                    className={`p-2 rounded-full transition-all backdrop-blur-sm border ${isRecording
                        ? 'bg-red-500/20 hover:bg-red-500/30 text-red-500 border-red-500/50 animate-pulse'
                        : 'bg-gray-800/50 hover:bg-gray-700/80 text-gray-400 hover:text-white border-gray-700/50'
                        }`}
                    title={t('record_session')}
                >
                    <Circle size={18} fill={isRecording ? "currentColor" : "none"} />
                </button>

                {/* Donation Button */}
                <button
                    onClick={() => setShowDonationModal(true)}
                    className="p-2 bg-gray-800/50 hover:bg-gray-700/80 rounded-full text-red-400 hover:text-red-500 transition-all backdrop-blur-sm border border-gray-700/50 group"
                    title={t('support_us')}
                >
                    <Heart size={18} className="group-hover:scale-110 transition-transform" />
                </button>

                {/* Theme Button */}
                <button
                    onClick={() => setShowThemeSelector(true)}
                    className="p-2 bg-gray-800/50 hover:bg-gray-700/80 rounded-full text-blue-400 hover:text-blue-500 transition-all backdrop-blur-sm border border-gray-700/50 group"
                    title={t('change_theme')}
                >
                    <Palette size={18} className="group-hover:scale-110 transition-transform" />
                </button>

                {/* Dark/Light Mode Toggle */}
                <button
                    onClick={() => {
                        const newMode = !isDarkMode;
                        setIsDarkMode(newMode);
                        localStorage.setItem('dashboardDarkMode', JSON.stringify(newMode));
                    }}
                    className="p-2 bg-gray-800/50 hover:bg-gray-700/80 rounded-full text-yellow-400 hover:text-yellow-500 transition-all backdrop-blur-sm border border-gray-700/50 group"
                    title="Toggle Dark/Light Mode"
                >
                    {isDarkMode ? (
                        <Sun size={18} className="group-hover:scale-110 transition-transform" />
                    ) : (
                        <Moon size={18} className="group-hover:scale-110 transition-transform" />
                    )}
                </button>

                {/* Alerts Button */}
                {onOpenAlerts && (
                    <button
                        onClick={onOpenAlerts}
                        className="p-2 bg-gray-800/50 hover:bg-gray-700/80 rounded-full text-orange-400 hover:text-orange-500 transition-all backdrop-blur-sm border border-gray-700/50 group"
                        title={t('alerts_settings')}
                    >
                        <Bell size={18} className="group-hover:scale-110 transition-transform" />
                    </button>
                )}

                {/* History Button */}
                {onOpenHistory && (
                    <button
                        onClick={onOpenHistory}
                        className="p-2 bg-gray-800/50 hover:bg-gray-700/80 rounded-full text-purple-400 hover:text-purple-500 transition-all backdrop-blur-sm border border-gray-700/50 group"
                        title={t('session_history')}
                    >
                        <History size={18} className="group-hover:scale-110 transition-transform" />
                    </button>
                )}
            </div>

            {/* MOBILE MENU (Bottom Bar) - Hidden until tap */}
            <div className={`absolute bottom-4 left-1/2 -translate-x-1/2 z-40 flex gap-2 md:hidden bg-gray-900/80 px-3 py-1.5 rounded-full backdrop-blur-md border border-gray-700/50 transition-all duration-300 ${showControls ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
                {onReturnToConfig && (
                    <button onClick={onReturnToConfig} className="p-1.5 rounded-full text-cyan-400">
                        <Home size={18} />
                    </button>
                )}
                <button onClick={() => setIsRecording(!isRecording)} className={`p-1.5 rounded-full ${isRecording ? 'text-red-500' : 'text-gray-400'}`}>
                    <Circle size={18} fill={isRecording ? "currentColor" : "none"} />
                </button>
                <button onClick={() => setShowThemeSelector(true)} className="p-1.5 rounded-full text-blue-400">
                    <Palette size={18} />
                </button>
                <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-1.5 rounded-full text-yellow-400">
                    {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
                </button>
                {onOpenAlerts && (
                    <button onClick={onOpenAlerts} className="p-1.5 rounded-full text-orange-400">
                        <Bell size={18} />
                    </button>
                )}
                {onOpenHistory && (
                    <button onClick={onOpenHistory} className="p-1.5 rounded-full text-purple-400">
                        <History size={18} />
                    </button>
                )}
                <button onClick={() => setShowDonationModal(true)} className="p-1.5 rounded-full text-red-400">
                    <Heart size={18} />
                </button>
            </div>


            {/* BACK BUTTON (Visible only in FPS/Stats views) */}
            {viewMode !== 'default' && (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        toggleView('default');
                    }}
                    className="absolute top-4 left-4 z-50 p-3 bg-gray-800/50 hover:bg-gray-700/80 rounded-full text-gray-400 hover:text-white transition-all backdrop-blur-sm border border-gray-700/50 group"
                    title={t('back_dashboard')}
                >
                    <ChevronLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
                </button>
            )}

            {/* CONNECT MOBILE MODAL */}
            {showConnectModal && (
                <div className="absolute inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowConnectModal(false)}>
                    <div className="bg-gray-900 border border-gray-700 rounded-2xl p-8 max-w-sm w-full flex flex-col items-center shadow-2xl" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between w-full items-center mb-6">
                            <h2 className="text-xl font-bold text-white">{t('connect_mobile')}</h2>
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
                            {t('scan_instruction')}
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
                className={`relative flex flex-col items-center justify-center transition-all duration-500 ease-in-out cursor-pointer select-none md:pl-0
                    ${viewMode === 'fps' ? `w-full h-full ${theme.colors.bg} border-none` : viewMode === 'stats' ? 'hidden' : `w-full h-[40%] md:w-[45%] md:h-full ${theme.colors.panelBg} border-b-4 md:border-b-0 md:border-r-4 ${theme.colors.border}`}`}
            >
                {/* Background Grid */}
                <div className="absolute inset-0 opacity-20" style={{
                    backgroundImage: `linear-gradient(${theme.colors.grid} 1px, transparent 1px), linear-gradient(90deg, ${theme.colors.grid} 1px, transparent 1px)`,
                    backgroundSize: viewMode === 'fps' ? '100px 100px' : '40px 40px',
                    opacity: viewMode === 'fps' ? 0.05 : 0.2
                }}></div>

                {/* Header - Hidden in Focus Mode */}
                {viewMode === 'default' && (
                    <div className="absolute top-4 left-4 flex items-center gap-2 opacity-70 md:ml-16">
                        <MonitorPlay className="text-green-400 animate-pulse" size={20} />
                        <span className="text-xs font-bold tracking-[0.2em] text-green-400">FrameForge</span>
                        <button
                            onClick={(e) => { e.stopPropagation(); setShowClock(true); }}
                            className="ml-2 text-green-400/50 hover:text-green-400 transition-colors"
                            title={t('open_clock')}
                        >
                            <ClockIcon size={16} />
                        </button>
                    </div>
                )}

                <div className="z-10 flex flex-col items-center justify-center h-full md:pl-0">
                    <div
                        className={`font-black leading-none tracking-tighter transition-all duration-500
                            ${viewMode === 'fps'
                                ? 'text-[35vw]'
                                : 'text-[25vw] md:text-[8rem] lg:text-[12rem]'
                            }`}
                        style={{
                            fontFamily: 'Impact, sans-serif',
                            color: currentTheme === 'custom' && customColors.fps ? customColors.fps : fpsColor,
                            filter: `drop-shadow(0 0 ${viewMode === 'fps' ? '50px' : '25px'} ${fpsColor}66)` // 66 is ~40% opacity
                        }}
                        onContextMenu={(e) => { e.preventDefault(); handleLongPress('fps'); }}
                    >
                        {fps || 0}
                    </div>

                    <div className={`flex flex-col items-center gap-1 mt-2 ${viewMode === 'fps' ? 'opacity-50' : ''}`}>
                        {data.game && (
                            <div className={`text-xl font-bold tracking-widest uppercase ${theme.colors.accent} animate-pulse`}>
                                {data.game}
                            </div>
                        )}
                        <div className="flex items-center gap-3">
                            <div className={`h-2 w-2 rounded-full ${fps > 0 ? 'animate-ping' : ''}`} style={{ backgroundColor: fpsColor }}></div>
                            <div className="text-lg text-gray-400 font-bold tracking-widest uppercase">
                                {!rtss_connected ? t('no_signal') : fps > 0 ? t('active') : t('idle')}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* RIGHT PANEL: STATS (Blue Focus) */}
            <div
                onDoubleClick={() => toggleView('stats')}
                className={`p-4 ${theme.colors.bg} flex flex-col justify-between gap-3 transition-all duration-500 cursor-pointer select-none md:pl-4
                    ${viewMode === 'stats' ? 'w-full h-full items-center justify-center' : viewMode === 'fps' ? 'w-0 p-0 overflow-hidden opacity-0' : 'w-full h-[60%] md:w-[55%] md:h-full opacity-100'}`}
            >
                {viewMode === 'stats' ? (
                    // BLUE MODE LAYOUT (Steam Blue #1a9fff)
                    // Layout: RAM (Left) - FPS (Center) - CPU/GPU Stack (Right)
                    <div className="flex flex-col md:flex-row items-center justify-between w-full h-full px-4 md:px-16 gap-8 md:gap-0 overflow-y-auto">

                        {/* LEFT: RAM */}
                        <div className="flex flex-col items-center justify-center min-w-[150px]">
                            <HardDrive className={`${theme.colors.secondary} mb-4`} size={48} />
                            <span className={`text-6xl font-bold ${theme.colors.text} tracking-tighter`}>{Math.floor(ram.used_gb)}</span>
                            <span className="text-xl text-gray-500 tracking-widest mt-2">{t('gb_ram')}</span>
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
                                    color: currentTheme === 'custom' && customColors.fps ? customColors.fps : fpsColor,
                                    filter: `drop-shadow(0 0 50px ${fpsColor}99)` // 99 is ~60% opacity
                                }}
                                onContextMenu={(e) => { e.preventDefault(); handleLongPress('fps'); }}
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
                                    <span className="text-sm text-gray-500 tracking-widest">{t('cpu')}</span>
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
                        {/* Game Name Header */}
                        {data.game && (
                            <div className={`w-full text-center py-2 ${theme.colors.accent} font-bold tracking-[0.2em] text-xl uppercase animate-pulse`}>
                                {data.game}
                            </div>
                        )}

                        {/* RAM MODULE */}
                        <div
                            onContextMenu={(e) => { e.preventDefault(); handleLongPress('ram'); }}
                            className={`flex-1 rounded-xl border p-4 flex flex-col justify-center relative overflow-hidden group hover:border-purple-500/50 transition-all cursor-pointer ${globalSettings?.rgbBorder ? 'rgb-border-animated' : theme.colors.border}`}
                            style={{ backgroundColor: 'rgba(17, 24, 39, 0.4)' }}
                        >
                            <div className="flex justify-between items-center mb-2">
                                <div className={`flex items-center gap-2 ${theme.colors.secondary}`} style={{ color: currentTheme === 'custom' ? customColors.ram : undefined }}>
                                    <HardDrive size={20} />
                                    <span className="font-bold tracking-wider">{t('ram')}</span>
                                </div>
                                <div className="text-right">
                                    <span className={`text-2xl font-bold ${theme.colors.text}`}>{Math.round(ram.percent)}%</span>
                                    <span className="text-xs text-gray-500 ml-2">{ram.used_gb}/{ram.total_gb}GB</span>
                                </div>
                            </div>
                            <div className="w-full bg-gray-800 rounded-full h-3 overflow-hidden">
                                <div
                                    className={`h-full shadow-[0_0_10px_rgba(168,85,247,0.5)] transition-all duration-500 ${theme.colors.secondaryBg}`}
                                    style={{
                                        width: `${ram.percent}%`,
                                        backgroundColor: currentTheme === 'custom' ? customColors.ram : undefined
                                    }}
                                ></div>
                            </div>
                        </div>

                        {/* GPU MODULE (Primary Only) */}
                        {gpus.length > 0 && (() => {
                            const gpu = gpus[0]; // Only show primary GPU
                            return (
                                <div
                                    key={gpu.id}
                                    onContextMenu={(e) => { e.preventDefault(); handleLongPress('gpu'); }}
                                    className={`flex-1 rounded-xl border p-4 flex flex-col justify-center relative overflow-hidden group hover:border-orange-500/50 transition-all cursor-pointer ${globalSettings?.rgbBorder ? 'rgb-border-animated' : theme.colors.border}`}
                                    style={{ backgroundColor: 'rgba(17, 24, 39, 0.4)' }}
                                >
                                    <div className="flex justify-between items-center mb-2">
                                        <div className={`flex items-center gap-2 ${theme.colors.highlight}`} style={{ color: currentTheme === 'custom' ? customColors.gpu : undefined }}>
                                            <CircuitBoard size={20} className={getPulseClass(gpu.load)} />
                                            <span className="font-bold tracking-wider">{t('gpu')}</span>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="text-right">
                                                <span className="text-xs text-gray-500 block">{t('temp')}</span>
                                                <span className="text-xl font-bold transition-colors" style={{ color: getTempColor(gpu.temperature, 75) }}>{Math.round(gpu.temperature)}°C</span>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-xs text-gray-500 block">{t('load')}</span>
                                                <span className={`text-xl font-bold ${theme.colors.text}`}>{gpu.load.toFixed(0)}%</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="w-full bg-gray-800 rounded-full h-3 overflow-hidden">
                                        <div
                                            className={`h-full shadow-[0_0_10px_rgba(249,115,22,0.5)] transition-all duration-500 ${theme.colors.highlightBg}`}
                                            style={{
                                                width: `${gpu.load}%`,
                                                backgroundColor: currentTheme === 'custom' ? customColors.gpu : undefined
                                            }}
                                        ></div>
                                    </div>
                                </div>
                            );
                        })()}

                        {/* CPU MODULE */}
                        <div
                            onContextMenu={(e) => { e.preventDefault(); handleLongPress('cpu'); }}
                            className={`flex-1 rounded-xl border p-4 flex flex-col justify-center relative overflow-hidden group hover:border-red-500/50 transition-all cursor-pointer ${globalSettings?.rgbBorder ? 'rgb-border-animated' : theme.colors.border}`}
                            style={{ backgroundColor: 'rgba(17, 24, 39, 0.4)' }}
                        >
                            <div className="flex justify-between items-center mb-2">
                                <div className={`flex items-center gap-2 ${theme.colors.highlight}`} style={{ color: currentTheme === 'custom' ? customColors.cpu : undefined }}>
                                    <Cpu size={20} className={getPulseClass(cpu.load)} />
                                    <span className="font-bold tracking-wider">{t('cpu')}</span>
                                </div>
                                <div className="text-right">
                                    <span className="text-xs text-gray-500 block">{t('temp')}</span>
                                    <span className="text-2xl font-bold transition-colors" style={{ color: getCpuColor(cpu.temp) }}>{Math.round(cpu.temp)}°C</span>
                                </div>
                            </div>
                            <div className="w-full bg-gray-800 rounded-full h-3 overflow-hidden">
                                <div
                                    className="h-full transition-all duration-500 shadow-[0_0_10px_rgba(249,115,22,0.5)]"
                                    style={{
                                        width: `${Math.min(cpu.temp, 100)}%`,
                                        backgroundColor: currentTheme === 'custom' ? customColors.cpu : getCpuColor(cpu.temp)
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
                <ThemeSelector
                    currentTheme={currentTheme}
                    onSelectTheme={handleThemeChange}
                    onClose={() => setShowThemeSelector(false)}
                    currentBackground={currentBackground}
                    onSelectBackground={handleSelectBackground}
                    onUploadBackground={handleUploadBackground}
                    globalSettings={globalSettings}
                    onUpdateGlobalSettings={handleUpdateGlobalSettings}
                />
            )}

            {showColorPicker && (
                <ColorPickerModal
                    initialColor={customColors[colorPickerTarget]}
                    onSave={saveCustomColor}
                    onClose={() => setShowColorPicker(false)}
                    title={`Color: ${colorPickerTarget?.toUpperCase()}`}
                />
            )}

            {showClock && (
                <div className="absolute inset-0 z-[100]">
                    <Clock
                        toggleFullScreen={toggleFullScreen}
                        serverAddress={serverAddress}
                        setServerAddress={setServerAddress}
                        onDismiss={() => setShowClock(false)}
                        isDemo={isDemo}
                        onExitDemo={onReturnToConfig}
                    />
                </div>
            )}
        </div>
    );
}

