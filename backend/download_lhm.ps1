$url = "https://github.com/LibreHardwareMonitor/LibreHardwareMonitor/releases/download/v0.9.4/LibreHardwareMonitor-net472.zip"
$output = "c:\FPS\backend\LHM.zip"
$dest = "c:\FPS\backend\LibreHardwareMonitor"

Write-Host "Downloading LibreHardwareMonitor..."
Invoke-WebRequest -Uri $url -OutFile $output

Write-Host "Extracting..."
Expand-Archive -Path $output -DestinationPath $dest -Force

Write-Host "Done. Executable is at $dest\LibreHardwareMonitor.exe"
