import ctypes
import mmap
import struct

# RTSS Shared Memory Name
RTSS_SHARED_MEMORY_NAME = "RTSSSharedMemoryV2"

# Constants
RTSS_MAX_OSD_SLOTS = 8

class RTSS_SHARED_MEMORY_OSD_ENTRY(ctypes.Structure):
    _fields_ = [
        ("szOSD", ctypes.c_char * 256),
        ("szOSDOwner", ctypes.c_char * 256),
    ]

class RTSS_SHARED_MEMORY_APP_ENTRY(ctypes.Structure):
    _fields_ = [
        ("dwProcessID", ctypes.c_uint32),
        ("szName", ctypes.c_char * 260),
        ("dwFlags", ctypes.c_uint32),
        ("dwTime0", ctypes.c_uint32),
        ("dwTime1", ctypes.c_uint32),
        ("dwFrames", ctypes.c_uint32),
        ("dwFrameTime", ctypes.c_uint32),
        ("dwStatFlags", ctypes.c_uint32),
        ("dwStatTime0", ctypes.c_uint32),
        ("dwStatTime1", ctypes.c_uint32),
        ("dwStatFrames", ctypes.c_uint32),
        ("dwStatCount", ctypes.c_uint32),
        ("dwStatFrametime", ctypes.c_uint32),
        ("dwStatMin", ctypes.c_uint32),
        ("dwStatAvg", ctypes.c_uint32),
        ("dwStatMax", ctypes.c_uint32),
        ("dwOSDX", ctypes.c_uint32),
        ("dwOSDY", ctypes.c_uint32),
        ("dwOSDPixel", ctypes.c_uint32),
        ("dwOSDColor", ctypes.c_uint32),
        ("dwOSDFrame", ctypes.c_uint32),
        ("dwScreenCaptureFlags", ctypes.c_uint32),
        ("szScreenCapturePath", ctypes.c_char * 260),
    ]

class RTSS_SHARED_MEMORY(ctypes.Structure):
    _fields_ = [
        ("dwSignature", ctypes.c_uint32),
        ("dwVersion", ctypes.c_uint32),
        ("dwAppEntrySize", ctypes.c_uint32),
        ("dwAppArrOffset", ctypes.c_uint32),
        ("dwAppArrSize", ctypes.c_uint32),
        ("dwOSDEntrySize", ctypes.c_uint32),
        ("dwOSDArrOffset", ctypes.c_uint32),
        ("dwOSDArrSize", ctypes.c_uint32),
        ("dwOSDFrame", ctypes.c_uint32),
    ]

class RTSSReader:
    def __init__(self):
        self.map_file = None
        self.shared_memory = None

    def connect(self):
        try:
            # Open named shared memory
            self.map_file = mmap.mmap(-1, ctypes.sizeof(RTSS_SHARED_MEMORY), RTSS_SHARED_MEMORY_NAME, access=mmap.ACCESS_READ)
            return True
        except FileNotFoundError:
            # RTSS is not running
            return False
        except Exception as e:
            print(f"Error connecting to RTSS: {e}")
            return False

    def is_connected(self):
        return self.map_file is not None

    def read_fps(self):
        if not self.map_file:
            if not self.connect():
                return {'fps': 0, 'game_name': ""}

        try:
            self.map_file.seek(0)
            # Read header
            header_data = self.map_file.read(ctypes.sizeof(RTSS_SHARED_MEMORY))
            header = RTSS_SHARED_MEMORY.from_buffer_copy(header_data)

            # Verify signature ('RTSS')
            if header.dwSignature != 0x52545353: 
                return {'fps': 0, 'game_name': ""}

            # Check if we need to remap to access the app array
            required_size = header.dwAppArrOffset + (header.dwAppArrSize * header.dwAppEntrySize)
            if self.map_file.size() < required_size:
                 self.map_file.close()
                 self.map_file = mmap.mmap(-1, required_size, RTSS_SHARED_MEMORY_NAME, access=mmap.ACCESS_READ)

            max_fps = 0
            active_game = ""
            
            for i in range(header.dwAppArrSize):
                offset = header.dwAppArrOffset + (i * header.dwAppEntrySize)
                self.map_file.seek(offset)
                entry_data = self.map_file.read(ctypes.sizeof(RTSS_SHARED_MEMORY_APP_ENTRY))
                entry = RTSS_SHARED_MEMORY_APP_ENTRY.from_buffer_copy(entry_data)
                
                # Check if entry is active (Process ID != 0)
                if entry.dwProcessID != 0:
                    if entry.dwFrameTime > 0:
                        fps = 1000000.0 / entry.dwFrameTime
                        if fps > max_fps:
                            max_fps = int(fps)
                            # Extract game name
                            try:
                                import os
                                name = entry.szName.decode('utf-8', errors='ignore').strip()
                                name = os.path.basename(name)
                                # Remove .exe extension if present
                                if name.lower().endswith('.exe'):
                                    name = name[:-4]
                                # Clean up common suffixes
                                name = name.replace("-Win64-Shipping", "").replace("-Shipping", "")
                                active_game = name
                            except:
                                pass
                            
            return {'fps': max_fps, 'game_name': active_game}

        except Exception as e:
            # print(f"Error reading RTSS: {e}")
            # If reading fails, try to reconnect next time
            self.map_file.close()
            self.map_file = None
            return {'fps': 0, 'game_name': ""}

if __name__ == "__main__":
    reader = RTSSReader()
    import time
    while True:
        print(f"FPS: {reader.read_fps()}")
        time.sleep(1)
