import React from 'react';

const Gauge = ({ value, label, sublabel, min = 0, max = 100, unit = "%", color }) => {
    // Clamp value between min and max
    const clampedValue = Math.min(Math.max(value, min), max);
    const percentage = (clampedValue - min) / (max - min);

    // SVG Configuration
    const radius = 80;
    const strokeWidth = 20;
    const center = radius + strokeWidth;
    const circumference = Math.PI * radius; // Half circle
    const arcLength = circumference * percentage;

    // Determine color based on value if not provided
    const getColor = (val) => {
        if (color) return color;
        if (val < 50) return "#4ade80"; // green-400
        if (val < 80) return "#facc15"; // yellow-400
        return "#f87171"; // red-400
    };

    const finalColor = getColor(clampedValue);

    return (
        <div className="relative flex flex-col items-center justify-center">
            <svg width={center * 2} height={center + 10} className="overflow-visible">
                {/* Background Arc */}
                <path
                    d={`M ${strokeWidth},${center} A ${radius},${radius} 0 0,1 ${center * 2 - strokeWidth},${center}`}
                    fill="none"
                    stroke="#374151" // gray-700
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                />

                {/* Value Arc */}
                <path
                    d={`M ${strokeWidth},${center} A ${radius},${radius} 0 0,1 ${center * 2 - strokeWidth},${center}`}
                    fill="none"
                    stroke={finalColor}
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    strokeDasharray={`${circumference} ${circumference}`}
                    strokeDashoffset={circumference - arcLength}
                    className="transition-all duration-1000 ease-out"
                    style={{ filter: `drop-shadow(0 0 6px ${finalColor})` }}
                />

                {/* Needle (Simple Triangle) */}
                <g
                    transform={`translate(${center}, ${center}) rotate(${(percentage * 180) - 90})`}
                    className="transition-transform duration-1000 ease-out"
                >
                    <path d="M -4,0 L 4,0 L 0,-radius Z" fill="white" />
                    <circle cx="0" cy="0" r="6" fill="white" />
                </g>
            </svg>

            {/* Text Overlay */}
            <div className="absolute bottom-0 text-center transform translate-y-2">
                <div className="text-3xl font-bold text-white" style={{ textShadow: `0 0 10px ${finalColor}` }}>
                    {Math.round(clampedValue)}{unit}
                </div>
                {label && <div className="text-sm text-gray-400">{label}</div>}
                {sublabel && <div className="text-xs text-gray-500">{sublabel}</div>}
            </div>
        </div>
    );
};

export default Gauge;
