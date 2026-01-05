import wmi
import pythoncom

def list_lhm_sensors():
    try:
        pythoncom.CoInitialize()
        print("Connecting to WMI namespace 'root/LibreHardwareMonitor'...")
        wmi_client = wmi.WMI(namespace="root/LibreHardwareMonitor")
        print("Connected.")

        print("\n--- Hardware List ---")
        for hw in wmi_client.Hardware():
            print(f"Name: {hw.Name}, Type: {hw.HardwareType}, ID: {hw.Identifier}")

        print("\n--- Sensor List (Temperature) ---")
        sensors = wmi_client.Sensor(SensorType="Temperature")
        if not sensors:
            print("No temperature sensors found.")
        
        for sensor in sensors:
            print(f"Name: {sensor.Name}, Value: {sensor.Value}, Parent: {sensor.Parent}")
            
    except Exception as e:
        print(f"Error: {e}")
        print("\nPossible causes:")
        print("1. LibreHardwareMonitor is not running.")
        print("2. The WMI option is not enabled in LibreHardwareMonitor settings.")
        print("3. Run as Administrator is required.")

if __name__ == "__main__":
    list_lhm_sensors()
