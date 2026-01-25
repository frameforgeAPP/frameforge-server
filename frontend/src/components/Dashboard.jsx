import React, { useState, useEffect, useRef } from 'react';
import { Cpu, CircuitBoard, HardDrive, MonitorPlay, Maximize, Minimize, Clock as ClockIcon, Circle, Smartphone, X, Heart, Palette, ChevronLeft, Sun, Moon, Bell, Home, AlertTriangle, History, Lock as LockIcon, Edit2, Share2, Instagram, Facebook, MessageCircle, Send, Twitter, Gamepad2, Flame, RotateCcw } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer, YAxis } from 'recharts';
import { ScreenBrightness } from '@capacitor-community/screen-brightness';
import { Capacitor } from '@capacitor/core';
import { Share } from '@capacitor/share';
import { toPng } from 'html-to-image';
import QRCode from 'react-qr-code';
import GameSummary from './GameSummary';
import DonationModal from './DonationModal';
import UnlockModal from './UnlockModal';
import ThemeSelector from './ThemeSelector';
import GameNameModal from './GameNameModal';
import SessionHistory from './SessionHistory';
import { saveSession } from '../utils/sessionStorage';
import { t } from '../utils/i18n';
import MatrixRain from './MatrixRain';
import StarsBackground from './StarsBackground';
import EmbersBackground from './EmbersBackground';
import RainBackground from './RainBackground';
import ParticlesBackground from './ParticlesBackground';
import GradientBackground from './GradientBackground';
import PulseBackground from './PulseBackground';
import ColorPickerModal from './ColorPickerModal';
import HardwareSettings from './HardwareSettings';
import Clock from './Clock';
import ConfigGuideModal from './ConfigGuideModal';
import PerformanceCompareModal from './PerformanceCompareModal';

import { themes } from '../utils/themes';
import { getAlertsSettings, triggerVibration, triggerSound } from '../utils/alertsUtils';
import { PremiumManager } from '../utils/PremiumManager';
import { ConfigService } from '../utils/ConfigService';

// Helper to format time (MM:SS)
const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};



