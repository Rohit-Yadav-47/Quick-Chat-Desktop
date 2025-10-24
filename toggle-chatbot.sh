#!/bin/bash
# Toggle script for Quick Chat Desktop

# Check if the app is already running
if pgrep -f "electron.*Quick-Chat-Desktop" > /dev/null; then
    # Get the window ID
    WINDOW_ID=$(xdotool search --class "ai-search-chatbot" 2>/dev/null | head -1)
    
    if [ -n "$WINDOW_ID" ]; then
        # Check if window is visible
        if xdotool search --class "ai-search-chatbot" getwindowfocus 2>/dev/null | grep -q "$WINDOW_ID"; then
            # Window is focused, minimize it
            xdotool windowminimize "$WINDOW_ID"
        else
            # Window is hidden/minimized, show and focus it
            xdotool windowactivate "$WINDOW_ID"
        fi
    else
        # Window not found, try wmctrl
        wmctrl -a "AI Assistant" 2>/dev/null || echo "Could not find window"
    fi
else
    # App not running, start it
    cd /home/Rohit/Quick-Chat-Desktop
    npm start &
fi
