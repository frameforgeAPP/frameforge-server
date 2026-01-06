export const generateMockData = () => {
    const now = new Date();
    const timeString = now.toLocaleTimeString('en-US', { hour12: false });

    return {
        cpu: {
            name: "Intel Core i9-14900K",
            load: 45 + Math.random() * 20,
            temp: 65 + Math.random() * 10,
            clock: 5.8,
            power: 125 + Math.random() * 50
        },
        gpus: [
            {
                id: "0",
                name: "NVIDIA GeForce RTX 4090",
                load: 80 + Math.random() * 20,
                temperature: 70 + Math.random() * 5,
                memory_used: 12000 + Math.random() * 2000,
                memory_total: 24576,
                clock: 2520,
                fan_speed: 60
            }
        ],
        ram: {
            used_gb: 16 + Math.random() * 2,
            total_gb: 32,
            percent: 50 + Math.random() * 5
        },
        fps: 144 + Math.floor(Math.random() * 20),
        frametime: 6.9,
        game: "Cyberpunk 2077",
        rtss_connected: true,
        time: timeString
    };
};
