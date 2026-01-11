// Utility functions for Afterburner status management

export const AFTERBURNER_STATUS = {
    RUNNING: 'running',
    INSTALLED: 'installed',
    NOT_FOUND: 'not-found'
};

export const checkAfterburnerStatus = async (serverAddress) => {
    try {
        // Add timeout to prevent hanging if server is not ready
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout

        const response = await fetch(`${serverAddress}/api/afterburner-status`, {
            signal: controller.signal
        });

        clearTimeout(timeoutId);
        const data = await response.json();
        return data.status;
    } catch (error) {
        // Silently handle abort/timeout errors
        if (error.name !== 'AbortError') {
            console.error('Error checking Afterburner status:', error);
        }
        return null;
    }
};

export const getStatusColor = (status) => {
    switch (status) {
        case AFTERBURNER_STATUS.RUNNING:
            return 'bg-green-500';
        case AFTERBURNER_STATUS.INSTALLED:
            return 'bg-yellow-500';
        case AFTERBURNER_STATUS.NOT_FOUND:
            return 'bg-red-500';
        default:
            return 'bg-gray-500';
    }
};

export const getStatusMessage = (status) => {
    switch (status) {
        case AFTERBURNER_STATUS.RUNNING:
            return 'Afterburner detectado - Pronto!';
        case AFTERBURNER_STATUS.INSTALLED:
            return 'Afterburner instalado - Por favor, abra o programa';
        case AFTERBURNER_STATUS.NOT_FOUND:
            return 'Afterburner não encontrado - Clique para instalar';
        default:
            return 'Verificando...';
    }
};

export const getStatusIcon = (status) => {
    switch (status) {
        case AFTERBURNER_STATUS.RUNNING:
            return '🟢';
        case AFTERBURNER_STATUS.INSTALLED:
            return '🟡';
        case AFTERBURNER_STATUS.NOT_FOUND:
            return '🔴';
        default:
            return '⚪';
    }
};

export const hasSeenOnboarding = () => {
    return localStorage.getItem('fps_monitor_onboarding_seen') === 'true';
};

export const markOnboardingSeen = () => {
    localStorage.setItem('fps_monitor_onboarding_seen', 'true');
};

export const resetOnboarding = () => {
    localStorage.removeItem('fps_monitor_onboarding_seen');
};
