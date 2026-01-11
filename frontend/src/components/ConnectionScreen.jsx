import React, { useState, useEffect } from 'react';
import { Scanner } from '@yudiel/react-qr-scanner';
import { Wifi, QrCode, Monitor, HelpCircle, Power, Info, Copy, Mail, MessageCircle, Share2, ExternalLink, ArrowLeft } from 'lucide-react';
import { Share } from '@capacitor/share';
import { t } from '../utils/i18n';
import { checkAfterburnerStatus, getStatusColor, getStatusMessage } from '../utils/afterburnerUtils';
import AfterburnerSetupModal from './AfterburnerSetupModal';

const SERVER_URL = 'https://github.com/frameforgeAPP/frameforge-server/releases';
const AFTERBURNER_URL = 'https://www.msi.com/Landing/afterburner/graphics-cards';

export default function ConnectionScreen({ onConnect, onDemo, serverAddress, setServerAddress, cameFromDashboard, onReconnect }) {
    const [showScanner, setShowScanner] = useState(false);
    const [manualIp, setManualIp] = useState(serverAddress || '');
    const [showManual, setShowManual] = useState(false);
    const [afterburnerStatus, setAfterburnerStatus] = useState(null);
    const [showSetupModal, setShowSetupModal] = useState(false);
    const [serverOnline, setServerOnline] = useState(false);
    const [copiedAfterburner, setCopiedAfterburner] = useState(false);
    const [copiedServer, setCopiedServer] = useState(false);
    const [isConnecting, setIsConnecting] = useState(false);
    const [connectionError, setConnectionError] = useState('');

    // Check Afterburner status when server address is available
    useEffect(() => {
        if (serverAddress || manualIp) {
            const address = serverAddress || manualIp;
            const checkStatus = async () => {
                const status = await checkAfterburnerStatus(address.startsWith('http') ? address : `http://${address}`);
                setAfterburnerStatus(status);
                setServerOnline(status !== null && status !== 'error');
            };

            checkStatus();
            const interval = setInterval(checkStatus, 3000);

            return () => clearInterval(interval);
        }
    }, [serverAddress, manualIp]);

    const handleCheckStatus = async () => {
        const address = serverAddress || manualIp;
        if (address) {
            const status = await checkAfterburnerStatus(address.startsWith('http') ? address : `http://${address}`);
            setAfterburnerStatus(status);
            setServerOnline(status !== null && status !== 'error');
        }
    };

    const handleScan = (result) => {
        if (result) {
            const rawValue = result[0]?.rawValue;
            if (rawValue) {
                let address = rawValue;
                if (!address.startsWith('http')) {
                    address = `http://${address}`;
                }
                onConnect(address);
                setShowScanner(false);
            }
        }
    };

    const handleManualConnect = async () => {
        if (!manualIp.trim()) {
            setConnectionError('Digite o IP do servidor');
            return;
        }

        setConnectionError('');
        setIsConnecting(true);

        let address = manualIp.trim();

        // Add port if not present
        if (!address.includes(':')) {
            address = `${address}:8000`;
        }

        // Add http if not present
        if (!address.startsWith('http')) {
            address = `http://${address}`;
        }

        // Try to verify connection before proceeding
        try {
            const response = await fetch(`${address}/api/server-info`, {
                method: 'GET',
                signal: AbortSignal.timeout(5000)
            });

            if (response.ok) {
                onConnect(address);
            } else {
                setConnectionError('Servidor não respondeu corretamente');
            }
        } catch (e) {
            // If fetch fails, still try to connect (socket.io may work)
            console.log('Direct API check failed, trying socket connection...');
            onConnect(address);
        } finally {
            setIsConnecting(false);
        }
    };

    // Copy/Share handlers for Afterburner
    const handleCopyAfterburner = async () => {
        try {
            await navigator.clipboard.writeText(AFTERBURNER_URL);
            setCopiedAfterburner(true);
            setTimeout(() => setCopiedAfterburner(false), 2000);
        } catch (e) {
            console.error('Copy failed', e);
        }
    };

    // Copy/Share handlers for Server
    const handleCopyServer = async () => {
        try {
            await navigator.clipboard.writeText(SERVER_URL);
            setCopiedServer(true);
            setTimeout(() => setCopiedServer(false), 2000);
        } catch (e) {
            console.error('Copy failed', e);
        }
    };

    const handleShareEmail = (url, name) => {
        const subject = encodeURIComponent(`${name} - Download`);
        const body = encodeURIComponent(`Baixe o ${name} no seu PC:\n\n${url}`);
        window.open(`mailto:?subject=${subject}&body=${body}`);
    };

    const handleShareWhatsApp = (url, name) => {
        const text = encodeURIComponent(`🎮 ${name}\n\nBaixe no seu PC:\n${url}`);
        window.open(`https://wa.me/?text=${text}`);
    };

    const handleShareNative = async (url, name) => {
        try {
            await Share.share({
                title: name,
                text: `Baixe o ${name} no seu PC: ${url}`,
                url: url,
                dialogTitle: 'Compartilhar link'
            });
        } catch (e) {
            console.error('Share failed', e);
        }
    };

    return (
        <div className="h-screen w-screen bg-black text-white flex flex-col items-center p-4 pt-6 relative overflow-y-auto">
            {/* Background Effects - Tron Style */}
            <div className="fixed inset-0 -z-10">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-cyan-900/20 via-black to-black"></div>
                <div
                    className="absolute inset-0 opacity-15"
                    style={{
                        backgroundImage: 'linear-gradient(rgba(0,243,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,243,255,0.1) 1px, transparent 1px)',
                        backgroundSize: '40px 40px'
                    }}
                ></div>
            </div>

            <div className="z-10 w-full max-w-md flex flex-col gap-4">
                {/* Header */}
                <div className="text-center mb-2">
                    <h1 className="text-3xl font-black tracking-tighter mb-1 bg-gradient-to-r from-cyan-400 via-blue-500 to-cyan-400 bg-clip-text text-transparent">
                        FrameForge
                    </h1>
                    <p className="text-cyan-500/60 text-xs tracking-widest uppercase">{t('performance_monitor')}</p>

                    {/* Demo Mode Button */}
                    {onDemo && (
                        <button
                            onClick={onDemo}
                            className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-purple-600/20 hover:bg-purple-600/40 border border-purple-500/50 rounded-full text-purple-400 text-xs font-medium transition-all"
                        >
                            ▶ Demo Mode
                        </button>
                    )}
                    {/* Back to Dashboard Button - Only show if came from dashboard */}
                    {cameFromDashboard && onReconnect && (
                        <button
                            onClick={onReconnect}
                            className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-cyan-600/20 hover:bg-cyan-600/40 border border-cyan-500/50 rounded-full text-cyan-400 text-xs font-medium transition-all"
                        >
                            <ArrowLeft size={14} />
                            Voltar ao Monitoramento
                        </button>
                    )}
                </div>

                {/* STEP 1: MSI Afterburner */}
                <div className="bg-gray-900/50 border border-cyan-800/50 rounded-2xl p-4">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 bg-gradient-to-br from-cyan-600 to-blue-600 rounded-full flex items-center justify-center text-xs font-bold">1</div>
                            <h3 className="font-bold text-cyan-400 text-sm">MSI Afterburner (PC)</h3>
                        </div>
                        {/* Status LED */}
                        <div className={`w-3 h-3 rounded-full ${afterburnerStatus === 'running' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]'}`} title={afterburnerStatus === 'running' ? 'Detectado' : 'Não detectado'} />
                    </div>
                    <p className="text-gray-400 text-xs mb-3">Programa gratuito que captura FPS dos jogos</p>

                    {/* URL Display */}
                    <div className="flex items-center gap-2 p-2 bg-black/50 rounded-lg border border-cyan-700/30 mb-2">
                        <span className="flex-1 text-xs text-cyan-300 truncate font-mono">msi.com/afterburner</span>
                        <button
                            onClick={handleCopyAfterburner}
                            className={`px-2 py-1 rounded text-xs font-bold transition-all ${copiedAfterburner
                                ? 'bg-cyan-600 text-white'
                                : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                                }`}
                        >
                            {copiedAfterburner ? '✓' : 'Copiar'}
                        </button>
                    </div>

                    {/* Share Options */}
                    <div className="grid grid-cols-3 gap-2">
                        <button onClick={() => handleShareEmail(AFTERBURNER_URL, 'MSI Afterburner')} className="flex flex-col items-center gap-1 p-2 bg-gray-800/50 hover:bg-gray-700/50 rounded-lg transition-all border border-cyan-800/30">
                            <Mail size={14} className="text-cyan-400" />
                            <span className="text-[10px] text-gray-400">Email</span>
                        </button>
                        <button onClick={() => handleShareWhatsApp(AFTERBURNER_URL, 'MSI Afterburner')} className="flex flex-col items-center gap-1 p-2 bg-gray-800/50 hover:bg-gray-700/50 rounded-lg transition-all border border-cyan-800/30">
                            <MessageCircle size={14} className="text-cyan-400" />
                            <span className="text-[10px] text-gray-400">WhatsApp</span>
                        </button>
                        <button onClick={() => handleShareNative(AFTERBURNER_URL, 'MSI Afterburner')} className="flex flex-col items-center gap-1 p-2 bg-gray-800/50 hover:bg-gray-700/50 rounded-lg transition-all border border-cyan-800/30">
                            <Share2 size={14} className="text-cyan-400" />
                            <span className="text-[10px] text-gray-400">Outros</span>
                        </button>
                    </div>
                </div>

                {/* STEP 2: FrameForge Server */}
                <div className="bg-gray-900/50 border border-cyan-800/50 rounded-2xl p-4">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 bg-gradient-to-br from-cyan-600 to-blue-600 rounded-full flex items-center justify-center text-xs font-bold">2</div>
                            <Monitor size={16} className="text-cyan-400" />
                            <h3 className="font-bold text-cyan-400 text-sm">FrameForge Server (PC)</h3>
                        </div>
                        {/* Status LED */}
                        <div className={`w-3 h-3 rounded-full ${serverOnline ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]'}`} title={serverOnline ? 'Online' : 'Offline'} />
                    </div>
                    <p className="text-gray-400 text-xs mb-3">Nosso programa que envia dados para o celular</p>

                    {/* URL Display */}
                    <div className="flex items-center gap-2 p-2 bg-black/50 rounded-lg border border-cyan-700/30 mb-2">
                        <span className="flex-1 text-xs text-cyan-300 truncate font-mono">github.com/frameforgeAPP</span>
                        <button
                            onClick={handleCopyServer}
                            className={`px-2 py-1 rounded text-xs font-bold transition-all ${copiedServer
                                ? 'bg-cyan-600 text-white'
                                : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                                }`}
                        >
                            {copiedServer ? '✓' : 'Copiar'}
                        </button>
                    </div>

                    {/* Share Options */}
                    <div className="grid grid-cols-3 gap-2">
                        <button onClick={() => handleShareEmail(SERVER_URL, 'FrameForge Server')} className="flex flex-col items-center gap-1 p-2 bg-gray-800/50 hover:bg-gray-700/50 rounded-lg transition-all border border-cyan-800/30">
                            <Mail size={14} className="text-cyan-400" />
                            <span className="text-[10px] text-gray-400">Email</span>
                        </button>
                        <button onClick={() => handleShareWhatsApp(SERVER_URL, 'FrameForge Server')} className="flex flex-col items-center gap-1 p-2 bg-gray-800/50 hover:bg-gray-700/50 rounded-lg transition-all border border-cyan-800/30">
                            <MessageCircle size={14} className="text-cyan-400" />
                            <span className="text-[10px] text-gray-400">WhatsApp</span>
                        </button>
                        <button onClick={() => handleShareNative(SERVER_URL, 'FrameForge Server')} className="flex flex-col items-center gap-1 p-2 bg-gray-800/50 hover:bg-gray-700/50 rounded-lg transition-all border border-cyan-800/30">
                            <Share2 size={14} className="text-cyan-400" />
                            <span className="text-[10px] text-gray-400">Outros</span>
                        </button>
                    </div>
                </div>

                {/* Network Notice */}
                <div className="bg-blue-900/20 border border-blue-700/30 rounded-xl p-3">
                    <div className="flex items-start gap-2">
                        <Info size={14} className="text-blue-400 mt-0.5 flex-shrink-0" />
                        <p className="text-gray-400 text-xs leading-relaxed">
                            <span className="text-blue-300 font-medium">Mesma rede Wi-Fi.</span> Conexão automática. Use QR/manual se houver erro.
                        </p>
                    </div>
                </div>

                {/* Connection Options */}
                {showScanner ? (
                    <div className="flex flex-col items-center gap-3">
                        <div className="w-56 h-56 border-2 border-cyan-500 rounded-xl overflow-hidden relative shadow-[0_0_20px_rgba(0,243,255,0.3)]">
                            <Scanner
                                onScan={handleScan}
                                styles={{ container: { width: '100%', height: '100%' } }}
                            />
                        </div>
                        <button
                            onClick={() => setShowScanner(false)}
                            className="text-cyan-400 hover:text-white text-sm"
                        >
                            Cancelar
                        </button>
                    </div>
                ) : (
                    <div className="flex flex-col gap-3">
                        {/* Scan QR Button */}
                        <button
                            onClick={() => setShowScanner(true)}
                            className="flex items-center justify-center gap-2 p-3 bg-gradient-to-r from-cyan-600/80 to-blue-600/80 hover:from-cyan-500 hover:to-blue-500 rounded-xl transition-all shadow-lg shadow-cyan-900/30 border border-cyan-500/30"
                        >
                            <QrCode size={20} />
                            <span className="font-bold text-sm">{t('scan_qr')}</span>
                        </button>

                        {/* Manual IP Button */}
                        <button
                            onClick={() => setShowManual(!showManual)}
                            className="flex items-center justify-center gap-2 p-3 bg-gray-800/50 hover:bg-gray-700/50 rounded-xl transition-all border border-cyan-700/50"
                        >
                            <Wifi size={20} className="text-cyan-400" />
                            <span className="font-bold text-sm text-cyan-200">{t('manual_connection')}</span>
                        </button>

                        {/* Manual IP Input */}
                        {showManual && (
                            <div className="bg-gray-900/50 p-3 rounded-xl border border-cyan-800/50">
                                <input
                                    type="text"
                                    value={manualIp}
                                    onChange={(e) => { setManualIp(e.target.value); setConnectionError(''); }}
                                    placeholder="192.168.1.xxx"
                                    className={`w-full bg-black border rounded-lg p-2 text-cyan-100 focus:border-cyan-500 outline-none mb-2 font-mono text-center text-sm ${connectionError ? 'border-red-500' : 'border-cyan-700/50'}`}
                                    onKeyDown={(e) => e.key === 'Enter' && handleManualConnect()}
                                />
                                {connectionError && (
                                    <p className="text-red-400 text-xs text-center mb-2">{connectionError}</p>
                                )}
                                <p className="text-gray-500 text-[10px] text-center mb-2">Porta :8000 será adicionada automaticamente</p>
                                <button
                                    onClick={handleManualConnect}
                                    disabled={isConnecting}
                                    className={`w-full py-2 rounded-lg font-bold text-sm border transition-all ${isConnecting
                                        ? 'bg-gray-700/50 border-gray-600/50 text-gray-400 cursor-wait'
                                        : 'bg-cyan-700/50 hover:bg-cyan-600/50 border-cyan-600/50 text-white'}`}
                                >
                                    {isConnecting ? '⏳ Conectando...' : t('connect')}
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <div className="mt-4 pb-6 text-xs text-cyan-600/50">
                v1.2.0 • {t('built_for_gamers')}
            </div>

            {/* Afterburner Setup Modal */}
            <AfterburnerSetupModal
                isOpen={showSetupModal}
                onClose={() => setShowSetupModal(false)}
                onCheckStatus={handleCheckStatus}
                currentStatus={afterburnerStatus}
            />
        </div>
    );
}
