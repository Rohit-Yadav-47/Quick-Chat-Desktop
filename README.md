# 🤖 AI Assistant - Desktop Chatbot

<div align="center">

![AI Assistant](https://img.shields.io/badge/AI-Assistant-blue?style=for-the-badge&logo=robot)
![Version](https://img.shields.io/badge/version-1.0.0-green?style=for-the-badge)
![Platform](https://img.shields.io/badge/platform-Linux-orange?style=for-the-badge&logo=linux)
![License](https://img.shields.io/badge/license-MIT-purple?style=for-the-badge)

**A beautiful, lightweight AI chatbot desktop application powered by Google Gemini API**

*Features a modern Raycast-inspired UI with global keyboard shortcuts and always-on-top functionality*

[📥 Download](#installation) • [🚀 Quick Start](#quick-start) • [📖 Documentation](#usage) • [🛠️ Development](#development)

</div>

---

## ✨ Features

### 🎯 **Core Features**
- 🚀 **Global Access**: Instant access via `Ctrl+Q` shortcut from anywhere on your system
- 🤖 **Multiple AI Models**: Support for various Gemini models (2.0 Flash, 1.5 Pro, 1.5 Flash, etc.)
- 🎨 **Modern UI**: Beautiful Raycast-inspired design with transparency and blur effects
- ⚡ **Lightning Fast**: Minimal resource usage, runs efficiently in background
- 🔄 **Smart Conversations**: Context-aware chat with conversation history

### ⌨️ **Keyboard Shortcuts**
| Shortcut | Action |
|----------|--------|
| `Ctrl+Q` | Open/Focus window |
| `Esc` | Hide window |
| `Ctrl+L` | Clear conversation |
| `Ctrl+,` | Open settings |
| `Enter` | Send message |

### 🖥️ **UI Features**
- 🖼️ **Always on Top**: Stays above other windows for instant access
- 🔧 **Adaptive Sizing**: Window height adjusts based on content
- 📱 **Compact Design**: Minimal footprint, maximum functionality
- 🌙 **Dark Theme**: Easy on the eyes with modern dark interface
- 💨 **Smooth Animations**: Polished user experience

---

## 🏁 Quick Start

### Method 1: One-Command Setup ⚡
```bash
git clone https://github.com/yourusername/AI-Search.git
cd AI-Search
chmod +x setup.sh
./setup.sh
```

### Method 2: Manual Installation 🛠️
```bash
# Clone the repository
git clone https://github.com/yourusername/AI-Search.git
cd AI-Search

# Install dependencies
npm install

# Run the app
npm start
```

### Method 3: Download Release 📦
1. Download the latest release from [Releases](https://github.com/yourusername/AI-Search/releases)
2. Extract and run:
   ```bash
   chmod +x "AI Assistant-1.0.0.AppImage"
   ./AI\ Assistant-1.0.0.AppImage
   ```

---

## 📋 Prerequisites

- **Node.js** v16 or higher
- **npm** or **yarn**
- **Linux** x64 (Ubuntu, Debian, Fedora, etc.)
- **Google Gemini API key** ([Get it here](https://makersuite.google.com/app/apikey))

---

## 💻 Installation

### Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/AI-Search.git
   cd AI-Search
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up your API key**
   - Get your Gemini API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
   - The app will prompt you to enter it on first run

4. **Run in development mode**
   ```bash
   npm run dev
   ```

### Production Build

Build the application for distribution:

```bash
# Build all formats
npm run build

# Build specific format
npm run build-linux -- --linux AppImage
npm run build-linux -- --linux deb
npm run build-linux -- --linux tar.gz
```

Built files will be in the `dist/` directory:
- **AppImage**: `AI Assistant-1.0.0.AppImage`
- **DEB Package**: `ai-search-chatbot_1.0.0_amd64.deb`
- **TAR.GZ**: `ai-search-chatbot-1.0.0.tar.gz`

---

## 🚀 Usage

### First Run Setup

1. **Launch the application**
   ```bash
   ./run.sh
   # or
   npm start
   ```

2. **Enter your API key**
   - On first launch, you'll be prompted for your Gemini API key
   - Get your key from [Google AI Studio](https://makersuite.google.com/app/apikey)
   - The key is stored locally and securely

3. **Start chatting!**
   - Type your question and press `Enter`
   - The AI will respond using the selected model

### Daily Usage

- **Open Assistant**: Press `Ctrl+Q` anywhere on your system
- **Ask Questions**: Type naturally and press `Enter`
- **Hide Window**: Press `Esc` (app keeps running in background)
- **Clear History**: Press `Ctrl+L` to start fresh
- **Change Settings**: Press `Ctrl+,` for options

### Model Selection

Choose the best AI model for your needs:

| Model | Best For | Speed | Capability |
|-------|----------|-------|------------|
| **Gemini 2.0 Flash** | General use, fast responses | ⚡⚡⚡ | ⭐⭐⭐ |
| **Gemini 1.5 Pro** | Complex tasks, reasoning | ⚡⚡ | ⭐⭐⭐⭐⭐ |
| **Gemini 1.5 Flash** | Quick questions | ⚡⚡⚡ | ⭐⭐⭐ |
| **Gemini 1.0 Pro** | Stable, reliable | ⚡⚡ | ⭐⭐⭐ |

---

## 🛠️ Development

### Project Structure
```
AI-Search/
├── 📁 src/
│   ├── main.js              # Main Electron process
│   ├── preload.js           # IPC communication bridge
│   ├── chatbot.html         # Main UI interface
│   ├── chatbot.js           # Frontend logic & AI integration
│   └── new_styles.css       # Modern UI styles
├── 📁 dist/                 # Built applications
├── 📄 package.json          # Dependencies & build config
├── 🔧 setup.sh              # Automated setup script
├── 🚀 run.sh                # Quick launch script
└── 📖 README.md             # This file
```

### Development Commands

```bash
# Development mode with hot reload
npm run dev

# Start production app
npm start

# Build for distribution
npm run build

# Build Linux-specific formats
npm run build-linux

# Clean build artifacts
rm -rf dist/ node_modules/
npm install
```

### Adding Features

1. **Frontend changes**: Edit `chatbot.js` and `new_styles.css`
2. **Main process**: Modify `main.js` for Electron features
3. **IPC communication**: Update `preload.js` for renderer-main communication
4. **UI layout**: Modify `chatbot.html` for interface changes

---

## 🔧 Configuration

### Environment Variables

Create a `.env` file for custom configuration:

```bash
# API Configuration
GEMINI_API_KEY=your_api_key_here
DEFAULT_MODEL=gemini-2.0-flash

# App Configuration
WINDOW_WIDTH=700
WINDOW_HEIGHT=400
GLOBAL_SHORTCUT=CommandOrControl+Q
```

### Build Configuration

Customize builds in `package.json`:

```json
{
  "build": {
    "linux": {
      "target": ["AppImage", "deb", "tar.gz"],
      "category": "Utility"
    }
  }
}
```

---

## 🐛 Troubleshooting

### Common Issues

<details>
<summary><strong>App won't start</strong></summary>

**Solution:**
1. Ensure Node.js v16+ is installed: `node --version`
2. Reinstall dependencies: `npm install`
3. Check for errors: `npm start` in terminal

</details>

<details>
<summary><strong>Global shortcut not working</strong></summary>

**Solution:**
1. Check if another app is using `Ctrl+Q`
2. Change shortcut in `main.js` line 64
3. Restart the application

</details>

<details>
<summary><strong>API key issues</strong></summary>

**Solution:**
1. Get a valid key from [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Clear stored settings and re-enter key
3. Check internet connection

</details>

<details>
<summary><strong>Build fails</strong></summary>

**Solution:**
1. Install build dependencies: `npm install electron-builder --save-dev`
2. Clear cache: `npm run clean && npm install`
3. Check Node.js version compatibility

</details>

<details>
<summary><strong>Permission issues (Linux)</strong></summary>

**Solution:**
1. Make AppImage executable: `chmod +x "AI Assistant-1.0.0.AppImage"`
2. For system-wide install: `sudo dpkg -i ai-search-chatbot_1.0.0_amd64.deb`

</details>

### System Requirements

- **OS**: Linux x64 (Ubuntu 18.04+, Debian 10+, Fedora 32+)
- **Memory**: 100MB RAM minimum
- **Storage**: 200MB free space
- **Network**: Internet connection for AI requests
- **Display**: X11 or Wayland

---

## 🤝 Contributing

We welcome contributions! Here's how you can help:

### Getting Started
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Test thoroughly
5. Submit a pull request

### Contribution Guidelines
- Follow existing code style
- Add tests for new features
- Update documentation
- Ensure builds pass on Linux

### Areas for Contribution
- 🎨 UI/UX improvements
- 🚀 Performance optimizations
- 🔧 New features
- 🐛 Bug fixes
- 📖 Documentation
- 🌍 Internationalization

---

## 📜 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

```
MIT License

Copyright (c) 2024 AI Assistant

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.
```

---

## 🙏 Acknowledgments

- **Google Gemini API** - Powering the AI capabilities
- **Electron** - Cross-platform desktop framework
- **Raycast** - UI/UX inspiration
- **Contributors** - Everyone who helps improve this project

---

## 📞 Support

- 🐛 **Bug Reports**: [Create an issue](https://github.com/yourusername/AI-Search/issues)
- 💡 **Feature Requests**: [Start a discussion](https://github.com/yourusername/AI-Search/discussions)
- 📧 **Contact**: computerfun200@gmail.com

---

<div align="center">

**⭐ Star this repo if you find it helpful!**

Made with ❤️ for the Linux community

</div>
