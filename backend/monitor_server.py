import asyncio
import platform
import subprocess
import psutil
import psutil
import socketio
import sys
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from rtss_reader import RTSSReader
from mahm_reader import MAHMReader
from lhm_reader import LHMReader
import hashlib
import pythoncom
import win32com.client
from zeroconf import ServiceInfo, Zeroconf
import socket
import GPUtil

# Initialize FastAPI
app = FastAPI()

# Enable CORS for local network access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for local dev
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import os

# Mount static files
# Mount static files
if getattr(sys, 'frozen', False):
    # If running as compiled EXE, look for frontend/dist relative to the executable
    base_path = os.path.dirname(sys.executable)
    frontend_dist = os.path.join(base_path, "frontend", "dist")
else:
    # If running as script, look for frontend/dist relative to this script
    frontend_dist = os.path.abspath(os.path.join(os.path.dirname(__file__), "../frontend/dist"))

if os.path.exists(frontend_dist):
    app.mount("/assets", StaticFiles(directory=os.path.join(frontend_dist, "assets")), name="assets")
    
    @app.get("/")
    async def read_index():
        return FileResponse(os.path.join(frontend_dist, "index.html"))


# Initialize Socket.IO (Async)
sio = socketio.AsyncServer(async_mode='asgi', cors_allowed_origins='*')
socket_app = socketio.ASGIApp(sio, app)

# Global flag to control the monitoring loop
monitoring_active = False

# Initialize Readers
rtss_reader = RTSSReader()
mahm_reader = MAHMReader()
lhm_reader = LHMReader()

def get_gpu_stats():
    # Priority 1: MSI Afterburner (MAHM)
    # Best because it's what the user asked for and is very reliable for gamers
    try:
        gpus = mahm_reader.read_gpu_stats()
        if gpus:
            return gpus
    except Exception:
        pass

    # Priority 2: LibreHardwareMonitor (LHM)
    try:
        gpus = lhm_reader.read_gpu_stats()
        if gpus:
            return gpus
    except Exception:
        pass

    # Priority 3: GPUtil (Fallback)
    try:
        gpus_list = []
        # GPUtil uses nvidia-smi which might cause a console window to flash on some systems
        # But it is the most reliable fallback
        for gpu in GPUtil.getGPUs():
            gpus_list.append({
                "id": str(gpu.id),
                "name": gpu.name,
                "load": gpu.load * 100,
                "memory_used": gpu.memoryUsed,
                "memory_total": gpu.memoryTotal,
                "temperature": gpu.temperature
            })
        return gpus_list
    except Exception as e:
        print(f"GPUtil error: {e}")
        return []

def get_wmi_temp():
    try:
        # Initialize COM for this thread
        pythoncom.CoInitialize()
        
        # Connect to WMI
        wmi = win32com.client.GetObject("winmgmts:root\\wmi")
        
        # Query temperature
        # MSAcpi_ThermalZoneTemperature usually returns decikelvin
        items = wmi.ExecQuery("SELECT CurrentTemperature FROM MSAcpi_ThermalZoneTemperature")
        
        if not items:
            return 0.0
            
        # Get the first result
        temp_dk = items[0].CurrentTemperature
        
        # Convert to Celsius: (dK / 10) - 273.15
        temp_c = (temp_dk / 10) - 273.15
        return round(temp_c, 1)
        
    except Exception as e:
        # print(f"WMI Error: {e}") # Silent error to avoid log spam
        return 0.0
    finally:
        # Uninitialize COM
        pythoncom.CoUninitialize()

async def get_cpu_temp():
    loop = asyncio.get_event_loop()
    
    # Helper to run blocking function with timeout
    async def run_blocking(func):
        return await loop.run_in_executor(None, func)

    try:
        # Try MSI Afterburner first (with timeout)
        temp = await asyncio.wait_for(run_blocking(mahm_reader.read_cpu_temp), timeout=2.0)
        if temp is not None:
            return temp
    except asyncio.TimeoutError:
        print("MAHM read timed out")
    except Exception as e:
        print(f"MAHM read error: {e}")

    try:
        # Try LibreHardwareMonitor (with timeout)
        temp = await asyncio.wait_for(run_blocking(lhm_reader.read_cpu_temp), timeout=2.0)
        if temp is not None:
            return temp
    except asyncio.TimeoutError:
        print("LHM read timed out")
    except Exception as e:
        print(f"LHM read error: {e}")

    # Fallback 2: WMI (Direct System Call - No Flashing Window)
    try:
        # Run WMI call in executor to avoid blocking event loop
        temp = await loop.run_in_executor(None, get_wmi_temp)
        if temp > 0:
            return temp
    except Exception as e:
        # print(f"WMI fallback error: {e}")
        pass

