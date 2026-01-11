import React from 'react';
import { LayoutDashboard, Palette, Settings, X, MonitorPlay, Circle, Sun, Moon, Smartphone, Clock, Users, RotateCcw } from 'lucide-react';
import { Capacitor } from '@capacitor/core';

export default function BottomNavigation({ activeTab, onTabChange, visible, onClose, isRecording, isDarkMode, showConnect }) {
    return (
        <div
            className={`fixed bottom-0 left-0 right-0 bg-gray-900/95 backdrop-blur-xl border-t border-gray-700/50 p-4 transition-transform duration-300 z-50 ${visible ? 'translate-y-0' : 'translate-y-full'}`}
        >
            <div className="flex justify-around items-center max-w-lg mx-auto overflow-x-auto gap-4 px-2">
                <button
                    onClick={() => onTabChange('dashboard')}
                    className={`flex flex-col items-center gap-1 min-w-[60px] ${activeTab === 'dashboard' ? 'text-blue-500' : 'text-gray-400'}`}
                >
                    <LayoutDashboard size={24} />
                    <span className="text-[10px] uppercase tracking-wider">Dash</span>
                </button>

                <button
                    onClick={() => onTabChange('themes')}
                    className={`flex flex-col items-center gap-1 min-w-[60px] ${activeTab === 'themes' ? 'text-purple-500' : 'text-gray-400'}`}
                >
                    <Palette size={24} />
                    <span className="text-[10px] uppercase tracking-wider">Themes</span>
                </button>

                <button
                    onClick={() => onTabChange('record')}
                    className={`flex flex-col items-center gap-1 min-w-[60px] ${isRecording ? 'text-red-500 animate-pulse' : 'text-gray-400'}`}
                >
                    {isRecording ? <Circle size={24} fill="currentColor" /> : <MonitorPlay size={24} />}
                    <span className="text-[10px] uppercase tracking-wider">{isRecording ? 'REC' : 'Record'}</span>
                </button>

                <button
                    onClick={() => onTabChange('clock')}
                    className="flex flex-col items-center gap-1 min-w-[60px] text-gray-400 hover:text-green-400"
                >
                    <Clock size={24} />
                    <span className="text-[10px] uppercase tracking-wider">Clock</span>
                </button>

                <button
                    onClick={() => onTabChange('darkmode')}
                    className={`flex flex-col items-center gap-1 min-w-[60px] ${isDarkMode ? 'text-yellow-400' : 'text-gray-400'}`}
                >
                    {isDarkMode ? <Sun size={24} /> : <Moon size={24} />}
                    <span className="text-[10px] uppercase tracking-wider">Mode</span>
                </button>

                {showConnect && (
                    <button
                        onClick={() => onTabChange('connect')}
                        className="flex flex-col items-center gap-1 min-w-[60px] text-gray-400"
                    >
                        <Smartphone size={24} />
                        <span className="text-[10px] uppercase tracking-wider">Connect</span>
                    </button>
                )}

                <button
                    onClick={onClose}
                    className="flex flex-col items-center gap-1 min-w-[60px] text-red-400/80"
                >
                    <X size={24} />
                    <span className="text-[10px] uppercase tracking-wider">Close</span>
                </button>

                <button
                    onClick={() => {
                        if (confirm('Reset all settings? This will reload the app.')) {
                            localStorage.clear();
                            window.location.reload();
                        }
                    }}
                    className="flex flex-col items-center gap-1 min-w-[60px] text-red-600"
                >
                    <RotateCcw size={24} />
                    <span className="text-[10px] uppercase tracking-wider">Reset</span>
                </button>
            </div>
        </div>
    );
}
