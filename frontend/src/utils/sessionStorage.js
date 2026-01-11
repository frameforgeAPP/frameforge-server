// Session Storage Utilities
// Manages game session history in localStorage

const STORAGE_KEY = 'fps_monitor_sessions';
const MAX_SESSIONS = 20;

export const getSessionHistory = () => {
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    } catch (e) {
        console.error('Error loading sessions:', e);
        return [];
    }
};

export const saveSession = (session) => {
    try {
        const sessions = getSessionHistory();

        // Add new session at the beginning
        const newSession = {
            id: Date.now(),
            ...session,
            savedAt: new Date().toISOString()
        };

        sessions.unshift(newSession);

        // Keep only last MAX_SESSIONS
        if (sessions.length > MAX_SESSIONS) {
            sessions.pop();
        }

        localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
        return newSession;
    } catch (e) {
        console.error('Error saving session:', e);
        return null;
    }
};

export const deleteSession = (sessionId) => {
    try {
        const sessions = getSessionHistory();
        const filtered = sessions.filter(s => s.id !== sessionId);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
        return true;
    } catch (e) {
        console.error('Error deleting session:', e);
        return false;
    }
};

export const clearAllSessions = () => {
    try {
        localStorage.removeItem(STORAGE_KEY);
        return true;
    } catch (e) {
        console.error('Error clearing sessions:', e);
        return false;
    }
};

export const getSessionById = (sessionId) => {
    const sessions = getSessionHistory();
    return sessions.find(s => s.id === sessionId) || null;
};

// Format duration from ms to readable string
export const formatDuration = (ms) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
        return `${hours}h ${minutes % 60}min`;
    } else if (minutes > 0) {
        return `${minutes}min ${seconds % 60}s`;
    } else {
        return `${seconds}s`;
    }
};

// Format date to readable string
export const formatDate = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};
