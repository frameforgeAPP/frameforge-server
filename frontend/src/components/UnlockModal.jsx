import React, { useState, useEffect } from 'react';
import { X, Lock, Zap, Code, Unlock, RotateCcw } from 'lucide-react';
import { PremiumManager } from '../utils/PremiumManager';

export default function UnlockModal({ onClose, onUnlock }) {
    const [unlockCode, setUnlockCode] = useState("");
    const [unlockError, setUnlockError] = useState("");
    const [deviceId, setDeviceId] = useState("");

    useEffect(() => {
        setDeviceId(PremiumManager.getDeviceId());
    }, []);

    const handleUnlock = async () => {
        const result = await PremiumManager.redeemKey(unlockCode);
        if (result.success) {
            if (onUnlock) onUnlock();
            onClose();
            alert("Funcionalidades Premium desbloqueadas com sucesso!");
        } else {
            setUnlockError("Código inválido ou expirado.");
        }
    };

    const handleRestore = () => {
        import('../utils/BillingService').then(({ BillingService }) => {
            BillingService.restore();
            alert("Verificando compras anteriores... Se houver uma compra válida, o app será atualizado.");
        });
    };

    return (
        <div className="fixed inset-0 z-[110] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4" onClick={(e) => e.stopPropagation()}>
            <div className="bg-gray-900 border border-yellow-500/30 rounded-2xl p-8 max-w-md w-full text-center relative shadow-2xl shadow-yellow-500/10">
                <button
                    onClick={onClose}
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

                <button
                    onClick={handleRestore}
                    className="flex items-center justify-center gap-2 w-full bg-gray-800 hover:bg-gray-700 text-gray-300 font-bold py-2 px-6 rounded-xl transition-all mb-4 text-sm border border-gray-700"
                >
                    <RotateCcw size={16} />
                    Restaurar Compras
                </button>

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
    );
}
