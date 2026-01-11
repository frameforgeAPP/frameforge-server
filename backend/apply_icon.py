from PIL import Image
import os

source_path = r"C:/Users/Administrador/.gemini/antigravity/brain/2064a8a5-4fca-4ad9-8b61-9f0dc082ef18/fps_monitor_tray_icon_1767759491917.png"
dest_path = r"c:\PLAY STORE\backend\icon.ico"

try:
    img = Image.open(source_path)
    # Save as ICO with multiple sizes for best quality
    img.save(dest_path, format='ICO', sizes=[(256, 256), (128, 128), (64, 64), (48, 48), (32, 32), (16, 16)])
    print(f"Successfully converted to {dest_path}")
except Exception as e:
    print(f"Error converting icon: {e}")