async def broadcast_stats():
    global monitoring_active
    monitoring_active = True
    print("Starting hardware monitoring loop...")
    
    while monitoring_active:
        try:
            # 1. Try to get ALL stats from MSI Afterburner (MAHM) first
            # This is the most efficient and stable method
            mahm_data = None
            try:
                mahm_data = mahm_reader.read_all_stats()
            except Exception:
                pass

            # CPU Stats
            cpu_percent = psutil.cpu_percent(interval=None)
            cpu_temp = 0
            
            if mahm_data and mahm_data.get("cpu_usage") is not None:
                cpu_percent = mahm_data["cpu_usage"]
            
            if mahm_data and mahm_data.get("cpu_temp") is not None:
                cpu_temp = mahm_data["cpu_temp"]
            else:
                # Fallback for CPU Temp
                cpu_temp = await get_cpu_temp()

            cpu_freq = psutil.cpu_freq()
            # Emit data to all connected clients
            await sio.emit('hardware_update', data)
            
            # Wait for 1 second before next update
            await asyncio.sleep(1)
            
        except Exception as e:
            print(f"Error in monitoring loop: {e}")
            await asyncio.sleep(1)

@app.on_event("startup")
async def startup_event():
    # Start the background task
    asyncio.create_task(broadcast_stats())

@sio.event
async def connect(sid, environ, auth=None):
    print(f"Client connecting: {sid}")
    # Always allow connection
    return True

@sio.event
async def disconnect(sid):
    print(f"Client disconnected: {sid}")

    # Run server (HTTP only to avoid Android SSL issues)
    uvicorn.run(
        socket_app, 
        host=HOST, 
        port=PORT
    )

# Global Zeroconf instance
zeroconf = None
info = None

@app.on_event("startup")
async def startup_event():
    global zeroconf, info
    # Start the background task
    asyncio.create_task(broadcast_stats())
    
    try:
        # Register mDNS service
        zeroconf = Zeroconf()
        local_ip = socket.gethostbyname(socket.gethostname())
        
        desc = {'path': '/'}
        
        info = ServiceInfo(
            "_fps-monitor._tcp.local.",
            "FPS Monitor Server._fps-monitor._tcp.local.",
            addresses=[socket.inet_aton(local_ip)],
            port=8000,
            properties=desc,
            server="fps-monitor.local."
        )
        
        zeroconf.register_service(info)
        print(f"mDNS Service registered: FPS Monitor Server at {local_ip}:8000")
    except Exception as e:
        print(f"Failed to register mDNS service: {e}")

@app.on_event("shutdown")
async def shutdown_event():
    global monitoring_active, zeroconf, info
    monitoring_active = False
    print("Shutting down...")
    
    if zeroconf and info:
        try:
            zeroconf.unregister_service(info)
            zeroconf.close()
            print("mDNS Service unregistered")
        except Exception as e:
            print(f"Error unregistering mDNS: {e}")

def run_server():
    # Fix for Uvicorn in noconsole mode (PyInstaller)
    if sys.stdout is None:
        sys.stdout = open(os.devnull, "w")
    if sys.stderr is None:
        sys.stderr = open(os.devnull, "w")

    # Configuration from Environment Variables (set by launcher)
    HOST = os.environ.get("FPS_HOST", "0.0.0.0")
    PORT = int(os.environ.get("FPS_PORT", "8000"))
    
    print(f"Starting server on {HOST}:{PORT}")
    
    # Run server (HTTP only to avoid Android SSL issues)
    uvicorn.run(
        socket_app, 
        host=HOST, 
        port=PORT
    )

if __name__ == "__main__":
    run_server()
