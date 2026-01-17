from PIL import Image
import os

def resize_with_padding(input_path, output_path, target_size, padding_ratio=0.3):
    """
    Resizes an image to target_size with padding to prevent cropping.
    padding_ratio: percentage of the image size to be used as padding (0.3 = 30%)
    """
    try:
        img = Image.open(input_path).convert("RGBA")
        
        # Calculate new size for the content (original image)
        # It should be smaller than target_size to have padding
        content_size = int(target_size * (1 - padding_ratio))
        
        # Resize original image
        img = img.resize((content_size, content_size), Image.Resampling.LANCZOS)
        
        # Create a new transparent background image of target_size
        new_img = Image.new("RGBA", (target_size, target_size), (0, 0, 0, 0))
        
        # Paste the resized content in the center
        offset = (target_size - content_size) // 2
        new_img.paste(img, (offset, offset), img)
        
        # Save
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        new_img.save(output_path, "PNG")
        print(f"Saved: {output_path}")
        
    except Exception as e:
        print(f"Error processing {input_path}: {e}")

# Configuration
source_icon = "c:/PLAY STORE/icon.png"
android_res_path = "c:/PLAY STORE/frontend/android/app/src/main/res"

# Map of folder name to size (px)
# Standard Android mipmap sizes
sizes = {
    "mipmap-mdpi": 48,
    "mipmap-hdpi": 72,
    "mipmap-xhdpi": 96,
    "mipmap-xxhdpi": 144,
    "mipmap-xxxhdpi": 192
}

# Execute
if not os.path.exists(source_icon):
    print(f"Error: Source icon not found at {source_icon}")
else:
    for folder, size in sizes.items():
        output_path = os.path.join(android_res_path, folder, "ic_launcher_foreground.png")
        # We only update the foreground, assuming background is handled by xml or color
        resize_with_padding(source_icon, output_path, size, padding_ratio=0.35)

    print("Icon update complete.")
