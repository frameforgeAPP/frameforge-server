import React from 'react';

export default function PulseBackground() {
    return (
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
            {/* Central pulse circles */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" style={{ width: '200vw', height: '200vh' }}>
                <div
                    className="absolute inset-0 rounded-full"
                    style={{
                        background: 'radial-gradient(circle, rgba(59, 130, 246, 0.4) 0%, transparent 70%)',
                        animation: 'pulse1 4s ease-in-out infinite',
                    }}
                />
                <div
                    className="absolute inset-0 rounded-full"
                    style={{
                        background: 'radial-gradient(circle, rgba(168, 85, 247, 0.3) 0%, transparent 60%)',
                        animation: 'pulse2 5s ease-in-out infinite 1s',
                    }}
                />
                <div
                    className="absolute inset-0 rounded-full"
                    style={{
                        background: 'radial-gradient(circle, rgba(0, 255, 255, 0.3) 0%, transparent 50%)',
                        animation: 'pulse3 6s ease-in-out infinite 2s',
                    }}
                />
            </div>
        </div>
    );
}
