"""
Script to generate padded icons for Android adaptive icons.
Adds padding to prevent cropping in launcher icons.
"""
from PIL import Image
import os

# Source icon
SOURCE_ICON = r"c:\PLAY STORE\icon.png"

# Output directories and sizes for Android mipmaps
MIPMAP_SIZES = {
    "mipmap-mdpi": 48,
    "mipmap-hdpi": 72,
    "mipmap-xhdpi": 96,
    "mipmap-xxhdpi": 144,
    "mipmap-xxxhdpi": 192,
}

# For adaptive icons, the foreground should be 108dp (432px at xxxhdpi)
# The visible area is 72dp (288px at xxxhdpi), so we need padding
FOREGROUND_SIZES = {
    "mipmap-mdpi": 108,
    "mipmap-hdpi": 162,
    "mipmap-xhdpi": 216,
    "mipmap-xxhdpi": 324,
    "mipmap-xxxhdpi": 432,
}

BASE_PATH = r"c:\PLAY STORE\frontend\android\app\src\main\res"

def create_padded_icon(source_path, output_path, size, foreground_size):
    """Create an icon with padding for adaptive icon safe zone."""
    # Open source image
    img = Image.open(source_path).convert("RGBA")
    
    # Calculate the safe zone (66% of total size is visible)
    safe_zone = int(foreground_size * 0.66)
    
    # Resize source to fit in safe zone with some extra padding (80% of safe zone)
    icon_size = int(safe_zone * 0.80)
    img_resized = img.resize((icon_size, icon_size), Image.Resampling.LANCZOS)
    
    # Create transparent background at foreground size
    result = Image.new("RGBA", (foreground_size, foreground_size), (0, 0, 0, 0))
    
    # Calculate position to center the icon
    offset = (foreground_size - icon_size) // 2
    
    # Paste resized icon centered
    result.paste(img_resized, (offset, offset), img_resized)
    
    # Save
    result.save(output_path, "PNG")
    print(f"Created: {output_path} ({foreground_size}x{foreground_size})")

def create_legacy_icon(source_path, output_path, size):
    """Create legacy square icon."""
    img = Image.open(source_path).convert("RGBA")
    
    # Add slight padding for legacy icons too (85% of size)
    icon_size = int(size * 0.85)
    img_resized = img.resize((icon_size, icon_size), Image.Resampling.LANCZOS)
    
    # Create background
    result = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    
    # Center
    offset = (size - icon_size) // 2
    result.paste(img_resized, (offset, offset), img_resized)
    
    result.save(output_path, "PNG")
    print(f"Created legacy: {output_path} ({size}x{size})")

def main():
    print("Generating padded icons for FrameForge...")
    
    for mipmap_dir, size in MIPMAP_SIZES.items():
        output_dir = os.path.join(BASE_PATH, mipmap_dir)
        os.makedirs(output_dir, exist_ok=True)
        
        foreground_size = FOREGROUND_SIZES[mipmap_dir]
        
        # Generate foreground (for adaptive icons)
        foreground_path = os.path.join(output_dir, "ic_launcher_foreground.png")
        create_padded_icon(SOURCE_ICON, foreground_path, size, foreground_size)
        
        # Generate legacy launcher icon
        launcher_path = os.path.join(output_dir, "ic_launcher.png")
        create_legacy_icon(SOURCE_ICON, launcher_path, size)
        
        # Generate round icon
        round_path = os.path.join(output_dir, "ic_launcher_round.png")
        create_legacy_icon(SOURCE_ICON, round_path, size)
    
    print("\nDone! All icons generated with proper padding.")

if __name__ == "__main__":
    main()
