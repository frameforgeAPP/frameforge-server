import { useEffect, useState } from 'react';
import { Maximize } from 'lucide-react';
import io from 'socket.io-client';
import { StatusBar } from '@capacitor/status-bar';
import Dashboard from './components/Dashboard';
// import Login from './components/Login'; // Removed

function App() {
  const [data, setData] = useState(null);
  const [connected, setConnected] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Initialize wantsFullScreen from localStorage
  const [wantsFullScreen, setWantsFullScreen] = useState(() => {
    return localStorage.getItem('wantsFullScreen') === 'true';
  });

  // Initialize serverAddress from localStorage or default
  const [serverAddress, setServerAddress] = useState(() => {
    return localStorage.getItem('serverAddress') || `http://192.168.1.110:8000`;
  });

  useEffect(() => {
    // Connect to the backend server
    const connectToServer = (pin) => {
      const socket = io(serverAddress, {
        transports: ['websocket', 'polling']
        // auth: { pin: pin } // Removed
      });

      socket.on('connect', () => {
        console.log('Connected to backend');
        setConnected(true);

        // Save PIN if successful (optional, for now just session)
        // localStorage.setItem('fps_pin', pin); // Removed
      });

      socket.on('connect_error', (err) => {
        console.error('Connection error:', err);
        if (err.message === "xhr poll error" || err.message === "websocket error") {
          // Network error, keep trying
        } else {

          // Auth error likely
          console.log("Auth failed or rejected");
          setConnected(false);
        }
      });

      socket.on('disconnect', () => {
        console.log('Disconnected from backend');
        setConnected(false);
        setData(prevData => {
          if (!prevData) return null;
          return {
            ...prevData,
            cpu: { ...prevData.cpu, temp: 0, load: 0 },
            ram: { ...prevData.ram, used_gb: 0, percent: 0 },
            gpus: prevData.gpus.map(gpu => ({ ...gpu, temperature: 0, load: 0 })),
            fps: 0,
            rtss_connected: false,
            game: ""
          };
        });
      });

      socket.on('hardware_update', (newData) => {
        setData(newData);
      });

      return socket;
    };

    // Always attempt to connect
    const socket = connectToServer("");

    return () => {
      if (socket) socket.disconnect();
    };
  }, [serverAddress]);

  // const handleLogin = (pin) => { ... } // Removed

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

    // Request on mount
    requestWakeLock();

    // Re-request on visibility change (if tab was hidden and comes back)
    const handleVisibilityChange = () => {
      if (wakeLock !== null && document.visibilityState === 'visible') {
        requestWakeLock();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Hide Status Bar on Mount (Capacitor)
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
      if (!document.fullscreenElement) {
        // Optional: setWantsFullScreen(false);
      }
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Restore Full Screen on Connect OR Disconnect (Persistent Mode)
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

  // Enforce Full Screen on any interaction if desired
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
      localStorage.setItem('wantsFullScreen', 'true');
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
      setWantsFullScreen(false);
      localStorage.setItem('wantsFullScreen', 'false');
    }
  };

  return (
    <div
      className="min-h-screen bg-gray-900 text-white"
      onClick={handleGlobalClick}
    >

      <Dashboard
        data={data}
        toggleFullScreen={toggleFullScreen}
        isFullscreen={isFullscreen}
        connected={connected}
        serverAddress={serverAddress}
        setServerAddress={setServerAddress}
      />
    </div>
  );
}

export default App;
