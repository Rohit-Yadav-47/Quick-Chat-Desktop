#!/bin/bash

# AI Assistant Setup Script for Linux
echo "🚀 Setting up AI Assistant Chatbot for Linux..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js v16+ first."
    echo "Visit: https://nodejs.org/ or run: sudo apt install nodejs npm"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 16 ]; then
    echo "❌ Node.js version 16+ required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) detected"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo "✅ Dependencies installed successfully"

# Build production app
echo "🔨 Building production app for Linux..."
npm run build-linux

if [ $? -ne 0 ]; then
    echo "❌ Build failed"
    exit 1
fi

echo "✅ Build completed successfully!"
echo ""
echo "🎉 AI Assistant is ready!"
echo ""
echo "📁 Built files are in the 'dist' directory:"
echo "   • AppImage: dist/AI Assistant-1.0.0.AppImage"
echo "   • DEB package: dist/ai-search-chatbot_1.0.0_amd64.deb"
echo "   • TAR.GZ: dist/ai-search-chatbot-1.0.0.tar.gz"
echo ""
echo "🚀 To run:"
echo "   chmod +x \"dist/AI Assistant-1.0.0.AppImage\""
echo "   ./\"dist/AI Assistant-1.0.0.AppImage\""
echo ""
echo "📋 Or install DEB package:"
echo "   sudo dpkg -i dist/ai-search-chatbot_1.0.0_amd64.deb"
echo ""
echo "⌨️  Use Ctrl+Q to open the assistant from anywhere!" 