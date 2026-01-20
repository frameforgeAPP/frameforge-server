"""
FrameForge Server - Desktop Application
Sends hardware stats (FPS, CPU, GPU, RAM) to the FrameForge mobile app
"""

import asyncio
import platform
import subprocess
import psutil
import socketio
import sys
import os
import threading
import webbrowser
import logging
import queue
import io

import locale

# ==================== TRANSLATIONS ====================
TRANSLATIONS = {
    "pt": {
        "status_running": "SERVIDOR RODANDO",
        "status_stopped": "SERVIDOR PARADO",
        "waiting_connection": "Aguardando conexão...",
        "devices_connected": "dispositivo(s) conectado(s)",
        "start_with_windows": "Iniciar com Windows",
        "minimized": "Minimizado",
        "stop_server": "Encerrar",
        "support": "Apoiar ❤️",
        "theme_changed": "Tema Alterado",
        "restart_msg": "Por favor, reinicie o servidor para aplicar o novo tema completamente.",
        "support_title": "Apoie o FrameForge",
        "support_header": "✨ Apoie o Projeto ✨",
        "support_desc": "Sua doação ajuda a manter o app gratuito!",
        "copy_pix": "Copiar Chave PIX",
        "copied": "Copiado! ✅",
        "open_browser": "Abrir no Navegador 🌐",
        "scan_to_donate": "Escaneie para doar pelo celular",
        "thank_you": "Obrigado! ❤️",
        "msi_warning": "MSI Afterburner não detectado",
        "msi_desc": "Abra o Afterburner + RTSS para monitorar FPS/GPU",
        "active_game": "JOGO ATIVO",
        "connect_qr": "CONECTAR VIA QR CODE",
        "scan_app": "Escaneie com o app",
        "error_qr": "Erro ao gerar QR",
        "connection": "CONEXÃO",
        "devices": "Dispositivos:",
    },
    "en": {
        "status_running": "SERVER RUNNING",
        "status_stopped": "SERVER STOPPED",
        "waiting_connection": "Waiting for connection...",
        "devices_connected": "device(s) connected",
        "start_with_windows": "Start with Windows",
        "minimized": "Minimized",
        "stop_server": "Stop",
        "support": "Support ❤️",
        "theme_changed": "Theme Changed",
        "restart_msg": "Please restart the server to fully apply the new theme.",
        "support_title": "Support FrameForge",
        "support_header": "✨ Support the Project ✨",
        "support_desc": "Your donation helps keep the app free!",
        "copy_pix": "Copy PIX Key",
        "copied": "Copied! ✅",
        "open_browser": "Open in Browser 🌐",
        "scan_to_donate": "Scan to donate via mobile",
        "thank_you": "Thank you! ❤️",
        "msi_warning": "MSI Afterburner not detected",
        "msi_desc": "Open Afterburner + RTSS to monitor FPS/GPU",
        "active_game": "ACTIVE GAME",
        "connect_qr": "CONNECT VIA QR CODE",
        "scan_app": "Scan with the app",
        "error_qr": "Error generating QR",
        "connection": "CONNECTION",
        "devices": "Devices:",
    }
}

def get_system_language():
    """Detect system language, default to 'en' if not 'pt'"""
    try:
        lang, _ = locale.getdefaultlocale()
        if lang and lang.lower().startswith('pt'):
            return 'pt'
        return 'en'
    except:
        return 'en'

CURRENT_LANG = get_system_language()

def t(key):
    """Get translation for key"""
    return TRANSLATIONS[CURRENT_LANG].get(key, key)

# ==================== SINGLE INSTANCE CHECK ====================
import ctypes
from ctypes import wintypes

MUTEX_NAME = "FrameForgeServerMutex_v1"
mutex_handle = None

def check_single_instance():
    """Check if another instance is already running using Windows Mutex"""
    global mutex_handle
    try:
        mutex_handle = ctypes.windll.kernel32.CreateMutexW(None, True, MUTEX_NAME)
        last_error = ctypes.windll.kernel32.GetLastError()
        ERROR_ALREADY_EXISTS = 183
        
        if last_error == ERROR_ALREADY_EXISTS:
            ctypes.windll.kernel32.CloseHandle(mutex_handle)
            return False  # Another instance is running
        return True  # This is the first instance
    except:
        return True  # If check fails, allow running

def show_already_running_message():
    """Show a Windows message box that the app is already running"""
    ctypes.windll.user32.MessageBoxW(
        0, 
        "O FrameForge Server já está em execução!\n\nVerifique o ícone na bandeja do sistema (área de notificação).",
        "FrameForge Server",
        0x40  # MB_ICONINFORMATION
    )

def set_app_user_model_id():
    """Force Windows to use the specific icon for this app group"""
    try:
        myappid = f'frameforge.server.gui.{APP_VERSION}'
        ctypes.windll.shell32.SetCurrentProcessExplicitAppUserModelID(myappid)
    except:
        pass

# Set ID immediately
set_app_user_model_id()

# ==================== FIX FOR FROZEN EXE ====================
# When running as frozen exe, stdout/stderr can be None
# This causes uvicorn's isatty() check to fail
if getattr(sys, 'frozen', False):
    # Redirect to devnull instead of StringIO for better compatibility
    devnull = open(os.devnull, 'w')
    if sys.stdout is None:
        sys.stdout = devnull
    if sys.stderr is None:
        sys.stderr = devnull

import tkinter as tk
import customtkinter as ctk
from tkinter import ttk, messagebox
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import uvicorn
from rtss_reader import RTSSReader
from mahm_reader import MAHMReader
from lhm_reader import LHMReader
import pythoncom
import win32com.client
from zeroconf import ServiceInfo, Zeroconf
import socket
import winreg
import qrcode
from PIL import Image, ImageTk
import io
import webbrowser
from PIL import Image, ImageTk
import pystray
from pystray import MenuItem as item
import qrcode

import json

# ==================== SUPPRESS CONSOLE WINDOWS ====================

if sys.platform == 'win32':
    try:
        kernel32 = ctypes.WinDLL('kernel32', use_last_error=True)
        user32 = ctypes.WinDLL('user32', use_last_error=True)
        hwnd = kernel32.GetConsoleWindow()
        if hwnd:
            user32.ShowWindow(hwnd, 0)
    except:
        pass

logging.getLogger("uvicorn").setLevel(logging.ERROR)
logging.getLogger("uvicorn.access").setLevel(logging.ERROR)
logging.getLogger("uvicorn.error").setLevel(logging.ERROR)
logging.getLogger("fastapi").setLevel(logging.ERROR)
logging.getLogger("socketio").setLevel(logging.ERROR)
logging.getLogger("engineio").setLevel(logging.ERROR)

