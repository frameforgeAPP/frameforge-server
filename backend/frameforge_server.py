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
import tkinter as tk
from tkinter import ttk
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
from PIL import Image, ImageTk
import pystray
from pystray import MenuItem as item
import qrcode

# ==================== SUPPRESS CONSOLE WINDOWS ====================

if sys.platform == 'win32':
    import ctypes
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

if getattr(sys, 'frozen', False):
    if sys.stdout is None or not hasattr(sys.stdout, 'write'):
        sys.stdout = open(os.devnull, 'w')
    if sys.stderr is None or not hasattr(sys.stderr, 'write'):
        sys.stderr = open(os.devnull, 'w')

# Constants
APP_NAME = "FrameForge Server"
APP_VERSION = "2.2.0"
REGISTRY_KEY = r"Software\Microsoft\Windows\CurrentVersion\Run"
SERVER_URL = "https://github.com/frameforgeAPP/frameforge-server"
CREATE_NO_WINDOW = 0x08000000

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
        
        result = subprocess.run(
            ['nvidia-smi', '--query-gpu=index,name,utilization.gpu,memory.used,memory.total,temperature.gpu', 
             '--format=csv,noheader,nounits'],
            capture_output=True, text=True, startupinfo=startupinfo, creationflags=CREATE_NO_WINDOW
        )
        
        if result.returncode == 0 and result.stdout.strip():
            gpus = []
            for line in result.stdout.strip().split('\n'):
                parts = [p.strip() for p in line.split(',')]
                if len(parts) >= 6:
                    gpus.append({
                        "id": parts[0], "name": parts[1],
                        "load": float(parts[2]) if parts[2] else 0,
                        "memory_used": float(parts[3]) if parts[3] else 0,
                        "memory_total": float(parts[4]) if parts[4] else 0,
                        "temperature": float(parts[5]) if parts[5] else 0
                    })
            return gpus
    except Exception:
        pass
    return []

def get_gpu_stats():
    try:
        gpus = mahm_reader.read_gpu_stats()
        if gpus:
            return gpus
    except:
        pass
    try:
        gpus = lhm_reader.read_gpu_stats()
        if gpus:
            return gpus
    except:
        pass
    return get_gpu_stats_nvidia_smi()

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
    qr_img = qr.make_image(fill_color=COLORS['cyan'], back_color=COLORS['bg_dark'])
    qr_img = qr_img.resize((size, size))
    return qr_img

