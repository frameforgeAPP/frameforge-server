import React from 'react';
import { X, Download, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';

export default function AfterburnerSetupModal({ isOpen, onClose, onCheckStatus, currentStatus }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-gray-900 border border-gray-800 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-gray-900 border-b border-gray-800 p-6 flex items-center justify-between">
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                        Como Instalar Afterburner
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                    >
                        <X className="w-6 h-6 text-gray-400" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Current Status */}
                    <div className={`p-4 rounded-xl border ${currentStatus === 'running'
                            ? 'bg-green-900/20 border-green-800'
                            : currentStatus === 'installed'
                                ? 'bg-yellow-900/20 border-yellow-800'
                                : 'bg-red-900/20 border-red-800'
                        }`}>
                        <div className="flex items-center gap-3">
                            {currentStatus === 'running' ? (
                                <CheckCircle className="w-6 h-6 text-green-400" />
                            ) : (
                                <AlertCircle className="w-6 h-6 text-yellow-400" />
                            )}
                            <div className="flex-1">
                                <p className="font-bold">
                                    {currentStatus === 'running' && 'Afterburner Detectado!'}
                                    {currentStatus === 'installed' && 'Afterburner Instalado'}
                                    {currentStatus === 'not-found' && 'Afterburner Não Encontrado'}
                                </p>
                                <p className="text-sm text-gray-400">
                                    {currentStatus === 'running' && 'Tudo pronto para usar!'}
                                    {currentStatus === 'installed' && 'Por favor, abra o programa'}
                                    {currentStatus === 'not-found' && 'Siga os passos abaixo'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Steps */}
                    <div className="space-y-4">
                        {/* Step 1 */}
                        <div className="bg-black/30 border border-gray-800 rounded-xl p-4">
                            <div className="flex items-start gap-4">
                                <div className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center font-bold">
                                    1
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-bold text-lg mb-2">Download</h3>
                                    <p className="text-gray-400 text-sm mb-3">
                                        Baixe o MSI Afterburner do site oficial
                                    </p>
                                    <a
                                        href="https://www.msi.com/Landing/afterburner/graphics-cards"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm font-bold transition-colors"
                                    >
                                        <Download className="w-4 h-4" />
                                        Baixar Afterburner
                                    </a>
                                    <div className="mt-3 flex items-center gap-2 text-green-400 text-sm">
                                        <CheckCircle className="w-4 h-4" />
                                        <span>RivaTuner vem incluído automaticamente!</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Step 2 */}
                        <div className="bg-black/30 border border-gray-800 rounded-xl p-4">
                            <div className="flex items-start gap-4">
                                <div className="flex-shrink-0 w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center font-bold">
                                    2
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-bold text-lg mb-2">Instalação</h3>
                                    <ul className="text-gray-400 text-sm space-y-2">
                                        <li className="flex items-start gap-2">
                                            <span className="text-purple-400 mt-1">•</span>
                                            <span>Execute o instalador baixado</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-purple-400 mt-1">•</span>
                                            <span>Aceite todas as opções padrão</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-purple-400 mt-1">•</span>
                                            <span>RTSS será instalado automaticamente junto</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* Step 3 */}
                        <div className="bg-black/30 border border-gray-800 rounded-xl p-4">
                            <div className="flex items-start gap-4">
                                <div className="flex-shrink-0 w-8 h-8 bg-pink-600 rounded-full flex items-center justify-center font-bold">
                                    3
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-bold text-lg mb-2">Executar</h3>
                                    <ul className="text-gray-400 text-sm space-y-2">
                                        <li className="flex items-start gap-2">
                                            <span className="text-pink-400 mt-1">•</span>
                                            <span>Abra o MSI Afterburner</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-pink-400 mt-1">•</span>
                                            <span>Deixe rodando em segundo plano</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-pink-400 mt-1">•</span>
                                            <span>O RTSS inicia automaticamente junto</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* Step 4 */}
                        <div className="bg-black/30 border border-gray-800 rounded-xl p-4">
                            <div className="flex items-start gap-4">
                                <div className="flex-shrink-0 w-8 h-8 bg-green-600 rounded-full flex items-center justify-center font-bold">
                                    4
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-bold text-lg mb-2">Verificar</h3>
                                    <p className="text-gray-400 text-sm mb-3">
                                        Clique no botão abaixo para verificar se está funcionando
                                    </p>
                                    <button
                                        onClick={onCheckStatus}
                                        className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-500 rounded-lg text-sm font-bold transition-colors"
                                    >
                                        <RefreshCw className="w-4 h-4" />
                                        Verificar Novamente
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Note */}
                    <div className="bg-blue-900/20 border border-blue-800 rounded-xl p-4">
                        <p className="text-sm text-blue-200">
                            <strong>💡 Dica:</strong> O Afterburner é usado por milhões de gamers para monitorar e fazer overclock. É totalmente seguro e gratuito!
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div className="sticky bottom-0 bg-gray-900 border-t border-gray-800 p-6">
                    <button
                        onClick={onClose}
                        className="w-full py-3 bg-gray-800 hover:bg-gray-700 rounded-xl font-bold transition-colors"
                    >
                        Fechar
                    </button>
                </div>
            </div>
        </div>
    );
}
