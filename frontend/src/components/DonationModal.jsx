import React, { useState } from 'react';
import { Heart, Copy, ExternalLink, X, Check, Sparkles, Coffee, Zap, Gift, Star } from 'lucide-react';
import QRCode from 'react-qr-code';
import { t } from '../utils/i18n';

export default function DonationModal({ onClose }) {
    const [copied, setCopied] = useState(false);
    const [activeTab, setActiveTab] = useState('pix');

    // REPLACE WITH YOUR ACTUAL PIX KEY
    const pixKey = "00020126330014BR.GOV.BCB.PIX0111your-pix-key5204000053039865802BR5913Your Name6008City62070503***63041234";
    const buyMeCoffeeUrl = "https://buymeacoffee.com/yourusername";

    const handleCopy = () => {
        navigator.clipboard.writeText(pixKey);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex items-center justify-center animate-in fade-in duration-300 p-4 overflow-y-auto" onClick={onClose}>
            <div className="bg-gradient-to-b from-gray-900 to-gray-950 border border-gray-800 rounded-3xl max-w-md w-full relative shadow-2xl shadow-purple-500/10 my-auto overflow-hidden" onClick={e => e.stopPropagation()}>

                {/* Animated Background Glow */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-gradient-to-b from-purple-500/20 via-pink-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-10 text-gray-500 hover:text-white transition-colors p-2 rounded-full hover:bg-gray-800/50"
                >
                    <X size={20} />
                </button>

                {/* Header */}
                <div className="text-center pt-10 pb-6 px-8 relative">
                    <div className="inline-flex items-center justify-center p-4 bg-gradient-to-br from-pink-500 to-purple-600 rounded-2xl mb-4 shadow-lg shadow-pink-500/30">
                        <Heart className="text-white fill-white" size={28} />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2 flex items-center justify-center gap-2">
                        <Sparkles className="w-5 h-5 text-yellow-400" />
                        {t('support_frameforge') || 'Apoie o FrameForge'}
                        <Sparkles className="w-5 h-5 text-yellow-400" />
                    </h2>
                    <p className="text-gray-400 text-sm leading-relaxed">
                        {t('donation_description') || 'Sua doação ajuda a manter o app gratuito e com atualizações constantes!'}
                    </p>
                </div>

                {/* Benefits */}
                <div className="mx-6 mb-6 grid grid-cols-3 gap-2">
                    <div className="flex flex-col items-center text-center p-3 bg-gray-800/30 rounded-xl border border-gray-700/50">
                        <Zap className="w-5 h-5 text-yellow-400 mb-1" />
                        <span className="text-xs text-gray-400">{t('faster_updates') || 'Updates'}</span>
                    </div>
                    <div className="flex flex-col items-center text-center p-3 bg-gray-800/30 rounded-xl border border-gray-700/50">
                        <Star className="w-5 h-5 text-purple-400 mb-1" />
                        <span className="text-xs text-gray-400">{t('new_themes') || 'Temas'}</span>
                    </div>
                    <div className="flex flex-col items-center text-center p-3 bg-gray-800/30 rounded-xl border border-gray-700/50">
                        <Gift className="w-5 h-5 text-green-400 mb-1" />
                        <span className="text-xs text-gray-400">{t('exclusive') || 'Exclusivo'}</span>
                    </div>
                </div>

                {/* Tab Selector */}
                <div className="flex gap-2 mx-6 mb-4">
                    <button
                        onClick={() => setActiveTab('pix')}
                        className={`flex-1 py-2 px-4 rounded-xl font-medium text-sm transition-all ${activeTab === 'pix'
                                ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg shadow-green-500/30'
                                : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50'
                            }`}
                    >
                        🇧🇷 PIX
                    </button>
                    <button
                        onClick={() => setActiveTab('coffee')}
                        className={`flex-1 py-2 px-4 rounded-xl font-medium text-sm transition-all ${activeTab === 'coffee'
                                ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-lg shadow-yellow-500/30'
                                : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50'
                            }`}
                    >
                        ☕ Coffee
                    </button>
                </div>

                {/* Content Area */}
                <div className="px-6 pb-6">
                    {activeTab === 'pix' ? (
                        <div className="bg-gray-800/40 rounded-2xl p-5 border border-gray-700/50">
                            <div className="flex justify-center mb-4">
                                <div className="bg-white p-3 rounded-xl shadow-lg">
                                    <QRCode value={pixKey} size={130} />
                                </div>
                            </div>

                            <p className="text-center text-sm text-gray-400 mb-3">
                                {t('scan_pix') || 'Escaneie ou copie a chave PIX'}
                            </p>

                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={pixKey}
                                    readOnly
                                    className="bg-gray-900/80 border border-gray-700 text-gray-400 text-xs rounded-xl px-3 py-3 w-full outline-none font-mono truncate"
                                />
                                <button
                                    onClick={handleCopy}
                                    className={`px-4 rounded-xl transition-all font-medium text-sm ${copied
                                            ? 'bg-green-500 text-white'
                                            : 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:shadow-lg hover:shadow-green-500/30'
                                        }`}
                                >
                                    {copied ? <Check size={18} /> : <Copy size={18} />}
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-4">
                            <a
                                href={buyMeCoffeeUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-center gap-3 py-4 bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-300 hover:to-orange-400 text-gray-900 font-bold rounded-2xl transition-all hover:scale-[1.02] hover:shadow-lg hover:shadow-yellow-500/30"
                            >
                                <Coffee size={22} />
                                Buy me a Coffee
                                <ExternalLink size={16} />
                            </a>

                            <p className="text-center text-xs text-gray-500">
                                {t('international_payments') || 'Para pagamentos internacionais'}
                            </p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="text-center pb-6 px-6">
                    <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                        <Heart className="w-3 h-3 text-pink-400 fill-pink-400" />
                        <span>{t('thanks_support') || 'Obrigado por apoiar!'}</span>
                        <Heart className="w-3 h-3 text-pink-400 fill-pink-400" />
                    </div>
                </div>
            </div>
        </div>
    );
}
