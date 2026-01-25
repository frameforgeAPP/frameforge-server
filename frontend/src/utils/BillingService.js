import { LicenseService } from './LicenseService';

// Product ID from Google Play Console
// Product ID from Google Play Console
const PRODUCT_ID_PRO = 'frameforge_pro_lifetime';
const PRODUCT_ID_DONATION = 'frameforge_donation_small';

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
        }, {
            type: window.CdvPurchase.ProductType.CONSUMABLE,
            id: PRODUCT_ID_DONATION,
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
                        window.location.reload();
                    });
            })
            .approved(transaction => {
                // Handle Donation
                if (transaction.products.find(p => p.id === PRODUCT_ID_DONATION)) {
                    console.log('Donation approved:', transaction);
                    transaction.verify();
                }
            })
            .verified(receipt => {
                // Handle Donation Verification
                if (receipt.id === PRODUCT_ID_DONATION) {
                    console.log('Donation verified:', receipt);
                    receipt.finish();
                    alert("Muito obrigado pelo seu apoio! ❤️");
                }
            })
            .finished(transaction => {
                console.log('Transaction finished:', transaction);
            })
            .error(error => {
                console.error('Store Error:', error);
                if (error.code !== window.CdvPurchase.ErrorCode.PAYMENT_CANCELLED) {
                    alert(`Erro na loja: ${error.message}`);
                }
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

    donate: () => {
        if (!BillingService.store) {
            BillingService.initialize();
        }

        const product = BillingService.store.get(PRODUCT_ID_DONATION);
        if (product && product.canPurchase) {
            product.getOffer().order();
        } else {
            alert("Doação não disponível no momento. Tente novamente mais tarde.");
        }
    },

    restore: () => {
        if (BillingService.store) {
            BillingService.store.restorePurchases();
        }
    }
};
