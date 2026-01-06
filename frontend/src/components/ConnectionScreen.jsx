import React, { useState, useEffect } from 'react';
import { Scanner } from '@yudiel/react-qr-scanner';
import { Wifi, Play, QrCode, Settings, Monitor } from 'lucide-react';

export default function ConnectionScreen({ onConnect, onDemo, serverAddress, setServerAddress }) {
    const [showScanner, setShowScanner] = useState(false);
    const [manualIp, setManualIp] = useState(serverAddress || '');
    const [showManual, setShowManual] = useState(false);

    const handleScan = (result) => {
        if (result) {
            const rawValue = result[0]?.rawValue;
            if (rawValue) {
                // Expecting "http://IP:PORT" or just "IP:PORT"
                let address = rawValue;
                if (!address.startsWith('http')) {
                    address = `http://${address}`;
                }
                onConnect(address);
                setShowScanner(false);
            }
        }
    };

    const handleManualConnect = () => {
        let address = manualIp;
        if (!address.startsWith('http')) {
            address = `http://${address}`;
        }
        onConnect(address);
    };

    return (
        <div className="h-screen w-screen bg-black text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-gray-800/20 via-black to-black"></div>

            <div className="z-10 w-full max-w-md flex flex-col gap-6">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-black tracking-tighter mb-2 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                        ANTIGRAVITY
                    </h1>
                    <p className="text-gray-500 text-sm tracking-widest uppercase">Performance Monitor</p>
                </div>

                {showScanner ? (
                    <div className="flex flex-col items-center gap-4 animate-in fade-in zoom-in duration-300">
                        <div className="w-64 h-64 border-2 border-blue-500 rounded-xl overflow-hidden relative shadow-[0_0_30px_rgba(59,130,246,0.3)]">
                            <Scanner
                                onScan={handleScan}
                                styles={{ container: { width: '100%', height: '100%' } }}
                            />
                            <div className="absolute inset-0 border-2 border-blue-500/50 animate-pulse"></div>
                        </div>
                        <button
                            onClick={() => setShowScanner(false)}
                            className="text-gray-400 hover:text-white text-sm"
                        >
                            Cancel Scanning
                        </button>
                    </div>
                ) : (
                    <div className="flex flex-col gap-4 animate-in slide-in-from-bottom-4 duration-500">
                        {/* Scan QR Button */}
                        <button
                            onClick={() => setShowScanner(true)}
                            className="group relative flex items-center justify-center gap-3 p-4 bg-blue-600 hover:bg-blue-500 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-blue-900/20"
                        >
                            <QrCode className="w-6 h-6" />
                            <span className="font-bold">Scan QR Code</span>
                            <div className="absolute inset-0 rounded-xl ring-2 ring-white/20 group-hover:ring-white/40 transition-all"></div>
                        </button>

                        {/* Manual IP Button */}
                        <button
                            onClick={() => setShowManual(!showManual)}
                            className="flex items-center justify-center gap-3 p-4 bg-gray-800 hover:bg-gray-700 rounded-xl transition-all border border-gray-700"
                        >
                            <Wifi className="w-6 h-6 text-gray-400" />
                            <span className="font-bold text-gray-200">Manual Connection</span>
                        </button>

                        {/* Manual IP Input */}
                        {showManual && (
                            <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-800 animate-in fade-in slide-in-from-top-2">
                                <input
                                    type="text"
                                    value={manualIp}
                                    onChange={(e) => setManualIp(e.target.value)}
                                    placeholder="192.168.1.X:8000"
                                    className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white focus:border-blue-500 outline-none mb-3 font-mono text-center"
                                />
                                <button
                                    onClick={handleManualConnect}
                                    className="w-full py-2 bg-gray-700 hover:bg-gray-600 rounded-lg font-bold text-sm"
                                >
                                    Connect
                                </button>
                            </div>
                        )}

                        <div className="h-px bg-gray-800 my-2"></div>

                        {/* Demo Mode Button */}
                        <button
                            onClick={onDemo}
                            className="flex items-center justify-center gap-3 p-4 bg-transparent hover:bg-white/5 rounded-xl transition-all border border-gray-800 hover:border-gray-600 group"
                        >
                            <Play className="w-6 h-6 text-purple-500 group-hover:scale-110 transition-transform" />
                            <span className="font-bold text-gray-300">Try Demo Mode</span>
                        </button>
                    </div>
                )}
            </div>

            <div className="absolute bottom-6 text-xs text-gray-600">
                v1.0.0 • Built for Gamers
            </div>
        </div>
    );
}
