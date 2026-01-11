import React, { useState } from 'react';
import Dashboard from './Dashboard';
import AlertsSettings from './AlertsSettings';
import SessionHistory from './SessionHistory';
import ExportReport from './ExportReport';
import PerformanceCompare from './PerformanceCompare';
import { t } from '../utils/i18n';

/**
 * DashboardWithModals - Wrapper that adds modal functionality to Dashboard
 * Passes callbacks to Dashboard for sidebar integration
 */
export default function DashboardWithModals(props) {
    // Modal States
    const [showAlertsSettings, setShowAlertsSettings] = useState(false);
    const [showSessionHistory, setShowSessionHistory] = useState(false);
    const [showExportReport, setShowExportReport] = useState(false);
    const [showCompare, setShowCompare] = useState(false);
    const [selectedSession, setSelectedSession] = useState(null);
    const [compareSessions, setCompareSessions] = useState([null, null]);

    // Handle session selection from history
    const handleSelectSession = (session) => {
        setSelectedSession(session);
        setShowSessionHistory(false);
        setShowExportReport(true);
    };

    // Handle compare mode
    const handleCompare = (sessions) => {
        if (sessions.length === 2) {
            setCompareSessions(sessions);
            setShowSessionHistory(false);
            setShowCompare(true);
        }
    };

    return (
        <div className="relative">
            {/* Dashboard with modal callbacks integrated into sidebar */}
            <Dashboard
                {...props}
                onOpenAlerts={() => setShowAlertsSettings(true)}
                onOpenHistory={() => setShowSessionHistory(true)}
            />

            {/* Modals */}
            {showAlertsSettings && (
                <AlertsSettings
                    isOpen={showAlertsSettings}
                    onClose={() => setShowAlertsSettings(false)}
                />
            )}

            {showSessionHistory && (
                <SessionHistory
                    isOpen={showSessionHistory}
                    onClose={() => setShowSessionHistory(false)}
                    onSelectSession={handleSelectSession}
                    onCompare={handleCompare}
                />
            )}

            {showExportReport && selectedSession && (
                <ExportReport
                    session={selectedSession}
                    onClose={() => {
                        setShowExportReport(false);
                        setSelectedSession(null);
                    }}
                />
            )}

            {showCompare && compareSessions[0] && compareSessions[1] && (
                <PerformanceCompare
                    session1={compareSessions[0]}
                    session2={compareSessions[1]}
                    onClose={() => {
                        setShowCompare(false);
                        setCompareSessions([null, null]);
                    }}
                />
            )}
        </div>
    );
}
