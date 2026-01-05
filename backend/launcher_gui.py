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

# Configuration
APP_NAME = "FPS Monitor Server"
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
        self.geometry("400x550")
        self.resizable(False, False)
        
        # Set theme
        ctk.set_appearance_mode("Dark")
        ctk.set_default_color_theme("blue")

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

    def create_widgets(self):
        # Title
        self.label_title = ctk.CTkLabel(self, text="FPS Monitor Server", font=("Roboto", 24, "bold"))
        self.label_title.pack(pady=20)

        # Status Indicator
        self.status_frame = ctk.CTkFrame(self, fg_color="transparent")
        self.status_frame.pack(pady=10)
        
        self.status_indicator = ctk.CTkLabel(self.status_frame, text="●", font=("Arial", 24), text_color="red")
        self.status_indicator.pack(side="left", padx=5)
        
        self.status_label = ctk.CTkLabel(self.status_frame, text="Stopped", font=("Roboto", 16))
        self.status_label.pack(side="left")

        # IP Address
        self.ip_label = ctk.CTkLabel(self, text=f"IP Address: {self.get_local_ip()}", font=("Roboto", 14))
        self.ip_label.pack(pady=5)
        
        self.port_label = ctk.CTkLabel(self, text=f"Port: {DEFAULT_PORT}", font=("Roboto", 14))
        self.port_label.pack(pady=5)

        # Start/Stop Button
        self.action_button = ctk.CTkButton(self, text="Start Server", command=self.toggle_server, height=40, font=("Roboto", 16, "bold"))
        self.action_button.pack(pady=20, padx=40, fill="x")

        # Start with Windows
        self.autostart_var = ctk.BooleanVar(value=self.check_autostart())
        self.autostart_checkbox = ctk.CTkCheckBox(self, text="Start with Windows", variable=self.autostart_var, command=self.toggle_autostart)
        self.autostart_checkbox.pack(pady=5)

        # Start Minimized
        self.minimized_var = ctk.BooleanVar(value=self.config.get("start_minimized", True))
        self.minimized_checkbox = ctk.CTkCheckBox(self, text="Start Minimized", variable=self.minimized_var, command=self.toggle_minimized)
        self.minimized_checkbox.pack(pady=5)

        # Minimize to Tray Info
        ctk.CTkLabel(self, text="Close window to minimize to tray", text_color="gray", font=("Roboto", 10)).pack(side="bottom", pady=10)

    def get_local_ip(self):
        try:
            s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
            s.connect(("8.8.8.8", 80))
            ip = s.getsockname()[0]
            s.close()
            return ip
        except:
            return "127.0.0.1"

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
            self.status_indicator.configure(text_color="green")
            self.status_label.configure(text="Running")
            self.action_button.configure(text="Stop Server", fg_color="red", hover_color="darkred")
            
        except Exception as e:
            self.status_label.configure(text=f"Error: {str(e)}", text_color="red")

    def stop_server(self):
        if self.server_process:
            self.server_process.terminate()
            self.server_process = None
        
        self.is_running = False
        self.status_indicator.configure(text_color="red")
        self.status_label.configure(text="Stopped")
        self.action_button.configure(text="Start Server", fg_color=["#3B8ED0", "#1F6AA5"], hover_color=["#36719F", "#144870"])

    def load_config(self):
        default_config = {"start_minimized": True}
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
        # Create a simple icon
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
