import { db } from './firebaseConfig';
import { doc, setDoc, getDoc, updateDoc, arrayUnion } from "firebase/firestore";
import { PremiumManager } from './PremiumManager';

export const LicenseService = {
    /**
     * Save a purchase record to Firestore
     * @param {string} orderId - Google Play Order ID
     * @param {string} productId - Product ID (e.g., 'pro_version')
     * @param {string} purchaseToken - Token for verification
     */
    savePurchase: async (orderId, productId, purchaseToken) => {
        const deviceId = PremiumManager.getDeviceId();

        try {
            const userRef = doc(db, "licenses", deviceId);
            const userSnap = await getDoc(userRef);

            const purchaseData = {
                orderId,
                productId,
                purchaseToken,
                purchaseDate: new Date().toISOString(),
                platform: 'android',
                status: 'active'
            };

            if (userSnap.exists()) {
                await updateDoc(userRef, {
                    purchases: arrayUnion(purchaseData),
                    isPro: true,
                    lastUpdated: new Date().toISOString()
                });
            } else {
                await setDoc(userRef, {
                    deviceId,
                    isPro: true,
                    firstLogin: new Date().toISOString(),
                    purchases: [purchaseData]
                });
            }
            console.log("Purchase saved to Firestore");
            return true;
        } catch (error) {
            console.error("Error saving purchase to Firestore:", error);
            // Even if saving fails, we should probably allow access if local verification passed
            // But for now, we just log it.
            return false;
        }
    },

    /**
     * Check if the current device has a valid license in Firestore
     * This is useful for restoring purchases or checking status across installs
     */
    checkLicense: async () => {
        const deviceId = PremiumManager.getDeviceId();

        try {
            const userRef = doc(db, "licenses", deviceId);
            const userSnap = await getDoc(userRef);

            if (userSnap.exists()) {
                const data = userSnap.data();
                return data.isPro === true;
            }
            return false;
        } catch (error) {
            console.error("Error checking license:", error);
            return false;
        }
    },

    /**
     * Redeem a promo code
     * @param {string} code - The code to redeem
     */
    redeemCode: async (code) => {
        const deviceId = PremiumManager.getDeviceId();
        const codeId = code.trim().toUpperCase();

        try {
            // 1. Check Code
            const codeRef = doc(db, "promo_codes", codeId);
            const codeSnap = await getDoc(codeRef);

            if (!codeSnap.exists()) {
                throw new Error("Código inválido");
            }

            const codeData = codeSnap.data();

            if (!codeData.active) {
                throw new Error("Código inativo");
            }

            if (codeData.maxUses > 0 && codeData.currentUses >= codeData.maxUses) {
                throw new Error("Limite de uso do código atingido");
            }

            // 2. Activate License
            const userRef = doc(db, "licenses", deviceId);

            // Transaction-like update (simplified for client-side)
            // Ideally should be a transaction or Cloud Function, but this works for simple apps
            await setDoc(userRef, {
                deviceId,
                isPro: true,
                redeemedCode: codeId,
                lastUpdated: new Date().toISOString(),
                platform: 'code'
            }, { merge: true });

            // 3. Increment Use Count
            await updateDoc(codeRef, {
                currentUses: (codeData.currentUses || 0) + 1
            });

            return { success: true };

        } catch (error) {
            console.error("Redeem error:", error);
            return { success: false, message: error.message };
        }
    }
};
