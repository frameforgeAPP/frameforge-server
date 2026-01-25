import React, { useState } from 'react';
import { X, Settings, Monitor, Activity, Wifi, Shield, Globe, Download, ExternalLink, Copy, Check } from 'lucide-react';
import { t } from '../utils/i18n';

export default function ConfigGuideModal({ isOpen, onClose }) {
    if (!isOpen) return null;

    const [activeTab, setActiveTab] = useState('fps'); // 'fps' or 'connection'
    const [copied, setCopied] = useState(null);

    const handleCopy = (text, key) => {
        navigator.clipboard.writeText(text);
        setCopied(key);
        setTimeout(() => setCopied(null), 2000);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-gray-900 border border-gray-700 rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-800 shrink-0">
                    <div className="flex items-center gap-3">
                        <Settings className="w-6 h-6 text-cyan-400" />
                        <h2 className="text-xl font-bold text-white">Guia de Configuração</h2>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded-lg transition-colors">
                        <X className="w-5 h-5 text-gray-400" />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-800 shrink-0">
                    <button
                        onClick={() => setActiveTab('fps')}
                        className={`flex-1 py-3 text-sm font-bold transition-colors relative ${activeTab === 'fps' ? 'text-cyan-400 bg-cyan-500/10' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}
                    >
                        FPS & Stats
                        {activeTab === 'fps' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-400" />}
                    </button>
                    <button
                        onClick={() => setActiveTab('connection')}
                        className={`flex-1 py-3 text-sm font-bold transition-colors relative ${activeTab === 'connection' ? 'text-green-400 bg-green-500/10' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}
                    >
                        Conexão PC
                        {activeTab === 'connection' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-400" />}
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6 overflow-y-auto">
                    {activeTab === 'fps' ? (
                        <>
                            <p className="text-gray-300 text-sm leading-relaxed">
                                Para ver o FPS, você precisa do <b>MSI Afterburner</b> e <b>RivaTuner (RTSS)</b> instalados e rodando no PC.
                            </p>

                            {/* Step 1 */}
                            <div className="bg-gray-800/50 p-4 rounded-xl border border-gray-700">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400 font-bold">1</div>
                                    <h3 className="font-bold text-white">Instale os Programas</h3>
                                </div>
                                <p className="text-sm text-gray-400 ml-11 mb-3">
                                    Baixe e instale o MSI Afterburner (o RivaTuner vem junto).
                                </p>

                                <div className="ml-11 bg-black/30 p-3 rounded-lg border border-gray-700 flex items-center justify-between gap-2">
                                    <span className="text-xs text-cyan-300 truncate font-mono">https://www.msi.com/Landing/afterburner/graphics-cards</span>
                                    <button
                                        onClick={() => handleCopy('https://www.msi.com/Landing/afterburner/graphics-cards', 'msi')}
                                        className="p-1.5 hover:bg-white/10 rounded-md transition-colors text-gray-400 hover:text-white"
                                        title="Copiar Link"
                                    >
                                        {copied === 'msi' ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                                    </button>
                                </div>
                            </div>

                            {/* Step 2 */}
                            <div className="bg-gray-800/50 p-4 rounded-xl border border-gray-700">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 font-bold">2</div>
                                    <h3 className="font-bold text-white">Mantenha Aberto</h3>
                                </div>
                                <p className="text-sm text-gray-400 ml-11">
                                    Abra o <b>MSI Afterburner</b> e o <b>RivaTuner</b>. Eles devem ficar abertos (minimizado na bandeja) enquanto você joga.
                                </p>
                            </div>

                            {/* Step 3 */}
                            <div className="bg-gray-800/50 p-4 rounded-xl border border-gray-700">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 font-bold">3</div>
                                    <h3 className="font-bold text-white">Configure o Setup</h3>
                                </div>
                                <ul className="text-sm text-gray-400 ml-11 list-disc space-y-1">
                                    <li>Application detection level: <b>Low</b> ou <b>Medium</b></li>
                                    <li>Show On-Screen Display: <b>ON</b></li>
                                </ul>
                            </div>

                            <div className="bg-blue-900/20 p-4 rounded-xl border border-blue-500/30 flex gap-3">
                                <Activity className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                                <p className="text-xs text-blue-200">
                                    Abra um jogo para testar. O FPS deve aparecer aqui automaticamente.
                                </p>
                            </div>
                        </>
                    ) : (
                        <>
                            <p className="text-gray-300 text-sm leading-relaxed">
                                O app precisa se comunicar com o seu PC para receber os dados.
                            </p>

                            {/* Step 1 */}
                            <div className="bg-gray-800/50 p-4 rounded-xl border border-gray-700">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold">1</div>
                                    <h3 className="font-bold text-white">FrameForge Server</h3>
                                </div>
                                <p className="text-sm text-gray-400 ml-11 mb-3">
                                    Baixe e execute o <b>FrameForgeServer.exe</b> no seu computador. Ele deve ficar aberto.
                                </p>
                                <div className="ml-11 bg-black/30 p-3 rounded-lg border border-gray-700 flex items-center justify-between gap-2">
                                    <span className="text-xs text-blue-300 truncate font-mono">https://github.com/seu-usuario/frameforge/releases</span>
                                    <button
                                        onClick={() => handleCopy('https://github.com/seu-usuario/frameforge/releases', 'server')}
                                        className="p-1.5 hover:bg-white/10 rounded-md transition-colors text-gray-400 hover:text-white"
                                        title="Copiar Link"
                                    >
                                        {copied === 'server' ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                                    </button>
                                </div>
                            </div>

                            {/* Step 2 */}
                            <div className="bg-gray-800/50 p-4 rounded-xl border border-gray-700">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 font-bold">2</div>
                                    <h3 className="font-bold text-white">Conexão Automática</h3>
                                </div>
                                <div className="ml-11">
                                    <p className="text-sm text-gray-400 mb-2">
                                        Se o celular e o PC estiverem no <b>mesmo Wi-Fi</b>, a conexão deve ser automática.
                                    </p>
                                    <div className="flex items-center gap-2 text-xs text-green-400 bg-green-900/20 p-2 rounded-lg border border-green-500/20">
                                        <Wifi size={14} />
                                        <span>Certifique-se que o Wi-Fi é o mesmo.</span>
                                    </div>
                                </div>
                            </div>

                            {/* Step 3 */}
                            <div className="bg-gray-800/50 p-4 rounded-xl border border-gray-700">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-400 font-bold">3</div>
                                    <h3 className="font-bold text-white">Conexão Manual</h3>
                                </div>
                                <p className="text-sm text-gray-400 ml-11 mb-2">
                                    Se não conectar, olhe o IP mostrado na tela preta do Server no PC (ex: 192.168.x.x) e digite na tela inicial do app.
                                </p>
                            </div>

                            {/* Firewall Tip */}
                            <div className="bg-red-900/20 p-4 rounded-xl border border-red-500/30 flex gap-3">
                                <Shield className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                                <div className="text-xs text-red-200">
                                    <span className="font-bold block mb-1">Firewall do Windows</span>
                                    Se o Windows perguntar, permita o acesso do Server nas redes <b>Privadas</b> e <b>Públicas</b>.
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-800 shrink-0">
                    <button
                        onClick={onClose}
                        className="w-full py-3 bg-cyan-600 hover:bg-cyan-500 rounded-xl font-bold text-white transition-colors"
                    >
                        Entendi
                    </button>
                </div>
            </div>
        </div>
    );
}