# Determine base path for config and logs
if getattr(sys, 'frozen', False):
    BASE_PATH = os.path.dirname(sys.executable)
else:
    BASE_PATH = os.path.dirname(os.path.abspath(__file__))

CONFIG_FILE = os.path.join(BASE_PATH, "config.json")
LOG_FILE = os.path.join(BASE_PATH, "server_debug.log")

# Configure logging with absolute path
logging.basicConfig(
    filename=LOG_FILE,
    level=logging.ERROR,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Constants
APP_NAME = "FrameForge Server"
APP_VERSION = "1.0"
REGISTRY_KEY = r"Software\Microsoft\Windows\CurrentVersion\Run"
SERVER_URL = "https://github.com/frameforgeAPP/frameforge-server"
CREATE_NO_WINDOW = 0x08000000

# ==================== CONFIG MANAGEMENT ====================

# ==================== CONFIG MANAGEMENT ====================

def load_config():
    try:
        if os.path.exists(CONFIG_FILE):
            with open(CONFIG_FILE, 'r') as f:
                return json.load(f)
    except:
        pass
    return {"start_minimized": False}

def save_config(config):
    try:
        with open(CONFIG_FILE, 'w') as f:
            json.dump(config, f)
    except:
        pass

# ==================== TRON THEME COLORS ====================
COLORS = {
    'bg_dark': '#0a0e14',
    'bg_panel': '#0f1620',
    'bg_card': '#1a2332',
    'cyan': '#00f3ff',
    'cyan_dim': '#00a8b5',
    'blue': '#1a9fff',
    'green': '#22c55e',
    'yellow': '#f59e0b',
    'red': '#ef4444',
    'text': '#ffffff',
    'text_dim': '#6b7280',
    'border': '#1e3a5f'
}

# Initialize FastAPI
app = FastAPI(title=APP_NAME, version=APP_VERSION)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

if getattr(sys, 'frozen', False):
    base_path = os.path.dirname(sys.executable)
    frontend_dist = os.path.join(base_path, "frontend", "dist")
else:
    frontend_dist = os.path.abspath(os.path.join(os.path.dirname(__file__), "../frontend/dist"))

if os.path.exists(frontend_dist):
    app.mount("/assets", StaticFiles(directory=os.path.join(frontend_dist, "assets")), name="assets")
    
    @app.get("/")
    async def read_index():
        return FileResponse(os.path.join(frontend_dist, "index.html"))

sio = socketio.AsyncServer(async_mode='asgi', cors_allowed_origins='*', logger=False, engineio_logger=False)
socket_app = socketio.ASGIApp(sio, app)

# Global state
monitoring_active = False
connected_clients = set()
server_stats = {
    "clients": 0,
    "fps": 0,
    "cpu_temp": 0,
    "gpu_temp": 0,
    "uptime": 0,
    "status": "Starting...",
    "game": ""
}

# GUI window reference
gui_window = None

rtss_reader = RTSSReader()
mahm_reader = MAHMReader()
lhm_reader = LHMReader()
zeroconf = None
mdns_info = None

# ==================== AUTO-START FUNCTIONS ====================

def is_auto_start_enabled():
    try:
        key = winreg.OpenKey(winreg.HKEY_CURRENT_USER, REGISTRY_KEY, 0, winreg.KEY_READ)
        try:
            winreg.QueryValueEx(key, APP_NAME)
            winreg.CloseKey(key)
            return True
        except WindowsError:
            winreg.CloseKey(key)
            return False
    except WindowsError:
        return False

def enable_auto_start():
    try:
        if getattr(sys, 'frozen', False):
            exe_path = f'"{sys.executable}" --minimized'
        else:
            exe_path = f'"{sys.executable}" "{os.path.abspath(__file__)}" --minimized'
        key = winreg.OpenKey(winreg.HKEY_CURRENT_USER, REGISTRY_KEY, 0, winreg.KEY_SET_VALUE)
        winreg.SetValueEx(key, APP_NAME, 0, winreg.REG_SZ, exe_path)
        winreg.CloseKey(key)
        return True
    except Exception:
        return False

def disable_auto_start():
    try:
        key = winreg.OpenKey(winreg.HKEY_CURRENT_USER, REGISTRY_KEY, 0, winreg.KEY_SET_VALUE)
        winreg.DeleteValue(key, APP_NAME)
        winreg.CloseKey(key)
        return True
    except Exception:
        return False

# ==================== HARDWARE MONITORING ====================

def get_afterburner_status():
    rtss_running = False
    afterburner_running = False
    
    for proc in psutil.process_iter(['name']):
        try:
            proc_name = proc.info['name']
            if proc_name and proc_name.lower() == 'rtss.exe':
                rtss_running = True
            elif proc_name and proc_name.lower() == 'msiafterburner.exe':
                afterburner_running = True
        except (psutil.NoSuchProcess, psutil.AccessDenied):
            pass
    
    if rtss_running:
        try:
            test_reader = RTSSReader()
            if test_reader.connect():
                return 'running'
        except:
            pass
    
    if rtss_running or afterburner_running:
        return 'installed'
    
    return 'not-found'

@app.get("/api/ip")
async def get_local_ip():
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
        return {"ip": ip}
    except Exception:
        return {"ip": socket.gethostbyname(socket.gethostname())}

@app.get("/api/afterburner-status")
async def get_afterburner_status_endpoint():
    return {"status": get_afterburner_status()}

@app.get("/api/server-info")
async def get_server_info():
    return {
        "name": APP_NAME,
        "version": APP_VERSION,
        "clients": len(connected_clients),
        "auto_start": is_auto_start_enabled()
    }

def get_gpu_stats_nvidia_smi():
    try:
        startupinfo = subprocess.STARTUPINFO()
        startupinfo.dwFlags |= subprocess.STARTF_USESHOWWINDOW
        startupinfo.wShowWindow = subprocess.SW_HIDE
        
        # Added 'utilization.memory' and better error handling
        result = subprocess.run(
            ['nvidia-smi', '--query-gpu=index,name,utilization.gpu,memory.used,memory.total,temperature.gpu', 
             '--format=csv,noheader,nounits'],
            capture_output=True, text=True, startupinfo=startupinfo, creationflags=CREATE_NO_WINDOW
        )
        
        if result.returncode == 0 and result.stdout.strip():
            gpus = []
            for line in result.stdout.strip().split('\n'):
                try:
                    parts = [p.strip() for p in line.split(',')]
                    if len(parts) >= 6:
                        # Safe float conversion
                        def safe_float(val):
                            try:
                                return float(val)
                            except:
                                return 0.0

                        gpus.append({
                            "id": parts[0], 
                            "name": parts[1],
                            "load": safe_float(parts[2]),
                            "memory_used": safe_float(parts[3]),
                            "memory_total": safe_float(parts[4]),
                            "temperature": safe_float(parts[5])
                        })
                except:
                    continue
            return gpus
    except Exception:
        pass
    return []

def prioritize_gpus(gpu_list):
    if not gpu_list:
        return []
        
    def is_dedicated(name):
        n = name.lower()
        return "nvidia" in n or "radeon" in n or "rtx" in n or "gtx" in n or "rx" in n or "arc" in n

    # Sort by:
    # 1. Dedicated (True > False)
    # 2. Load (Higher > Lower)
    # 3. Memory Used (Higher > Lower)
    return sorted(gpu_list, key=lambda x: (
        is_dedicated(x['name']),
        x['load'],
        x['memory_used']
    ), reverse=True)

def get_gpu_stats():
    all_gpus = []
    
    # 1. Try MSI Afterburner (Best for gaming)
    try:
        mahm_gpus = mahm_reader.read_gpu_stats()
        if mahm_gpus:
            all_gpus.extend(mahm_gpus)
    except:
        pass

    # 2. Try LibreHardwareMonitor (Good general coverage)
    try:
        lhm_gpus = lhm_reader.read_gpu_stats()
        if lhm_gpus:
            all_gpus.extend(lhm_gpus)
    except:
        pass
    
    # 3. Try Nvidia SMI (Reliable for Nvidia)
    try:
        nvidia_gpus = get_gpu_stats_nvidia_smi()
        if nvidia_gpus:
            all_gpus.extend(nvidia_gpus)
    except:
        pass

    if not all_gpus:
        return []

    # Deduplicate based on name (simple fuzzy match) or just prioritize and return unique top
    # Simple deduplication: If we have multiple entries for "NVIDIA GeForce RTX 3060", take the one with highest load
    
    unique_gpus = {}
    for gpu in all_gpus:
        name = gpu['name']
        # Create a normalized key
        key = name.lower().replace("nvidia", "").replace("amd", "").replace("radeon", "").replace("geforce", "").strip()
        
        if key not in unique_gpus:
            unique_gpus[key] = gpu
        else:
            # If we already have this GPU, keep the one with higher load or temp
            existing = unique_gpus[key]
            if gpu['load'] > existing['load']:
                unique_gpus[key] = gpu
            elif gpu['load'] == existing['load'] and gpu['temperature'] > existing['temperature']:
                unique_gpus[key] = gpu

    final_list = list(unique_gpus.values())
    return prioritize_gpus(final_list)

def get_wmi_temp():
    try:
        pythoncom.CoInitialize()
        wmi = win32com.client.GetObject("winmgmts:root\\wmi")
        items = wmi.ExecQuery("SELECT CurrentTemperature FROM MSAcpi_ThermalZoneTemperature")
        if not items:
            return 0.0
        temp_dk = items[0].CurrentTemperature
        temp_c = (temp_dk / 10) - 273.15
        return round(temp_c, 1)
    except:
        return 0.0
    finally:
        try:
            pythoncom.CoUninitialize()
        except:
            pass

async def get_cpu_temp():
    loop = asyncio.get_event_loop()
    async def run_blocking(func):
        return await loop.run_in_executor(None, func)
    try:
        temp = await asyncio.wait_for(run_blocking(mahm_reader.read_cpu_temp), timeout=2.0)
        if temp is not None:
            return temp
    except:
        pass
    try:
        temp = await asyncio.wait_for(run_blocking(lhm_reader.read_cpu_temp), timeout=2.0)
        if temp is not None:
            return temp
    except:
        pass
    try:
        temp = await loop.run_in_executor(None, get_wmi_temp)
        if temp > 0:
            return temp
    except:
        pass
    return 0

async def broadcast_stats():
    global monitoring_active, server_stats
    monitoring_active = True
    start_time = asyncio.get_event_loop().time()
    server_stats["status"] = "Running"
    
    while monitoring_active:
        try:
            mahm_data = None
            try:
                mahm_data = mahm_reader.read_all_stats()
            except:
                pass

            cpu_percent = psutil.cpu_percent(interval=None)
            cpu_temp = 0
            
            if mahm_data and mahm_data.get("cpu_usage") is not None:
                cpu_percent = mahm_data["cpu_usage"]
            if mahm_data and mahm_data.get("cpu_temp") is not None:
                cpu_temp = mahm_data["cpu_temp"]
            else:
                cpu_temp = await get_cpu_temp()

            cpu_freq = psutil.cpu_freq()
            ram = psutil.virtual_memory()
            gpus = get_gpu_stats()
            fps_data = rtss_reader.read_fps()
            fps = fps_data.get("fps", 0) if fps_data else 0
            
            server_stats["fps"] = fps
            server_stats["cpu_temp"] = cpu_temp
            server_stats["gpu_temp"] = gpus[0]["temperature"] if gpus else 0
            server_stats["clients"] = len(connected_clients)
            server_stats["uptime"] = int(asyncio.get_event_loop().time() - start_time)
            server_stats["game"] = fps_data.get("game_name", "") if fps_data else ""
            
            data = {
                "cpu": {"load": cpu_percent, "temp": cpu_temp, "freq": cpu_freq.current if cpu_freq else 0},
                "ram": {"percent": ram.percent, "used_gb": round(ram.used / (1024**3), 1), "total_gb": round(ram.total / (1024**3), 1)},
                "gpus": gpus, "fps": fps,
                "rtss_connected": fps_data is not None,
                "game": fps_data.get("game_name", "") if fps_data else "",
                "afterburner_status": get_afterburner_status(),
                "system": {"hostname": platform.node(), "os": f"{platform.system()} {platform.release()}"},
                "client_count": len(connected_clients)
            }
            await sio.emit('hardware_update', data)
            await asyncio.sleep(1)
        except:
            await asyncio.sleep(1)

@sio.event
async def connect(sid, environ, auth=None):
    connected_clients.add(sid)
    return True

@sio.event
async def disconnect(sid):
    connected_clients.discard(sid)

@sio.event
async def request_data(sid):
    """Send immediate hardware data when client requests it"""
    try:
        cpu_percent = psutil.cpu_percent(interval=None)
        cpu_temp = 0
        
        try:
            mahm_data = mahm_reader.read_all_stats()
            if mahm_data and mahm_data.get("cpu_temp") is not None:
                cpu_temp = mahm_data["cpu_temp"]
        except:
            pass
        
        if cpu_temp == 0:
            cpu_temp = await get_cpu_temp()
        
        cpu_freq = psutil.cpu_freq()
        ram = psutil.virtual_memory()
        gpus = get_gpu_stats()
        fps_data = rtss_reader.read_fps()
        fps = fps_data.get("fps", 0) if fps_data else 0
        
        data = {
            "cpu": {"load": cpu_percent, "temp": cpu_temp, "freq": cpu_freq.current if cpu_freq else 0},
            "ram": {"percent": ram.percent, "used_gb": round(ram.used / (1024**3), 1), "total_gb": round(ram.total / (1024**3), 1)},
            "gpus": gpus, "fps": fps,
            "rtss_connected": fps_data is not None,
            "game": fps_data.get("game_name", "") if fps_data else "",
            "afterburner_status": get_afterburner_status(),
            "system": {"hostname": platform.node(), "os": f"{platform.system()} {platform.release()}"},
            "client_count": len(connected_clients)
        }
        await sio.emit('hardware_update', data, to=sid)
    except Exception as e:
        print(f"Error sending initial data: {e}")

@app.on_event("startup")
async def startup_event():
    global zeroconf, mdns_info
    asyncio.create_task(broadcast_stats())
    try:
        zeroconf = Zeroconf()
        local_ip = socket.gethostbyname(socket.gethostname())
        mdns_info = ServiceInfo(
            "_fps-monitor._tcp.local.",
            "FrameForge Server._fps-monitor._tcp.local.",
            addresses=[socket.inet_aton(local_ip)],
            port=8000,
            properties={'path': '/', 'version': APP_VERSION},
            server="frameforge.local."
        )
        zeroconf.register_service(mdns_info)
    except:
        pass

@app.on_event("shutdown")
async def shutdown_event():
    global monitoring_active, zeroconf, mdns_info
    monitoring_active = False
    if zeroconf and mdns_info:
        try:
            zeroconf.unregister_service(mdns_info)
            zeroconf.close()
        except:
            pass

# ==================== GUI WINDOW - TRON STYLE ====================

def get_local_ip_sync():
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except:
        return "127.0.0.1"

def generate_qr_code(data, size=120):
    """Generate QR code image for tkinter"""
    import qrcode
    qr = qrcode.QRCode(version=1, box_size=4, border=2)
    qr.add_data(data)
    qr.make(fit=True)
    # Classic black on white QR code for better readability
    qr_img = qr.make_image(fill_color='black', back_color='white')
    qr_img = qr_img.resize((size, size))
    return qr_img

class ServerGUI:
    """Modern server control panel using CustomTkinter"""
    
    def __init__(self):
        logger.info("Initializing ServerGUI")
        self.queue = queue.Queue()
        self.is_open = False
        self.server_running = True
        self.config = load_config()
        self.current_theme = self.config.get("theme", "dark")
        self.last_client_count = 0  # For connection animation
        self.afterburner_warning_shown = False
        
        # Theme color palettes
        self.dark_colors = {
            'bg': '#171d25',           # Steam dark background
            'card': '#1e2837',          # Steam card background
            'accent': '#00f3ff',        # TRON cyan (for logo)
            'accent_steam': '#1a9fff', # Steam blue accent
            'accent_light': '#66c0f4',  # Steam light blue
            'text': '#c6d4df',          # Steam text
            'text_bright': '#ffffff',   # White
            'text_dim': '#8f98a0',      # Dim text
            'green': '#a4d007',         # Steam green
            'red': '#c43c35',           # Error red
            'yellow': '#ffcc00',        # Warning
            'orange': '#f97316',        # Orange warning
            'purple': '#8b5cf6',        # Synthwave Purple
            'purple_hover': '#7c3aed',  # Darker purple
        }
        
        self.light_colors = {
            'bg': '#e8eaed',           # Light gray background
            'card': '#ffffff',          # White card
            'accent': '#0099cc',        # Darker cyan for light mode
            'accent_steam': '#1a73e8', # Google blue
            'accent_light': '#4285f4',  # Lighter blue
            'text': '#202124',          # Dark text
            'text_bright': '#000000',   # Black
            'text_dim': '#5f6368',      # Gray text
            'green': '#34a853',         # Green
            'red': '#ea4335',           # Red
            'yellow': '#fbbc04',        # Yellow
            'orange': '#fa903e',        # Orange warning
            'purple': '#8b5cf6',        # Synthwave Purple
            'purple_hover': '#7c3aed',  # Darker purple
        }
        
        # Set current colors based on theme
        self.colors = self.dark_colors if self.current_theme == "dark" else self.light_colors
        
        # Configure CustomTkinter
        ctk.set_appearance_mode(self.current_theme)
        ctk.set_default_color_theme("blue")
        
        # Create main window
        self.window = ctk.CTk()
        self.window.title(APP_NAME)
        self.window.geometry("380x750")
        self.window.resizable(False, False)
        
        self.window.configure(fg_color=self.colors['bg'])
        
        self._set_icon()
        self.window.withdraw()
        self.window.protocol("WM_DELETE_WINDOW", self.hide)
        
        self._build_ui()
        self._schedule_queue_check()
    
    def _set_icon(self):
        try:
            if getattr(sys, 'frozen', False):
                base = sys._MEIPASS if hasattr(sys, '_MEIPASS') else os.path.dirname(sys.executable)
            else:
                base = os.path.dirname(os.path.abspath(__file__))
            icon_path = os.path.join(base, 'icon.ico')
            if os.path.exists(icon_path):
                self.window.iconbitmap(icon_path)
        except:
            pass
    
    def _build_ui(self):
        """Build modern CustomTkinter UI"""
        # Main scrollable container
        self.main_frame = ctk.CTkFrame(self.window, fg_color="transparent")
        self.main_frame.pack(fill='both', expand=True, padx=20, pady=15)
        
        # Header
        self._build_header(self.main_frame)
        
        # Status Card
        self._build_status_card(self.main_frame)
        
        # Afterburner Warning (conditional)
        self._build_afterburner_warning(self.main_frame)
        
        # Hardware Stats Card
        self._build_stats_card(self.main_frame)
        
        # Game Card (shows active game)
        self._build_game_card(self.main_frame)
        
        # Connection Card
        self._build_connection_card(self.main_frame)
        
        # QR Code Card
        self._build_qr_card(self.main_frame)
        
        # Footer with theme toggle
        self._build_footer(self.main_frame)
        
        # Start updates
        self._update_stats()

    
    def _build_header(self, parent):
        """Build header with logo"""
        header = ctk.CTkFrame(parent, fg_color="transparent")
        header.pack(fill='x', pady=(0, 15))
        
        # Top row with buttons on the right
        top_row = ctk.CTkFrame(header, fg_color="transparent")
        top_row.pack(fill='x')
        
        # FF Logo (Left)
        ctk.CTkLabel(top_row, text="FF", 
                    font=ctk.CTkFont(family="Arial Black", size=42, weight="bold"),
                    text_color=self.colors['accent']).pack(side='left')
        
        # Theme Toggle (Far Right)
        ctk.CTkButton(top_row, text="🌓", width=32, height=32,
                     fg_color=self.colors['card'], hover_color=self.colors['accent_steam'],
                     corner_radius=16,
                     font=ctk.CTkFont(size=16),
                     command=self._toggle_theme).pack(side='right', padx=(5, 0))

        # Support Button (Right)
        ctk.CTkButton(top_row, text=t("support"), 
                     font=ctk.CTkFont(size=12, weight="bold"),
                     fg_color=self.colors['purple'], 
                     hover_color=self.colors['purple_hover'],
                     corner_radius=20,
                     height=32,
                     command=self.open_donation_modal).pack(side='right')

        # Text row below
        ctk.CTkLabel(header, text="FRAMEFORGE SERVER",
                    font=ctk.CTkFont(size=14, weight="bold"),
                    text_color=self.colors['text']).pack(anchor='w')
        
        ctk.CTkLabel(header, text=f"v{APP_VERSION}",
                    font=ctk.CTkFont(size=11),
                    text_color=self.colors['text_dim']).pack(anchor='w')
    
    def _build_status_card(self, parent):
        """Server status card"""
        self.status_card = ctk.CTkFrame(parent, fg_color=self.colors['card'], corner_radius=12)
        self.status_card.pack(fill='x', pady=(0, 10))
        
        inner = ctk.CTkFrame(self.status_card, fg_color="transparent")
        inner.pack(fill='x', padx=15, pady=12)
        
        # Status Indicator
        self.status_indicator = ctk.CTkLabel(inner, text="●", 
                                           font=ctk.CTkFont(size=24),
                                           text_color=self.colors['green'])
        self.status_indicator.pack(side='left')
        
        # Status Text
        self.status_label = ctk.CTkLabel(inner, text=t("status_running"),
                                       font=ctk.CTkFont(size=14, weight="bold"),
                                       text_color=self.colors['text'])
        self.status_label.pack(side='left', padx=(10, 0))
        
        # Port info
        ctk.CTkLabel(inner, text=f"Port: 8000",
                    font=ctk.CTkFont(family="Consolas", size=12),
                    text_color=self.colors['text_dim']).pack(side='right')

    def _build_stats_card(self, parent):
        """Hardware stats grid"""
        card = ctk.CTkFrame(parent, fg_color=self.colors['card'], corner_radius=12)
        card.pack(fill='x', pady=(0, 10))
        
        inner = ctk.CTkFrame(card, fg_color="transparent")
        inner.pack(fill='x', padx=15, pady=12)
        
        # Title
        ctk.CTkLabel(inner, text="HARDWARE MONITOR",
                    font=ctk.CTkFont(size=11, weight="bold"),
                    text_color=self.colors['text_dim']).pack(anchor='w', pady=(0, 10))
        
        # Stats row
        stats_row = ctk.CTkFrame(inner, fg_color="transparent")
        stats_row.pack(fill='x')
        
        stats_data = [
            ("FPS", "fps_label", 22),
            ("CPU", "cpu_label", 14),
            ("GPU", "gpu_label", 14),
            ("RAM", "ram_label", 14),
        ]
        
        for name, attr, font_size in stats_data:
            box = ctk.CTkFrame(stats_row, fg_color=self.colors['bg'], corner_radius=8)
            box.pack(side='left', fill='x', expand=True, padx=(0, 5))
            
            box_inner = ctk.CTkFrame(box, fg_color="transparent")
            box_inner.pack(padx=8, pady=8)
            
            ctk.CTkLabel(box_inner, text=name,
                        font=ctk.CTkFont(size=10),
                        text_color=self.colors['text_dim']).pack()
            
            lbl = ctk.CTkLabel(box_inner, text="--",
                              font=ctk.CTkFont(family="Consolas", size=font_size, weight="bold"),
                              text_color=self.colors['accent_light'])
            lbl.pack()
            setattr(self, attr, lbl)
    
    def _build_afterburner_warning(self, parent):
        """Warning card when Afterburner is not running"""
        self.afterburner_card = ctk.CTkFrame(parent, fg_color=self.colors.get('orange', '#f97316'), corner_radius=12)
        # Initially hidden, will be shown/hidden in _update_stats
        
        inner = ctk.CTkFrame(self.afterburner_card, fg_color="transparent")
        inner.pack(fill='x', padx=12, pady=10)
        
        row = ctk.CTkFrame(inner, fg_color="transparent")
        row.pack(fill='x')
        
        # Warning icon
        ctk.CTkLabel(row, text="⚠️",
                    font=ctk.CTkFont(size=16)).pack(side='left')
        
        # Warning text
        ctk.CTkLabel(row, text=t("msi_warning"),
                    font=ctk.CTkFont(size=11, weight="bold"),
                    text_color='#ffffff').pack(side='left', padx=(8, 0))
        
        # Sub-text
        ctk.CTkLabel(inner, text=t("msi_desc"),
                    font=ctk.CTkFont(size=10),
                    text_color='#cccccc').pack(anchor='w', pady=(4, 0))
    
    def _build_game_card(self, parent):
        """Card showing the currently active game"""
        self.game_card = ctk.CTkFrame(parent, fg_color=self.colors['card'], corner_radius=12)
        # Initially hidden, shown when game is detected
        
        inner = ctk.CTkFrame(self.game_card, fg_color="transparent")
        inner.pack(fill='x', padx=15, pady=10)
        
        row = ctk.CTkFrame(inner, fg_color="transparent")
        row.pack(fill='x')
        
        # Game icon
        ctk.CTkLabel(row, text="🎮",
                    font=ctk.CTkFont(size=14)).pack(side='left')
        
        ctk.CTkLabel(row, text=t("active_game"),
                    font=ctk.CTkFont(size=10, weight="bold"),
                    text_color=self.colors['text_dim']).pack(side='left', padx=(8, 0))
        
        # Game name label
        self.game_name_label = ctk.CTkLabel(inner, text="--",
                                            font=ctk.CTkFont(size=13, weight="bold"),
                                            text_color=self.colors['green'])
        self.game_name_label.pack(anchor='w', pady=(5, 0))
    
    def _build_connection_card(self, parent):
        """Connection info card"""
        card = ctk.CTkFrame(parent, fg_color=self.colors['card'], corner_radius=12)
        card.pack(fill='x', pady=(0, 10))
        
        inner = ctk.CTkFrame(card, fg_color="transparent")
        inner.pack(fill='x', padx=15, pady=12)
        
        # Title
        ctk.CTkLabel(inner, text=t("connection"),
                    font=ctk.CTkFont(size=11, weight="bold"),
                    text_color=self.colors['text_dim']).pack(anchor='w', pady=(0, 8))
        
        # Devices row
        row = ctk.CTkFrame(inner, fg_color="transparent")
        row.pack(fill='x')
        
        ctk.CTkLabel(row, text=t("devices"),
                    font=ctk.CTkFont(size=12),
                    text_color=self.colors['text_dim']).pack(side='left')
        
        self.clients_count = ctk.CTkLabel(row, text="0",
                                          font=ctk.CTkFont(size=13, weight="bold"),
                                          text_color=self.colors['accent'])
        self.clients_count.pack(side='left', padx=(8, 0))
        
        self.clients_label = ctk.CTkLabel(inner, text=t("waiting_connection"),
                                          font=ctk.CTkFont(size=11),
                                          text_color=self.colors['text_dim'])
        self.clients_label.pack(anchor='w', pady=(5, 0))
    
    def _build_qr_card(self, parent):
        """QR code card"""
        card = ctk.CTkFrame(parent, fg_color=self.colors['card'], corner_radius=12)
        card.pack(fill='x', pady=(0, 10))
        
        inner = ctk.CTkFrame(card, fg_color="transparent")
        inner.pack(fill='x', padx=15, pady=12)
        
        # Title
        ctk.CTkLabel(inner, text=t("connect_qr"),
                    font=ctk.CTkFont(size=11, weight="bold"),
                    text_color=self.colors['text_dim']).pack(anchor='w', pady=(0, 10))
        
        # QR row
        qr_row = ctk.CTkFrame(inner, fg_color="transparent")
        qr_row.pack(fill='x')
        
        ip = get_local_ip_sync()
        
        try:
            qr_img = generate_qr_code(f"http://{ip}:8000", 90)
            self.qr_photo = ImageTk.PhotoImage(qr_img)
            
            # QR container
            qr_container = ctk.CTkFrame(qr_row, fg_color="white", corner_radius=8)
            qr_container.pack(side='left')
            
            qr_label = tk.Label(qr_container, image=self.qr_photo, bg='white')
            qr_label.pack(padx=5, pady=5)
            
            # Info
            info = ctk.CTkFrame(qr_row, fg_color="transparent")
            info.pack(side='left', padx=(15, 0))
            
            ctk.CTkLabel(info, text=t("scan_app"),
                        font=ctk.CTkFont(size=11),
                        text_color=self.colors['text_dim']).pack(anchor='w')
            
            ctk.CTkLabel(info, text="FrameForge",
                        font=ctk.CTkFont(size=12, weight="bold"),
                        text_color=self.colors['text']).pack(anchor='w')
            
            ctk.CTkLabel(info, text=f"{ip}:8000",
                        font=ctk.CTkFont(family="Consolas", size=11),
                        text_color=self.colors['accent']).pack(anchor='w', pady=(8, 0))
                        
        except Exception as e:
            logger.error(f"QR Error: {e}")
            ctk.CTkLabel(inner, text=t("error_qr"),
                        text_color=self.colors['red']).pack()
    
    def _build_footer(self, parent):
        """Footer with options"""
        footer = ctk.CTkFrame(parent, fg_color="transparent")
        footer.pack(fill='x', pady=(5, 0))
        
        # Checkboxes
        cb_row = ctk.CTkFrame(footer, fg_color="transparent")
        cb_row.pack(anchor='w')
        
        self.auto_start_var = ctk.BooleanVar(value=is_auto_start_enabled())
        ctk.CTkCheckBox(cb_row, text=t("start_with_windows"),
                       variable=self.auto_start_var,
                       font=ctk.CTkFont(size=11),
                       fg_color=self.colors['accent_steam'],
                       hover_color=self.colors['accent_light'],
                       command=self._toggle_auto_start).pack(side='left')
        
        self.start_minimized_var = ctk.BooleanVar(value=self.config.get("start_minimized", False))
        ctk.CTkCheckBox(cb_row, text=t("minimized"),
                       variable=self.start_minimized_var,
                       font=ctk.CTkFont(size=11),
                       fg_color=self.colors['accent_steam'],
                       hover_color=self.colors['accent_light'],
                       command=self._toggle_start_minimized).pack(side='left', padx=(15, 0))
        
        # Buttons Row
        btn_row = ctk.CTkFrame(footer, fg_color="transparent")
        btn_row.pack(fill='x', pady=(12, 0))
        
        # Stop button
        ctk.CTkButton(btn_row, text=t("stop_server"),
                     font=ctk.CTkFont(size=12, weight="bold"),
                     fg_color=self.colors['red'],
                     hover_color="#dc2626",
                     corner_radius=8,
                     width=120,
                     command=self.stop_server).pack(side='left', expand=True, padx=(0, 5))


        

    
    def _schedule_queue_check(self):
        try:
            while True:
                msg = self.queue.get_nowait()
                if msg == "show":
                    self.window.deiconify()
                    self.window.lift()
                    self.window.focus_force()
                    self.is_open = True
                elif msg == "hide":
                    self.hide()
                elif msg == "quit":
                    self.stop_server()
        except queue.Empty:
            pass
        
        if self.window:
            self.window.after(100, self._schedule_queue_check)
    
    def check_queue(self):
        self._schedule_queue_check()
    
    def start(self):
        if self.window:
            self.window.mainloop()
    
    def stop_server(self):
        global monitoring_active
        monitoring_active = False
        self.hide()
        os._exit(0)
    
    def _toggle_auto_start(self):
        if self.auto_start_var.get():
            enable_auto_start()
        else:
            disable_auto_start()
    
    def toggle_auto_start(self):
        self._toggle_auto_start()
    
    def _toggle_start_minimized(self):
        self.config["start_minimized"] = self.start_minimized_var.get()
        save_config(self.config)
    
    def toggle_start_minimized(self):
        self._toggle_start_minimized()
        
    def _toggle_theme(self):
        new_theme = "light" if self.current_theme == "dark" else "dark"
        self.current_theme = new_theme
        self.config["theme"] = new_theme
        save_config(self.config)
        
        # Update colors
        self.colors = self.dark_colors if new_theme == "dark" else self.light_colors
        ctk.set_appearance_mode(new_theme)
        
        # Show restart message
        try:
            messagebox.showinfo(t("theme_changed"), t("restart_msg"))
        except:
            pass
    
    def _update_stats(self):
        if not self.window:
            return
        
        try:
            cpu = psutil.cpu_percent(interval=None)
            ram = psutil.virtual_memory().percent
            
            self.cpu_label.configure(text=f"{int(cpu)}%")
            self.ram_label.configure(text=f"{int(ram)}%")
            
            gpu_temp = server_stats.get('gpu_temp', 0)
            self.gpu_label.configure(text=f"{int(gpu_temp)}°C" if gpu_temp else "--")
            
            fps = server_stats.get('fps', 0)
            self.fps_label.configure(text=str(fps))
            
            # FPS color
            if fps >= 60:
                self.fps_label.configure(text_color=self.colors['green'])
            elif fps >= 30:
                self.fps_label.configure(text_color=self.colors['yellow'])
            else:
                self.fps_label.configure(text_color=self.colors['red'])
            
            # Clients
            count = len(connected_clients)
            self.clients_count.configure(text=str(count))
            
            # Connection Animation
            if count > self.last_client_count:
                # New client connected - Pulse effect
                self.clients_count.configure(text_color=self.colors['green'])
                self.window.after(500, lambda: self.clients_count.configure(text_color=self.colors['accent']))
            self.last_client_count = count
            
            if connected_clients:
                self.clients_label.configure(text=f"{count} {t('devices_connected')}",
                                            text_color=self.colors['text'])
            else:
                self.clients_label.configure(text=t("waiting_connection"),
                                            text_color=self.colors['text_dim'])
            
            # Update Game Name
            game_name = server_stats.get("game", "")
            if game_name:
                self.game_card.pack(fill='x', pady=(0, 10), after=self.afterburner_card)
                self.game_name_label.configure(text=game_name)
            else:
                self.game_card.pack_forget()
                
            # Update Afterburner Warning
            afterburner_status = get_afterburner_status()
            if afterburner_status == 'not-found':
                self.afterburner_card.pack(fill='x', pady=(0, 10), after=self.main_frame.winfo_children()[2]) # After status card
            else:
                self.afterburner_card.pack_forget()
            
            self.window.after(1000, self._update_stats)
        except Exception as e:
            logger.error(f"Update error: {e}")
    
    def update_stats(self):
        self._update_stats()
    
    def hide(self):
        if self.window:
            self.window.withdraw()
            self.is_open = False
    
    def open_donation_modal(self):
        """Open donation modal with PayPal and PIX"""
        modal = ctk.CTkToplevel(self.window)
        modal.title(t("support_title"))
        modal.geometry("400x600")
        modal.resizable(False, False)
        modal.transient(self.window)
        modal.grab_set()
        
        # Center modal
        modal.update_idletasks()
        x = self.window.winfo_x() + (self.window.winfo_width() // 2) - (400 // 2)
        y = self.window.winfo_y() + (self.window.winfo_height() // 2) - (600 // 2)
        modal.geometry(f"+{x}+{y}")
        
        modal.configure(fg_color=self.colors['bg'])
        
        # Header
        ctk.CTkLabel(modal, text=t("support_header"), 
                     font=ctk.CTkFont(size=20, weight="bold"),
                     text_color=self.colors['text_bright']).pack(pady=(20, 5))
                     
        ctk.CTkLabel(modal, text=t("support_desc"), 
                     font=ctk.CTkFont(size=12),
                     text_color=self.colors['text_dim']).pack(pady=(0, 15))
        
        # Tabs
        tabview = ctk.CTkTabview(modal, width=360, height=450)
        tabview.pack(pady=(0, 20))
        
        tabview.add("PIX")
        tabview.add("PayPal")
        
        # ===== PIX TAB =====
        pix_frame = tabview.tab("PIX")
        
        pix_key = "00020126410014BR.GOV.BCB.PIX0119ad1000rso@gmail.com5204000053039865802BR5925Ademir Martin Gonzales Ju6009SAO PAULO62140510iNlqO1pmCE6304C7B3"
        
        # Generate PIX QR
        qr = qrcode.QRCode(box_size=5, border=2)
        qr.add_data(pix_key)
        qr.make(fit=True)
        qr_img = qr.make_image(fill_color="black", back_color="white")
        
        img_byte_arr = io.BytesIO()
        qr_img.save(img_byte_arr, format='PNG')
        ctk_img = ctk.CTkImage(light_image=Image.open(io.BytesIO(img_byte_arr.getvalue())),
                              dark_image=Image.open(io.BytesIO(img_byte_arr.getvalue())),
                              size=(200, 200))
                              
        ctk.CTkLabel(pix_frame, text="", image=ctk_img).pack(pady=20)
        
        def copy_pix():
            self.window.clipboard_clear()
            self.window.clipboard_append(pix_key)
            copy_btn.configure(text=t("copied"), fg_color=self.colors['green'])
            self.window.after(2000, lambda: copy_btn.configure(text=t("copy_pix"), fg_color=self.colors['card']))
            
        copy_btn = ctk.CTkButton(pix_frame, text=t("copy_pix"),
                                font=ctk.CTkFont(size=12, weight="bold"),
                                fg_color=self.colors['card'], hover_color=self.colors['accent_steam'],
                                height=40,
                                command=copy_pix)
        copy_btn.pack(fill='x', padx=20)
        
        ctk.CTkLabel(pix_frame, text="Ademir ***", 
                     font=ctk.CTkFont(size=10),
                     text_color=self.colors['text_dim']).pack(pady=(5, 0))

        # ===== PAYPAL TAB =====
        paypal_frame = tabview.tab("PayPal")
        
        paypal_url = "https://www.paypal.com/cgi-bin/webscr?cmd=_donations&business=frameforgeapp@gmail.com&currency_code=BRL&source=url"
        
        # Generate PayPal QR
        qr_pp = qrcode.QRCode(box_size=5, border=2)
        qr_pp.add_data(paypal_url)
        qr_pp.make(fit=True)
        qr_img_pp = qr_pp.make_image(fill_color="black", back_color="white")
        
        img_byte_arr_pp = io.BytesIO()
        qr_img_pp.save(img_byte_arr_pp, format='PNG')
        ctk_img_pp = ctk.CTkImage(light_image=Image.open(io.BytesIO(img_byte_arr_pp.getvalue())),
                                 dark_image=Image.open(io.BytesIO(img_byte_arr_pp.getvalue())),
                                 size=(200, 200))
        
        ctk.CTkLabel(paypal_frame, text="", image=ctk_img_pp).pack(pady=20)
        
        def open_paypal():
            webbrowser.open(paypal_url)
            
        ctk.CTkButton(paypal_frame, text=t("open_browser"),
                     font=ctk.CTkFont(size=12, weight="bold"),
                     fg_color="#0070BA", hover_color="#003087",
                     height=40,
                     command=open_paypal).pack(fill='x', padx=20)
                     
        ctk.CTkLabel(paypal_frame, text=t("scan_to_donate"), 
                     font=ctk.CTkFont(size=10),
                     text_color=self.colors['text_dim']).pack(pady=(5, 0))

        # ===== KO-FI TAB =====
        tabview.add("Ko-fi")
        kofi_frame = tabview.tab("Ko-fi")
        
        kofi_url = "https://ko-fi.com/frameforge"
        
        # Generate Ko-fi QR
        qr_kf = qrcode.QRCode(box_size=5, border=2)
        qr_kf.add_data(kofi_url)
        qr_kf.make(fit=True)
        qr_img_kf = qr_kf.make_image(fill_color="black", back_color="white")
        
        img_byte_arr_kf = io.BytesIO()
        qr_img_kf.save(img_byte_arr_kf, format='PNG')
        ctk_img_kf = ctk.CTkImage(light_image=Image.open(io.BytesIO(img_byte_arr_kf.getvalue())),
                                 dark_image=Image.open(io.BytesIO(img_byte_arr_kf.getvalue())),
                                 size=(200, 200))
        
        ctk.CTkLabel(kofi_frame, text="", image=ctk_img_kf).pack(pady=20)
        
        def open_kofi():
            webbrowser.open(kofi_url)
            
        ctk.CTkButton(kofi_frame, text="☕ Buy me a Coffee",
                     font=ctk.CTkFont(size=12, weight="bold"),
                     fg_color="#FF5E5B", hover_color="#D94140", # Ko-fi red color
                     height=40,
                     command=open_kofi).pack(fill='x', padx=20)
                     
        ctk.CTkLabel(kofi_frame, text=t("scan_to_donate"), 
                     font=ctk.CTkFont(size=10),
                     text_color=self.colors['text_dim']).pack(pady=(5, 0))

# ==================== MAIN ====================

def create_tray_icon():
    """Create system tray icon with FF in TRON style"""
    # Always generate TRON-style FF icon as requested
    try:
        from PIL import ImageDraw, ImageFont
        
        size = 64
        # TRON colors
        bg_color = (10, 15, 20)  # Dark background
        cyan = (0, 255, 255)     # TRON cyan
        
        # Create image
        img = Image.new('RGB', (size, size), bg_color)
        draw = ImageDraw.Draw(img)
        
        # Try to use a bold font
        try:
            font = ImageFont.truetype("arialbd.ttf", 32)
        except:
            try:
                font = ImageFont.truetype("arial.ttf", 32)
            except:
                font = ImageFont.load_default()
        
        # Draw FF text centered
        text = "FF"
        bbox = draw.textbbox((0, 0), text, font=font)
        text_width = bbox[2] - bbox[0]
        text_height = bbox[3] - bbox[1]
        x = (size - text_width) // 2
        y = (size - text_height) // 2 - 4
        
        # Draw glow effect (multiple layers)
        glow_color = (0, 180, 200)
        for offset in range(3, 0, -1):
            alpha = 100 - offset * 30
            draw.text((x-offset, y), text, font=font, fill=glow_color)
            draw.text((x+offset, y), text, font=font, fill=glow_color)
            draw.text((x, y-offset), text, font=font, fill=glow_color)
            draw.text((x, y+offset), text, font=font, fill=glow_color)
        
        # Draw main text
        draw.text((x, y), text, font=font, fill=cyan)
        
        return img
    except:
        # Ultimate fallback
        return Image.new('RGB', (64, 64), color=(0, 255, 255))

def open_browser(icon=None, item=None):
    ip = get_local_ip_sync()
    webbrowser.open(f"http://{ip}:8000")

def open_github(icon=None, item=None):
    webbrowser.open("https://github.com/frameforgeAPP/frameforge-server")

def toggle_auto_start_tray(icon, item):
    if is_auto_start_enabled():
        disable_auto_start()
    else:
        enable_auto_start()

def run_server_thread():
    try:
        logger.info("Starting Server Thread")
        HOST = os.environ.get("FPS_HOST", "0.0.0.0")
        PORT = int(os.environ.get("FPS_PORT", "8000"))
        
        # Completely disable uvicorn logging to avoid isatty() errors in frozen exe
        log_config = {
            "version": 1,
            "disable_existing_loggers": True,
            "handlers": {},
            "loggers": {},
        }
        
        config = uvicorn.Config(
            socket_app, 
            host=HOST, 
            port=PORT, 
            log_level="critical",
            access_log=False,
            log_config=log_config
        )
        server = uvicorn.Server(config)
        server.run()
    except Exception as e:
        logger.error(f"Server Thread Failed: {e}", exc_info=True)

def get_status_text():
    return "FrameForge Server: Online"

def run_tray(gui_ref):
    try:
        logger.info("Starting Tray Thread")
        icon_image = create_tray_icon()
        
        def show_gui_action():
            gui_ref.queue.put("show")
            
        def quit_action(icon):
            gui_ref.queue.put("quit")
            icon.stop()
        
        menu = pystray.Menu(
            item(lambda text: get_status_text(), None, enabled=False),
            item('─────────────', None, enabled=False),
            item('Abrir Painel', show_gui_action, default=True),
            item('Abrir no Navegador', open_browser),
            item('GitHub / Updates', open_github),
            item('─────────────', None, enabled=False),
            item('Iniciar com Windows', toggle_auto_start_tray, checked=lambda item: is_auto_start_enabled()),
            item('─────────────', None, enabled=False),
            item('Sair', quit_action)
        )
        
        icon = pystray.Icon(APP_NAME, icon_image, APP_NAME, menu)
        icon.run()
    except Exception as e:
        logger.error(f"Tray Thread Failed: {e}", exc_info=True)

if __name__ == "__main__":
    # Check if another instance is already running
    if not check_single_instance():
        show_already_running_message()
        sys.exit(0)
    
    try:
        logger.info("Application Starting")
        # 1. Start Server in Background Thread
        server_thread = threading.Thread(target=run_server_thread, daemon=True)
        server_thread.start()
        
        # 2. Initialize GUI (Main Thread)
        gui = ServerGUI()
        
        # 3. Start Tray in Background Thread
        tray_thread = threading.Thread(target=run_tray, args=(gui,), daemon=True)
        tray_thread.start()
        
        # 4. Show window if not minimized argument or config
        config = load_config()
        should_minimize = "--minimized" in sys.argv or config.get("start_minimized", False)
        
        if not should_minimize:
            gui.queue.put("show")
            
        # 5. Start Main Loop (Blocking)
        gui.start()
    except Exception as e:
        logger.critical(f"Main Loop Failed: {e}", exc_info=True)
        # Show error box if possible
        try:
            ctypes.windll.user32.MessageBoxW(0, f"Critical Error: {e}", "FrameForge Server Error", 0x10)
        except:
            pass
