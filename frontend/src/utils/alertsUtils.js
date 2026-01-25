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
    cooldownSeconds: 30,
    cpuAlertEnabled: true,
    gpuAlertEnabled: true,
    fpsAlertEnabled: true
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
export const triggerVibration = async (pattern = [200, 100, 200]) => {
    // Prioritize Web API for patterns as Capacitor Haptics is limited
    if ('vibrate' in navigator) {
        try {
            navigator.vibrate(pattern);
            return;
        } catch (e) {
            console.log("Navigator vibrate failed", e);
        }
    }

    // Fallback to Capacitor Haptics (Simple vibration)
    try {
        const { Haptics, VibrateAnimationType } = await import('@capacitor/haptics');
        await Haptics.vibrate();
    } catch (e) {
        console.log("Haptics failed", e);
    }
};

// Sound helper (simple beep using Web Audio API)
let audioContext = null;
export const triggerSound = (type = 'default') => {
    try {
        if (!audioContext) {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }

        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        const now = audioContext.currentTime;

        // Distinct sounds based on type
        if (type === 'cpu') {
            // High pitch beep (Warning)
            oscillator.frequency.setValueAtTime(1000, now);
            oscillator.frequency.exponentialRampToValueAtTime(1200, now + 0.1);
            oscillator.type = 'square';

            gainNode.gain.setValueAtTime(0.1, now);
            gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

            oscillator.start(now);
            oscillator.stop(now + 0.15);
        }
        else if (type === 'gpu') {
            // Mid pitch beep (Caution)
            oscillator.frequency.setValueAtTime(600, now);
            oscillator.frequency.linearRampToValueAtTime(500, now + 0.1);
            oscillator.type = 'sawtooth';

            gainNode.gain.setValueAtTime(0.1, now);
            gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.2);

            oscillator.start(now);
            oscillator.stop(now + 0.2);
        }
        else if (type === 'fps') {
            // Low/Fast pulse (Critical)
            oscillator.frequency.setValueAtTime(150, now);
            oscillator.type = 'square';

            gainNode.gain.setValueAtTime(0.15, now);
            gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1);

            oscillator.start(now);
            oscillator.stop(now + 0.1);
        }
        else {
            // Default beep
            oscillator.frequency.value = 800;
            oscillator.type = 'sine';
            gainNode.gain.setValueAtTime(0.3, now);
            gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
            oscillator.start(now);
            oscillator.stop(now + 0.3);
        }

    } catch (e) {
        console.error('Sound error:', e);
    }
};
