import React, { useEffect, useState, useRef } from 'react';
import { Maximize } from 'lucide-react';
import io from 'socket.io-client';
import { StatusBar } from '@capacitor/status-bar';
import DashboardWithModals from './components/DashboardWithModals';
import ConnectionScreen from './components/ConnectionScreen';
import SplashScreen from './components/SplashScreen';
import TutorialOverlay from './components/TutorialOverlay';
import { generateMockData } from './utils/mockData';

// Simple Error Boundary Component
// ErrorBoundary moved to components/ErrorBoundary.jsx

function App() {
  const [data, setData] = useState(null);
  const [connected, setConnected] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isDemo, setIsDemo] = useState(false);
  const [cameFromDashboard, setCameFromDashboard] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const [showTutorial, setShowTutorial] = useState(false);
  const [hasShownTutorial, setHasShownTutorial] = useState(() => {
    try {
      return localStorage.getItem('fps_monitor_tutorial_seen') === 'true';
    } catch (e) {
      return false;
    }
  });

  // Initialize wantsFullScreen from localStorage
  const [wantsFullScreen, setWantsFullScreen] = useState(() => {
    try {
      return localStorage.getItem('wantsFullScreen') === 'true';
    } catch (e) {
      return false;
    }
  });

  // Initialize serverAddress from localStorage or default
  const [serverAddress, setServerAddress] = useState(() => {
    try {
      return localStorage.getItem('serverAddress') || `http://192.168.1.110:8000`;
    } catch (e) {
      return `http://192.168.1.110:8000`;
    }
  });

  // Socket Ref to handle disconnects manually
  const socketRef = useRef(null);

  // Demo Mode Loop
  useEffect(() => {
    let interval;
    if (isDemo) {
      setConnected(true);
      interval = setInterval(() => {
        setData(generateMockData());
      }, 1000);
    } else {
      if (interval) clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isDemo]);

  // Real Connection Logic
  useEffect(() => {
    if (isDemo) return; // Don't connect if in demo mode

    const connectToServer = () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }

      const socket = io(serverAddress, {
        transports: ['websocket', 'polling'],
        // Reconnection options
        reconnection: true,
        reconnectionAttempts: 10,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        // Timeout options
        timeout: 20000,
        // Force fresh connection (fixes stale connection issues)
        forceNew: true,
        // Ping settings
        pingTimeout: 30000,
        pingInterval: 10000,
      });

      socketRef.current = socket;

      socket.on('connect', () => {
        console.log('Connected to backend');
        setConnected(true);
        // Request initial data immediately after connection
        socket.emit('request_data');
      });

      socket.on('connect_error', (err) => {
        console.error('Connection error:', err);
        setConnected(false);
      });

      socket.on('disconnect', (reason) => {
        console.log('Disconnected from backend:', reason);
        setConnected(false);
        setData(null);
        // If disconnected unexpectedly, socket.io will auto-reconnect
      });

      socket.on('reconnect', (attemptNumber) => {
        console.log('Reconnected after', attemptNumber, 'attempts');
        setConnected(true);
      });

      socket.on('reconnect_attempt', (attemptNumber) => {
        console.log('Reconnection attempt', attemptNumber);
      });

      socket.on('hardware_update', (newData) => {
        setData(newData);
      });

      return socket;
    };

    connectToServer();

    return () => {
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, [serverAddress, isDemo]);

  // Handle Manual Connect from Screen
  const handleConnect = (address) => {
    setIsDemo(false);
    setServerAddress(address);
    try {
      localStorage.setItem('serverAddress', address);
    } catch (e) {
      console.error("Failed to save server address", e);
    }
  };

  const handleDemo = () => {
    if (socketRef.current) socketRef.current.disconnect();
    setIsDemo(true);
  };

  // Wake Lock Logic
  useEffect(() => {
    let wakeLock = null;

    const requestWakeLock = async () => {
      try {
        if ('wakeLock' in navigator) {
          wakeLock = await navigator.wakeLock.request('screen');
          console.log('Wake Lock is active');
        }
      } catch (err) {
        console.error(`${err.name}, ${err.message}`);
      }
    };

    requestWakeLock();

    const handleVisibilityChange = () => {
      if (wakeLock !== null && document.visibilityState === 'visible') {
        requestWakeLock();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    const hideStatusBar = async () => {
      try {
        await StatusBar.hide();
        await StatusBar.setOverlaysWebView({ overlay: true });
      } catch (err) {
        console.log("StatusBar hide failed (not on mobile?)", err);
      }
    };
    hideStatusBar();

    return () => {
      if (wakeLock !== null) {
        wakeLock.release().then(() => {
          console.log('Wake Lock released');
        });
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Full Screen Logic
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  useEffect(() => {
    if (wantsFullScreen && !document.fullscreenElement) {
      const restoreFS = async () => {
        try {
          await document.documentElement.requestFullscreen();
        } catch (err) {
          console.log("Waiting for interaction to restore FS...");
        }
      };
      restoreFS();
    }
  }, [connected, wantsFullScreen]);

  const handleGlobalClick = () => {
    if (wantsFullScreen && !document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => console.log("FS Blocked:", err));
    }
  };

  const toggleFullScreen = (e) => {
    if (e) e.stopPropagation();

    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => console.log(err));
      setWantsFullScreen(true);
      try {
        localStorage.setItem('wantsFullScreen', 'true');
      } catch (e) { }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
      setWantsFullScreen(false);
      try {
        localStorage.setItem('wantsFullScreen', 'false');
      } catch (e) { }
    }
  };

  // Handle return to config screen
  const handleReturnToConfig = () => {
    if (socketRef.current) socketRef.current.disconnect();
    setConnected(false);
    setIsDemo(false);
    setData(null);
    setCameFromDashboard(true); // Remember we came from dashboard
  };

  // Handle quick reconnect from ConnectionScreen
  const handleReconnect = () => {
    setCameFromDashboard(false);
    // Trigger reconnection by re-setting server address
    const addr = serverAddress;
    setServerAddress('');
    setTimeout(() => setServerAddress(addr), 100);
  };

  // Show tutorial when first connected (and not in demo, and not seen before)
  useEffect(() => {
    if (connected && !hasShownTutorial && !isDemo && data) {
      setTimeout(() => {
        setShowTutorial(true);
      }, 1000);
    }
  }, [connected, hasShownTutorial, isDemo, data]);

  const handleTutorialComplete = () => {
    setShowTutorial(false);
    setHasShownTutorial(true);
    try {
      localStorage.setItem('fps_monitor_tutorial_seen', 'true');
    } catch (e) { }
  };

  return (
    <div
      className="min-h-screen bg-gray-900 text-white"
      onClick={handleGlobalClick}
    >
      {/* Splash Screen */}
      {showSplash && (
        <SplashScreen onComplete={() => setShowSplash(false)} />
      )}

      {/* Tutorial Overlay */}
      <TutorialOverlay
        isOpen={showTutorial}
        onComplete={handleTutorialComplete}
      />

      {!connected ? (
        <ConnectionScreen
          onConnect={handleConnect}
          onDemo={handleDemo}
          serverAddress={serverAddress}
          setServerAddress={setServerAddress}
          cameFromDashboard={cameFromDashboard}
          onReconnect={handleReconnect}
        />
      ) : (
        <DashboardWithModals
          data={data}
          toggleFullScreen={toggleFullScreen}
          isFullscreen={isFullscreen}
          connected={connected}
          serverAddress={serverAddress}
          setServerAddress={setServerAddress}
          isDemo={isDemo}
          exitDemo={() => setIsDemo(false)}
          onReturnToConfig={handleReturnToConfig}
        />
      )}
    </div>
  );
}

export default App;
