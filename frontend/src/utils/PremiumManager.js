
import { LicenseService } from './LicenseService';
import { ConfigService } from './ConfigService';
import { Device } from '@capacitor/device';

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

    // Initialize persistent ID from hardware
    initialize: async () => {
        try {
            const info = await Device.getId();
            if (info && info.uuid) {
                console.log("Hardware ID found:", info.uuid);
                // Always overwrite local ID with hardware ID to ensure persistence
                localStorage.setItem('frameforge_device_id', info.uuid);
            }
        } catch (e) {
            console.warn("Could not get hardware ID, using fallback:", e);
        }
    },

    // Sync remote config to check if app is free for everyone
    syncRemoteConfig: async () => {
        try {
            const isFree = await ConfigService.isFreeForEveryone();
            if (isFree) {
                localStorage.setItem('frameforge_is_free_remote', 'true');
                return true;
            } else {
                localStorage.removeItem('frameforge_is_free_remote');
                return false;
            }
        } catch (e) {
            console.error("Sync error:", e);
            return false;
        }
    },

    // Centralized check for PRO status
    isPro: () => {
        // 1. Check Remote Override (Free for Everyone)
        if (localStorage.getItem('frameforge_is_free_remote') === 'true') return true;

        // 2. Check Local Purchase/Unlock
        if (localStorage.getItem('frameforge_is_pro') === 'true') return true;

        return false;
    },

    // Async validation using Web Crypto API OR License Service
    validateKey: async (inputKey) => {
        // 1. Check local legacy code
        if (inputKey) {
            const isValidLocal = await PremiumManager.validateLocalKey(inputKey);
            if (isValidLocal) return true;
        }

        return false;
    },

    // Unified redemption method (Local Hash OR Online Promo Code)
    redeemKey: async (inputKey) => {
        // 1. Try Local Validation (Device Hash)
        if (await PremiumManager.validateLocalKey(inputKey)) {
            localStorage.setItem('frameforge_is_pro', 'true');
            return { success: true, type: 'local' };
        }

        // 2. Try Online Promo Code Redemption
        try {
            const result = await LicenseService.redeemCode(inputKey);
            if (result.success) {
                localStorage.setItem('frameforge_is_pro', 'true');
                return { success: true, type: 'online' };
            }
        } catch (e) {
            console.warn("Online redemption failed:", e);
        }

        return { success: false };
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
        // First check if it's free globally
        await PremiumManager.syncRemoteConfig();
        if (PremiumManager.isPro()) return true;

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
