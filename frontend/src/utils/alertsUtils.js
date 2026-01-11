// Alerts Settings Utilities
// Manages temperature and FPS alert thresholds

const ALERTS_KEY = 'fps_monitor_alerts';

const DEFAULT_ALERTS = {
    enabled: true,
    cpuTempLimit: 85,
    gpuTempLimit: 85,
    fpsLowLimit: 30,
    vibrate: true,
    sound: false,
    cooldownSeconds: 30
};

export const getAlertsSettings = () => {
    try {
        const data = localStorage.getItem(ALERTS_KEY);
        return data ? { ...DEFAULT_ALERTS, ...JSON.parse(data) } : DEFAULT_ALERTS;
    } catch (e) {
        return DEFAULT_ALERTS;
    }
};

export const saveAlertsSettings = (settings) => {
    try {
        localStorage.setItem(ALERTS_KEY, JSON.stringify(settings));
        return true;
    } catch (e) {
        return false;
    }
};

export const resetAlertsSettings = () => {
    try {
        localStorage.setItem(ALERTS_KEY, JSON.stringify(DEFAULT_ALERTS));
        return DEFAULT_ALERTS;
    } catch (e) {
        return DEFAULT_ALERTS;
    }
};

// Vibration helper
export const triggerVibration = (pattern = [200, 100, 200]) => {
    if ('vibrate' in navigator) {
        navigator.vibrate(pattern);
    }
};

// Sound helper (simple beep using Web Audio API)
let audioContext = null;
export const triggerSound = () => {
    try {
        if (!audioContext) {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }

        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.value = 800;
        oscillator.type = 'sine';

        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.3);
    } catch (e) {
        console.error('Sound error:', e);
    }
};
