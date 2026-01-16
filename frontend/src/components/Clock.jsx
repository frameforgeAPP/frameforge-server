import React, { useState, useEffect, useRef } from 'react';
import { Settings, ArrowLeft, Sun, X, Palette } from 'lucide-react';
import { ScreenBrightness } from '@capacitor-community/screen-brightness';

export default function Clock({ toggleFullScreen, serverAddress, setServerAddress, onDismiss, isDemo, onExitDemo }) {
    const [time, setTime] = useState(new Date());
    const [showSettings, setShowSettings] = useState(false);
    const [showControls, setShowControls] = useState(false);
    const [tempAddress, setTempAddress] = useState(serverAddress || '');
    const [clockColor, setClockColor] = useState(localStorage.getItem('clockColor') || '#ffffff');
    const [tempColor, setTempColor] = useState(clockColor);
    const [backgroundColor, setBackgroundColor] = useState(localStorage.getItem('clockBgColor') || '#000000');
    const [tempBgColor, setTempBgColor] = useState(backgroundColor);
    const [brightness, setBrightness] = useState(1);
    const [showBgColorPicker, setShowBgColorPicker] = useState(false);
    const longPressTimer = useRef(null);

    // Extended color palette with darker options
    const colors = [
        // Light colors
        { name: 'White', value: '#ffffff' },
        { name: 'Light Gray', value: '#9ca3af' },
        // Bright colors
        { name: 'Red', value: '#ef4444' },
        { name: 'Green', value: '#22c55e' },
        { name: 'Blue', value: '#3b82f6' },
        { name: 'Yellow', value: '#eab308' },
        { name: 'Purple', value: '#a855f7' },
        { name: 'Cyan', value: '#06b6d4' },
        // Dark colors (new)
        { name: 'Dark Gray', value: '#374151' },
        { name: 'Dark Red', value: '#7f1d1d' },
        { name: 'Dark Green', value: '#14532d' },
        { name: 'Dark Blue', value: '#1e3a5f' },
        { name: 'Navy', value: '#1e1b4b' },
        { name: 'Charcoal', value: '#1f2937' },
        { name: 'Olive', value: '#3f3f46' },
        { name: 'Dim', value: '#262626' }
    ];

    // Background colors
    const bgColors = [
        { name: 'Black', value: '#000000' },
        { name: 'Deep Blue', value: '#0a1628' },
        { name: 'Navy', value: '#0f172a' },
        { name: 'Dark Purple', value: '#1a0b2e' },
        { name: 'Dark Green', value: '#052e16' },
        { name: 'Dark Red', value: '#1f0a0a' },
        { name: 'Charcoal', value: '#18181b' },
        { name: 'Dark Gray', value: '#1f2937' },
    ];

    useEffect(() => {
        const timer = setInterval(() => {
            setTime(new Date());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        setTempAddress(serverAddress || '');
    }, [serverAddress]);

    useEffect(() => {
        setTempColor(clockColor);
    }, [clockColor]);

    useEffect(() => {
        setTempBgColor(backgroundColor);
    }, [backgroundColor]);

    useEffect(() => {
        const initBrightness = async () => {
            try {
                const { brightness } = await ScreenBrightness.getBrightness();
                setBrightness(brightness);
            } catch (e) {
                console.error('Error getting brightness', e);
            }
        };
        initBrightness();
    }, []);

    // Auto-hide controls after 3 seconds
    useEffect(() => {
        if (showControls && !showSettings && !showBgColorPicker) {
            const timer = setTimeout(() => {
                setShowControls(false);
            }, 4000);
            return () => clearTimeout(timer);
        }
    }, [showControls, showSettings, showBgColorPicker]);

    const handleBrightnessChange = async (e) => {
        const newBrightness = parseFloat(e.target.value);
        setBrightness(newBrightness);
        try {
            await ScreenBrightness.setBrightness({ brightness: newBrightness });
        } catch (err) {
            console.error('Error setting brightness', err);
        }
    };

    const formatTime = (date) => {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    };

    const handleSave = (e) => {
        e.stopPropagation();
        localStorage.setItem('serverAddress', tempAddress);
        setServerAddress(tempAddress);
        localStorage.setItem('clockColor', tempColor);
        setClockColor(tempColor);
        localStorage.setItem('clockBgColor', tempBgColor);
        setBackgroundColor(tempBgColor);
        setShowSettings(false);
    };

    const handleSettingsClick = (e) => {
        e.stopPropagation();
        setShowSettings(!showSettings);
    };

    const handleScreenTap = (e) => {
        // Toggle controls visibility on tap
        if (!showSettings && !showBgColorPicker) {
            setShowControls(prev => !prev);
        }
    };

    const handleBack = (e) => {
        e.stopPropagation();
        if (onDismiss) onDismiss();
        else toggleFullScreen(e);
    };

    // Long press handlers for background color
    const handleTouchStart = (e) => {
        if (showSettings || showBgColorPicker) return;
        longPressTimer.current = setTimeout(() => {
            setShowBgColorPicker(true);
            setShowControls(true);
        }, 2000);
    };

    const handleTouchEnd = () => {
        if (longPressTimer.current) {
            clearTimeout(longPressTimer.current);
            longPressTimer.current = null;
        }
    };

    const handleBgColorSelect = (color) => {
        setTempBgColor(color);
        setBackgroundColor(color);
        localStorage.setItem('clockBgColor', color);
        setShowBgColorPicker(false);
    };

    return (
        <div
            onClick={handleScreenTap}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            onMouseDown={handleTouchStart}
            onMouseUp={handleTouchEnd}
            onMouseLeave={handleTouchEnd}
            className="flex items-center justify-center h-screen w-screen text-white overflow-hidden cursor-pointer relative"
            style={{ backgroundColor }}
        >
            {/* Controls - hidden by default, show on tap */}
            <div className={`absolute inset-0 z-40 pointer-events-none transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}>


                {/* Close Button (same as back) */}
                <button
                    onClick={handleBack}
                    className={`absolute right-6 top-6 p-3 bg-gray-800/70 hover:bg-gray-700 rounded-full text-gray-300 hover:text-white transition-all backdrop-blur-sm border border-gray-700/50 pointer-events-auto ${showControls ? '' : 'pointer-events-none'}`}
                >
                    <X size={24} />
                </button>

                {/* Monitor Button */}
                <button
                    onClick={handleBack}
                    className={`absolute left-6 bottom-6 p-3 bg-gray-800/70 hover:bg-gray-700 rounded-full text-gray-400 hover:text-white transition-all backdrop-blur-sm border border-gray-700/50 pointer-events-auto flex items-center gap-2 ${showControls ? '' : 'pointer-events-none'}`}
                >
                    <ArrowLeft size={24} />
                    <span className="text-sm font-medium pr-1">Monitor</span>
                </button>

                {/* Settings Button */}
                <button
                    onClick={handleSettingsClick}
                    className={`absolute bottom-6 right-6 p-3 bg-gray-800/70 hover:bg-gray-700 rounded-full text-gray-400 hover:text-white transition-all backdrop-blur-sm border border-gray-700/50 pointer-events-auto flex items-center gap-2 ${showControls ? '' : 'pointer-events-none'}`}
                >
                    <Settings size={24} />
                    <span className="text-sm font-medium pr-1">Personalizar</span>
                </button>

                {/* Hint text */}
                <div className={`absolute bottom-6 left-1/2 -translate-x-1/2 text-gray-500 text-xs transition-opacity ${showControls ? 'opacity-100' : 'opacity-0'}`}>
                    Segure 2s para mudar cor de fundo
                </div>
            </div>

            {/* Demo Mode Indicator & Exit Button - ALWAYS VISIBLE when in demo mode */}
            {isDemo && (
                <div className="absolute top-4 right-4 z-50 flex flex-col items-end gap-2 pointer-events-auto">
                    <div className="bg-purple-600/20 border border-purple-500/50 text-purple-400 px-3 py-1 rounded-full text-xs font-bold tracking-widest animate-pulse">
                        DEMO MODE
                    </div>
                    {onExitDemo && (
                        <button
                            onClick={onExitDemo}
                            className="bg-red-600/90 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-bold shadow-lg border border-red-500 transition-transform hover:scale-105 active:scale-95 flex items-center gap-2 backdrop-blur-sm"
                        >
                            <X size={16} />
                            <span className="text-sm">Sair Demo</span>
                        </button>
                    )}
                </div>
            )}

            {/* Clock Display */}
            <div
                className="font-bold leading-none tracking-tighter select-none transition-colors duration-500"
                style={{
                    fontFamily: 'Inter, system-ui, sans-serif',
                    fontSize: '35vw',
                    color: clockColor,
                    textShadow: clockColor === '#ffffff' ? 'none' : `0 0 100px ${clockColor}40`
                }}
            >
                {formatTime(time)}
            </div>

            {/* Background Color Picker Overlay */}
            {showBgColorPicker && (
                <div className="absolute inset-0 bg-black/90 flex items-center justify-center z-50" onClick={(e) => e.stopPropagation()}>
                    <div className="bg-gray-900 p-6 rounded-2xl border border-gray-700 w-80">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                <Palette size={20} className="text-cyan-400" />
                                Cor de Fundo
                            </h3>
                            <button
                                onClick={(e) => { e.stopPropagation(); setShowBgColorPicker(false); }}
                                className="p-1 text-gray-500 hover:text-white"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="grid grid-cols-4 gap-3">
                            {bgColors.map((color) => (
                                <button
                                    key={color.value}
                                    onClick={(e) => { e.stopPropagation(); handleBgColorSelect(color.value); }}
                                    className={`w-14 h-14 rounded-xl border-2 transition-all hover:scale-110 ${backgroundColor === color.value
                                        ? 'border-cyan-400 scale-110 ring-2 ring-cyan-400/30'
                                        : 'border-gray-600 hover:border-gray-400'
                                        }`}
                                    style={{ backgroundColor: color.value }}
                                    title={color.name}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Settings Modal */}
            {showSettings && (
                <div className="absolute inset-0 bg-black/90 flex items-center justify-center z-50" onClick={(e) => e.stopPropagation()}>
                    <div className="bg-gray-900 p-6 rounded-2xl border border-gray-700 w-80 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold text-white">Personalizar Relógio</h3>
                            <button
                                onClick={(e) => { e.stopPropagation(); setShowSettings(false); }}
                                className="p-1 text-gray-500 hover:text-white"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Server Address */}
                        <div className="mb-6">
                            <label className="block text-xs text-gray-400 mb-2">Endereço do Servidor</label>
                            <input
                                type="text"
                                value={tempAddress}
                                onChange={(e) => setTempAddress(e.target.value)}
                                onClick={(e) => e.stopPropagation()}
                                className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white focus:border-cyan-500 outline-none text-sm"
                                placeholder="https://192.168.1.x:8000"
                            />
                            <button
                                onClick={(e) => { e.stopPropagation(); setTempAddress("http://fps-monitor.local:8000"); }}
                                className="text-xs text-cyan-400 hover:text-cyan-300 mt-2"
                            >
                                Usar Auto-Discovery
                            </button>
                        </div>

                        {/* Clock Color Selector */}
                        <div className="mb-6">
                            <label className="block text-xs text-gray-400 mb-3">Cor do Relógio</label>
                            <div className="grid grid-cols-8 gap-2">
                                {colors.map((color) => (
                                    <button
                                        key={color.value}
                                        onClick={(e) => { e.stopPropagation(); setTempColor(color.value); }}
                                        className={`w-8 h-8 rounded-lg border-2 transition-all hover:scale-110 ${tempColor === color.value
                                            ? 'border-white scale-110 ring-2 ring-white/30'
                                            : 'border-gray-600 hover:border-gray-400'
                                            }`}
                                        style={{ backgroundColor: color.value }}
                                        title={color.name}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Background Color Selector */}
                        <div className="mb-6">
                            <label className="block text-xs text-gray-400 mb-3">Cor de Fundo</label>
                            <div className="grid grid-cols-8 gap-2">
                                {bgColors.map((color) => (
                                    <button
                                        key={color.value}
                                        onClick={(e) => { e.stopPropagation(); setTempBgColor(color.value); }}
                                        className={`w-8 h-8 rounded-lg border-2 transition-all hover:scale-110 ${tempBgColor === color.value
                                            ? 'border-cyan-400 scale-110 ring-2 ring-cyan-400/30'
                                            : 'border-gray-600 hover:border-gray-400'
                                            }`}
                                        style={{ backgroundColor: color.value }}
                                        title={color.name}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Brightness */}
                        <div className="mb-6">
                            <label className="block text-xs text-gray-400 mb-3 flex items-center gap-2">
                                <Sun size={14} />
                                Brilho da Tela
                            </label>
                            <input
                                type="range"
                                min="0.05"
                                max="1"
                                step="0.05"
                                value={brightness}
                                onChange={handleBrightnessChange}
                                onClick={(e) => e.stopPropagation()}
                                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                            />
                            <div className="flex justify-between text-[10px] text-gray-500 mt-1">
                                <span>Min</span>
                                <span>{Math.round(brightness * 100)}%</span>
                                <span>Max</span>
                            </div>
                        </div>

                        {/* Buttons */}
                        <div className="flex gap-3">
                            <button
                                onClick={(e) => { e.stopPropagation(); setShowSettings(false); }}
                                className="flex-1 py-3 text-sm text-gray-400 hover:text-white bg-gray-800 rounded-lg"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleSave}
                                className="flex-1 py-3 text-sm bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-medium"
                            >
                                Salvar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
