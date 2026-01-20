import { X, Save, Cpu, HardDrive, CircuitBoard } from 'lucide-react';
import { t } from '../utils/i18n';

export default function HardwareSettings({ onClose, onSave, initialLabels }) {
    const [labels, setLabels] = useState(initialLabels || { cpu: 'CPU', gpu: 'GPU', ram: 'RAM' });

    const handleChange = (key, value) => {
        setLabels(prev => ({ ...prev, [key]: value }));
    };

    const handleSave = () => {
        onSave(labels);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[110] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 max-w-sm w-full shadow-2xl" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <CircuitBoard size={20} className="text-cyan-400" />
                        Renomear Hardware
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">
                        <X size={24} />
                    </button>
                </div>

                <div className="space-y-4 mb-6">
                    {/* CPU */}
                    <div>
                        <label className="block text-xs text-gray-500 uppercase mb-1 flex items-center gap-1">
                            <Cpu size={12} /> Processador (CPU)
                        </label>
                        <input
                            type="text"
                            value={labels.cpu || ''}
                            onChange={(e) => handleChange('cpu', e.target.value)}
                            maxLength={30}
                            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                            placeholder="Ex: Ryzen 7 5700X"
                        />
                    </div>

                    {/* GPU */}
                    <div>
                        <label className="block text-xs text-gray-500 uppercase mb-1 flex items-center gap-1">
                            <CircuitBoard size={12} /> Placa de Vídeo (GPU)
                        </label>
                        <input
                            type="text"
                            value={labels.gpu || ''}
                            onChange={(e) => handleChange('gpu', e.target.value)}
                            maxLength={30}
                            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                            placeholder="Ex: RTX 4060"
                        />
                    </div>

                    {/* RAM */}
                    <div>
                        <label className="block text-xs text-gray-500 uppercase mb-1 flex items-center gap-1">
                            <HardDrive size={12} /> Memória (RAM)
                        </label>
                        <input
                            type="text"
                            value={labels.ram || ''}
                            onChange={(e) => handleChange('ram', e.target.value)}
                            maxLength={20}
                            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                            placeholder="Ex: 32GB RAM"
                        />
                    </div>
                </div>

                <button
                    onClick={handleSave}
                    className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors"
                >
                    <Save size={18} />
                    Salvar Alterações
                </button>
            </div>
        </div>
    );
}
