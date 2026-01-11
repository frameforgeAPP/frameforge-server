import React from 'react';
import Gauge from '../Gauge';

export default function GaugeTheme({ data, theme }) {
    const { cpu, ram, gpus, fps } = data;
    const gpu = gpus[0] || { temperature: 0, load: 0 };

    return (
        <div className="flex flex-col items-center justify-center h-full w-full p-4 gap-8">
            {/* Main Gauges (FPS & CPU) */}
            <div className="flex flex-wrap justify-center gap-8 md:gap-16">
                <Gauge
                    value={fps}
                    max={240}
                    label="FPS"
                    unit=""
                    color={fps < 60 ? '#ef4444' : fps < 120 ? '#facc15' : '#4ade80'}
                />
                <Gauge
                    value={cpu.temp}
                    max={100}
                    label="CPU Temp"
                    unit="°C"
                    color={cpu.temp > 80 ? '#ef4444' : cpu.temp > 60 ? '#facc15' : '#4ade80'}
                />
            </div>

            {/* Secondary Gauges (GPU & RAM) */}
            <div className="flex flex-wrap justify-center gap-8 md:gap-16">
                <Gauge
                    value={gpu.temperature}
                    max={100}
                    label="GPU Temp"
                    unit="°C"
                    color={gpu.temperature > 80 ? '#ef4444' : gpu.temperature > 60 ? '#facc15' : '#4ade80'}
                />
                <Gauge
                    value={ram.percent}
                    max={100}
                    label="RAM"
                    unit="%"
                    color={ram.percent > 90 ? '#ef4444' : ram.percent > 70 ? '#facc15' : '#4ade80'}
                />
            </div>
        </div>
    );
}
