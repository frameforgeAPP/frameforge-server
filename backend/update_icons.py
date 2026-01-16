import os
from PIL import Image
import shutil

# Configuration
SOURCE_IMAGE = r"C:/Users/Administrador/.gemini/antigravity/brain/728ab392-fc6c-4062-9e84-3e0785b0ccac/uploaded_image_1768534928899.png"
ANDROID_RES_DIR = r"c:/PLAY STORE/frontend/android/app/src/main/res"

# Icon definitions (folder_name, size)
ICONS = [
    ("mipmap-mdpi", 48),
    ("mipmap-hdpi", 72),
    ("mipmap-xhdpi", 96),
    ("mipmap-xxhdpi", 144),
    ("mipmap-xxxhdpi", 192)
]

def update_icons():
    if not os.path.exists(SOURCE_IMAGE):
        print(f"Error: Source image not found at {SOURCE_IMAGE}")
        return

    try:
        img = Image.open(SOURCE_IMAGE)
        print(f"Loaded source image: {img.size}")

        # Ensure RGBA for transparency support if needed, though usually icons are opaque or PNGs
        img = img.convert("RGBA")

        for folder, size in ICONS:
            target_dir = os.path.join(ANDROID_RES_DIR, folder)
            if not os.path.exists(target_dir):
                print(f"Warning: Directory {target_dir} does not exist. Creating...")
                os.makedirs(target_dir)

            # Resize
            resized_img = img.resize((size, size), Image.Resampling.LANCZOS)

            # Save as ic_launcher.png
            target_path = os.path.join(target_dir, "ic_launcher.png")
            resized_img.save(target_path, "PNG")
            print(f"Saved {target_path} ({size}x{size})")

            # Save as ic_launcher_round.png (using same image for now, usually should be masked)
            target_round_path = os.path.join(target_dir, "ic_launcher_round.png")
            resized_img.save(target_round_path, "PNG")
            print(f"Saved {target_round_path} ({size}x{size})")
            
            # Also update foreground if it exists, to be safe against adaptive icons showing old foreground
            target_foreground_path = os.path.join(target_dir, "ic_launcher_foreground.png")
            if os.path.exists(target_foreground_path):
                 resized_img.save(target_foreground_path, "PNG")
                 print(f"Updated foreground {target_foreground_path}")

        print("\nSuccess! All icons updated.")

    except Exception as e:
        print(f"Error processing icons: {e}")

if __name__ == "__main__":
    update_icons()
