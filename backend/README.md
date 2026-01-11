# FrameForge Server

<p align="center">
  <img src="assets/icon.ico" width="100" alt="FrameForge Server">
</p>

**FrameForge Server** is the Windows companion app for the FrameForge mobile app. It captures real-time FPS, CPU, GPU, and RAM data from your PC and sends it to your phone.

## 📥 Download

Download the latest version from [Releases](https://github.com/frameforgeAPP/frameforge-server/releases).

## ✨ Features

- 🎮 **Real-time FPS monitoring** via MSI Afterburner / RTSS
- 🌡️ **CPU & GPU temperatures**
- 💾 **RAM usage**
- 📡 **Automatic discovery** via mDNS
- 🔧 **System tray** - runs silently in background
- 🚀 **Auto-start with Windows** (optional)
- 📱 **QR Code** for easy mobile connection

## 🔧 Requirements

- **Windows 10/11**
- **MSI Afterburner** with **RivaTuner Statistics Server (RTSS)**

## 📲 How to Use

1. Download and run `FrameForgeServer.exe`
2. Install MSI Afterburner if not already installed
3. Make sure RTSS is running (comes with Afterburner)
4. Open the FrameForge app on your phone
5. Connect to the server using the displayed IP or QR Code

## 🖥️ System Tray

The server runs in your system tray. Right-click the icon for options:

- **Open in Browser** - View the dashboard on your PC
- **Start with Windows** - Toggle auto-start
- **Quit** - Close the server

## 🔒 Privacy

- FrameForge Server only works on your local network
- No data is sent to the internet
- Open source and transparent

## 🛠️ Building from Source

```bash
cd backend
pip install -r requirements.txt
python frameforge_server.py
```

## 📄 License

MIT License - See [LICENSE](LICENSE) for details.

---

Made with ❤️ by FrameForge
