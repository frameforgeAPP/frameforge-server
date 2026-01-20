import React from 'react';
import { Download, CheckCircle, Play, Info, Copy, Mail, MessageCircle, Share2, Monitor, ExternalLink } from 'lucide-react';
import { Share } from '@capacitor/share';
import { markOnboardingSeen } from '../utils/afterburnerUtils';
import { t } from '../utils/i18n';

const SERVER_URL = 'https://github.com/frameforgeAPP/frameforge-server/releases';
const AFTERBURNER_URL = 'https://www.msi.com/Landing/afterburner/graphics-cards';

export default function OnboardingScreen({ onComplete, onDemo }) {
    const [dontShowAgain, setDontShowAgain] = React.useState(false);
    const [copied, setCopied] = React.useState(false);

    const handleContinue = () => {
        if (dontShowAgain) {
            markOnboardingSeen();
        }
        onComplete();
    };

    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(SERVER_URL);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (e) {
            console.error('Copy failed', e);
        }
    };

    const handleShareEmail = () => {
        const subject = encodeURIComponent(t('share_server_subject'));
        const body = encodeURIComponent(t('share_server_body', { url: SERVER_URL }));
        window.open(`mailto:?subject=${subject}&body=${body}`);
    };

    const handleShareWhatsApp = () => {
        const text = encodeURIComponent(t('share_whatsapp_text', { url: SERVER_URL }));
        window.open(`https://wa.me/?text=${text}`);
    };

    const handleShareNative = async () => {
        try {
            await Share.share({
                title: 'FrameForge Server',
                text: t('share_server_body', { url: SERVER_URL }),
                url: SERVER_URL,
                dialogTitle: t('share_dialog_title')
            });
        } catch (e) {
            console.error('Share failed', e);
        }
    };

    return (
        <div className="h-screen w-screen bg-black text-white flex flex-col items-center justify-start p-4 pt-8 relative overflow-y-auto">
            {/* Background Effects - Tron Style */}
            <div className="fixed inset-0 -z-10">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-cyan-900/30 via-black to-black"></div>
                {/* Grid Pattern */}
                <div
                    className="absolute inset-0 opacity-20"
                    style={{
                        backgroundImage: 'linear-gradient(rgba(0,243,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,243,255,0.1) 1px, transparent 1px)',
                        backgroundSize: '40px 40px'
                    }}
                ></div>
            </div>

            <div className="z-10 w-full max-w-lg flex flex-col gap-4">
                {/* Demo Mode Button - Top */}
                {onDemo && (
                    <button
                        onClick={onDemo}
                        className="self-center mb-2 inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-cyan-600/20 to-blue-600/20 hover:from-cyan-600/40 hover:to-blue-600/40 border border-cyan-500/50 rounded-full text-cyan-400 hover:text-cyan-300 text-sm font-medium transition-all shadow-[0_0_15px_rgba(0,243,255,0.2)] hover:shadow-[0_0_25px_rgba(0,243,255,0.4)]"
                    >
                        <Play size={16} fill="currentColor" />
                        Modo Demo
                    </button>
                )}

                {/* Header */}
                <div className="text-center mb-2">
                    <h1 className="text-4xl font-black tracking-tighter mb-2 bg-gradient-to-r from-cyan-400 via-blue-500 to-cyan-400 bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(0,243,255,0.5)]">
                        Bem-vindo!
                    </h1>
                    <p className="text-cyan-400/70">FrameForge - Setup Rápido</p>
                </div>

                {/* Requirements Card */}
                <div className="bg-gray-900/50 border border-cyan-800/50 rounded-2xl p-4 backdrop-blur-sm shadow-[0_0_20px_rgba(0,243,255,0.1)]">
                    <div className="flex items-center gap-2 mb-3">
                        <Info className="w-5 h-5 text-cyan-400" />
                        <h2 className="text-lg font-bold text-cyan-100">Para funcionar, você precisa de:</h2>
                    </div>

                    <div className="space-y-3">
                        {/* Requirement 1 - Afterburner */}
                        <div className="flex items-start gap-3 p-3 bg-black/30 rounded-xl border border-cyan-800/30">
                            <div className="flex-shrink-0 w-7 h-7 bg-gradient-to-br from-cyan-600 to-blue-600 rounded-full flex items-center justify-center font-bold text-sm shadow-[0_0_10px_rgba(0,243,255,0.4)]">
                                1
                            </div>
                            <div className="flex-1">
                                <h3 className="font-bold mb-1 text-cyan-100">MSI Afterburner (PC)</h3>
                                <p className="text-gray-400 text-sm mb-2">
                                    Baixe, instale e <strong className="text-cyan-400">abra</strong> no seu PC. (O RivaTuner abre junto)
                                </p>
                                <div className="flex items-center gap-2 text-cyan-400 text-xs">
                                    <CheckCircle className="w-3 h-3" />
                                    <span>RivaTuner já vem incluído!</span>
                                </div>
                            </div>
                        </div>

                        {/* Requirement 2 - Server */}
                        <div className="flex items-start gap-3 p-3 bg-black/30 rounded-xl border border-cyan-800/30">
                            <div className="flex-shrink-0 w-7 h-7 bg-gradient-to-br from-cyan-600 to-blue-600 rounded-full flex items-center justify-center font-bold text-sm shadow-[0_0_10px_rgba(0,243,255,0.4)]">
                                2
                            </div>
                            <div className="flex-1">
                                <h3 className="font-bold mb-1 text-cyan-100">FrameForge Server (PC)</h3>
                                <p className="text-gray-400 text-sm">
                                    Baixe, instale e <strong className="text-cyan-400">abra</strong> no seu PC para conectar.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Visit Afterburner Page - Now external link */}
                <a
                    href={AFTERBURNER_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-3 p-3 bg-gradient-to-r from-cyan-600/80 to-blue-600/80 hover:from-cyan-500 hover:to-blue-500 rounded-xl transition-all shadow-lg shadow-cyan-900/30 border border-cyan-500/30"
                >
                    <ExternalLink className="w-5 h-5" />
                    <span className="font-bold">1. Visitar Página do MSI Afterburner</span>
                </a>

                {/* Server Download Section */}
                <div className="bg-gray-900/50 border border-cyan-800/50 rounded-2xl p-4 shadow-[0_0_20px_rgba(0,243,255,0.1)]">
                    <div className="flex items-center gap-2 mb-3">
                        <Monitor className="w-5 h-5 text-cyan-400" />
                        <h3 className="font-bold text-cyan-400">2. FrameForge Server</h3>
                    </div>

                    <p className="text-gray-400 text-sm mb-3">
                        Envie o link para seu PC e baixe lá:
                    </p>

                    {/* URL Display */}
                    <div className="flex items-center gap-2 p-3 bg-black/50 rounded-lg border border-cyan-700/50 mb-3">
                        <span className="flex-1 text-sm text-cyan-300 truncate font-mono">
                            github.com/frameforgeAPP
                        </span>
                        <button
                            onClick={handleCopyLink}
                            className={`px-3 py-1 rounded-lg text-sm font-bold transition-all ${copied
                                ? 'bg-cyan-600 text-white'
                                : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                                }`}
                        >
                            {copied ? '✓ Copiado!' : 'Copiar'}
                        </button>
                    </div>

                    {/* Share Options */}
                    <div className="grid grid-cols-3 gap-2">
                        <button
                            onClick={handleShareEmail}
                            className="flex flex-col items-center gap-1 p-3 bg-gray-800/50 hover:bg-gray-700/50 rounded-xl transition-all border border-cyan-800/30"
                        >
                            <Mail className="w-5 h-5 text-cyan-400" />
                            <span className="text-xs text-gray-400">Email</span>
                        </button>
                        <button
                            onClick={handleShareWhatsApp}
                            className="flex flex-col items-center gap-1 p-3 bg-gray-800/50 hover:bg-gray-700/50 rounded-xl transition-all border border-cyan-800/30"
                        >
                            <MessageCircle className="w-5 h-5 text-cyan-400" />
                            <span className="text-xs text-gray-400">WhatsApp</span>
                        </button>
                        <button
                            onClick={handleShareNative}
                            className="flex flex-col items-center gap-1 p-3 bg-gray-800/50 hover:bg-gray-700/50 rounded-xl transition-all border border-cyan-800/30"
                        >
                            <Share2 className="w-5 h-5 text-cyan-400" />
                            <span className="text-xs text-gray-400">Outros</span>
                        </button>
                    </div>
                </div>

                {/* Don't Show Again */}
                <label className="flex items-center gap-3 cursor-pointer justify-center">
                    <input
                        type="checkbox"
                        checked={dontShowAgain}
                        onChange={(e) => setDontShowAgain(e.target.checked)}
                        className="w-5 h-5 rounded border-cyan-600 bg-gray-800 text-cyan-600 focus:ring-2 focus:ring-cyan-500"
                    />
                    <span className="text-gray-400 text-sm">Não mostrar novamente</span>
                </label>

                {/* Continue Button */}
                <button
                    onClick={handleContinue}
                    className="flex items-center justify-center gap-3 p-4 bg-gray-800/50 hover:bg-gray-700/50 rounded-xl transition-all border border-cyan-700/50 shadow-[0_0_15px_rgba(0,243,255,0.1)] hover:shadow-[0_0_20px_rgba(0,243,255,0.2)]"
                >
                    <Play className="w-5 h-5 text-cyan-400" />
                    <span className="font-bold text-cyan-100">Entendi, vamos começar!</span>
                </button>

                <p className="text-center text-xs text-gray-600 pb-4">
                    Você pode acessar este tutorial novamente nas configurações
                </p>
            </div>
        </div>
    );
}
