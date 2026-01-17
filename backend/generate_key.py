import hashlib
import sys

SECRET_SALT = "FRAMEFORGE_PREMIUM_2026_SALT_SECURE"

def generate_key(device_id):
    # Combine Device ID and Salt
    data = (device_id + SECRET_SALT).encode('utf-8')
    
    # Calculate SHA-256 hash
    hash_object = hashlib.sha256(data)
    hash_hex = hash_object.hexdigest()
    
    # The key is the first 12 characters of the hash, uppercase
    key = hash_hex[:12].upper()
    return key

if __name__ == "__main__":
    print("=== FrameForge Key Generator ===")
    if len(sys.argv) > 1:
        device_id = sys.argv[1]
    else:
        device_id = input("Enter Device ID: ").strip()
    
    if device_id:
        key = generate_key(device_id)
        print(f"\nDevice ID: {device_id}")
        print(f"License Key: {key}")
        print("\nSend this key to the user.")
    else:
        print("Error: No Device ID provided.")
