import React, { useRef, useState, useEffect } from 'react';
import { Palette, X, Check, Image, Sparkles, Code, Flame, Upload, Sun, Moon, Zap, Droplets, Circle, Waves, Activity, Gamepad2, Lock, Unlock, Coffee, Clock } from 'lucide-react';
import { themes } from '../utils/themes';
import { PremiumManager } from '../utils/PremiumManager';
import { t } from '../utils/i18n';

// Define Premium Themes
const PREMIUM_THEMES = ['matrix', 'roblox', 'minecraft'];
const PREMIUM_BACKGROUNDS = ['matrix', 'embers', 'rain']; // Free: none, stars, particles

export default function ThemeSelector({ currentTheme, onSelectTheme, onClose, currentBackground, onSelectBackground, onUploadBackground, globalSettings, onUpdateGlobalSettings, isDarkMode, onToggleDarkMode, onOpenClock, customColors, onUpdateCustomColor, hardwareLabels, onUpdateHardwareLabel }) {
    const fileInputRef = useRef(null);
    const [isPro, setIsPro] = useState(false);
    const [showUnlockModal, setShowUnlockModal] = useState(false);
    const [unlockCode, setUnlockCode] = useState("");
    const [unlockError, setUnlockError] = useState("");
    const [deviceId, setDeviceId] = useState("");

    useEffect(() => {
        // Check if user is already PRO
        const proStatus = localStorage.getItem('frameforge_is_pro');
        if (proStatus === 'true') {
            setIsPro(true);
        }
        // Get Device ID
        setDeviceId(PremiumManager.getDeviceId());
    }, []);

    const handleUnlock = async () => {
        const isValid = await PremiumManager.validateKey(unlockCode);
        if (isValid) {
            localStorage.setItem('frameforge_is_pro', 'true');
            setIsPro(true);
            setShowUnlockModal(false);
            setUnlockCode("");
            alert("Funcionalidades Premium desbloqueadas com sucesso!");
        } else {
            setUnlockError("Código inválido. Verifique se digitou corretamente.");
        }
    };

    const handleThemeClick = (key) => {
        // Custom theme is now a PREMIUM feature
        if ((PREMIUM_THEMES.includes(key) || key === 'custom') && !isPro) {
            setShowUnlockModal(true);
        } else {
            onSelectTheme(key);
        }
    };

    const handleRgbToggle = () => {
        if (!isPro) {
            setShowUnlockModal(true);
        } else {
            onUpdateGlobalSettings && onUpdateGlobalSettings('rgbBorder', !globalSettings?.rgbBorder);
        }
    };

    const backgrounds = [
        { id: 'none', name: 'None', icon: X },
        { id: 'stars', name: 'Stars', icon: Sparkles },
        { id: 'particles', name: 'Particles', icon: Circle },
        { id: 'matrix', name: 'Matrix', icon: Code },
        { id: 'embers', name: 'Embers', icon: Flame },
        { id: 'rain', name: 'Rain', icon: Droplets },
        { id: 'custom', name: 'Custom', icon: Image },
    ];

    // Categorize themes
    const themeCategories = {
        'Escuros': ['default', 'redDragon', 'midnightPurple', 'carbonBlack', 'matrix', 'synthwave'],
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
                <div className="text-center mb-6 relative">
                    <div className="inline-flex items-center justify-center p-3 bg-cyan-500/10 rounded-full mb-3">
                        <Palette className="text-cyan-500 animate-pulse" size={28} />
                    </div>
                    <h2 className="text-xl font-bold text-white mb-1">{t('visual_interface')}</h2>
                    <p className="text-gray-400 text-sm">
                        {t('select_theme_desc')}
                    </p>

                    {/* Quick Actions Row */}
                    <div className="flex items-center justify-center gap-4 mt-4">
                        {/* Dark/Light Toggle */}
                        <button
                            onClick={onToggleDarkMode}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all ${isDarkMode ? 'bg-gray-800 border-gray-700 text-yellow-400' : 'bg-gray-100 border-gray-300 text-orange-500'}`}
                        >
                            {isDarkMode ? <Moon size={14} /> : <Sun size={14} />}
                            <span className="text-xs font-bold">{isDarkMode ? 'Escuro' : 'Claro'}</span>
                        </button>

                        {/* Open Clock Button */}
                        <button
                            onClick={onOpenClock}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-all"
                        >
                            <Clock size={14} />
                            <span className="text-xs font-bold">Abrir Relógio</span>
                        </button>
                    </div>

                    {!isPro && (
                        <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-xs font-bold cursor-pointer hover:bg-yellow-500/20" onClick={() => setShowUnlockModal(true)}>
                            <Lock size={12} />
                            Desbloquear Temas Premium
                        </div>
                    )}
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
                                const isPremium = PREMIUM_THEMES.includes(key) || key === 'custom';
                                const isLocked = isPremium && !isPro;
                                const previewColors = getThemePreviewColors(theme);

                                return (
                                    <button
                                        key={key}
                                        onClick={() => handleThemeClick(key)}
                                        className={`relative group p-3 rounded-xl border-2 transition-all duration-300 flex flex-col items-center gap-2 overflow-hidden
                                            ${isActive
                                                ? 'border-cyan-400 bg-cyan-500/10 scale-[1.02] shadow-lg shadow-cyan-500/20'
                                                : 'border-gray-800 hover:border-gray-600 hover:bg-gray-800/50'
                                            }
                                            ${isLocked ? 'opacity-75 grayscale-[0.5]' : ''}
                                            `}
                                    >
                                        {/* Lock Overlay */}
                                        {isLocked && (
                                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-20 backdrop-blur-[1px]">
                                                <Lock className="text-yellow-400 drop-shadow-lg" size={24} />
                                            </div>
                                        )}

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
                                            {isPremium && !isActive && !isLocked && (
                                                <div className="text-[10px] text-yellow-400 flex items-center justify-center gap-1 mt-1">
                                                    <Unlock size={10} /> PRO
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
                                    const isPremiumBg = PREMIUM_BACKGROUNDS.includes(bg.id) || bg.id === 'custom';
                                    if (isPremiumBg && !isPro) {
                                        setShowUnlockModal(true);
                                        return;
                                    }

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
                                    }
                                    ${(PREMIUM_BACKGROUNDS.includes(bg.id) || bg.id === 'custom') && !isPro ? 'opacity-75 grayscale-[0.5]' : ''}
                                    `}
                            >
                                <Icon size={20} className={isActive ? 'text-cyan-400' : 'text-gray-500'} />
                                <span className={`text-xs font-bold ${isActive ? 'text-cyan-400' : 'text-gray-400'}`}>{bg.name}</span>

                                {/* Lock Icon for Premium Backgrounds */}
                                {(PREMIUM_BACKGROUNDS.includes(bg.id) || bg.id === 'custom') && !isPro && (
                                    <div className="absolute top-1 right-1">
                                        <Lock size={10} className="text-yellow-500" />
                                    </div>
                                )}

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




                {/* Hardware Renaming */}
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <span className="w-1 h-4 bg-yellow-500 rounded-full"></span>
                    Renomear Hardware
                </h3>
                <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="flex flex-col gap-2">
                        <label className="text-xs text-gray-500">CPU</label>
                        <input
                            type="text"
                            value={hardwareLabels?.cpu !== undefined ? hardwareLabels.cpu : ''}
                            placeholder="CPU"
                            onChange={(e) => onUpdateHardwareLabel && onUpdateHardwareLabel('cpu', e.target.value)}
                            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-yellow-500"
                        />
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="text-xs text-gray-500">GPU</label>
                        <input
                            type="text"
                            value={hardwareLabels?.gpu !== undefined ? hardwareLabels.gpu : ''}
                            placeholder="GPU"
                            onChange={(e) => onUpdateHardwareLabel && onUpdateHardwareLabel('gpu', e.target.value)}
                            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-yellow-500"
                        />
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="text-xs text-gray-500">RAM</label>
                        <input
                            type="text"
                            value={hardwareLabels?.ram !== undefined ? hardwareLabels.ram : ''}
                            placeholder="RAM"
                            onChange={(e) => onUpdateHardwareLabel && onUpdateHardwareLabel('ram', e.target.value)}
                            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-yellow-500"
                        />
                    </div>
                </div>

                {/* RGB Border Toggle */}
                <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-xl border border-gray-700 mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-red-500 via-green-500 to-blue-500 animate-pulse" />
                        <div>
                            <div className="text-sm font-bold text-white">RGB Borda</div>
                            <div className="text-xs text-gray-500">Borda animada nos painéis {!isPro && <span className="text-yellow-500 font-bold">(PRO)</span>}</div>
                        </div>
                    </div>
                    <button
                        onClick={handleRgbToggle}
                        className={`relative w-12 h-6 rounded-full transition-all ${globalSettings?.rgbBorder ? 'bg-gradient-to-r from-red-500 via-green-500 to-blue-500' : 'bg-gray-700'}`}
                    >
                        <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${globalSettings?.rgbBorder ? 'left-7' : 'left-1'}`} />
                        {!isPro && !globalSettings?.rgbBorder && (
                            <Lock size={10} className="absolute top-1.5 left-1.5 text-gray-400" />
                        )}
                    </button>
                </div>

                {/* Clock After Game Toggle */}
                <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-xl border border-gray-700 mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                            <Clock className="text-blue-400" size={18} />
                        </div>
                        <div>
                            <div className="text-sm font-bold text-white">Relógio Digital</div>
                        </div>
                    </div>
                    <button
                        onClick={() => onUpdateGlobalSettings && onUpdateGlobalSettings('clockAfterGame', !globalSettings?.clockAfterGame)}
                        className={`relative w-12 h-6 rounded-full transition-all ${globalSettings?.clockAfterGame ? 'bg-blue-500' : 'bg-gray-700'}`}
                    >
                        <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${globalSettings?.clockAfterGame ? 'left-7' : 'left-1'}`} />
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

            {/* UNLOCK MODAL */}
            {
                showUnlockModal && (
                    <div className="fixed inset-0 z-[110] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4" onClick={(e) => e.stopPropagation()}>
                        <div className="bg-gray-900 border border-yellow-500/30 rounded-2xl p-8 max-w-md w-full text-center relative shadow-2xl shadow-yellow-500/10">
                            <button
                                onClick={() => setShowUnlockModal(false)}
                                className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
                            >
                                <X size={24} />
                            </button>

                            <div className="inline-flex items-center justify-center p-4 bg-yellow-500/10 rounded-full mb-6">
                                <Lock className="text-yellow-500" size={48} />
                            </div>

                            <h2 className="text-2xl font-bold text-white mb-2">Desbloquear Versão PRO</h2>
                            <p className="text-gray-400 mb-6">
                                Tenha acesso vitalício a todos os temas Premium, Borda RGB, Alertas e muito mais!
                            </p>

                            <div className="bg-gray-800/50 rounded-xl p-4 mb-6 border border-gray-700">
                                <div className="text-sm text-gray-400 mb-1">Acesso Total</div>
                                <div className="text-3xl font-bold text-white">R$ 14,99</div>
                                <div className="text-xs text-green-400 mt-1">Vitalício</div>
                            </div>

                            {/* Device ID Display */}
                            <div className="bg-black/40 rounded-lg p-3 mb-4 border border-gray-700/50 text-left">
                                <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Seu ID de Dispositivo</div>
                                <div className="flex items-center justify-between gap-2">
                                    <code className="text-xs text-cyan-400 font-mono bg-cyan-900/20 px-2 py-1 rounded select-all">
                                        {deviceId}
                                    </code>
                                    <button
                                        onClick={() => {
                                            navigator.clipboard.writeText(deviceId);
                                            alert("ID copiado!");
                                        }}
                                        className="text-gray-400 hover:text-white"
                                        title="Copiar ID"
                                    >
                                        <Code size={14} />
                                    </button>
                                </div>
                                <p className="text-[9px] text-gray-600 mt-1">
                                    Envie este ID junto com o comprovante de pagamento.
                                </p>
                            </div>

                            <a
                                href="#"
                                onClick={(e) => {
                                    e.preventDefault();
                                    import('../utils/BillingService').then(({ BillingService }) => {
                                        BillingService.purchase();
                                    });
                                }}
                                className="flex items-center justify-center gap-2 w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-xl transition-all mb-2"
                            >
                                <Zap size={20} />
                                Comprar com Google Play
                            </a>

                            <a
                                href="https://ko-fi.com/frameforge"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-center gap-2 w-full bg-[#FF5E5B] hover:bg-[#D94140] text-white font-bold py-3 px-6 rounded-xl transition-all mb-4"
                            >
                                <Coffee size={20} />
                                Doar via Ko-fi (Alternativo)
                            </a>

                            <div className="relative mb-2">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-gray-700"></div>
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-2 bg-gray-900 text-gray-500">Já tem um código?</span>
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    autoFocus
                                    placeholder="Cole seu código aqui..."
                                    className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-yellow-500 uppercase"
                                    value={unlockCode}
                                    onChange={(e) => {
                                        setUnlockCode(e.target.value.toUpperCase());
                                        setUnlockError("");
                                    }}
                                />
                                <button
                                    onClick={handleUnlock}
                                    className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold px-4 py-2 rounded-lg transition-colors"
                                >
                                    <Unlock size={18} />
                                </button>
                            </div>
                            {unlockError && (
                                <p className="text-red-500 text-xs mt-2 text-left">{unlockError}</p>
                            )}

                            <p className="text-[10px] text-gray-600 mt-6">
                                Após o pagamento, enviaremos o código para seu e-mail.
                            </p>
                        </div>
                    </div>
                )
            }
        </div >
    );
}
