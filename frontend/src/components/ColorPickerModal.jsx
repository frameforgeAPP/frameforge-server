import React, { useState } from 'react';
import { X, Check } from 'lucide-react';
import { t } from '../utils/i18n';

const PRESET_COLORS = [
    '#ef4444', // Red
    '#f97316', // Orange
    '#eab308', // Yellow
    '#22c55e', // Green
    '#06b6d4', // Cyan
    '#3b82f6', // Blue
    '#a855f7', // Purple
    '#ec4899', // Pink
    '#ffffff', // White
    '#9ca3af', // Gray
];

export default function ColorPickerModal({ initialColor, onSave, onClose, title }) {
    const [selectedColor, setSelectedColor] = useState(initialColor || '#3b82f6');

    return (
        <div className="fixed inset-0 z-[150] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 max-w-xs w-full shadow-2xl" onClick={e => e.stopPropagation()}>

                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-white">{title || t('select_color')}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">
                        <X size={20} />
                    </button>
                </div>

                {/* Color Preview */}
                <div
                    className="w-full h-12 rounded-lg mb-4 border border-gray-600 shadow-inner"
                    style={{ backgroundColor: selectedColor }}
                ></div>

                {/* Presets */}
                <div className="grid grid-cols-5 gap-2 mb-4">
                    {PRESET_COLORS.map(color => (
                        <button
                            key={color}
                            onClick={() => setSelectedColor(color)}
                            className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${selectedColor === color ? 'border-white scale-110' : 'border-transparent'}`}
                            style={{ backgroundColor: color }}
                        />
                    ))}
                </div>

                {/* Hex Input */}
                <div className="mb-6">
                    <label className="text-xs text-gray-500 uppercase tracking-wider block mb-1">Hex Code</label>
                    <input
                        type="text"
                        value={selectedColor}
                        onChange={(e) => setSelectedColor(e.target.value)}
                        className="w-full bg-black border border-gray-700 rounded-lg p-2 text-white font-mono text-center focus:border-blue-500 outline-none"
                    />
                </div>

                {/* Save Button */}
                <button
                    onClick={() => onSave(selectedColor)}
                    className="w-full py-3 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold text-white flex items-center justify-center gap-2 transition-colors"
                >
                    <Check size={18} />
                    {t('save')}
                </button>

            </div>
        </div>
    );
}
