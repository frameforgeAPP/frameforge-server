import React, { useState, useEffect } from 'react';
import { Activity } from 'lucide-react';

export default function PingTest({ serverAddress, ...props }) {
    const [ping, setPing] = useState(null);
    const [loading, setLoading] = useState(false);

    const checkPing = async () => {
        if (!serverAddress) return;

        // Ensure address has protocol
        let url = serverAddress;
        if (!url.startsWith('http')) {
            url = `http://${url}`;
        }

        setLoading(true);
        const start = Date.now();
        try {
            await fetch(`${url}/api/server-info`, {
                method: 'GET',
                signal: AbortSignal.timeout(2000)
            });
            const end = Date.now();
            setPing(end - start);
        } catch (e) {
            setPing(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (serverAddress) {
            checkPing();
            const interval = setInterval(checkPing, 2000);
            return () => clearInterval(interval);
        }
    }, [serverAddress]);

    if (ping === null) return null;

    // Compact mode for header
    if (props.compact) {
        let color = 'text-green-400';
        if (ping > 50) color = 'text-green-300';
        if (ping > 100) color = 'text-yellow-400';
        if (ping > 200) color = 'text-red-400';

        return (
            <div className="flex items-center gap-1 px-2 py-0.5 bg-black/40 rounded-full border border-gray-800/50 backdrop-blur-sm animate-fade-in">
                <Activity size={10} className={color} />
                <span className={`text-[10px] font-mono font-bold ${color}`}>
                    {ping}ms
                </span>
            </div>
        );
    }

    let color = 'text-green-400';
    if (ping > 50) color = 'text-green-300';
    if (ping > 100) color = 'text-yellow-400';
    if (ping > 200) color = 'text-red-400';

    return (
        <div className="flex items-center gap-2 px-3 py-1.5 bg-black/40 rounded-full border border-gray-800 backdrop-blur-sm animate-fade-in">
            <Activity size={12} className={color} />
            <span className={`text-xs font-mono font-bold ${color}`}>
                {ping}ms
            </span>
        </div>
    );
}
