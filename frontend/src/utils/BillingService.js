import { LicenseService } from './LicenseService';

// Product ID from Google Play Console
const PRODUCT_ID_PRO = 'frameforge_pro_lifetime';

export const BillingService = {
    store: null,

    initialize: () => {
        if (!window.CdvPurchase) {
            console.warn('CdvPurchase not available. Are you on a device?');
            return;
        }

        const store = window.CdvPurchase.store;
        BillingService.store = store;

        // Register the product
        store.register([{
            type: window.CdvPurchase.ProductType.NON_CONSUMABLE,
            id: PRODUCT_ID_PRO,
            platform: window.CdvPurchase.Platform.GOOGLE_PLAY,
        }]);

        // Setup listeners
        store.when()
            .approved(transaction => {
                console.log('Transaction approved:', transaction);
                // Verify and finish
                transaction.verify();
            })
            .verified(receipt => {
                console.log('Transaction verified:', receipt);
                // Save to Firestore
                LicenseService.savePurchase(receipt.id, receipt.productId, receipt.purchaseToken)
                    .then(() => {
                        receipt.finish();
                        alert("Compra realizada com sucesso! Funcionalidades PRO liberadas.");
                        // Reload or trigger state update
                        window.location.reload();
                    });
            })
            .finished(transaction => {
                console.log('Transaction finished:', transaction);
            });

        // Refresh the store
        store.initialize([
            window.CdvPurchase.Platform.GOOGLE_PLAY
        ]);
    },

    purchase: () => {
        if (!BillingService.store) {
            BillingService.initialize();
        }

        const product = BillingService.store.get(PRODUCT_ID_PRO);
        if (product && product.canPurchase) {
            product.getOffer().order();
        } else {
            alert("Produto não disponível ou loja não inicializada.");
        }
    },

    restore: () => {
        if (BillingService.store) {
            BillingService.store.restorePurchases();
        }
    }
};
