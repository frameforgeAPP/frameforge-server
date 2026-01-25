// Session Storage Utilities
// Manages game session history in localStorage

import { db, auth } from './firebaseConfig';
import { doc, setDoc, getDoc, updateDoc, arrayUnion, arrayRemove, collection, getDocs, writeBatch } from "firebase/firestore";

const STORAGE_KEY = 'fps_monitor_sessions';
const MAX_SESSIONS = 20;

// Helper to get current user ID
const getUserId = () => {
    return auth.currentUser ? auth.currentUser.uid : null;
};

// Sync local sessions with cloud
export const syncSessions = async () => {
    const userId = getUserId();
    if (!userId) return;

    try {
        const userRef = doc(db, "users", userId);
        const userSnap = await getDoc(userRef);

        let cloudSessions = [];
        if (userSnap.exists()) {
            cloudSessions = userSnap.data().sessions || [];
        }

        const localSessions = getSessionHistory();

        // Merge logic: Combine and deduplicate by ID
        const allSessions = [...cloudSessions, ...localSessions];
        const uniqueSessions = Array.from(new Map(allSessions.map(item => [item.id, item])).values());

        // Sort by date desc
        uniqueSessions.sort((a, b) => new Date(b.savedAt) - new Date(a.savedAt));

        // Limit to MAX_SESSIONS
        const finalSessions = uniqueSessions.slice(0, MAX_SESSIONS);

        // Update Local
        localStorage.setItem(STORAGE_KEY, JSON.stringify(finalSessions));

        // Update Cloud
        await setDoc(userRef, {
            sessions: finalSessions,
            lastSynced: new Date().toISOString()
        }, { merge: true });

        return finalSessions;
    } catch (e) {
        console.error("Sync error:", e);
        return getSessionHistory();
    }
};

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

        // Cloud Sync (Fire and Forget)
        const userId = getUserId();
        if (userId) {
            const userRef = doc(db, "users", userId);
            setDoc(userRef, {
                sessions: sessions,
                lastUpdated: new Date().toISOString()
            }, { merge: true }).catch(e => console.error("Cloud save failed:", e));
        }

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

        // Cloud Sync
        const userId = getUserId();
        if (userId) {
            const userRef = doc(db, "users", userId);
            updateDoc(userRef, {
                sessions: filtered
            }).catch(e => console.error("Cloud delete failed:", e));
        }

        return true;
    } catch (e) {
        console.error('Error deleting session:', e);
        return false;
    }
};

export const clearAllSessions = () => {
    try {
        localStorage.removeItem(STORAGE_KEY);

        // Cloud Sync
        const userId = getUserId();
        if (userId) {
            const userRef = doc(db, "users", userId);
            updateDoc(userRef, {
                sessions: []
            }).catch(e => console.error("Cloud clear failed:", e));
        }

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
