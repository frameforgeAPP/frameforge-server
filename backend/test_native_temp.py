import wmi
import pythoncom
import win32com.client

def test_wmi_temp():
    try:
        pythoncom.CoInitialize()
        w = wmi.WMI(namespace="root/wmi")
        temperature_info = w.MSAcpi_ThermalZoneTemperature()
        
        print("--- WMI Thermal Zones ---")
        for sensor in temperature_info:
            temp_c = (sensor.CurrentTemperature / 10.0) - 273.15
            print(f"Name: {sensor.InstanceName}, Temp: {temp_c:.1f} C")
            
        if not temperature_info:
            print("No WMI Thermal Zones found.")
            
    except Exception as e:
        print(f"Error reading WMI: {e}")

if __name__ == "__main__":
    test_wmi_temp()
