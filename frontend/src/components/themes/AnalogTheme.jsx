import React from 'react';
import AnalogMeter from '../AnalogMeter';

export default function AnalogTheme({ data, theme }) {
    const { cpu, ram, gpus, fps } = data;
    const gpu = gpus[0] || { temperature: 0, load: 0 };

    return (
        <div className="flex flex-col items-center justify-center h-full w-full p-4 gap-8 bg-[#1a1a1a]">
            {/* Header */}
            <div className="w-full max-w-4xl bg-[#262626] border-b-4 border-[#333] p-4 mb-4 shadow-lg">
                <div className="text-2xl font-bold text-[#d4d4d4] tracking-widest uppercase text-center">
                    Analog Monitoring System
                </div>
            </div>

            {/* Main Meters */}
            <div className="flex flex-wrap justify-center gap-8">
                <AnalogMeter
                    value={fps}
                    max={240}
                    label="FPS Output"
                    unit=""
                    color={theme.colors.success}
                />
                <AnalogMeter
                    value={cpu.temp}
                    max={100}
                    label="CPU Temp"
                    unit="°C"
                    color={theme.colors.danger}
                />
            </div>

            {/* Secondary Meters */}
            <div className="flex flex-wrap justify-center gap-8">
                <AnalogMeter
                    value={gpu.temperature}
                    max={100}
                    label="GPU Temp"
                    unit="°C"
                    color={theme.colors.highlight}
                />
                <AnalogMeter
                    value={ram.percent}
                    max={100}
                    label="RAM Usage"
                    unit="%"
                    color={theme.colors.secondary}
                />
            </div>

            {/* Load Meters */}
            <div className="flex flex-wrap justify-center gap-8 opacity-80">
                <AnalogMeter
                    value={cpu.load}
                    max={100}
                    label="CPU Load"
                    unit="%"
                    color={theme.colors.text}
                />
                <AnalogMeter
                    value={gpu.load}
                    max={100}
                    label="GPU Load"
                    unit="%"
                    color={theme.colors.text}
                />
            </div>
        </div>
    );
}
