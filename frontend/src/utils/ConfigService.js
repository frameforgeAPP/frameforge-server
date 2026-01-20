import { db } from './firebaseConfig';
import { doc, getDoc } from "firebase/firestore";

export const ConfigService = {
    /**
     * Check if the app is globally free for the current version
     * @returns {Promise<boolean>}
     */
    isFreeForEveryone: async () => {
        try {
            const configRef = doc(db, "config", "global");
            const configSnap = await getDoc(configRef);

            if (configSnap.exists()) {
                const data = configSnap.data();

                // 1. Check legacy boolean flag (optional, for backward compatibility)
                if (data.isFreeForEveryone === true) return true;

                // 2. Check Version List
                const currentVersion = import.meta.env.PACKAGE_VERSION || '1.0.0';
                const freeVersions = data.freeVersions || [];

                if (Array.isArray(freeVersions)) {
                    // Check for wildcard '*' or exact version match
                    if (freeVersions.includes('*') || freeVersions.includes(currentVersion)) {
                        console.log(`App version ${currentVersion} is whitelisted as FREE.`);
                        return true;
                    }
                }
            }
            return false;
        } catch (error) {
            console.error("Error fetching remote config:", error);
            return false;
        }
    },

    /**
     * Get the list of premium items (themes, backgrounds)
     * @returns {Promise<{premiumThemes: string[], premiumBackgrounds: string[]}>}
     */
    getPremiumConfiguration: async () => {
        try {
            const configRef = doc(db, "config", "global");
            const configSnap = await getDoc(configRef);

            // Default values (fallback)
            const defaults = {
                premiumThemes: ['matrix', 'roblox', 'minecraft'],
                premiumBackgrounds: ['matrix', 'embers', 'rain'],
                premiumFeatures: ['alerts', 'history', 'rgbBorder']
            };

            if (configSnap.exists()) {
                const data = configSnap.data();
                return {
                    premiumThemes: data.premiumThemes || defaults.premiumThemes,
                    premiumBackgrounds: data.premiumBackgrounds || defaults.premiumBackgrounds,
                    premiumFeatures: data.premiumFeatures || defaults.premiumFeatures
                };
            }
            return defaults;
        } catch (error) {
            console.error("Error fetching premium config:", error);
            return {
                premiumThemes: ['matrix', 'roblox', 'minecraft'],
                premiumBackgrounds: ['matrix', 'embers', 'rain'],
                premiumFeatures: ['alerts', 'history', 'rgbBorder']
            };
        }
    }
};
