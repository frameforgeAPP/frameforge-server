import React from 'react';

const AnalogMeter = ({ value, min = 0, max = 100, label, unit = "", color = "#d4d4d4" }) => {
    const clampedValue = Math.min(Math.max(value, min), max);
    const percentage = (clampedValue - min) / (max - min);

    // Angle range: -45 to 45 degrees
    const angle = (percentage * 90) - 45;

    return (
        <div className="relative w-48 h-32 bg-[#262626] border-4 border-[#333] rounded-lg shadow-inner overflow-hidden flex flex-col items-center pt-4">
            {/* Scale Markings */}
            <div className="absolute inset-0 flex justify-center items-end pb-4">
                <div className="w-40 h-40 border-t-2 border-gray-600 rounded-full absolute top-8 opacity-30"></div>
                {/* Ticks would be complex to draw with CSS only, skipping for simplicity or using SVG if needed */}
            </div>

            {/* Label */}
            <div className="z-10 text-xs font-bold uppercase tracking-widest mb-1" style={{ color }}>{label}</div>

            {/* Needle Container */}
            <div className="absolute bottom-[-10px] left-1/2 w-0 h-0">
                <div
                    className="w-1 h-24 bg-red-600 origin-bottom transition-transform duration-300 ease-out shadow-md"
                    style={{
                        transform: `translateX(-50%) rotate(${angle}deg)`,
                        bottom: 0
                    }}
                ></div>
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-4 h-4 bg-gray-400 rounded-full shadow-lg"></div>
            </div>

            {/* Value Display */}
            <div className="absolute bottom-2 right-2 font-mono text-sm text-gray-400 bg-black/50 px-1 rounded">
                {Math.round(value)}{unit}
            </div>
        </div>
    );
};

export default AnalogMeter;
