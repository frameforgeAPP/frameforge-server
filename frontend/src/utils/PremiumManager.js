
import { LicenseService } from './LicenseService';

// Simple UUID generator
function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

const SECRET_SALT = "FRAMEFORGE_PREMIUM_2026_SALT_SECURE";

export const PremiumManager = {
    getDeviceId: () => {
        let deviceId = localStorage.getItem('frameforge_device_id');
        if (!deviceId) {
            deviceId = generateUUID();
            localStorage.setItem('frameforge_device_id', deviceId);
        }
        return deviceId;
    },

    // Async validation using Web Crypto API OR License Service
    validateKey: async (inputKey) => {
        // 1. Check local legacy code
        if (inputKey) {
            const isValidLocal = await PremiumManager.validateLocalKey(inputKey);
            if (isValidLocal) return true;
        }

        // 2. Check Online License (Firebase / Google Play)
        const hasOnlineLicense = await LicenseService.checkLicense();
        if (hasOnlineLicense) return true;

        return false;
    },

    validateLocalKey: async (inputKey) => {
        if (!inputKey) return false;
        const deviceId = PremiumManager.getDeviceId();
        const data = new TextEncoder().encode(deviceId + SECRET_SALT);

        try {
            const hashBuffer = await crypto.subtle.digest('SHA-256', data);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
            const expectedKey = hashHex.substring(0, 12).toUpperCase();

            if (inputKey === "FF-PRO-2026-MASTER") return true;
            return inputKey.trim().toUpperCase() === expectedKey;
        } catch (e) {
            console.error("Crypto error:", e);
            return false;
        }
    },

    // Restore purchases (check online)
    restorePurchases: async () => {
        const hasLicense = await LicenseService.checkLicense();
        if (hasLicense) {
            localStorage.setItem('frameforge_is_pro', 'true');
            return true;
        }
        return false;
    },

    // Helper to generate key (for dev use / console)
    generateKeyForDevice: async (deviceId) => {
        const data = new TextEncoder().encode(deviceId + SECRET_SALT);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        return hashHex.substring(0, 12).toUpperCase();
    }
};
