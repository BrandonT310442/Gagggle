#!/bin/bash

# Cross-platform script to get local IP address
# Works on macOS, Linux, and Windows (with Git Bash/WSL)

echo "🔍 Finding your local IP address..."
echo ""

# Detect OS
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    echo "🍎 Detected macOS"
    IP=$(ifconfig en0 | grep 'inet ' | grep -v '127.0.0.1' | awk '{print $2}' | head -1)
    
    # Fallback to other interfaces if en0 doesn't have IP
    if [ -z "$IP" ]; then
        IP=$(ifconfig | grep 'inet ' | grep -v '127.0.0.1' | awk '{print $2}' | head -1)
    fi
    
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    # Linux
    echo "🐧 Detected Linux"
    IP=$(hostname -I | awk '{print $1}')
    
    # Fallback method for Linux
    if [ -z "$IP" ]; then
        IP=$(ip route get 8.8.8.8 | awk '{print $7; exit}')
    fi
    
elif [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "win32" ]]; then
    # Windows (Git Bash or similar)
    echo "🪟 Detected Windows"
    IP=$(ipconfig | grep 'IPv4 Address' | grep -v '127.0.0.1' | awk '{print $NF}' | head -1)
    
else
    echo "❌ Unsupported OS: $OSTYPE"
    echo "Please manually find your IP address:"
    echo "  - macOS: ifconfig en0 | grep inet"
    echo "  - Linux: hostname -I"
    echo "  - Windows: ipconfig"
    exit 1
fi

# Check if we found an IP
if [ -z "$IP" ]; then
    echo "❌ Could not automatically detect IP address"
    echo "Please manually find your IP address:"
    echo "  - macOS: ifconfig en0 | grep inet"
    echo "  - Linux: hostname -I"  
    echo "  - Windows: ipconfig"
    exit 1
fi

echo "✅ Found local IP address: $IP"
echo ""
echo "📋 Copy this for your teammate:"
echo "   http://$IP:3000/?room=YOUR_ROOM_ID"
echo ""
echo "🚀 Your services will be available at:"
echo "   Frontend: http://$IP:3000"
echo "   Backend:  http://$IP:3001"
echo ""

# Export IP for other scripts to use
export LOCAL_IP="$IP"
echo "$IP" > .local-ip

echo "💾 IP address saved to .local-ip file"
echo ""
echo "🔗 Next steps:"
echo "1. Run: npm run dev:local"
echo "2. Run: npm run backend:local" 
echo "3. Share the URL above with your teammate"
