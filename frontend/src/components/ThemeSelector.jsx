import React, { useRef } from 'react';
import { Palette, X, Check, Image, Sparkles, Code, Flame, Upload, Sun, Moon, Zap, Droplets, Circle, Waves, Activity, Gamepad2 } from 'lucide-react';
import { themes } from '../utils/themes';
import { t } from '../utils/i18n';

export default function ThemeSelector({ currentTheme, onSelectTheme, onClose, currentBackground, onSelectBackground, onUploadBackground, globalSettings, onUpdateGlobalSettings }) {
    const fileInputRef = useRef(null);

    const backgrounds = [
        { id: 'none', name: 'None', icon: X },
        { id: 'matrix', name: 'Matrix', icon: Code },
        { id: 'embers', name: 'Embers', icon: Flame },
        { id: 'stars', name: 'Stars', icon: Sparkles },
        { id: 'rain', name: 'Rain', icon: Droplets },
        { id: 'particles', name: 'Particles', icon: Circle },
        { id: 'gradient', name: 'Gradient', icon: Waves },
        { id: 'pulse', name: 'Pulse', icon: Activity },
        { id: 'custom', name: 'Custom', icon: Image },
    ];



    // Categorize themes
    const themeCategories = {
        'Escuros': ['default', 'redDragon', 'midnightPurple', 'carbonBlack', 'neonOrange', 'matrix', 'synthwave'],
        'Claros': ['cyberpunk', 'barbie'],
        'Gaming': ['minecraft', 'roblox', 'pixel'],
        'Especiais': ['custom']
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                onUploadBackground(e.target.result);
                onSelectBackground('custom');
            };
            reader.readAsDataURL(file);
        }
    };

    // Get theme preview colors for visual display
    const getThemePreviewColors = (theme) => {
        const colors = theme.colors;
        // Extract hex colors from tailwind classes
        const extractColor = (cls) => {
            const match = cls.match(/#[a-fA-F0-9]{6}/);
            return match ? match[0] : null;
        };

        return {
            bg: extractColor(colors.bg) || '#1f2937',
            text: extractColor(colors.text) || '#ffffff',
            accent: extractColor(colors.accentBg) || '#3b82f6',
            border: extractColor(colors.border) || '#374151'
        };
    };

    return (
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-gray-900 border border-gray-700 rounded-3xl p-6 max-w-2xl w-full relative shadow-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors z-10"
                >
                    <X size={24} />
                </button>

                {/* Header */}
                <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center p-3 bg-cyan-500/10 rounded-full mb-3">
                        <Palette className="text-cyan-500 animate-pulse" size={28} />
                    </div>
                    <h2 className="text-xl font-bold text-white mb-1">{t('visual_interface')}</h2>
                    <p className="text-gray-400 text-sm">
                        {t('select_theme_desc')}
                    </p>
                </div>

                {/* Themes by Category */}
                {Object.entries(themeCategories).map(([category, themeKeys]) => (
                    <div key={category} className="mb-6">
                        <div className="flex items-center gap-2 mb-3">
                            {category === 'Escuros' && <Moon size={16} className="text-gray-400" />}
                            {category === 'Claros' && <Sun size={16} className="text-yellow-400" />}
                            {category === 'Gaming' && <Gamepad2 size={16} className="text-green-400" />}
                            {category === 'Especiais' && <Zap size={16} className="text-purple-400" />}
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">{category}</h3>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {themeKeys.filter(key => themes[key]).map((key) => {
                                const theme = themes[key];
                                const isActive = currentTheme === key;
                                const previewColors = getThemePreviewColors(theme);

                                return (
                                    <button
                                        key={key}
                                        onClick={() => onSelectTheme(key)}
                                        className={`relative group p-3 rounded-xl border-2 transition-all duration-300 flex flex-col items-center gap-2 overflow-hidden
                                            ${isActive
                                                ? 'border-cyan-400 bg-cyan-500/10 scale-[1.02] shadow-lg shadow-cyan-500/20'
                                                : 'border-gray-800 hover:border-gray-600 hover:bg-gray-800/50'
                                            }`}
                                    >
                                        {/* Color Preview Bar */}
                                        <div className="w-full h-8 rounded-lg flex overflow-hidden border border-gray-700/50">
                                            <div className="flex-1" style={{ backgroundColor: previewColors.bg }}></div>
                                            <div className="w-8" style={{ backgroundColor: previewColors.accent }}></div>
                                            <div className="flex-1" style={{ backgroundColor: previewColors.bg }}>
                                                <div className="h-full flex items-center justify-center text-[8px] font-bold" style={{ color: previewColors.text }}>
                                                    FPS
                                                </div>
                                            </div>
                                        </div>

                                        <div className="text-center">
                                            <div className={`text-sm font-bold ${isActive ? 'text-cyan-400' : 'text-gray-300 group-hover:text-white'}`}>
                                                {theme.name}
                                            </div>
                                            {isActive && (
                                                <div className="text-[10px] text-cyan-400 flex items-center justify-center gap-1 mt-1">
                                                    <Check size={10} /> Ativo
                                                </div>
                                            )}
                                            {key === 'custom' && !isActive && (
                                                <div className="text-[10px] text-blue-400 mt-1 italic">
                                                    Personalizável
                                                </div>
                                            )}
                                            {key === 'pixel' && !isActive && (
                                                <div className="text-[10px] text-green-400 mt-1" style={{ fontFamily: "'Press Start 2P', monospace", fontSize: '6px' }}>
                                                    RETRO
                                                </div>
                                            )}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                ))}

                {/* Divider */}
                <div className="h-px bg-gray-800 my-6"></div>

                {/* Background Effects */}
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Sparkles size={14} />
                    Efeitos de Fundo
                </h3>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 mb-6">
                    {backgrounds.map((bg) => {
                        const isActive = currentBackground === bg.id;
                        const Icon = bg.icon;

                        return (
                            <button
                                key={bg.id}
                                onClick={() => {
                                    if (bg.id === 'custom') {
                                        fileInputRef.current?.click();
                                    } else {
                                        onSelectBackground(bg.id);
                                    }
                                }}
                                className={`relative group p-3 rounded-xl border-2 transition-all duration-300 flex flex-col items-center gap-2 overflow-hidden
                                    ${isActive
                                        ? 'border-cyan-500 bg-cyan-500/10'
                                        : 'border-gray-800 hover:border-gray-600 hover:bg-gray-800/50'
                                    }`}
                            >
                                <Icon size={20} className={isActive ? 'text-cyan-400' : 'text-gray-500'} />
                                <span className={`text-xs font-bold ${isActive ? 'text-cyan-400' : 'text-gray-400'}`}>{bg.name}</span>

                                {bg.id === 'custom' && (
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        className="hidden"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                    />
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* Global Color Overrides */}
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Palette size={14} />
                    Cores Globais
                </h3>
                <div className="grid grid-cols-3 gap-4 mb-4">
                    {/* Accent Color */}
                    <div className="flex flex-col gap-2">
                        <label className="text-xs text-gray-500">Destaque</label>
                        <div className="relative">
                            <input
                                type="color"
                                value={globalSettings?.accent || '#3b82f6'}
                                className="w-full h-10 rounded-lg cursor-pointer border-2 border-gray-700"
                                onChange={(e) => onUpdateGlobalSettings && onUpdateGlobalSettings('accent', e.target.value)}
                            />
                        </div>
                    </div>
                    {/* Text Color */}
                    <div className="flex flex-col gap-2">
                        <label className="text-xs text-gray-500">Texto</label>
                        <input
                            type="color"
                            value={globalSettings?.text || '#ffffff'}
                            className="w-full h-10 rounded-lg cursor-pointer border-2 border-gray-700"
                            onChange={(e) => onUpdateGlobalSettings && onUpdateGlobalSettings('text', e.target.value)}
                        />
                    </div>
                    {/* Background Color */}
                    <div className="flex flex-col gap-2">
                        <label className="text-xs text-gray-500">Fundo</label>
                        <input
                            type="color"
                            value={globalSettings?.bg || '#111827'}
                            className="w-full h-10 rounded-lg cursor-pointer border-2 border-gray-700"
                            onChange={(e) => onUpdateGlobalSettings && onUpdateGlobalSettings('bg', e.target.value)}
                        />
                    </div>
                </div>

                {/* RGB Border Toggle */}
                <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-xl border border-gray-700 mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-red-500 via-green-500 to-blue-500 animate-pulse" />
                        <div>
                            <div className="text-sm font-bold text-white">RGB Borda</div>
                            <div className="text-xs text-gray-500">Borda animada nos painéis</div>
                        </div>
                    </div>
                    <button
                        onClick={() => onUpdateGlobalSettings && onUpdateGlobalSettings('rgbBorder', !globalSettings?.rgbBorder)}
                        className={`relative w-12 h-6 rounded-full transition-all ${globalSettings?.rgbBorder ? 'bg-gradient-to-r from-red-500 via-green-500 to-blue-500' : 'bg-gray-700'}`}
                    >
                        <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${globalSettings?.rgbBorder ? 'left-7' : 'left-1'}`} />
                    </button>
                </div>

                {/* Font Selector */}
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Code size={14} />
                    Fonte Personalizada
                </h3>
                <div className="grid grid-cols-2 gap-2 mb-4">
                    {[
                        { id: 'default', name: 'Padrão', preview: 'Inter, sans-serif', class: '' },
                        { id: 'pixel', name: 'Pixel', preview: "'Press Start 2P'", class: 'font-pixel' },
                        { id: 'minecraft', name: 'Minecraft', preview: "'Silkscreen'", class: 'font-minecraft' },
                        { id: 'roblox', name: 'Roblox', preview: "'Pixelify Sans'", class: 'font-roblox' },
                        { id: 'mono', name: 'Monospace', preview: "'Consolas', monospace", class: 'font-mono' },
                        { id: 'rounded', name: 'Arredondada', preview: "'Nunito', sans-serif", class: 'font-sans' },
                    ].map(font => (
                        <button
                            key={font.id}
                            onClick={() => onUpdateGlobalSettings && onUpdateGlobalSettings('customFont', font.id)}
                            className={`p-3 rounded-xl border-2 transition-all text-left ${globalSettings?.customFont === font.id
                                    ? 'border-cyan-500 bg-cyan-500/10'
                                    : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
                                }`}
                        >
                            <div className={`text-sm font-bold text-white mb-1 ${font.class}`} style={{ fontFamily: font.preview }}>
                                {font.name}
                            </div>
                            <div className={`text-xs text-gray-500 ${font.class}`} style={{ fontFamily: font.preview }}>
                                Abc 123
                            </div>
                        </button>
                    ))}
                </div>

            </div>
        </div>
    );
}
