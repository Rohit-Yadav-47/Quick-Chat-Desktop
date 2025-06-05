#!/bin/bash

# AI Assistant - Quick Run Script
echo "🚀 Starting AI Assistant..."

# Check if built version exists
if [ -f "dist/linux-unpacked/ai-search-chatbot" ]; then
    echo "✅ Running production build..."
    ./dist/linux-unpacked/ai-search-chatbot
elif [ -f "node_modules/.bin/electron" ]; then
    echo "✅ Running development version..."
    npm start
else
    echo "❌ No executable found. Please run:"
    echo "   npm install && npm run build-linux"
    echo "   or"
    echo "   ./setup.sh"
fi 