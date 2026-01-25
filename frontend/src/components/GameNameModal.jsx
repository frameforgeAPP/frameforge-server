import React, { useState, useEffect } from 'react';
import { X, Save, Edit2 } from 'lucide-react';
import { t } from '../utils/i18n';

export default function GameNameModal({ isOpen, onClose, currentName, executable, onSave }) {
    const [newName, setNewName] = useState(currentName);

    useEffect(() => {
        setNewName(currentName);
    }, [currentName, isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-md p-6 relative shadow-2xl shadow-blue-900/20">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors">
                    <X size={24} />
                </button>

                <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <Edit2 className="text-blue-400" size={20} />
                    {t('edit_game_name') || 'Editar Nome do Jogo'}
                </h2>

                <div className="mb-4">
                    <label className="text-xs text-gray-500 uppercase tracking-wider mb-1.5 block font-bold">
                        {t('executable') || 'Executável Original'}
                    </label>
                    <code className="block bg-black/40 border border-gray-700/50 p-3 rounded-lg text-gray-300 text-sm font-mono break-all">
                        {executable}
                    </code>
                </div>

                <div className="mb-8">
                    <label className="text-xs text-gray-500 uppercase tracking-wider mb-1.5 block font-bold">
                        {t('display_name') || 'Nome de Exibição'}
                    </label>
                    <input
                        type="text"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder-gray-600"
                        placeholder="Ex: Silent Hill 2"
                        autoFocus
                    />
                </div>

                <button
                    onClick={() => onSave(executable, newName)}
                    className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20"
                >
                    <Save size={20} />
                    {t('save') || 'Salvar'}
                </button>
            </div>
        </div>
    );
}
