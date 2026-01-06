import mmap
import struct
import ctypes

# MSI Afterburner Shared Memory Name
MAHM_SHARED_MEMORY_NAME = "MAHMSharedMemory"

class MAHMReader:
    def __init__(self):
        self.map_file = None
        self.header_size = 0
        self.entry_count = 0
        self.entry_size = 0
        
    def connect(self):
        try:
            # Step 1: Open with small size to read header
            temp_map = mmap.mmap(-1, 1024, MAHM_SHARED_MEMORY_NAME, access=mmap.ACCESS_READ)
            
            temp_map.seek(0)
            signature = temp_map.read(4)
            
            # Accept both MAHM and MHAM signatures
            if signature != b'MAHM' and signature != b'MHAM':
                temp_map.close()
                return False

            temp_map.seek(8)
            self.header_size = struct.unpack('I', temp_map.read(4))[0]
            self.entry_count = struct.unpack('I', temp_map.read(4))[0]
            self.entry_size = struct.unpack('I', temp_map.read(4))[0]
            
            total_size = self.header_size + (self.entry_count * self.entry_size)
            temp_map.close()
            
            # Step 2: Reopen with exact size
            self.map_file = mmap.mmap(-1, total_size, MAHM_SHARED_MEMORY_NAME, access=mmap.ACCESS_READ)
            return True
            
        except FileNotFoundError:
            return False
        except Exception as e:
            print(f"Error connecting to MAHM: {e}")
            return False

    def read_cpu_temp(self):
        if not self.map_file:
            if not self.connect():
                return None

        try:
            current_offset = self.header_size
            
            for i in range(self.entry_count):
                try:
                    self.map_file.seek(current_offset)
                    
                    # Read Name (260 bytes)
                    name_bytes = self.map_file.read(260)
                    name = name_bytes.decode('latin-1', errors='ignore').strip('\x00')
                    
                    # Optimization: Check name before reading everything else
                    # We are looking for "CPU temperature" specifically
                    if "CPU" in name and "temperature" in name.lower():
                        # Read Data
                        # Offset calculation: Name(260) + Units(260) + LocName(260) + LocUnits(260) + Format(260) = 1300
                        # Found via debug: Value is at 1300 exactly.
                        data_offset = current_offset + 1300
                        self.map_file.seek(data_offset)
                        value = struct.unpack('f', self.map_file.read(4))[0]
                        
                        # Filter out 0.0 or invalid values if possible, but 0.0 might be valid if idle? 
                        # Usually CPU temp is > 20.
                        if value > 0:
                            return round(value, 1)

                    current_offset += self.entry_size
                except ValueError:
                    # Seek error
                    break
                    
            return None

        except Exception:
            return None

    def read_gpu_stats(self):
        if not self.map_file:
            if not self.connect():
                return []

        gpus = {}
        
        try:
            current_offset = self.header_size
            
            for i in range(self.entry_count):
                try:
                    self.map_file.seek(current_offset)
                    
                    # Read Name (260 bytes)
                    name_bytes = self.map_file.read(260)
                    name = name_bytes.decode('latin-1', errors='ignore').strip('\x00')
                    
                    # Optimization: Check if it starts with GPU
                    if name.startswith("GPU"):
                        # Parse GPU index and type
                        # Examples: "GPU1 temperature", "GPU2 usage", "GPU1 memory usage"
                        parts = name.split(' ')
                        if len(parts) >= 2:
                            gpu_id_str = parts[0].replace("GPU", "")
                            if gpu_id_str.isdigit():
                                gpu_id = int(gpu_id_str)
                                
                                if gpu_id not in gpus:
                                    gpus[gpu_id] = {
                                        "id": str(gpu_id),
                                        "name": f"GPU {gpu_id}",
                                        "load": 0,
                                        "memory_used": 0,
                                        "memory_total": 0, 
                                        "temperature": 0
                                    }
                                
                                # Read Value
                                data_offset = current_offset + 1300
                                self.map_file.seek(data_offset)
                                value = struct.unpack('f', self.map_file.read(4))[0]
                                
                                metric = " ".join(parts[1:]).lower()
                                
                                if "temperature" in metric:
                                    gpus[gpu_id]["temperature"] = value
                                elif "usage" in metric and "memory" not in metric and "bus" not in metric and "fb" not in metric and "vid" not in metric:
                                    gpus[gpu_id]["load"] = value
                                elif "memory usage" in metric:
                                    gpus[gpu_id]["memory_used"] = value

                    current_offset += self.entry_size
                except ValueError:
                    break
            
            # Convert dict to list and sort by ID
            return sorted(gpus.values(), key=lambda x: int(x["id"]))

        except Exception as e:
            # print(f"Error reading MAHM GPU stats: {e}")
            if self.map_file:
                self.map_file.close()
            self.map_file = None
            return []

    def read_cpu_usage(self):
        if not self.map_file:
            if not self.connect():
                return None

        try:
            current_offset = self.header_size
            
            for i in range(self.entry_count):
                try:
                    self.map_file.seek(current_offset)
                    
                    # Read Name (260 bytes)
                    name_bytes = self.map_file.read(260)
                    name = name_bytes.decode('latin-1', errors='ignore').strip('\x00')
                    
                    # Look for "CPU usage" (Total)
                    # Note: There are also "CPU1 usage", "CPU2 usage" etc. We want the total one.
                    if name == "CPU usage":
                        data_offset = current_offset + 1300
                        self.map_file.seek(data_offset)
                        value = struct.unpack('f', self.map_file.read(4))[0]
                        return round(value, 1)

                    current_offset += self.entry_size
                except ValueError:
                    break
            
            return None

        except Exception:
            return None

    def read_all_stats(self):
        """
        Reads all relevant stats (CPU Temp, CPU Usage, GPU Stats) in one pass
        to avoid multiple open/close operations and race conditions.
        """
        if not self.map_file:
            if not self.connect():
                return None

        result = {
            "cpu_temp": None,
            "cpu_usage": None,
            "gpus": {}
        }

        try:
            current_offset = self.header_size
            
            for i in range(self.entry_count):
                try:
                    self.map_file.seek(current_offset)
                    
                    # Read Name (260 bytes)
                    name_bytes = self.map_file.read(260)
                    name = name_bytes.decode('latin-1', errors='ignore').strip('\x00')
                    
                    # Read Value (Skip Units, LocName, LocUnits, Format)
                    # Data is at offset + 1300
                    data_offset = current_offset + 1300
                    self.map_file.seek(data_offset)
                    value = struct.unpack('f', self.map_file.read(4))[0]
                    
                    # 1. CPU Temperature
                    if "CPU" in name and "temperature" in name.lower() and "GPU" not in name:
                         # Prefer "CPU temperature" (Package) but take any core if package not found yet
                         if name == "CPU temperature":
                             result["cpu_temp"] = round(value, 1)
                         elif result["cpu_temp"] is None and value > 0:
                             result["cpu_temp"] = round(value, 1)

                    # 2. CPU Usage
                    elif name == "CPU usage":
                        result["cpu_usage"] = round(value, 1)

                    # 3. GPU Stats
                    elif name.startswith("GPU"):
                        parts = name.split(' ')
                        if len(parts) >= 2:
                            gpu_id_str = parts[0].replace("GPU", "")
                            if gpu_id_str.isdigit():
                                gpu_id = int(gpu_id_str)
                                
                                if gpu_id not in result["gpus"]:
                                    result["gpus"][gpu_id] = {
                                        "id": str(gpu_id),
                                        "name": f"GPU {gpu_id}",
                                        "load": 0,
                                        "memory_used": 0,
                                        "memory_total": 0, 
                                        "temperature": 0
                                    }
                                
                                metric = " ".join(parts[1:]).lower()
                                
                                if "temperature" in metric:
                                    result["gpus"][gpu_id]["temperature"] = value
                                elif "usage" in metric and "memory" not in metric and "bus" not in metric and "fb" not in metric and "vid" not in metric:
                                    result["gpus"][gpu_id]["load"] = value
                                elif "memory usage" in metric:
                                    result["gpus"][gpu_id]["memory_used"] = value

                    current_offset += self.entry_size
                except ValueError:
                    break
            
            # Convert GPU dict to list
            result["gpus"] = sorted(result["gpus"].values(), key=lambda x: int(x["id"]))
            return result

        except Exception:
            # If error, close and return None to force reconnect next time
            if self.map_file:
                self.map_file.close()
            self.map_file = None
            return None