class ServerGUI:
    def __init__(self):
        self.window = None
        self.is_open = False
        self.stat_labels = {}
        self.server_running = True
        self.clients_listbox = None
        
    def show(self):
        if self.is_open and self.window:
            try:
                self.window.deiconify()
                self.window.lift()
                self.window.focus_force()
                return
            except:
                pass
        
        # Create main window - Tron Style
        self.window = tk.Tk()
        self.window.title("FrameForge Server")
        self.window.geometry("380x720")
        self.window.configure(bg=COLORS['bg_dark'])
        self.window.resizable(False, False)
        
        # Center window
        self.window.update_idletasks()
        x = (self.window.winfo_screenwidth() // 2) - 190
        y = (self.window.winfo_screenheight() // 2) - 360
        self.window.geometry(f"+{x}+{y}")
        
        self.is_open = True
        self.window.protocol("WM_DELETE_WINDOW", self.hide)
        
        # Main container
        main = tk.Frame(self.window, bg=COLORS['bg_dark'])
        main.pack(fill='both', expand=True, padx=20, pady=15)
        
        # ===== HEADER - FF LOGO =====
        header_frame = tk.Frame(main, bg=COLORS['bg_dark'])
        header_frame.pack(pady=(0, 5))
        
        tk.Label(header_frame, text="FF", font=('Impact', 48, 'bold'),
                fg=COLORS['cyan'], bg=COLORS['bg_dark']).pack()
        
        tk.Label(header_frame, text="FrameForge", font=('Segoe UI', 16, 'bold'),
                fg=COLORS['text'], bg=COLORS['bg_dark']).pack()
        
        tk.Label(header_frame, text="FPS MONITOR SERVER", font=('Segoe UI', 9),
                fg=COLORS['text_dim'], bg=COLORS['bg_dark']).pack()
        
        # ===== STATUS BAR =====
        status_frame = tk.Frame(main, bg=COLORS['bg_card'], pady=10, padx=15)
        status_frame.pack(fill='x', pady=10)
        
        status_inner = tk.Frame(status_frame, bg=COLORS['bg_card'])
        status_inner.pack()
        
        # Glowing status dot
        self.status_dot = tk.Label(status_inner, text="●", font=('Segoe UI', 16),
                             fg=COLORS['cyan'], bg=COLORS['bg_card'])
        self.status_dot.pack(side='left')
        
        self.status_text = tk.Label(status_inner, text="ONLINE", font=('Segoe UI', 12, 'bold'),
                                   fg=COLORS['cyan'], bg=COLORS['bg_card'])
        self.status_text.pack(side='left', padx=10)
        
        # ===== IP ADDRESS =====
        ip = get_local_ip_sync()
        
        ip_frame = tk.Frame(main, bg=COLORS['bg_dark'])
        ip_frame.pack(pady=8)
        tk.Label(ip_frame, text=ip, font=('Consolas', 18, 'bold'),
                fg=COLORS['cyan'], bg=COLORS['bg_dark']).pack(side='left')
        tk.Label(ip_frame, text=":8000", font=('Consolas', 14),
                fg=COLORS['cyan_dim'], bg=COLORS['bg_dark']).pack(side='left')
        
        # ===== GAME & FPS DISPLAY =====
        game_fps_frame = tk.Frame(main, bg=COLORS['bg_card'], pady=12)
        game_fps_frame.pack(fill='x', pady=8)
        
        # Game name section
        game_section = tk.Frame(game_fps_frame, bg=COLORS['bg_card'])
        game_section.pack(side='left', expand=True, fill='x', padx=15)
        tk.Label(game_section, text="🎮 GAME", font=('Segoe UI', 8),
                fg=COLORS['text_dim'], bg=COLORS['bg_card']).pack()
        self.game_label = tk.Label(game_section, text="Idle", font=('Segoe UI', 13, 'bold'),
                                   fg=COLORS['text_dim'], bg=COLORS['bg_card'])
        self.game_label.pack()
        
        # Separator
        tk.Label(game_fps_frame, text="│", font=('Segoe UI', 24),
                fg=COLORS['border'], bg=COLORS['bg_card']).pack(side='left')
        
        # FPS section
        fps_section = tk.Frame(game_fps_frame, bg=COLORS['bg_card'])
        fps_section.pack(side='left', expand=True, fill='x', padx=15)
        tk.Label(fps_section, text="📊 FPS", font=('Segoe UI', 8),
                fg=COLORS['text_dim'], bg=COLORS['bg_card']).pack()
        self.fps_label = tk.Label(fps_section, text="0", font=('Impact', 28),
                                  fg=COLORS['green'], bg=COLORS['bg_card'])
        self.fps_label.pack()
        
        # ===== STATS CARDS =====
        stats_frame = tk.Frame(main, bg=COLORS['bg_dark'])
        stats_frame.pack(fill='x', pady=8)
        
        # CPU Card
        cpu_card = tk.Frame(stats_frame, bg=COLORS['bg_card'], padx=15, pady=10)
        cpu_card.pack(side='left', expand=True, fill='both', padx=3)
        tk.Label(cpu_card, text="CPU", font=('Segoe UI', 9, 'bold'),
                fg=COLORS['text_dim'], bg=COLORS['bg_card']).pack()
        self.cpu_label = tk.Label(cpu_card, text="--%", font=('Segoe UI', 16, 'bold'),
                                  fg=COLORS['cyan'], bg=COLORS['bg_card'])
        self.cpu_label.pack()
        
        # GPU Card
        gpu_card = tk.Frame(stats_frame, bg=COLORS['bg_card'], padx=15, pady=10)
        gpu_card.pack(side='left', expand=True, fill='both', padx=3)
        tk.Label(gpu_card, text="GPU", font=('Segoe UI', 9, 'bold'),
                fg=COLORS['text_dim'], bg=COLORS['bg_card']).pack()
        self.gpu_label = tk.Label(gpu_card, text="--%", font=('Segoe UI', 16, 'bold'),
                                  fg=COLORS['cyan'], bg=COLORS['bg_card'])
        self.gpu_label.pack()
        
        # RAM Card
        ram_card = tk.Frame(stats_frame, bg=COLORS['bg_card'], padx=15, pady=10)
        ram_card.pack(side='left', expand=True, fill='both', padx=3)
        tk.Label(ram_card, text="RAM", font=('Segoe UI', 9, 'bold'),
                fg=COLORS['text_dim'], bg=COLORS['bg_card']).pack()
        self.ram_label = tk.Label(ram_card, text="--%", font=('Segoe UI', 16, 'bold'),
                                  fg=COLORS['cyan'], bg=COLORS['bg_card'])
        self.ram_label.pack()
        
        # ===== CONNECTED CLIENTS =====
        clients_frame = tk.Frame(main, bg=COLORS['bg_card'], pady=10)
        clients_frame.pack(fill='x', pady=8)
        
        clients_header = tk.Frame(clients_frame, bg=COLORS['bg_card'])
        clients_header.pack(fill='x', padx=12)
        
        tk.Label(clients_header, text="📱 CONNECTED DEVICES", font=('Segoe UI', 10, 'bold'),
                fg=COLORS['cyan'], bg=COLORS['bg_card']).pack(side='left')
        
        self.clients_count = tk.Label(clients_header, text="0", font=('Segoe UI', 14, 'bold'),
                                      fg=COLORS['green'], bg=COLORS['bg_card'])
        self.clients_count.pack(side='right')
        
        # Client list
        list_frame = tk.Frame(clients_frame, bg=COLORS['bg_dark'], padx=12)
        list_frame.pack(fill='x', pady=5)
        
        self.clients_listbox = tk.Listbox(list_frame, height=2, bg=COLORS['bg_dark'], fg=COLORS['text_dim'],
                                          font=('Consolas', 9), relief='flat', 
                                          highlightthickness=0, selectbackground=COLORS['bg_card'])
        self.clients_listbox.pack(fill='x')
        self.clients_listbox.insert(tk.END, "  Waiting for connections...")
        
        # ===== QR CODE =====
        qr_frame = tk.Frame(main, bg=COLORS['bg_dark'])
        qr_frame.pack(pady=10)
        
        try:
            qr_img = generate_qr_code(f"http://{ip}:8000", 110)
            self.qr_photo = ImageTk.PhotoImage(qr_img)
            qr_label = tk.Label(qr_frame, image=self.qr_photo, bg=COLORS['bg_dark'])
            qr_label.pack()
        except Exception as e:
            tk.Label(qr_frame, text="[QR Code]", font=('Segoe UI', 10),
                    fg=COLORS['text_dim'], bg=COLORS['bg_dark']).pack()
        
        tk.Label(main, text="SCAN TO CONNECT", font=('Segoe UI', 9, 'bold'),
                fg=COLORS['cyan'], bg=COLORS['bg_dark']).pack()
        
        # ===== CHECKBOXES =====
        check_frame = tk.Frame(main, bg=COLORS['bg_dark'])
        check_frame.pack(fill='x', pady=8)
        
        self.auto_start_var = tk.BooleanVar(value=is_auto_start_enabled())
        auto_check = tk.Checkbutton(check_frame, text="  Start with Windows",
                                    variable=self.auto_start_var, font=('Segoe UI', 10),
                                    fg=COLORS['text_dim'], bg=COLORS['bg_dark'], selectcolor=COLORS['bg_card'],
                                    activebackground=COLORS['bg_dark'], activeforeground=COLORS['cyan'],
                                    cursor='hand2', command=self.toggle_auto_start)
        auto_check.pack(anchor='center')
        
        # ===== STOP SERVER BUTTON =====
        stop_btn = tk.Button(main, text="⏹  STOP SERVER", font=('Segoe UI', 12, 'bold'),
                            fg=COLORS['text'], bg=COLORS['red'], relief='flat', pady=12,
                            cursor='hand2', activebackground='#dc2626', activeforeground='white',
                            command=self.stop_server)
        stop_btn.pack(fill='x', pady=10)
        stop_btn.configure(borderwidth=0, highlightthickness=0)
        
        # ===== VERSION =====
        tk.Label(main, text=f"v{APP_VERSION}", font=('Segoe UI', 8),
                fg=COLORS['text_dim'], bg=COLORS['bg_dark']).pack()
        
        # Start update loop
        self.update_stats()
        
        self.window.mainloop()
    
    def stop_server(self):
        """Stop the server and close"""
        global monitoring_active
        monitoring_active = False
        self.hide()
        os._exit(0)
    
    def toggle_auto_start(self):
        if self.auto_start_var.get():
            enable_auto_start()
        else:
            disable_auto_start()
    
    def update_stats(self):
        if self.is_open and self.window:
            try:
                # Update CPU/GPU/RAM
                cpu = psutil.cpu_percent(interval=None)
                ram = psutil.virtual_memory().percent
                
                self.cpu_label.config(text=f"{int(cpu)}%")
                self.ram_label.config(text=f"{int(ram)}%")
                
                gpu_temp = server_stats.get('gpu_temp', 0)
                self.gpu_label.config(text=f"{int(gpu_temp)}°C" if gpu_temp else "--%")
                
                # Update FPS
                fps = server_stats.get('fps', 0)
                self.fps_label.config(text=str(fps))
                
                # Color FPS based on value
                if fps >= 60:
                    self.fps_label.config(fg=COLORS['green'])
                elif fps >= 30:
                    self.fps_label.config(fg=COLORS['yellow'])
                else:
                    self.fps_label.config(fg=COLORS['red'])
                
                # Update Game name
                game = server_stats.get('game', '')
                if game:
                    display_name = game[:18] + "..." if len(game) > 18 else game
                    self.game_label.config(text=display_name, fg=COLORS['green'])
                else:
                    self.game_label.config(text="Idle", fg=COLORS['text_dim'])
                
                # Update connected clients
                client_count = len(connected_clients)
                self.clients_count.config(text=str(client_count))
                
                # Update client list
                self.clients_listbox.delete(0, tk.END)
                if connected_clients:
                    for sid in list(connected_clients)[:3]:
                        self.clients_listbox.insert(tk.END, f"  📱 {sid[:20]}...")
                else:
                    self.clients_listbox.insert(tk.END, "  Waiting for connections...")
                
                self.window.after(1000, self.update_stats)
            except:
                pass
    
    def hide(self):
        if self.window:
            self.window.withdraw()
            self.is_open = False

gui = ServerGUI()

def show_gui(icon=None, item=None):
    threading.Thread(target=gui.show, daemon=True).start()

# ==================== SYSTEM TRAY ====================

def create_tray_icon():
    """Create clean, readable tray icon"""
    icon_size = 64
    image = Image.new('RGBA', (icon_size, icon_size), color=(0, 0, 0, 255))
    from PIL import ImageDraw, ImageFont
    draw = ImageDraw.Draw(image)
    
    # Draw a subtle cyan border/glow
    for i in range(3):
        alpha = 80 - i * 25
        draw.rounded_rectangle(
            [i, i, icon_size-1-i, icon_size-1-i], 
            radius=8, 
            outline=(0, 243, 255, alpha),
            width=1
        )
    
    # Draw FF text - simple and readable
    try:
        font = ImageFont.truetype("arial.ttf", 28)
    except:
        try:
            font = ImageFont.truetype("arialbd.ttf", 28)
        except:
            font = ImageFont.load_default()
    
    # Center the text
    text = "FF"
    bbox = draw.textbbox((0, 0), text, font=font)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]
    x = (icon_size - text_width) // 2
    y = (icon_size - text_height) // 2 - 2
    
    # Solid cyan text - clean and readable
    draw.text((x, y), text, fill=(0, 243, 255, 255), font=font)
    
    return image

def open_browser(icon=None, item=None):
    ip = get_local_ip_sync()
    webbrowser.open(f"http://{ip}:8000")

def open_github(icon=None, item=None):
    webbrowser.open(SERVER_URL)

def toggle_auto_start(icon, item):
    if is_auto_start_enabled():
        disable_auto_start()
    else:
        enable_auto_start()

def quit_app(icon, item):
    global monitoring_active
    monitoring_active = False
    icon.stop()
    os._exit(0)

def get_status_text():
    ip = get_local_ip_sync()
    clients = server_stats["clients"]
    fps = server_stats["fps"]
    return f"IP: {ip}:8000 | Clients: {clients} | FPS: {fps}"

def run_tray():
    icon_image = create_tray_icon()
    
    menu = pystray.Menu(
        item(lambda text: get_status_text(), None, enabled=False),
        item('─────────────', None, enabled=False),
        item('Abrir Painel', show_gui, default=True),
        item('Abrir no Navegador', open_browser),
        item('GitHub / Updates', open_github),
        item('─────────────', None, enabled=False),
        item('Iniciar com Windows', toggle_auto_start, checked=lambda item: is_auto_start_enabled()),
        item('─────────────', None, enabled=False),
        item('Sair', quit_app)
    )
    
    icon = pystray.Icon(APP_NAME, icon_image, APP_NAME, menu)
    icon.run()

# ==================== MAIN ====================

def run_server():
    HOST = os.environ.get("FPS_HOST", "0.0.0.0")
    PORT = int(os.environ.get("FPS_PORT", "8000"))
    
    tray_thread = threading.Thread(target=run_tray, daemon=True)
    tray_thread.start()
    
    config = uvicorn.Config(socket_app, host=HOST, port=PORT, log_level="error", access_log=False)
    server = uvicorn.Server(config)
    server.run()

if __name__ == "__main__":
    run_server()
