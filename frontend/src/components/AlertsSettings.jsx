import React, { useState, useEffect } from 'react';
import { X, Bell, BellOff, Thermometer, Cpu, CircuitBoard, Gauge, Volume2, VolumeX, Vibrate, RotateCcw } from 'lucide-react';
import { getAlertsSettings, saveAlertsSettings, resetAlertsSettings, triggerVibration, triggerSound } from '../utils/alertsUtils';
import { t } from '../utils/i18n';

export default function AlertsSettings({ isOpen, onClose }) {
    const [settings, setSettings] = useState(getAlertsSettings());

    useEffect(() => {
        if (isOpen) {
            setSettings(getAlertsSettings());
        }
    }, [isOpen]);

    const updateSetting = (key, value) => {
        const newSettings = { ...settings, [key]: value };
        setSettings(newSettings);
        saveAlertsSettings(newSettings);
    };

    const handleReset = () => {
        const defaults = resetAlertsSettings();
        setSettings(defaults);
    };

    const testVibration = () => {
        triggerVibration([200, 100, 200]);
    };

    const testSound = () => {
        triggerSound();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-gray-900 border border-gray-800 rounded-2xl max-w-md w-full max-h-[85vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-800">
                    <div className="flex items-center gap-3">
                        <Bell className="w-6 h-6 text-orange-400" />
                        <h2 className="text-xl font-bold text-white">{t('alerts_settings') || 'Alertas'}</h2>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded-lg transition-colors">
                        <X className="w-5 h-5 text-gray-400" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6 overflow-y-auto flex-1">
                    {/* Master Toggle */}
                    <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-xl border border-gray-700">
                        <div className="flex items-center gap-3">
                            {settings.enabled ? <Bell className="w-5 h-5 text-green-400" /> : <BellOff className="w-5 h-5 text-gray-500" />}
                            <span className="font-bold text-white">{t('alerts_enabled') || 'Alertas Ativados'}</span>
                        </div>
                        <button
                            onClick={() => updateSetting('enabled', !settings.enabled)}
                            className={`w-14 h-7 rounded-full transition-colors relative ${settings.enabled ? 'bg-green-500' : 'bg-gray-600'}`}
                        >
                            <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-transform ${settings.enabled ? 'translate-x-8' : 'translate-x-1'}`} />
                        </button>
                    </div>

                    {/* Temperature Limits */}
                    <div className={`space-y-4 ${!settings.enabled ? 'opacity-50 pointer-events-none' : ''}`}>
                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">{t('temperature_limits') || 'Limites de Temperatura'}</h3>

                        {/* CPU Temp */}
                        <div className="p-4 bg-gray-800/30 rounded-xl border border-gray-700">
                            <div className="flex items-center gap-3 mb-3">
                                <Cpu className="w-5 h-5 text-orange-400" />
                                <span className="text-white font-medium">CPU {t('temperature') || 'Temperatura'}</span>
                            </div>
                            <div className="flex items-center gap-4">
                                <input
                                    type="range"
                                    min="60"
                                    max="100"
                                    value={settings.cpuTempLimit}
                                    onChange={(e) => updateSetting('cpuTempLimit', parseInt(e.target.value))}
                                    className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-orange-500"
                                />
                                <span className="text-xl font-bold text-orange-400 w-16 text-right">{settings.cpuTempLimit}°C</span>
                            </div>
                        </div>

                        {/* GPU Temp */}
                        <div className="p-4 bg-gray-800/30 rounded-xl border border-gray-700">
                            <div className="flex items-center gap-3 mb-3">
                                <CircuitBoard className="w-5 h-5 text-green-400" />
                                <span className="text-white font-medium">GPU {t('temperature') || 'Temperatura'}</span>
                            </div>
                            <div className="flex items-center gap-4">
                                <input
                                    type="range"
                                    min="60"
                                    max="100"
                                    value={settings.gpuTempLimit}
                                    onChange={(e) => updateSetting('gpuTempLimit', parseInt(e.target.value))}
                                    className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-green-500"
                                />
                                <span className="text-xl font-bold text-green-400 w-16 text-right">{settings.gpuTempLimit}°C</span>
                            </div>
                        </div>

                        {/* FPS Low */}
                        <div className="p-4 bg-gray-800/30 rounded-xl border border-gray-700">
                            <div className="flex items-center gap-3 mb-3">
                                <Gauge className="w-5 h-5 text-red-400" />
                                <span className="text-white font-medium">FPS {t('minimum') || 'Mínimo'}</span>
                            </div>
                            <div className="flex items-center gap-4">
                                <input
                                    type="range"
                                    min="15"
                                    max="60"
                                    value={settings.fpsLowLimit}
                                    onChange={(e) => updateSetting('fpsLowLimit', parseInt(e.target.value))}
                                    className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-red-500"
                                />
                                <span className="text-xl font-bold text-red-400 w-16 text-right">{settings.fpsLowLimit}</span>
                            </div>
                        </div>
                    </div>

                    {/* Notification Type */}
                    <div className={`space-y-4 ${!settings.enabled ? 'opacity-50 pointer-events-none' : ''}`}>
                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">{t('notification_type') || 'Tipo de Notificação'}</h3>

                        <div className="grid grid-cols-2 gap-3">
                            {/* Vibration */}
                            <button
                                onClick={() => updateSetting('vibrate', !settings.vibrate)}
                                className={`p-4 rounded-xl border transition-all ${settings.vibrate ? 'bg-blue-600/20 border-blue-500' : 'bg-gray-800/30 border-gray-700'}`}
                            >
                                <Vibrate className={`w-6 h-6 mx-auto mb-2 ${settings.vibrate ? 'text-blue-400' : 'text-gray-500'}`} />
                                <span className={`text-sm font-medium ${settings.vibrate ? 'text-blue-400' : 'text-gray-500'}`}>
                                    {t('vibration') || 'Vibração'}
                                </span>
                            </button>

                            {/* Sound */}
                            <button
                                onClick={() => updateSetting('sound', !settings.sound)}
                                className={`p-4 rounded-xl border transition-all ${settings.sound ? 'bg-purple-600/20 border-purple-500' : 'bg-gray-800/30 border-gray-700'}`}
                            >
                                {settings.sound ? <Volume2 className="w-6 h-6 mx-auto mb-2 text-purple-400" /> : <VolumeX className="w-6 h-6 mx-auto mb-2 text-gray-500" />}
                                <span className={`text-sm font-medium ${settings.sound ? 'text-purple-400' : 'text-gray-500'}`}>
                                    {t('sound') || 'Som'}
                                </span>
                            </button>
                        </div>

                        {/* Test Buttons */}
                        <div className="flex gap-3">
                            <button
                                onClick={testVibration}
                                className="flex-1 py-2 px-4 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm text-gray-300 transition-colors"
                            >
                                {t('test_vibration') || 'Testar Vibração'}
                            </button>
                            <button
                                onClick={testSound}
                                className="flex-1 py-2 px-4 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm text-gray-300 transition-colors"
                            >
                                {t('test_sound') || 'Testar Som'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-800 flex gap-3">
                    <button
                        onClick={handleReset}
                        className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-800 hover:bg-gray-700 rounded-xl text-gray-300 transition-colors"
                    >
                        <RotateCcw className="w-4 h-4" />
                        {t('reset') || 'Resetar'}
                    </button>
                    <button
                        onClick={onClose}
                        className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold text-white transition-colors"
                    >
                        {t('done') || 'Concluído'}
                    </button>
                </div>
            </div>
        </div>
    );
}
