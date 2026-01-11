import React from 'react';
import { Cpu, CircuitBoard, HardDrive, Activity, Wifi } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer, YAxis } from 'recharts';
import AnimatedNumber from '../AnimatedNumber';

const Card = ({ title, icon: Icon, children, className = "", borderColor = "border-white/10" }) => (
    <div className={`bg-black/40 backdrop-blur-md border ${borderColor} rounded-xl p-4 flex flex-col ${className}`}>
        <div className="flex items-center gap-2 mb-2 text-gray-400">
            <Icon size={16} />
            <span className="text-xs font-bold tracking-widest uppercase">{title}</span>
        </div>
        <div className="flex-1 flex flex-col justify-center">
            {children}
        </div>
    </div>
);

const BuilderTheme = ({ data, theme }) => {
    const { fps, cpu, gpus, ram, network = {} } = data;
    const gpu = gpus[0] || {};

    // Mock history for graphs (in a real app, this would be passed down or managed internally)
    // For visual purposes, we'll just show the current value prominently

    return (
        <div className="w-full h-full p-4 md:p-8 grid grid-cols-2 md:grid-cols-4 grid-rows-3 gap-4">

            {/* ROW 1: CPU & GPU */}
            <Card title="CPU Processor" icon={Cpu} className="col-span-1 md:col-span-2" borderColor="border-blue-500/30">
                <div className="flex justify-between items-end">
                    <div>
                        <div className="text-5xl font-bold text-white mb-1">{Math.round(cpu.load)}%</div>
                        <div className="text-sm text-blue-400">{cpu.name}</div>
                    </div>
                    <div className="text-right">
                        <div className="text-4xl font-mono text-gray-300">{Math.round(cpu.temp)}°C</div>
                        <div className="text-xs text-gray-500">{Math.round(cpu.clock)} MHz</div>
                    </div>
                </div>
                {/* Simulated Graph Line */}
                <div className="h-1 w-full bg-gray-800 mt-4 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 transition-all duration-300" style={{ width: `${cpu.load}%` }}></div>
                </div>
            </Card>

            <Card title="Graphics Unit" icon={CircuitBoard} className="col-span-1 md:col-span-2" borderColor="border-green-500/30">
                <div className="flex justify-between items-end">
                    <div>
                        <div className="text-5xl font-bold text-white mb-1">{Math.round(gpu.load)}%</div>
                        <div className="text-sm text-green-400">{gpu.name}</div>
                    </div>
                    <div className="text-right">
                        <div className="text-4xl font-mono text-gray-300">{Math.round(gpu.temperature)}°C</div>
                        <div className="text-xs text-gray-500">{Math.round(gpu.memory_used)} MB VRAM</div>
                    </div>
                </div>
                <div className="h-1 w-full bg-gray-800 mt-4 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500 transition-all duration-300" style={{ width: `${gpu.load}%` }}></div>
                </div>
            </Card>

            {/* ROW 2: FPS (Center Focus) & RAM */}
            <Card title="System Memory" icon={HardDrive} className="col-span-1" borderColor="border-purple-500/30">
                <div className="flex flex-col items-center justify-center h-full">
                    <div className="text-4xl font-bold text-white">{Math.round(ram.used_gb)} <span className="text-lg text-gray-500">GB</span></div>
                    <div className="text-xs text-purple-400 mt-1">{Math.round(ram.total_gb)} GB Total</div>
                    <div className="w-full h-2 bg-gray-800 mt-4 rounded-full overflow-hidden">
                        <div className="h-full bg-purple-500 transition-all duration-300" style={{ width: `${(ram.used_gb / ram.total_gb) * 100}%` }}></div>
                    </div>
                </div>
            </Card>

            <div className="col-span-1 md:col-span-2 row-span-2 bg-black/60 border border-white/20 rounded-xl flex flex-col items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-blue-500/10 to-transparent"></div>
                <div className="z-10 text-center">
                    <div className="text-[8rem] md:text-[10rem] font-black leading-none tracking-tighter text-white drop-shadow-[0_0_30px_rgba(59,130,246,0.5)]">
                        <AnimatedNumber value={fps || 0} />
                    </div>
                    <div className="text-2xl font-bold tracking-[1em] text-blue-500 uppercase mt-[-1rem]">FPS</div>
                </div>
                {data.game && (
                    <div className="absolute bottom-4 text-sm font-mono text-gray-400 uppercase tracking-widest border border-gray-700 px-3 py-1 rounded-full">
                        {data.game}
                    </div>
                )}
            </div>

            <Card title="Network" icon={Wifi} className="col-span-1" borderColor="border-yellow-500/30">
                <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-500">UP</span>
                        <span className="text-lg font-mono text-yellow-400">{((network.up || 0) / 1024).toFixed(1)} <span className="text-xs">KB/s</span></span>
                    </div>
                    <div className="w-full h-1 bg-gray-800 rounded-full overflow-hidden">
                        <div className="h-full bg-yellow-500" style={{ width: '20%' }}></div>
                    </div>
                    <div className="flex justify-between items-center mt-2">
                        <span className="text-xs text-gray-500">DOWN</span>
                        <span className="text-lg font-mono text-yellow-400">{((network.down || 0) / 1024).toFixed(1)} <span className="text-xs">KB/s</span></span>
                    </div>
                    <div className="w-full h-1 bg-gray-800 rounded-full overflow-hidden">
                        <div className="h-full bg-yellow-500" style={{ width: '40%' }}></div>
                    </div>
                </div>
            </Card>

            {/* ROW 3: Extra Stats */}
            <Card title="Activity" icon={Activity} className="col-span-1 md:col-span-2" borderColor="border-red-500/30">
                <div className="grid grid-cols-3 gap-2 text-center">
                    <div>
                        <div className="text-2xl font-bold text-white">{data.process_count || 0}</div>
                        <div className="text-[10px] text-gray-500 uppercase">Procs</div>
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-white">{Math.round(cpu.cores)}</div>
                        <div className="text-[10px] text-gray-500 uppercase">Cores</div>
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-white">{Math.floor(data.uptime / 3600) || 0}h</div>
                        <div className="text-[10px] text-gray-500 uppercase">Uptime</div>
                    </div>
                </div>
            </Card>

        </div>
    );
};

export default BuilderTheme;
