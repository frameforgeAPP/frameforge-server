import wmi
import pythoncom

class LHMReader:
    def __init__(self):
        self.wmi_client = None
        self.connected = False

    def connect(self):
        try:
            # Initialize COM for the current thread (needed for WMI in threads/async)
            pythoncom.CoInitialize()
            self.wmi_client = wmi.WMI(namespace="root/LibreHardwareMonitor")
            self.connected = True
            return True
        except Exception as e:
            # print(f"Error connecting to LHM WMI: {e}")
            self.connected = False
            return False

    def _parse_value(self, value):
        try:
            if isinstance(value, (int, float)):
                return float(value)
            if isinstance(value, str):
                # Handle comma for locales like pt-BR
                return float(value.replace(',', '.'))
            return None
        except Exception:
            return None



    def read_cpu_temp(self):
        # Method 1: Try WMI via python-wmi
        if not self.connected:
            if not self.connect():
                return None

        try:
            # Query for Temperature sensors containing "CPU", "Core", or "Package"
            sensors = self.wmi_client.Sensor(SensorType="Temperature")
            for sensor in sensors:
                if ("CPU" in sensor.Name or "Core" in sensor.Name or "Package" in sensor.Name) and "GPU" not in sensor.Name:
                    val = self._parse_value(sensor.Value)
                    if val is not None and val > 0:
                        return round(val, 1)
            
            return None
            
        except Exception:
            # Re-connect on error
            self.connected = False
            return None

    def read_gpu_stats(self):
        if not self.connected:
            if not self.connect():
                return []

        gpus = []
        try:
            # We need to find the GPU hardware first to get its ID/Name
            hardware_list = self.wmi_client.Hardware()
            
            for hw in hardware_list:
                if hw.HardwareType.lower() == "gpu" or "gpu" in hw.Name.lower() or "nvidia" in hw.Name.lower() or "radeon" in hw.Name.lower():
                    gpu_data = {
                        "id": hw.Identifier,
                        "name": hw.Name,
                        "load": 0,
                        "memory_used": 0,
                        "memory_total": 0, # LHM might not provide total easily via WMI without more complex queries
                        "temperature": 0
                    }
                    
                    # Now find sensors for this hardware
                    sensors = self.wmi_client.Sensor(Parent=hw.Identifier)
                    for sensor in sensors:
                        val = self._parse_value(sensor.Value)
                        if val is None: continue
                        
                        stype = sensor.SensorType.lower()
                        sname = sensor.Name.lower()
                        
                        if stype == "load" and "core" in sname:
                            gpu_data["load"] = val
                        elif stype == "temperature" and "core" in sname:
                            gpu_data["temperature"] = val
                        elif stype == "smalldata" and "memory" in sname and "used" in sname:
                             # LHM often reports memory used in MB
                             gpu_data["memory_used"] = val
                        elif stype == "data" and "memory" in sname and "used" in sname:
                             gpu_data["memory_used"] = val

                    # If we found at least some data, add it
                    gpus.append(gpu_data)
                    
            return gpus

        except Exception:
            self.connected = False
            return []
