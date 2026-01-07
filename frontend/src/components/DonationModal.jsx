import React, { useState } from 'react';
import { Heart, Copy, ExternalLink, X, Check } from 'lucide-react';
import QRCode from 'react-qr-code';

export default function DonationModal({ onClose }) {
    const [copied, setCopied] = useState(false);

    // REPLACE THIS WITH YOUR ACTUAL PIX KEY
    const pixKey = "00020126330014BR.GOV.BCB.PIX0111your-pix-key5204000053039865802BR5913Your Name6008City62070503***63041234";
    const buyMeCoffeeUrl = "https://buymeacoffee.com/yourusername";

    const handleCopy = () => {
        navigator.clipboard.writeText(pixKey);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center animate-in fade-in duration-300 p-4 overflow-y-auto" onClick={onClose}>
            <div className="bg-gray-900 border border-gray-700 rounded-3xl p-8 max-w-md w-full relative shadow-2xl my-auto" onClick={e => e.stopPropagation()}>

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
                >
                    <X size={24} />
                </button>

                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center p-3 bg-red-500/10 rounded-full mb-4">
                        <Heart className="text-red-500 fill-red-500 animate-pulse" size={32} />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">Support Antigravity</h2>
                    <p className="text-gray-400 text-sm">
                        Help us keep the updates coming and unlock exclusive themes (coming soon).
                    </p>
                </div>

                {/* Pix Section */}
                <div className="bg-black/50 rounded-xl p-6 mb-6 border border-gray-800 flex flex-col items-center">
                    <span className="text-gray-300 font-bold mb-4 flex items-center gap-2">
                        <img src="https://upload.wikimedia.org/wikipedia/commons/a/a2/Logo_Pix.png" alt="Pix" className="h-6 opacity-80 invert" />
                        Instant Donation
                    </span>

                    <div className="bg-white p-2 rounded-lg mb-4">
                        <QRCode value={pixKey} size={150} />
                    </div>

                    <div className="w-full flex gap-2">
                        <input
                            type="text"
                            value={pixKey}
                            readOnly
                            className="bg-gray-800 border border-gray-700 text-gray-400 text-xs rounded-lg px-3 py-2 w-full outline-none font-mono truncate"
                        />
                        <button
                            onClick={handleCopy}
                            className={`p-2 rounded-lg transition-all ${copied ? 'bg-green-500 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                        >
                            {copied ? <Check size={18} /> : <Copy size={18} />}
                        </button>
                    </div>
                </div>

                {/* External Link */}
                <a
                    href={buyMeCoffeeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full py-3 bg-yellow-400 hover:bg-yellow-300 text-yellow-900 font-bold rounded-xl transition-all hover:scale-105"
                >
                    <ExternalLink size={20} />
                    Buy me a Coffee
                </a>

                <div className="text-center mt-6 text-xs text-gray-600">
                    Thank you for being a supporter! 🚀
                </div>

            </div>
        </div>
    );
}
