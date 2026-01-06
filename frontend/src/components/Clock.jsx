import React, { useState, useEffect } from 'react';
import { Settings, ArrowLeft, Sun } from 'lucide-react';
import { ScreenBrightness } from '@capacitor-community/screen-brightness';

export default function Clock({ toggleFullScreen, serverAddress, setServerAddress, onDismiss }) {
    const [time, setTime] = useState(new Date());
    const [showSettings, setShowSettings] = useState(false);
    const [tempAddress, setTempAddress] = useState(serverAddress || '');
    const [clockColor, setClockColor] = useState(localStorage.getItem('clockColor') || '#ffffff');
    const [tempColor, setTempColor] = useState(clockColor);
    const [brightness, setBrightness] = useState(1);

    const colors = [
        { name: 'White', value: '#ffffff' },
        { name: 'Gray', value: '#9ca3af' },
        { name: 'Red', value: '#ef4444' },
        { name: 'Green', value: '#22c55e' },
        { name: 'Blue', value: '#3b82f6' },
        { name: 'Yellow', value: '#eab308' },
        { name: 'Purple', value: '#a855f7' },
        { name: 'Cyan', value: '#06b6d4' }
    ];

    useEffect(() => {
        const timer = setInterval(() => {
            setTime(new Date());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    // Update tempAddress when serverAddress changes
    useEffect(() => {
        setTempAddress(serverAddress || '');
    }, [serverAddress]);

    // Update tempColor when clockColor changes
    useEffect(() => {
        setTempColor(clockColor);
    }, [clockColor]);

    // Initialize brightness
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
        setShowSettings(false);
    };

    const handleSettingsClick = (e) => {
        e.stopPropagation();
        setShowSettings(!showSettings);
    };

    const handleClick = (e) => {
        if (onDismiss) {
            onDismiss();
        } else {
            toggleFullScreen(e);
        }
    };

    return (
        <div
            onClick={handleClick}
            className="flex items-center justify-center h-screen w-screen bg-black text-white overflow-hidden cursor-pointer relative"
        >
            {/* Back Button */}
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    if (onDismiss) onDismiss();
                    else toggleFullScreen(e);
                }}
                className="absolute left-8 top-1/2 -translate-y-1/2 p-4 bg-gray-800/50 hover:bg-gray-700/80 rounded-full text-gray-400 hover:text-white transition-all backdrop-blur-sm border border-gray-700/50 z-50"
            >
                <ArrowLeft size={32} />
            </button>

            <div
                className="font-bold leading-none tracking-tighter select-none"
                style={{
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '35vw',
                    color: clockColor
                }}
            >
                {formatTime(time)}
            </div>

            {/* Settings Button */}
            <button
                onClick={handleSettingsClick}
                className="absolute bottom-8 right-8 p-2 text-gray-600 hover:text-gray-400 transition-colors z-50"
            >
                <Settings size={24} />
            </button>

            {/* Settings Modal */}
            {showSettings && (
                <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-50" onClick={(e) => e.stopPropagation()}>
                    <div className="bg-gray-900 p-6 rounded-xl border border-gray-700 w-80">
                        <h3 className="text-lg font-bold mb-4 text-white">Server Settings</h3>
                        <div className="mb-4">
                            <label className="block text-xs text-gray-400 mb-1">Server Address</label>
                            <input
                                type="text"
                                value={tempAddress}
                                onChange={(e) => setTempAddress(e.target.value)}
                                onClick={(e) => e.stopPropagation()}
                                className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-white focus:border-blue-500 outline-none mb-2"
                                placeholder="https://192.168.1.x:8000"
                            />
                            <button
                                onClick={(e) => { e.stopPropagation(); setTempAddress("http://fps-monitor.local:8000"); }}
                                className="text-xs text-blue-400 hover:text-blue-300 underline"
                            >
                                Use Auto-Discovery (fps-monitor.local)
                            </button>
                        </div>

                        <div className="mb-6">
                            <label className="block text-xs text-gray-400 mb-2">Clock Color</label>
                            <div className="flex gap-2 flex-wrap">
                                {colors.map((color) => (
                                    <button
                                        key={color.value}
                                        onClick={(e) => { e.stopPropagation(); setTempColor(color.value); }}
                                        className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${tempColor === color.value ? 'border-white scale-110' : 'border-transparent'}`}
                                        style={{ backgroundColor: color.value }}
                                        title={color.name}
                                    />
                                ))}
                            </div>
                        </div>

                        <div className="mb-6">
                            <label className="block text-xs text-gray-400 mb-2 flex items-center gap-2">
                                <Sun size={14} />
                                Brightness
                            </label>
                            <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.05"
                                value={brightness}
                                onChange={handleBrightnessChange}
                                onClick={(e) => e.stopPropagation()}
                                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                            />
                        </div>
                        <div className="flex justify-end gap-2">
                            <button
                                onClick={(e) => { e.stopPropagation(); setShowSettings(false); }}
                                className="px-4 py-2 text-sm text-gray-400 hover:text-white"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-500 text-white rounded"
                            >
                                Save & Connect
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
