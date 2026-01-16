import React, { useState, useEffect } from 'react';
import { Heart, Copy, ExternalLink, X, Check, Sparkles, Coffee, Zap, Gift, Star } from 'lucide-react';
import QRCode from 'react-qr-code';
import { t } from '../utils/i18n';

export default function DonationModal({ onClose }) {
    const [copied, setCopied] = useState(false);

    // Detect language for default tab and order
    const isPt = navigator.language?.startsWith('pt');
    const [activeTab, setActiveTab] = useState(isPt ? 'pix' : 'paypal');

    // REPLACE WITH YOUR ACTUAL PIX KEY
    const pixKey = "00020126410014BR.GOV.BCB.PIX0119ad1000rso@gmail.com5204000053039865802BR5925Ademir Martin Gonzales Ju6009SAO PAULO62140510iNlqO1pmCE6304C7B3";
    const displayPixKey = pixKey.substring(0, 60) + "..." + pixKey.substring(pixKey.length - 20); // Hide name completely in display
    const buyMeCoffeeUrl = "https://www.paypal.com/cgi-bin/webscr?cmd=_donations&business=frameforgeapp@gmail.com&currency_code=BRL&source=url";

    const handleCopy = () => {
        navigator.clipboard.writeText(pixKey);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    // Define tabs content
    const tabs = {
        pix: (
            <div className="bg-gray-800/40 rounded-2xl p-5 border border-gray-700/50">
                <div className="flex justify-center mb-4">
                    <div className="bg-white p-3 rounded-xl shadow-lg">
                        <QRCode value={pixKey} size={130} />
                    </div>
                </div>

                <p className="text-center text-sm text-gray-400 mb-3">
                    {t('scan_pix')}
                </p>

                <div className="flex gap-2">
                    <input
                        type="text"
                        value={displayPixKey}
                        readOnly
                        className="bg-gray-900/80 border border-gray-700 text-gray-400 text-xs rounded-xl px-3 py-3 w-full outline-none font-mono truncate select-all"
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
        ),
        kofi: (
            <div className="flex flex-col gap-4">
                <a
                    href="https://ko-fi.com/frameforge"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-3 py-4 bg-gradient-to-r from-blue-500 to-sky-600 hover:from-blue-400 hover:to-sky-500 text-white font-bold rounded-2xl transition-all hover:scale-[1.02] hover:shadow-lg hover:shadow-blue-500/30"
                >
                    <Coffee size={22} />
                    Support on Ko-fi
                    <ExternalLink size={16} />
                </a>

                <p className="text-center text-xs text-gray-500">
                    {t('international_payments')}
                </p>
            </div>
        ),
        paypal: (
            <div className="flex flex-col gap-4">
                <a
                    href={buyMeCoffeeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-3 py-4 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white font-bold rounded-2xl transition-all hover:scale-[1.02] hover:shadow-lg hover:shadow-indigo-500/30"
                >
                    <Coffee size={22} />
                    Donate with PayPal
                    <ExternalLink size={16} />
                </a>

                <p className="text-center text-xs text-gray-500">
                    {t('international_payments')}
                </p>
            </div>
        )
    };

    // Define tab buttons order
    const tabButtons = isPt ? [
        { id: 'pix', label: '🇧🇷 PIX', color: 'green' },
        { id: 'paypal', label: '💳 PayPal', color: 'indigo' },
        { id: 'kofi', label: '☕ Ko-fi', color: 'blue' }
    ] : [
        { id: 'paypal', label: '💳 PayPal', color: 'indigo' },
        { id: 'kofi', label: '☕ Ko-fi', color: 'blue' },
        { id: 'pix', label: '🇧🇷 PIX', color: 'green' }
    ];

    const getTabColorClass = (color, isActive) => {
        if (!isActive) return 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50';
        switch (color) {
            case 'green': return 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg shadow-green-500/30';
            case 'blue': return 'bg-gradient-to-r from-blue-500 to-sky-600 text-white shadow-lg shadow-blue-500/30';
            case 'indigo': return 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/30';
            default: return '';
        }
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
                        {t('support_frameforge')}
                        <Sparkles className="w-5 h-5 text-yellow-400" />
                    </h2>
                    <p className="text-gray-400 text-sm leading-relaxed">
                        {t('donation_description')}
                    </p>
                </div>

                {/* Benefits */}
                <div className="mx-6 mb-6 grid grid-cols-3 gap-2">
                    <div className="flex flex-col items-center text-center p-3 bg-gray-800/30 rounded-xl border border-gray-700/50">
                        <Zap className="w-5 h-5 text-yellow-400 mb-1" />
                        <span className="text-xs text-gray-400">{t('faster_updates')}</span>
                    </div>
                    <div className="flex flex-col items-center text-center p-3 bg-gray-800/30 rounded-xl border border-gray-700/50">
                        <Star className="w-5 h-5 text-purple-400 mb-1" />
                        <span className="text-xs text-gray-400">{t('new_themes')}</span>
                    </div>
                    <div className="flex flex-col items-center text-center p-3 bg-gray-800/30 rounded-xl border border-gray-700/50">
                        <Gift className="w-5 h-5 text-green-400 mb-1" />
                        <span className="text-xs text-gray-400">{t('exclusive')}</span>
                    </div>
                </div>

                {/* Tab Selector */}
                <div className="flex gap-2 mx-6 mb-4">
                    {tabButtons.map(btn => (
                        <button
                            key={btn.id}
                            onClick={() => setActiveTab(btn.id)}
                            className={`flex-1 py-2 px-4 rounded-xl font-medium text-sm transition-all ${getTabColorClass(btn.color, activeTab === btn.id)}`}
                        >
                            {btn.label}
                        </button>
                    ))}
                </div>

                {/* Content Area */}
                <div className="px-6 pb-6">
                    {tabs[activeTab]}
                </div>

                {/* Footer */}
                <div className="text-center pb-6 px-6">
                    <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                        <Heart className="w-3 h-3 text-pink-400 fill-pink-400" />
                        <span>{t('thanks_support')}</span>
                        <Heart className="w-3 h-3 text-pink-400 fill-pink-400" />
                    </div>
                </div>
            </div>
        </div>
    );
}