export default function Dashboard({ data, toggleFullScreen, isFullscreen, connected, serverAddress, setServerAddress, isDemo, exitDemo, onOpenAlerts, onReturnToConfig, pingServer }) {
    // Check Afterburner Status
    const [showAfterburnerAlert, setShowAfterburnerAlert] = useState(false);

    useEffect(() => {
        if (data && (data.afterburner_status === 'not-found' || data.afterburner_status === 'installed')) {
            setShowAfterburnerAlert(true);
        } else {
            setShowAfterburnerAlert(false);
        }
    }, [data]);

    // Optimize: Fetch Remote Config ONLY ONCE on mount
    useEffect(() => {
        // Sync Remote Config (Check if Free for Everyone)
        PremiumManager.syncRemoteConfig().then(isFree => {
            if (isFree) {
                console.log("App is in Free Mode (Remote Config)");
            }
        });

        // Fetch Remote Premium Features
        ConfigService.getPremiumConfiguration().then(config => {
            setPremiumFeatures(config.premiumFeatures);
        });
    }, []);
    // Initialize viewMode from localStorage or default to 'default'
    const [viewMode, setViewMode] = useState(() => {
        return localStorage.getItem('dashboardViewMode') || 'default';
    });

    const [isRecording, setIsRecording] = useState(false);
    const [showConnectModal, setShowConnectModal] = useState(false);
    const [showDonationModal, setShowDonationModal] = useState(false);
    const [showUnlockModal, setShowUnlockModal] = useState(false);
    const [showHistory, setShowHistory] = useState(false);
    const [showThemeSelector, setShowThemeSelector] = useState(false);
    const [currentTheme, setCurrentTheme] = useState(() => {
        return localStorage.getItem('dashboardTheme') || 'default';
    });
    const [isDarkMode, setIsDarkMode] = useState(() => {
        const saved = localStorage.getItem('dashboardDarkMode');
        return saved !== null ? JSON.parse(saved) : true;
    });
    const [localIp, setLocalIp] = useState("");
    const [premiumFeatures, setPremiumFeatures] = useState([]); // Default locked features (Empty = Free by default)
    const [isPro, setIsPro] = useState(false);

    useEffect(() => {
        const checkPro = () => {
            const status = PremiumManager.isPro();
            setIsPro(status);
        };
        checkPro();
        checkPro();
        // Listen for storage changes in case pro status updates
        window.addEventListener('storage', checkPro);
        window.addEventListener('premium_status_changed', checkPro);

        return () => {
            window.removeEventListener('storage', checkPro);
            window.removeEventListener('premium_status_changed', checkPro);
        };
    }, []);

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
    const [showHardwareSettings, setShowHardwareSettings] = useState(false);
    const [showConfigGuide, setShowConfigGuide] = useState(false);
    const [showCompareModal, setShowCompareModal] = useState(false);
    const [showShareMenu, setShowShareMenu] = useState(false);
    const [previousSession, setPreviousSession] = useState(null);
    const [latency, setLatency] = useState(null);
    const [sessionTimer, setSessionTimer] = useState(0);
    const [fpsSmoothing, setFpsSmoothing] = useState(false);

    // Latency Check Loop
    useEffect(() => {
        if (!connected || !pingServer) return;

        const checkLatency = async () => {
            const ms = await pingServer();
            if (ms >= 0) setLatency(ms);
        };

        checkLatency(); // Initial check
        const interval = setInterval(checkLatency, 2000);
        return () => clearInterval(interval);
    }, [connected, pingServer]);

    const [hardwareLabels, setHardwareLabels] = useState(() => {
        const defaults = { cpu: 'CPU', gpu: 'GPU', ram: 'RAM' };
        try {
            const saved = localStorage.getItem('dashboardHardwareLabels');
            return saved ? { ...defaults, ...JSON.parse(saved) } : defaults;
        } catch (e) {
            return defaults;
        }
    });

    const handleSaveHardwareLabels = (newLabels) => {
        setHardwareLabels(newLabels);
        localStorage.setItem('dashboardHardwareLabels', JSON.stringify(newLabels));
    };

    // Demo Mode Logic (Cycling Themes & Screens)
    useEffect(() => {
        if (!isDemo) {
            // Reset states when exiting demo
            setShowConfigGuide(false);
            setShowThemeSelector(false);
            setShowHistory(false);
            return;
        }

        const demoSteps = [
            { type: 'dashboard', theme: 'default', alert: false },
            { type: 'dashboard', theme: 'matrix', alert: true }, // Simulate alert
            // { type: 'modal', modal: 'config' }, // Removed as requested
            { type: 'modal', modal: 'themes' },
            { type: 'modal', modal: 'history' },
            { type: 'dashboard', theme: 'cyberpunk', alert: false }
        ];

        let currentIndex = 0;

        const interval = setInterval(() => {
            currentIndex = (currentIndex + 1) % demoSteps.length;
            const step = demoSteps[currentIndex];

            // Reset all modals first
            setShowConfigGuide(false);
            setShowThemeSelector(false);
            setShowHistory(false);

            // Reset simulated alerts
            if (!step.alert) {
                setActiveAlerts({ cpu: false, gpu: false, fps: false });
            }

            if (step.type === 'dashboard') {
                setCurrentTheme(step.theme);
                // Toggle RGB border for Matrix
                setGlobalSettings(prev => ({ ...prev, rgbBorder: step.theme === 'matrix' }));

                if (step.alert) {
                    // Simulate high temp alert
                    setActiveAlerts({ cpu: true, gpu: false, fps: false });
                }
            } else if (step.type === 'modal') {
                if (step.modal === 'config') setShowConfigGuide(true);
                if (step.modal === 'themes') setShowThemeSelector(true);
                if (step.modal === 'history') setShowHistory(true);
            }

        }, 4000); // Switch every 4 seconds

        return () => clearInterval(interval);
    }, [isDemo]);

    // Trial Logic
    useEffect(() => {
        const installDate = localStorage.getItem('installDate');
        if (!installDate) {
            localStorage.setItem('installDate', Date.now().toString());
        }
    }, []);

    const checkHistoryAccess = async () => {
        // 1. Check if PRO
        const isPro = await BillingService.checkProStatus();
        if (isPro) {
            setShowHistory(true);
            return;
        }

        // 2. Check Trial (14 days)
        const installDate = parseInt(localStorage.getItem('installDate') || Date.now());
        const daysSinceInstall = (Date.now() - installDate) / (1000 * 60 * 60 * 24);

        if (daysSinceInstall <= 14) {
            setShowHistory(true);
        } else {
            // Trial expired and not PRO
            setShowDonationModal(true);
        }
    };

    // Background Effects State
    const [currentBackground, setCurrentBackground] = useState(() => {
        return localStorage.getItem('dashboardBackground') || 'none';
    });
    const [customBackgroundImage, setCustomBackgroundImage] = useState(() => {
        return localStorage.getItem('dashboardCustomBgImage') || null;
    });
    const [globalSettings, setGlobalSettings] = useState(() => {
        const defaults = { accent: '#3b82f6', text: '#ffffff', bg: '#111827' };
        try {
            const saved = localStorage.getItem('dashboardGlobalSettings');
            return saved ? { ...defaults, ...JSON.parse(saved) } : defaults;
        } catch (e) {
            return defaults;
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

    // Font Classes Map
    const fontClasses = {
        'pixel': 'font-pixel',
        'minecraft': 'font-minecraft',
        'roblox': 'font-roblox',
        'mono': 'font-mono',
        'rounded': 'font-sans',
        'default': ''
    };

    // Helper to extract hex from tailwind class
    const extractColor = (cls) => {
        if (!cls) return '#3b82f6';
        const match = cls.match(/#([a-fA-F0-9]{6}|[a-fA-F0-9]{3})/);
        if (match) return match[0];

        const colors = {
            'blue-500': '#3b82f6',
            'red-500': '#ef4444',
            'green-500': '#22c55e',
            'purple-500': '#a855f7',
            'orange-500': '#f97316',
            'cyan-500': '#06b6d4',
            'yellow-500': '#eab308',
            'white': '#ffffff',
            'black': '#000000'
        };

        for (const [name, hex] of Object.entries(colors)) {
            if (cls.includes(name)) return hex;
        }
        return '#3b82f6';
    };

    const baseTheme = themes[currentTheme] || themes.default;

    // Apply Dark/Light Mode Overrides
    // Apply Dark/Light Mode Overrides AND Global Settings
    // Fix: Only apply global overrides if they are explicitly set and not empty/default
    const hasGlobalBg = globalSettings?.bg && globalSettings.bg !== '#111827'; // Assuming default dark bg
    const hasGlobalText = globalSettings?.text && globalSettings.text !== '#ffffff';
    const hasGlobalAccent = globalSettings?.accent && globalSettings.accent !== '#3b82f6';

    const theme = {
        ...baseTheme,
        colors: {
            ...baseTheme.colors,
            bg: hasGlobalBg ? `bg-[${globalSettings.bg}]` : (isDarkMode ? baseTheme.colors.bg : "bg-gray-50"),
            panelBg: isDarkMode ? baseTheme.colors.panelBg : "bg-white",
            text: hasGlobalText ? `text-[${globalSettings.text}]` : (isDarkMode ? baseTheme.colors.text : "text-gray-950"),
            border: isDarkMode ? baseTheme.colors.border : "border-gray-300",
            grid: isDarkMode ? baseTheme.colors.grid : "rgba(0,0,0,0.15)",
            // Apply Global Accent if set
            accent: hasGlobalAccent ? `text-[${globalSettings.accent}]` : baseTheme.colors.accent,
            accentBg: hasGlobalAccent ? `bg-[${globalSettings.accent}]` : baseTheme.colors.accentBg,
            highlight: hasGlobalAccent ? `text-[${globalSettings.accent}]` : baseTheme.colors.highlight,
            secondary: hasGlobalAccent ? `text-[${globalSettings.accent}]` : baseTheme.colors.secondary,
        }
    };

    // History State for Graphs
    const [history, setHistory] = useState([]);

    useEffect(() => {
        if (!data) return;
        setHistory(prev => {
            const newPoint = {
                timestamp: Date.now(),
                cpuTemp: data.cpu.temp,
                gpuTemp: data.gpus[0]?.temperature || 0
            };
            const newHistory = [...prev, newPoint];
            // Keep last 60 points (approx 1 minute if 1 update/sec)
            if (newHistory.length > 60) return newHistory.slice(newHistory.length - 60);
            return newHistory;
        });
    }, [data]);

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

    // Game Name Edit Logic
    const [showGameNameModal, setShowGameNameModal] = useState(false);
    const [showEditIcon, setShowEditIcon] = useState(false);
    const [editIconTimeout, setEditIconTimeout] = useState(null);

    useEffect(() => {
        if (data && data.game) {
            setShowEditIcon(true);
            if (editIconTimeout) clearTimeout(editIconTimeout);
            const timeout = setTimeout(() => setShowEditIcon(false), 10000);
            setEditIconTimeout(timeout);
        } else {
            setShowEditIcon(false);
        }
        return () => {
            if (editIconTimeout) clearTimeout(editIconTimeout);
        };
    }, [data?.game]);

    const handleGameNameClick = (e) => {
        e.stopPropagation();
        setShowEditIcon(true);
        if (editIconTimeout) clearTimeout(editIconTimeout);
        const timeout = setTimeout(() => setShowEditIcon(false), 10000);
        setEditIconTimeout(timeout);
    };

    const handleSaveGameName = async (executable, newName) => {
        try {
            console.log(`Saving game name: ${executable} -> ${newName} to ${serverAddress}/api/set-game-name`);
            const response = await fetch(`${serverAddress}/api/set-game-name`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ executable, name: newName })
            });

            const data = await response.json();

            if (response.ok && data.success) {
                setShowGameNameModal(false);
                alert(t('saved_success') || "Salvo com sucesso!");
            } else {
                console.error("Server returned error:", data);
                alert((t('error_saving') || "Erro ao salvar: ") + (data.error || "Unknown error"));
            }
        } catch (error) {
            console.error("Failed to save game name", error);
            alert((t('error_saving') || "Erro ao salvar: ") + error.message);
        }
    };

    // Update History & Data Logic
    useEffect(() => {
        if (!data) return;



        // Recording Logic
        if (isRecording) {
            setRecordingSession(prev => [...prev, {
                timestamp: Date.now(),
                fps: data.fps,
                cpuTemp: data.cpu.temp,
                gpuTemp: data.gpus[0]?.temperature || 0
            }]);
        }

        // Sync FPS Smoothing state from server
        if (data.fps_smoothing !== undefined) {
            setFpsSmoothing(data.fps_smoothing);
        }
    }, [data, isRecording]);

    // Alerts Checking & Visual State
    const [activeAlerts, setActiveAlerts] = useState({ cpu: false, gpu: false, fps: false });
    const lastSoundTime = useRef(0);

    useEffect(() => {
        if (!data) return;

        const alertSettings = getAlertsSettings();
        if (!alertSettings.enabled) {
            setActiveAlerts({ cpu: false, gpu: false, fps: false });
            return;
        }

        const cpuTemp = data.cpu?.temp || 0;
        const gpuTemp = data.gpus?.[0]?.temperature || 0;
        const fps = data.fps || 0;

        const newAlerts = {
            cpu: alertSettings.cpuAlertEnabled !== false && cpuTemp > alertSettings.cpuTempLimit,
            gpu: alertSettings.gpuAlertEnabled !== false && gpuTemp > alertSettings.gpuTempLimit,
            fps: alertSettings.fpsAlertEnabled !== false && fps > 5 && fps < alertSettings.fpsLowLimit
        };

        setActiveAlerts(newAlerts);

        // Sound Logic (Throttled to every 1.5s for continuous feel without chaos)
        // Disable sound in Demo Mode
        if (isDemo) return;

        const now = Date.now();
        if (now - lastSoundTime.current > 1500) {
            if (newAlerts.fps) {
                triggerSound('fps');
                if (alertSettings.vibrate) triggerVibration([100, 50, 100]);
                lastSoundTime.current = now;
            } else if (newAlerts.cpu) {
                triggerSound('cpu');
                if (alertSettings.vibrate) triggerVibration([200]);
                lastSoundTime.current = now;
            } else if (newAlerts.gpu) {
                triggerSound('gpu');
                if (alertSettings.vibrate) triggerVibration([200]);
                lastSoundTime.current = now;
            }
        }
    }, [data]);

    // Automatic Game Detection
    useEffect(() => {
        if (!data) return;

        // Start Recording if game is detected and not already recording
        if (data.game && !isRecording) {
            console.log("Game detected:", data.game);
            setLastGameName(data.game);
            setRecordingSession([]);
            setIsRecording(true);
            setShowClock(false); // Auto-switch to monitor view
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

            const sessionData = {
                gameName: lastGameName || t('manual_session'),
                duration,
                avgFps, minFps, maxFps,
                avgCpuTemp, maxCpuTemp,
                avgGpuTemp, maxGpuTemp
            };

            setSummaryData(sessionData);
            saveSession(sessionData); // Auto-save to history
            setShowSummary(true);
            setLastGameName(""); // Reset
        } else if (!isRecording) {
            // Reset if too short
            setRecordingSession([]);
        }
    }, [isRecording]);

    // Share Functionality
    const handleShare = async () => {
        try {
            console.log("Starting share process...");
            setShowShareMenu(false); // Hide menu before capture

            // Wait for menu to hide
            await new Promise(resolve => setTimeout(resolve, 300));

            const element = document.getElementById('dashboard-content');
            if (!element) {
                console.error("Dashboard content element not found!");
                alert("Erro: Elemento de captura não encontrado.");
                return;
            }

            console.log("Capturing canvas with html-to-image...");
            // Use html-to-image which supports modern CSS (like oklch) better than html2canvas
            const base64 = await toPng(element, {
                backgroundColor: '#000000', // Force black background
                pixelRatio: 2, // High quality
                cacheBust: true,
                filter: (node) => !node.hasAttribute?.('data-html2canvas-ignore') // Ignore elements with this attribute
            });

            console.log("Canvas captured, base64 length:", base64.length);

            if (Capacitor.isNativePlatform()) {
                console.log("Sharing via Capacitor...");
                try {
                    // Write to temp file for better compatibility
                    const { Filesystem, Directory } = await import('@capacitor/filesystem');
                    const fileName = `frameforge_share_${Date.now()}.png`;

                    await Filesystem.writeFile({
                        path: fileName,
                        data: base64,
                        directory: Directory.Cache
                    });

                    const uri = await Filesystem.getUri({
                        directory: Directory.Cache,
                        path: fileName
                    });

                    await Share.share({
                        title: 'FrameForge Stats',
                        text: `Game: ${data.game || 'Unknown'} - FPS: ${fps}`,
                        url: uri.uri,
                        dialogTitle: 'Compartilhar Estatísticas'
                    });
                    console.log("Share successful");
                } catch (shareError) {
                    console.error("Share failed:", shareError);
                    alert("Erro ao compartilhar: " + shareError.message);
                }
            } else {
                // Web Fallback
                console.log("Web fallback: downloading image");
                const link = document.createElement('a');
                link.download = `frameforge-${Date.now()}.png`;
                link.href = base64;
                link.click();
            }

        } catch (error) {
            console.error("Critical error in handleShare:", error);
            alert("Erro ao gerar imagem: " + error.message);
        }
    };



    // Brightness Control Logic (Night Mode)
    const originalBrightness = useRef(null);

    useEffect(() => {
        const handleBrightness = async () => {
            try {
                // Save original brightness
                const { brightness } = await ScreenBrightness.getBrightness();
                if (originalBrightness.current === null) {
                    originalBrightness.current = brightness;
                }

                const now = new Date();
                const hour = now.getHours();
                const isNight = hour >= 22 || hour < 6;

                if (isNight) {
                    await ScreenBrightness.setBrightness({ brightness: 0.1 });
                } else if (originalBrightness.current !== null) {
                    // Restore if it's day and we have a saved value
                    await ScreenBrightness.setBrightness({ brightness: originalBrightness.current });
                }
            } catch (e) {
                console.error("Failed to manage brightness", e);
            }
        };

        handleBrightness(); // Check on mount
        const interval = setInterval(handleBrightness, 60000); // Check every minute

        return () => {
            clearInterval(interval);
            // Restore brightness on unmount
            if (originalBrightness.current !== null) {
                ScreenBrightness.setBrightness({ brightness: originalBrightness.current }).catch(console.error);
            }
        };
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
        if (activeAlerts.fps) return "#ef4444";
        if (!fpsVal) return extractColor(theme.colors.danger);
        // Use theme accent color for normal FPS to match theme
        return extractColor(theme.colors.accent);
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
            id="dashboard-content"
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
            className={`h-screen w-screen flex flex-col md:flex-row ${theme.colors.bg} ${theme.colors.text} overflow-hidden font-sans selection:bg-orange-500 selection:text-black relative transition-all duration-500 ${isDanger ? 'border-4 border-red-600 shadow-[inset_0_0_50px_rgba(220,38,38,0.5)]' : ''} ${currentTheme === 'custom' && globalSettings?.customFont ? fontClasses[globalSettings.customFont] : (theme.fontClass || '')}`}
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

            {/* Afterburner Alert Banner - FIXED POSITION CENTERED */}
            {showAfterburnerAlert && !isDemo && (
                <div className="fixed top-16 left-1/2 -translate-x-1/2 z-[60] bg-yellow-600/95 text-white px-6 py-3 rounded-xl shadow-2xl flex items-center gap-4 backdrop-blur-md animate-fade-in border border-yellow-500/50 max-w-[90vw] w-max">
                    <AlertTriangle size={24} className="text-yellow-200 flex-shrink-0" />
                    <span className="text-sm font-bold text-center whitespace-normal leading-relaxed">
                        {t('install_afterburner_rivatuner')}
                    </span>
                    <button
                        onClick={() => setShowAfterburnerAlert(false)}
                        className="p-2 hover:bg-white/20 rounded-full transition-colors flex-shrink-0"
                    >
                        <X size={20} />
                    </button>
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

            {/* Latency Indicator (Top Right, below exit buttons) */}


            {/* Exit Demo Button - ALWAYS VISIBLE when in demo mode (not affected by showControls) */}
            {
                isDemo && onReturnToConfig && (
                    <button
                        onClick={onReturnToConfig}
                        className="absolute top-16 right-4 z-50 bg-red-600/90 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-bold shadow-lg border border-red-500 transition-transform hover:scale-105 active:scale-95 flex items-center gap-2 backdrop-blur-sm"
                        title="Sair do Demo"
                    >
                        <X size={16} />
                        <span className="text-sm">Sair Demo</span>
                    </button>
                )
            }

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

                {/* Restore Purchases Button */}
                {!isPro && (
                    <button
                        onClick={() => {
                            import('../utils/BillingService').then(({ BillingService }) => {
                                BillingService.restore();
                                alert("Verificando compras...");
                            });
                        }}
                        className="p-2 bg-gray-800/50 hover:bg-gray-700/80 rounded-full text-green-400 hover:text-green-500 transition-all backdrop-blur-sm border border-gray-700/50 group"
                        title="Restaurar Compras"
                    >
                        <RotateCcw size={18} className="group-hover:scale-110 transition-transform" />
                    </button>
                )}

                {/* History Button */}
                <button
                    onClick={() => {
                        if (premiumFeatures.includes('history') && !isPro) {
                            setShowUnlockModal(true);
                        } else {
                            setShowHistory(true);
                        }
                    }}
                    className={`p-2 bg-gray-800/50 hover:bg-gray-700/80 rounded-full text-purple-400 hover:text-purple-500 transition-all backdrop-blur-sm border border-gray-700/50 group relative ${premiumFeatures.includes('history') && !isPro ? 'opacity-75 grayscale-[0.5]' : ''}`}
                    title={t('history')}
                >
                    <History size={18} className="group-hover:scale-110 transition-transform" />
                    {premiumFeatures.includes('history') && !isPro && (
                        <div className="absolute -top-1 -right-1 bg-yellow-500 rounded-full p-[2px]">
                            <LockIcon size={8} className="text-black" />
                        </div>
                    )}
                </button>

                {/* Theme Button */}
                <button
                    onClick={() => setShowThemeSelector(true)}
                    className="p-2 bg-gray-800/50 hover:bg-gray-700/80 rounded-full text-blue-400 hover:text-blue-500 transition-all backdrop-blur-sm border border-gray-700/50 group"
                    title={t('change_theme')}
                >
                    <Palette size={18} className="group-hover:scale-110 transition-transform" />
                </button>

                {/* Dark/Light Mode Toggle - MOVED TO THEME SELECTOR */
                /* <button
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
                </button> */}

                {/* Alerts Button */}
                {onOpenAlerts && (
                    <button
                        onClick={() => {
                            if (premiumFeatures.includes('alerts') && !isPro) {
                                setShowUnlockModal(true);
                            } else {
                                onOpenAlerts();
                            }
                        }}
                        className={`p-2 bg-gray-800/50 hover:bg-gray-700/80 rounded-full text-orange-400 hover:text-orange-500 transition-all backdrop-blur-sm border border-gray-700/50 group relative ${premiumFeatures.includes('alerts') && !isPro ? 'opacity-75 grayscale-[0.5]' : ''}`}
                        title={t('alerts_settings')}
                    >
                        <Bell size={18} className="group-hover:scale-110 transition-transform" />
                        {premiumFeatures.includes('alerts') && !isPro && (
                            <div className="absolute -top-1 -right-1 bg-yellow-500 rounded-full p-[2px]">
                                <LockIcon size={8} className="text-black" />
                            </div>
                        )}
                    </button>
                )}


            </div>

            {/* MOBILE MENU (Bottom Bar) - Hidden until tap */}
            <div className={`absolute bottom-4 left-1/2 -translate-x-1/2 z-40 flex gap-4 md:hidden bg-gray-900/80 px-4 py-2 rounded-full backdrop-blur-md border border-gray-700/50 transition-all duration-300 ${showControls ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
                {onReturnToConfig && (
                    <button onClick={onReturnToConfig} className="p-1.5 rounded-full text-cyan-400">
                        <Home size={18} />
                    </button>
                )}
                <button onClick={() => setIsRecording(!isRecording)} className={`p-1.5 rounded-full ${isRecording ? 'text-red-500' : 'text-gray-400'}`}>
                    <Circle size={18} fill={isRecording ? "currentColor" : "none"} />
                </button>
                <button onClick={() => {
                    if (premiumFeatures.includes('history') && !isPro) {
                        setShowUnlockModal(true);
                    } else {
                        setShowHistory(true);
                    }
                }} className={`p-1.5 rounded-full text-purple-400 relative ${premiumFeatures.includes('history') && !isPro ? 'opacity-75 grayscale-[0.5]' : ''}`}>
                    <History size={18} />
                    {premiumFeatures.includes('history') && !isPro && (
                        <div className="absolute -top-1 -right-1 bg-yellow-500 rounded-full p-[2px]">
                            <LockIcon size={8} className="text-black" />
                        </div>
                    )}
                </button>
                <button onClick={() => setShowThemeSelector(true)} className="p-1.5 rounded-full text-blue-400">
                    <Palette size={18} />
                </button>

                {onOpenAlerts && (
                    <button onClick={() => {
                        if (premiumFeatures.includes('alerts') && !isPro) {
                            setShowUnlockModal(true);
                        } else {
                            onOpenAlerts();
                        }
                    }} className={`p-1.5 rounded-full text-orange-400 relative ${premiumFeatures.includes('alerts') && !isPro ? 'opacity-75 grayscale-[0.5]' : ''}`}>
                        <Bell size={18} />
                        {premiumFeatures.includes('alerts') && !isPro && (
                            <div className="absolute -top-1 -right-1 bg-yellow-500 rounded-full p-[2px]">
                                <LockIcon size={8} className="text-black" />
                            </div>
                        )}
                    </button>
                )}

                <button onClick={() => setShowDonationModal(true)} className="p-1.5 rounded-full text-red-400">
                    <Heart size={18} />
                </button>

                {!isPro && (
                    <button onClick={() => {
                        import('../utils/BillingService').then(({ BillingService }) => {
                            BillingService.restore();
                            alert("Verificando compras...");
                        });
                    }} className="p-1.5 rounded-full text-green-400">
                        <RotateCcw size={18} />
                    </button>
                )}
            </div>

            {/* RIGHT SIDE SHARE MENU */}
            <div className={`absolute right-4 top-1/2 -translate-y-1/2 z-40 flex flex-col gap-4 transition-all duration-300 ${showControls ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4 pointer-events-none'}`}>
                <button
                    onClick={() => setShowShareMenu(!showShareMenu)}
                    className="p-3 bg-gray-800/50 hover:bg-gray-700/80 rounded-full text-white transition-all backdrop-blur-sm border border-gray-700/50 shadow-lg"
                >
                    <Share2 size={20} />
                </button>

                {/* Share Options Popup - Fixed positioning to stay on screen */}
                <div className={`absolute right-14 top-1/2 -translate-y-1/2 bg-gray-900/90 backdrop-blur-md border border-gray-700 rounded-2xl p-3 flex flex-col gap-3 transition-all duration-300 origin-right max-h-[80vh] overflow-y-auto ${showShareMenu ? 'scale-100 opacity-100' : 'scale-0 opacity-0 pointer-events-none'}`}>
                    <button onClick={handleShare} className="p-2 hover:bg-white/10 rounded-xl text-pink-500" title="Instagram">
                        <Instagram size={20} />
                    </button>
                    <button onClick={handleShare} className="p-2 hover:bg-white/10 rounded-xl text-blue-600" title="Facebook">
                        <Facebook size={20} />
                    </button>
                    <button onClick={handleShare} className="p-2 hover:bg-white/10 rounded-xl text-indigo-400" title="Discord">
                        <Gamepad2 size={20} />
                    </button>
                    <button onClick={handleShare} className="p-2 hover:bg-white/10 rounded-xl text-black bg-white" title="TikTok">
                        <span className="font-bold text-xs">Tk</span>
                    </button>
                    <button onClick={handleShare} className="p-2 hover:bg-white/10 rounded-xl text-blue-900 bg-white" title="Steam">
                        <MonitorPlay size={20} />
                    </button>
                    <button onClick={handleShare} className="p-2 hover:bg-white/10 rounded-xl text-green-500" title="WhatsApp">
                        <MessageCircle size={20} />
                    </button>
                    <button onClick={handleShare} className="p-2 hover:bg-white/10 rounded-xl text-orange-500" title="Reddit">
                        <span className="font-bold text-xs">Rd</span>
                    </button>
                    <button onClick={handleShare} className="p-2 hover:bg-white/10 rounded-xl text-white" title="X (Twitter)">
                        <Twitter size={20} />
                    </button>
                    <button onClick={handleShare} className="p-2 hover:bg-white/10 rounded-xl text-blue-400" title="Telegram">
                        <Send size={20} />
                    </button>
                </div>
            </div>


            {/* BACK BUTTON (Visible only in FPS/Stats views) */}
            {
                viewMode !== 'default' && (
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
                )
            }

            {/* CONNECT MOBILE MODAL */}
            {
                showConnectModal && (
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
                            <div className="bg-black/50 p-3 rounded-lg border border-gray-800 flex items-center justify-between">
                                <span className="text-xs text-gray-500">Local IP</span>
                                <p className="font-mono text-sm text-green-400">
                                    {localIp ? `http://${localIp}:8000` : "Detecting..."}
                                </p>
                            </div>

                            {/* Latency Display */}
                            <div className="bg-black/50 p-3 rounded-lg border border-gray-800 flex items-center justify-between mt-2">
                                <span className="text-xs text-gray-500">Ping</span>
                                <p className={`font-mono text-sm font-bold ${latency < 50 ? 'text-green-400' : latency < 100 ? 'text-yellow-400' : 'text-red-400'}`}>
                                    {latency !== null ? `${latency} ms` : "--"}
                                </p>
                            </div>
                        </div>
                    </div>
                )
            }

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
                            } ${activeAlerts.fps ? 'animate-pulse text-red-500' : ''}`}
                        style={{
                            fontFamily: 'Impact, sans-serif',
                            color: (!activeAlerts.fps && currentTheme === 'custom' && customColors.fps) ? customColors.fps : fpsColor,
                            filter: `drop-shadow(0 0 ${viewMode === 'fps' ? '50px' : '25px'} ${fpsColor}66)` // 66 is ~40% opacity
                        }}
                        onContextMenu={(e) => { e.preventDefault(); handleLongPress('fps'); }}
                    >
                        {fps || 0}
                    </div>

                    <div className={`flex flex-col items-center gap-1 mt-2 ${viewMode === 'fps' ? 'opacity-50' : ''}`}>
                        {data.game && (
                            <div
                                onClick={handleGameNameClick}
                                className={`text-xl font-bold tracking-widest uppercase ${theme.colors.accent} animate-pulse flex items-center gap-2 cursor-pointer`}
                            >
                                {data.game}
                                {showEditIcon && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setShowGameNameModal(true);
                                        }}
                                        className="p-1 bg-blue-500/20 hover:bg-blue-500/40 rounded-full text-blue-400 transition-colors"
                                    >
                                        <Edit2 size={16} />
                                    </button>
                                )}
                            </div>
                        )}



                        <div className="flex items-center gap-3 mt-1">
                            {/* Green Dot for Comparison */}
                            {previousSession && isRecording && (
                                <button
                                    onClick={(e) => { e.stopPropagation(); setShowCompareModal(true); }}
                                    className="w-3 h-3 rounded-full bg-green-500 shadow-[0_0_10px_#22c55e] animate-pulse hover:scale-150 transition-transform"
                                    title="Ver Comparativo"
                                />
                            )}

                            <div className="text-lg text-gray-400 font-bold tracking-widest uppercase">
                                {!rtss_connected ? (
                                    <button
                                        onClick={(e) => { e.stopPropagation(); setShowConfigGuide(true); }}
                                        className="hover:text-white underline decoration-dashed underline-offset-4 transition-colors"
                                    >
                                        {t('no_signal') || 'Ocioso (Dicas)'}
                                    </button>
                                ) : fps > 0 ? (
                                    // Removed "Active" text as requested
                                    <span></span>
                                ) : (
                                    <button
                                        onClick={(e) => { e.stopPropagation(); setShowConfigGuide(true); }}
                                        className="hover:text-white underline decoration-dashed underline-offset-4 transition-colors"
                                    >
                                        {t('idle') || 'Ocioso (Dicas)'}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div >

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
                        <div
                            className="flex flex-col items-center justify-center min-w-[150px] cursor-pointer hover:scale-105 transition-transform"
                            onContextMenu={(e) => { e.preventDefault(); setShowHardwareSettings(true); }}
                            onClick={() => setShowHardwareSettings(true)}
                            title="Clique para renomear"
                        >
                            <HardDrive className={`${theme.colors.secondary} mb-4`} size={48} />
                            <span className={`text-6xl font-bold ${theme.colors.text} tracking-tighter`}>{Math.floor(ram.used_gb)}</span>
                            <span className="text-xl text-gray-500 tracking-widest mt-2">{hardwareLabels.ram}</span>
                        </div>

                        {/* CENTER: Big Blue FPS & Game Name */}
                        <div className="flex flex-col items-center justify-center">
                            {data.game && (
                                <div
                                    onClick={handleGameNameClick}
                                    className={`${theme.colors.accent} font-bold tracking-[0.2em] text-lg mb-[-2vh] uppercase animate-pulse flex items-center gap-2 cursor-pointer`}
                                >
                                    {data.game}
                                    {showEditIcon && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setShowGameNameModal(true);
                                            }}
                                            className="p-1 bg-blue-500/20 hover:bg-blue-500/40 rounded-full text-blue-400 transition-colors"
                                        >
                                            <Edit2 size={16} />
                                        </button>
                                    )}
                                </div>
                            )}
                            <div
                                className={`font-black leading-none tracking-tighter text-[25vw] ${activeAlerts.fps ? 'animate-pulse text-red-500' : ''}`}
                                style={{
                                    fontFamily: 'Impact, sans-serif',
                                    color: (!activeAlerts.fps && currentTheme === 'custom' && customColors.fps) ? customColors.fps : fpsColor,
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
                            <div
                                className="flex flex-col items-center w-48 transition-transform min-w-[12rem]"
                            >
                                <div className="flex items-center gap-2 mb-1">
                                    <Cpu className={`${theme.colors.highlight} ${getPulseClass(cpu.load)}`} size={24} />
                                    <span className="text-sm text-gray-500 tracking-widest">{hardwareLabels.cpu}</span>
                                </div>
                                <span className={`text-5xl font-bold mb-2 ${activeAlerts.cpu ? 'animate-pulse text-red-500' : ''}`} style={{ color: activeAlerts.cpu ? '#ef4444' : getCpuColor(cpu.temp) }}>{Math.round(cpu.temp)}°</span>
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
                                    <div
                                        key={gpu.id}
                                        className="flex flex-col items-center w-48 transition-transform min-w-[12rem]"
                                    >
                                        <div className="flex items-center gap-2 mb-1">
                                            <CircuitBoard className={`${theme.colors.highlight} ${getPulseClass(gpu.load)}`} size={24} />
                                            <span className="text-sm text-gray-500 tracking-widest">{hardwareLabels.gpu}</span>
                                        </div>
                                        <div className="flex gap-4 items-baseline mb-2">
                                            <span className={`text-5xl font-bold ${activeAlerts.gpu ? 'animate-pulse text-red-500' : ''}`} style={{ color: activeAlerts.gpu ? '#ef4444' : getTempColor(gpu.temperature) }}>{Math.round(gpu.temperature)}°</span>
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
                            <div
                                onClick={handleGameNameClick}
                                className={`w-full text-center py-2 ${theme.colors.accent} font-bold tracking-[0.2em] text-xl uppercase animate-pulse flex items-center justify-center gap-2 cursor-pointer`}
                            >
                                {data.game}
                                {showEditIcon && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setShowGameNameModal(true);
                                        }}
                                        data-html2canvas-ignore="true"
                                        className="p-1 bg-blue-500/20 hover:bg-blue-500/40 rounded-full text-blue-400 transition-colors"
                                    >
                                        <Edit2 size={16} />
                                    </button>
                                )}
                            </div>
                        )}

                        {/* GPU MODULE (Primary Only) - MOVED UP */}
                        {gpus.length > 0 && (() => {
                            const gpu = gpus[0]; // Only show primary GPU
                            return (
                                <div
                                    key={gpu.id}
                                    className={`flex-1 rounded-xl border p-4 flex flex-col justify-center relative overflow-hidden group hover:border-orange-500/50 transition-all ${globalSettings?.rgbBorder ? 'rgb-border-animated' : theme.colors.border} ${activeAlerts.gpu ? 'animate-pulse border-red-500 bg-red-500/10' : ''}`}
                                    style={{ backgroundColor: activeAlerts.gpu ? undefined : 'rgba(17, 24, 39, 0.4)' }}
                                >
                                    <div className="flex justify-between items-center mb-2">
                                        <div className={`flex items-center gap-2 ${theme.colors.highlight}`} style={{ color: currentTheme === 'custom' ? customColors.gpu : undefined }}>
                                            <CircuitBoard size={20} className={getPulseClass(gpu.load)} />
                                            <span className="font-bold tracking-wider">{hardwareLabels.gpu}</span>
                                            {activeAlerts.gpu && <Flame size={20} className="text-red-500 animate-bounce ml-2" />}
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="text-right">
                                                <span className="text-xs text-gray-500 block">{t('temp')}</span>
                                                <span className="text-xl font-bold transition-colors" style={{ color: getTempColor(gpu.temperature, 75) }}>{Math.round(gpu.temperature)}°C</span>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-xs text-gray-500 block">{t('usage')}</span>
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

                        {/* RAM MODULE - MOVED DOWN */}
                        <div
                            className={`flex-1 rounded-xl border p-4 flex flex-col justify-center relative overflow-hidden group hover:border-purple-500/50 transition-all ${globalSettings?.rgbBorder ? 'rgb-border-animated' : theme.colors.border}`}
                            style={{ backgroundColor: 'rgba(17, 24, 39, 0.4)' }}
                        >
                            <div className="flex justify-between items-center mb-2">
                                <div className={`flex items-center gap-2 ${theme.colors.secondary}`} style={{ color: currentTheme === 'custom' ? customColors.ram : undefined }}>
                                    <HardDrive size={20} />
                                    <span className="font-bold tracking-wider">{hardwareLabels.ram}</span>
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

                        {/* CPU MODULE */}
                        <div
                            className={`flex-1 rounded-xl border p-4 flex flex-col justify-center relative overflow-hidden group hover:border-red-500/50 transition-all ${globalSettings?.rgbBorder ? 'rgb-border-animated' : theme.colors.border} ${activeAlerts.cpu ? 'animate-pulse border-red-500 bg-red-500/10' : ''}`}
                            style={{ backgroundColor: activeAlerts.cpu ? undefined : 'rgba(17, 24, 39, 0.4)' }}
                        >
                            <div className="flex justify-between items-center mb-2">
                                <div className={`flex items-center gap-2 ${theme.colors.highlight}`} style={{ color: currentTheme === 'custom' ? customColors.cpu : undefined }}>
                                    <Cpu size={20} className={getPulseClass(cpu.load)} />
                                    <span className="font-bold tracking-wider">{hardwareLabels.cpu}</span>
                                    {activeAlerts.cpu && <Flame size={20} className="text-red-500 animate-bounce ml-2" />}
                                </div>
                                <div className="text-right">
                                    <span className="text-xs text-gray-500 block">{t('temp')}</span>
                                    <span className="text-2xl font-bold transition-colors" style={{ color: getCpuColor(cpu.temp) }}>
                                        {cpu.temp > 0 ? Math.round(cpu.temp) + '°C' : 'N/A'}
                                    </span>
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
            </div >

            {/* MODALS */}
            {
                showSummary && summaryData && (
                    <GameSummary
                        data={summaryData}
                        onClose={() => {
                            setShowSummary(false);
                            // Strictly require true to open clock
                            if (globalSettings?.clockAfterGame === true) {
                                setShowClock(true);
                            }
                        }}
                    />
                )
            }

            {
                showDonationModal && (
                    <DonationModal onClose={() => setShowDonationModal(false)} />
                )
            }

            {
                showUnlockModal && (
                    <UnlockModal onClose={() => setShowUnlockModal(false)} />
                )
            }

            {
                showGameNameModal && (
                    <GameNameModal
                        isOpen={showGameNameModal}
                        onClose={() => setShowGameNameModal(false)}
                        currentName={data.game}
                        executable={data.game_id || data.game}
                        onSave={handleSaveGameName}
                    />
                )
            }

            {
                showThemeSelector && (
                    <ThemeSelector
                        currentTheme={currentTheme}
                        onSelectTheme={handleThemeChange}
                        onClose={() => setShowThemeSelector(false)}
                        currentBackground={currentBackground}
                        onSelectBackground={handleSelectBackground}
                        onUploadBackground={handleUploadBackground}
                        globalSettings={globalSettings}
                        onUpdateGlobalSettings={handleUpdateGlobalSettings}
                        isDarkMode={isDarkMode}
                        onToggleDarkMode={() => {
                            const newMode = !isDarkMode;
                            setIsDarkMode(newMode);
                            localStorage.setItem('dashboardDarkMode', JSON.stringify(newMode));
                        }}
                        onOpenClock={() => {
                            setShowThemeSelector(false);
                            setShowClock(true);
                        }}
                        customColors={customColors}
                        onUpdateCustomColor={(target, color) => {
                            const newColors = { ...customColors, [target]: color };
                            setCustomColors(newColors);
                            localStorage.setItem('dashboardCustomColors', JSON.stringify(newColors));
                        }}
                        hardwareLabels={hardwareLabels}
                        onUpdateHardwareLabel={(key, value) => {
                            const newLabels = { ...hardwareLabels, [key]: value };
                            setHardwareLabels(newLabels);
                            localStorage.setItem('dashboardHardwareLabels', JSON.stringify(newLabels));
                        }}
                    />
                )
            }

            {
                showColorPicker && (
                    <ColorPickerModal
                        initialColor={customColors[colorPickerTarget]}
                        onSave={saveCustomColor}
                        onClose={() => setShowColorPicker(false)}
                        title={`Color: ${colorPickerTarget?.toUpperCase()}`}
                    />
                )
            }



            {
                showHistory && (
                    <SessionHistory
                        isOpen={showHistory}
                        onClose={() => setShowHistory(false)}
                        onSelectSession={(session) => {
                            setSummaryData(session);
                            setShowSummary(true);
                            setShowHistory(false);
                        }}
                        onCompare={(s1, s2) => {
                            // TODO: Implement comparison view
                            console.log("Compare", s1, s2);
                        }}
                    />
                )
            }

            {/* Hardware Settings Modal */}
            {
                showHardwareSettings && (
                    <HardwareSettings
                        initialLabels={hardwareLabels}
                        onSave={handleSaveHardwareLabels}
                        onClose={() => setShowHardwareSettings(false)}
                        fpsSmoothing={fpsSmoothing}
                        onToggleFpsSmoothing={(enabled) => {
                            // Optimistic update
                            setFpsSmoothing(enabled);
                            // Send to server
                            if (serverAddress) {
                                // If we had a direct socket reference we would use it, but here we might need to use a fetch or just rely on the next update
                                // Since we don't have direct socket access here easily without refactoring, we can use the API if available or just assume the socket is handled in App.jsx
                                // Actually, Dashboard receives data but doesn't hold the socket. 
                                // Let's check if we can emit via a prop or if we need to add an API endpoint.
                                // The plan said "Socket: Emit set_fps_smoothing".
                                // Dashboard doesn't seem to have the socket instance passed to it directly, only `connected` and `serverAddress`.
                                // Wait, `pingServer` is passed. 
                                // Let's assume we can use fetch to a new endpoint or we need to pass the socket emit function.
                                // Since I added a socket event listener in the backend, I should probably use the socket.
                                // But `Dashboard.jsx` doesn't have `socket`. 
                                // Let's look at `App.jsx` or where `Dashboard` is used.
                                // Ah, I can use a simple fetch to a new API endpoint if I add one, OR I can try to use the `serverAddress` to emit if I had a socket client here.
                                // Let's add an API endpoint to the backend for consistency with `set-game-name`.

                                // WAIT, I see `setServerAddress` and `pingServer`.
                                // Let's check `App.jsx` to see how `Dashboard` is rendered.
                                // I can't see `App.jsx` right now.
                                // However, `Dashboard` receives `data`.

                                // Let's use a fetch to an API endpoint. It's cleaner than passing socket around if not already there.
                                // I need to add the API endpoint to `frameforge_server.py` first.

                                fetch(`${serverAddress}/api/set-fps-smoothing`, {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ enabled })
                                }).catch(err => console.error("Failed to set smoothing", err));
                            }
                        }}
                    />
                )
            }

            {/* Config Guide Modal */}
            {
                showConfigGuide && (
                    <ConfigGuideModal
                        isOpen={showConfigGuide}
                        onClose={() => setShowConfigGuide(false)}
                    />
                )
            }



            {/* Performance Compare Modal */}
            {
                showCompareModal && (
                    <PerformanceCompareModal
                        isOpen={showCompareModal}
                        onClose={() => setShowCompareModal(false)}
                        currentSession={{
                            gameName: data.game,
                            avgFps: recordingSession.length > 0 ? recordingSession.reduce((a, b) => a + b.fps, 0) / recordingSession.length : fps,
                            maxCpuTemp: recordingSession.length > 0 ? Math.max(...recordingSession.map(d => d.cpuTemp)) : cpu.temp,
                            maxGpuTemp: recordingSession.length > 0 ? Math.max(...recordingSession.map(d => d.gpuTemp)) : (gpus[0]?.temperature || 0)
                        }}
                        previousSession={previousSession}
                    />
                )
            }

            {
                showClock && (
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
                )
            }
        </div >
    );
}

