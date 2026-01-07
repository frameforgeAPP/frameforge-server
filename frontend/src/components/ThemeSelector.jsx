import React from 'react';
import { Palette, X, Check } from 'lucide-react';
import { themes } from '../utils/themes';
import { t } from '../utils/i18n';

export default function ThemeSelector({ currentTheme, onSelectTheme, onClose }) {
    return (
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-gray-900 border border-gray-700 rounded-3xl p-8 max-w-2xl w-full relative shadow-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors z-10"
                >
                    <X size={24} />
                </button>

                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center p-3 bg-blue-500/10 rounded-full mb-4">
                        <Palette className="text-blue-500 animate-pulse" size={32} />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">{t('visual_interface')}</h2>
                    <p className="text-gray-400 text-sm">
                        {t('select_theme_desc')}
                    </p>
                </div>

                {/* Theme Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {Object.entries(themes).map(([key, theme]) => {
                        const isActive = currentTheme === key;

                        // Extract preview colors
                        const bgClass = theme.colors.panelBg;
                        const accentClass = theme.colors.accentBg;
                        const borderClass = theme.colors.border;

                        return (
                            <button
                                key={key}
                                onClick={() => onSelectTheme(key)}
                                className={`relative group p-4 rounded-xl border-2 transition-all duration-300 flex items-center gap-4 overflow-hidden
                                    ${isActive
                                        ? 'border-white bg-white/5 scale-[1.02] shadow-lg shadow-white/10'
                                        : 'border-gray-800 hover:border-gray-600 hover:bg-gray-800/50'
                                    }`}
                            >
                                {/* Preview Circle */}
                                <div className={`w-12 h-12 rounded-full ${bgClass} border-2 ${borderClass} flex items-center justify-center shadow-inner`}>
                                    <div className={`w-4 h-4 rounded-full ${accentClass}`}></div>
                                </div>

                                <div className="text-left">
                                    <div className={`font-bold ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-200'}`}>
                                        {theme.name}
                                    </div>
                                    {isActive && (
                                        <div className="text-xs text-green-400 flex items-center gap-1 mt-1">
                                            <Check size={12} /> {t('active_theme')}
                                        </div>
                                    )}
                                    {/* Custom Theme Hint */}
                                    {key === 'custom' && (
                                        <div className="text-[10px] text-blue-400 mt-1 italic">
                                            {t('long_press_customize') || "Long press elements to edit colors"}
                                        </div>
                                    )}
                                </div>

                                {/* Background Glow (Subtle) */}
                                {isActive && (
                                    <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent pointer-events-none" />
                                )}
                            </button>
                        );
                    })}
                </div>

            </div>
        </div>
    );
}
