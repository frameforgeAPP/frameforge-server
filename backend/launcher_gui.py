import customtkinter as ctk
import subprocess
import sys
import os
import socket
import threading
import pystray
from PIL import Image, ImageDraw
from tkinter import messagebox
import winreg
import signal
import time
import hashlib
import win32event
import win32api
import winerror
from tkinter import messagebox
import monitor_server
import json
import qrcode
from PIL import ImageTk
import socketio

# Configuration
APP_NAME = "FPS Monitor PC"
DEFAULT_PORT = 8000
CONFIG_FILE = "launcher_config.txt"

class ServerLauncher(ctk.CTk):
    def __init__(self):
        # Single Instance Check
        self.mutex = win32event.CreateMutex(None, False, "Global\\FPSMonitorLauncher")
        if win32api.GetLastError() == winerror.ERROR_ALREADY_EXISTS:
            messagebox.showwarning("FPS Monitor", "The application is already running.")
            sys.exit(0)

        super().__init__()

        self.title(APP_NAME)
        self.geometry("400x700") # Increased height
        self.resizable(False, False)
        
        # Set theme
        ctk.set_appearance_mode("Dark")
        ctk.set_default_color_theme("dark-blue") # Base theme
        
        # Custom Colors
        self.colors = {
            "bg": "#0a0a0a",
            "panel": "#111827",
            "primary": "#3b82f6", # Blue
            "danger": "#ef4444",  # Red
            "text": "#ffffff",
            "text_dim": "#6b7280", # Darker gray for dim text
            "border": "#1f2937"
        }
        
        self.configure(fg_color=self.colors["bg"])

        self.server_process = None
        self.is_running = False
        
        # Load Config
        self.config = self.load_config()

        self.create_widgets()
        self.protocol("WM_DELETE_WINDOW", self.on_closing)
        
        # System Tray Setup
        self.tray_icon = None
        self.setup_tray()

        # Auto-start server
        self.after(1000, self.start_server)

        # Check if started with --minimized argument (from Registry)
        if "--minimized" in sys.argv:
            self.withdraw()
            # Ensure tray icon is created immediately
            if not self.tray_icon:
                self.setup_tray()
        # Check config for "start minimized" preference (legacy/manual start)
        elif self.config.get("start_minimized", False):
            self.after(500, self.minimize_to_tray)

        # Socket.IO Client
        self.sio = socketio.Client()
        self.setup_socket_events()

    def setup_socket_events(self):
        @self.sio.event
        def connect():
            print("GUI Connected to Server")

        @self.sio.event
        def disconnect():
            print("GUI Disconnected from Server")

        @self.sio.event
        def hardware_update(data):
            self.update_stats(data)

    def create_widgets(self):
        # Main Container
        self.main_frame = ctk.CTkFrame(self, fg_color="transparent")
        self.main_frame.pack(fill="both", expand=True, padx=20, pady=20)

        # Title / Header
        self.label_title = ctk.CTkLabel(
            self.main_frame, 
            text="FPS MONITOR PC", 
            font=("Arial Black", 24), # Smaller title
            text_color=self.colors["text"]
        )
        self.label_title.pack(pady=(0, 2))
        
        self.label_subtitle = ctk.CTkLabel(
            self.main_frame, 
            text="SERVER CONTROL", 
            font=("Arial", 10, "bold"), # Smaller subtitle
            text_color=self.colors["primary"]
        )
        self.label_subtitle.pack(pady=(0, 20))

        # Status Panel
        self.status_frame = ctk.CTkFrame(self.main_frame, fg_color=self.colors["panel"], border_width=1, border_color=self.colors["border"], corner_radius=10)
        self.status_frame.pack(fill="x", pady=(0, 15), ipady=5)
        
        self.status_indicator = ctk.CTkLabel(self.status_frame, text="●", font=("Arial", 18), text_color=self.colors["danger"])
        self.status_indicator.pack(side="left", padx=(15, 8))
        
        self.status_label = ctk.CTkLabel(self.status_frame, text="STOPPED", font=("Arial", 12, "bold"), text_color=self.colors["text_dim"])
        self.status_label.pack(side="left")

        # Network Info
        self.info_frame = ctk.CTkFrame(self.main_frame, fg_color="transparent")
        self.info_frame.pack(fill="x", pady=(0, 15))
        
        # Minimalist IP/Port
        self.ip_label = ctk.CTkLabel(self.info_frame, text=f"{self.get_local_ip()}", font=("Consolas", 12), text_color=self.colors["text_dim"])
        self.ip_label.pack()
        
        self.port_label = ctk.CTkLabel(self.info_frame, text=f":{DEFAULT_PORT}", font=("Consolas", 12), text_color=self.colors["text_dim"])
        self.port_label.pack()

        # Monitoring Stats (Hidden by default, shown when running)
        self.stats_frame = ctk.CTkFrame(self.main_frame, fg_color="transparent") # Transparent bg for minimalism
        # self.stats_frame.pack(fill="x", pady=(0, 20)) # Packed in toggle_server

        # Stats Grid (Horizontal)
        self.stats_grid = ctk.CTkFrame(self.stats_frame, fg_color="transparent")
        self.stats_grid.pack(fill="x", expand=True)
        
        # CPU
        self.cpu_frame = ctk.CTkFrame(self.stats_grid, fg_color=self.colors["panel"], corner_radius=8)
        self.cpu_frame.pack(side="left", fill="x", expand=True, padx=2)
        ctk.CTkLabel(self.cpu_frame, text="CPU", font=("Arial", 8, "bold"), text_color=self.colors["text_dim"]).pack(pady=(2,0))
        self.cpu_label = ctk.CTkLabel(self.cpu_frame, text="--%", font=("Consolas", 12, "bold"), text_color=self.colors["text"])
        self.cpu_label.pack(pady=(0,2))

        # GPU
        self.gpu_frame = ctk.CTkFrame(self.stats_grid, fg_color=self.colors["panel"], corner_radius=8)
        self.gpu_frame.pack(side="left", fill="x", expand=True, padx=2)
        ctk.CTkLabel(self.gpu_frame, text="GPU", font=("Arial", 8, "bold"), text_color=self.colors["text_dim"]).pack(pady=(2,0))
        self.gpu_label = ctk.CTkLabel(self.gpu_frame, text="--%", font=("Consolas", 12, "bold"), text_color=self.colors["text"])
        self.gpu_label.pack(pady=(0,2))

        # RAM
        self.ram_frame = ctk.CTkFrame(self.stats_grid, fg_color=self.colors["panel"], corner_radius=8)
        self.ram_frame.pack(side="left", fill="x", expand=True, padx=2)
        ctk.CTkLabel(self.ram_frame, text="RAM", font=("Arial", 8, "bold"), text_color=self.colors["text_dim"]).pack(pady=(2,0))
        self.ram_label = ctk.CTkLabel(self.ram_frame, text="--%", font=("Consolas", 12, "bold"), text_color=self.colors["text"])
        self.ram_label.pack(pady=(0,2))

        # Start/Stop Button
        self.action_button = ctk.CTkButton(
            self.main_frame, 
            text="START SERVER", 
            command=self.toggle_server, 
            height=50, 
            font=("Arial", 16, "bold"),
            fg_color=self.colors["primary"],
            hover_color="#2563eb",
            corner_radius=25
        )
        self.action_button.pack(fill="x", pady=(0, 20))

        # Options
        self.options_frame = ctk.CTkFrame(self.main_frame, fg_color="transparent")
        self.options_frame.pack(pady=(0, 20))

        self.autostart_var = ctk.BooleanVar(value=self.check_autostart())
        self.autostart_checkbox = ctk.CTkCheckBox(
            self.options_frame, 
            text="Start with Windows", 
            variable=self.autostart_var, 
            command=self.toggle_autostart,
            fg_color=self.colors["primary"],
            hover_color=self.colors["primary"],
            text_color=self.colors["text_dim"],
            font=("Arial", 12)
        )
        self.autostart_checkbox.pack(anchor="w", pady=5)

        self.minimized_var = ctk.BooleanVar(value=self.config.get("start_minimized", False))
        self.minimized_checkbox = ctk.CTkCheckBox(
            self.options_frame, 
            text="Start Minimized", 
            variable=self.minimized_var, 
            command=self.toggle_minimized,
            fg_color=self.colors["primary"],
            hover_color=self.colors["primary"],
            text_color=self.colors["text_dim"],
            font=("Arial", 12)
        )
        self.minimized_checkbox.pack(anchor="w", pady=5)

        # QR Code Container (Hidden by default)
        self.qr_frame = ctk.CTkFrame(self.main_frame, fg_color="transparent")
        self.qr_frame.pack(pady=10, expand=True)
        
        self.qr_label = ctk.CTkLabel(self.qr_frame, text="")
        self.qr_label.pack()
        
        self.scan_label = ctk.CTkLabel(self.qr_frame, text="SCAN TO CONNECT", font=("Arial", 10, "bold"), text_color=self.colors["text_dim"])
        # Only pack scan label when QR is shown

        # Footer
        ctk.CTkLabel(self, text="v1.0.0 • FPS Monitor", text_color="#4b5563", font=("Arial", 10)).pack(side="bottom", pady=10)

    def get_local_ip(self):
        try:
            s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
            s.connect(("8.8.8.8", 80))
            ip = s.getsockname()[0]
            s.close()
            return ip
        except:
            return "127.0.0.1"

    def show_qr_code(self):
        try:
            ip = self.get_local_ip()
            port = DEFAULT_PORT
            url = f"http://{ip}:{port}"
            
            # Generate QR
            qr = qrcode.QRCode(box_size=4, border=2)
            qr.add_data(url)
            qr.make(fit=True)
            img = qr.make_image(fill_color="black", back_color="white")
            
            # Convert to RGB (Crucial for CTkImage compatibility)
            img = img.convert("RGB")
            
            # Convert to CTkImage - Reduced size to prevent cropping
            ctk_img = ctk.CTkImage(light_image=img, dark_image=img, size=(140, 140))
            
            self.qr_label.configure(image=ctk_img)
            self.qr_label.image = ctk_img # Keep reference
        except Exception as e:
            messagebox.showerror("QR Error", f"Failed to generate QR: {e}")

    def toggle_server(self):
        if self.is_running:
            self.stop_server()
        else:
            self.start_server()

    def start_server(self):
        self.status_label.configure(text="Starting...", text_color="green")

        # Set Environment Variables
        env = os.environ.copy()
        env["FPS_PORT"] = str(DEFAULT_PORT)
        
        # Start Process
        if getattr(sys, 'frozen', False):
            # Running as EXE: Call self with --server argument
            cmd = [sys.executable, "--server"]
        else:
            # Running as script: Call python monitor_server.py
            cmd = [sys.executable, "monitor_server.py"]
        
        # Use CREATE_NO_WINDOW flag for cleaner background execution
        creationflags = subprocess.CREATE_NO_WINDOW if os.name == 'nt' else 0
        
        try:
            self.server_process = subprocess.Popen(
                cmd, 
                env=env, 
                creationflags=creationflags,
                cwd=os.path.dirname(os.path.abspath(__file__))
            )
            
            self.is_running = True
            self.status_indicator.configure(text_color=self.colors["primary"]) # Green/Blue
            self.status_label.configure(text="RUNNING", text_color=self.colors["text"])
            self.action_button.configure(text="STOP SERVER", fg_color=self.colors["danger"], hover_color="#dc2626")
            
            # Show QR Code
            self.show_qr_code()
            self.scan_label.pack(pady=(5,0))
            
            # Show Stats
            self.stats_frame.pack(fill="x", pady=(0, 20), after=self.info_frame)

            # Connect Socket (Delayed to ensure server is up)
            self.after(2000, self.connect_socket)
            
        except Exception as e:
            self.status_label.configure(text=f"Error: {str(e)}", text_color="red")

    def connect_socket(self):
        if not self.sio.connected:
            try:
                self.sio.connect(f'http://localhost:{DEFAULT_PORT}')
            except Exception as e:
                print(f"Socket connection failed: {e}")
                # Retry after 2 seconds
                self.after(2000, self.connect_socket)

    def update_stats(self, data):
        # Update UI in main thread
        try:
            # CPU
            cpu_load = data['cpu']['load']
            cpu_temp = data['cpu']['temp']
            self.cpu_label.configure(text=f"{cpu_load}%")
            
            # GPU
            if data['gpus']:
                gpu = data['gpus'][0]
                self.gpu_label.configure(text=f"{gpu['load']:.0f}%")
            
            # RAM
            ram_percent = data['ram']['percent']
            self.ram_label.configure(text=f"{ram_percent}%")
            
            # Client Count
            client_count = data.get('client_count', 0)
            # Subtract 1 because the GUI itself is a client
            real_clients = max(0, client_count - 1)
            
            if real_clients > 0:
                self.status_label.configure(text=f"RUNNING • {real_clients} Device(s)")
            else:
                self.status_label.configure(text="RUNNING • Waiting...")
                
        except Exception as e:
            print(f"Error updating UI: {e}")

    def stop_server(self):
        if self.server_process:
            self.server_process.terminate()
            self.server_process = None
        
        self.is_running = False
        self.status_indicator.configure(text_color=self.colors["danger"])
        self.status_label.configure(text="STOPPED", text_color=self.colors["text_dim"])
        self.action_button.configure(text="START SERVER", fg_color=self.colors["primary"], hover_color="#2563eb")
        
        # Hide QR Code
        self.qr_label.configure(image=None)
        self.qr_label.image = None
        self.scan_label.pack_forget()
        
        # Hide Stats
        self.stats_frame.pack_forget()
        
        # Disconnect Socket
        if self.sio.connected:
            self.sio.disconnect()

    def load_config(self):
        default_config = {"start_minimized": False}
        if os.path.exists(CONFIG_FILE):
            try:
                with open(CONFIG_FILE, "r") as f:
                    content = f.read().strip()
                    if not content:
                        return default_config
                    # Try to parse as JSON
                    return json.loads(content)
            except json.JSONDecodeError:
                # If fails, it might be the old format (just PIN hash)
                # We can discard it or migrate it, but since we removed PIN, we just reset.
                return default_config
            except Exception:
                return default_config
        return default_config

    def save_config(self):
        config = {
            "start_minimized": self.minimized_var.get()
        }
        try:
            with open(CONFIG_FILE, "w") as f:
                json.dump(config, f)
        except Exception as e:
            print(f"Error saving config: {e}")

    def toggle_minimized(self):
        self.save_config()

    def check_autostart(self):
        try:
            key = winreg.OpenKey(winreg.HKEY_CURRENT_USER, r"Software\Microsoft\Windows\CurrentVersion\Run", 0, winreg.KEY_READ)
            winreg.QueryValueEx(key, APP_NAME)
            key.Close()
            return True
        except WindowsError:
            return False

    def toggle_autostart(self):
        key_path = r"Software\Microsoft\Windows\CurrentVersion\Run"
        exe_path = sys.executable  # In dev, this is python.exe. In build, it will be the exe path.
        
        # If running as script, we need to point to the script
        if not getattr(sys, 'frozen', False):
            script_path = os.path.abspath(__file__)
            # Use pythonw.exe to run without console if possible, or just python
            cmd = f'"{exe_path}" "{script_path}" --minimized'
        else:
            cmd = f'"{exe_path}" --minimized'

        try:
            key = winreg.OpenKey(winreg.HKEY_CURRENT_USER, key_path, 0, winreg.KEY_ALL_ACCESS)
            if self.autostart_var.get():
                winreg.SetValueEx(key, APP_NAME, 0, winreg.REG_SZ, cmd)
            else:
                try:
                    winreg.DeleteValue(key, APP_NAME)
                except WindowsError:
                    pass
            key.Close()
        except Exception as e:
            print(f"Registry Error: {e}")

    # System Tray Logic
    def setup_tray(self):
        image = self.create_tray_icon()
        menu = pystray.Menu(
            pystray.MenuItem("Show", self.show_window),
            pystray.MenuItem("Exit", self.quit_app)
        )
        self.tray_icon = pystray.Icon("FPS Monitor", image, "FPS Monitor Server", menu)
        
        # Run tray in separate thread
        threading.Thread(target=self.tray_icon.run, daemon=True).start()

    def create_tray_icon(self):
        # Load icon.png or icon.ico if available, else fallback
        for icon_name in ["icon.png", "icon.ico"]:
            icon_path = icon_name
            if getattr(sys, 'frozen', False):
                 icon_path = os.path.join(sys._MEIPASS, icon_name) if hasattr(sys, '_MEIPASS') else icon_name
            
            if os.path.exists(icon_path):
                return Image.open(icon_path)

        # Create a simple icon fallback
        width = 64
        height = 64
        image = Image.new('RGB', (width, height), color=(59, 142, 208))
        dc = ImageDraw.Draw(image)
        dc.rectangle((16, 16, 48, 48), fill='white')
        return image

    def show_window(self, icon=None, item=None):
        self.deiconify()
        self.lift()
        self.focus_force()

    def minimize_to_tray(self):
        self.withdraw()

    def on_closing(self):
        self.withdraw()  # Hide window instead of closing
        
    def quit_app(self, icon=None, item=None):
        self.stop_server()
        if self.tray_icon:
            self.tray_icon.stop()
        self.quit()
        sys.exit()

if __name__ == "__main__":
    # Check for server mode argument
    if len(sys.argv) > 1 and sys.argv[1] == "--server":
        monitor_server.run_server()
        sys.exit(0)

    app = ServerLauncher()
    app.mainloop()
