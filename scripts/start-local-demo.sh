#!/bin/bash

echo "🚀 Starting Gagggle Local Network Demo"
echo "======================================"
echo ""

# Get the local IP address
echo "🔍 Finding your local IP address..."
./scripts/get-local-ip.sh

if [ ! -f .local-ip ]; then
    echo "❌ Could not detect IP address. Please run './scripts/get-local-ip.sh' manually."
    exit 1
fi

LOCAL_IP=$(cat .local-ip)
echo ""
echo "✅ Your IP address: $LOCAL_IP"
echo ""

# Generate a room ID
ROOM_ID="demo-$(date +%s | tail -c 4)"
echo "🏠 Generated room ID: $ROOM_ID"
echo ""

# Display URLs
echo "📋 SHARE THESE URLS WITH YOUR TEAMMATE:"
echo "   Frontend: http://$LOCAL_IP:3000/?room=$ROOM_ID"
echo "   Backend:  http://$LOCAL_IP:3001/health (for testing)"
echo ""

# Save URLs to a file for easy access
echo "http://$LOCAL_IP:3000/?room=$ROOM_ID" > .demo-url
echo "http://$LOCAL_IP:3001" > .backend-url

echo "💾 URLs saved to .demo-url and .backend-url files"
echo ""

echo "🚀 NEXT STEPS:"
echo "1. Open a new terminal and run: npm run backend:local"
echo "2. Open another terminal and run: npm run dev:local"  
echo "3. Visit: http://$LOCAL_IP:3000/?room=$ROOM_ID"
echo "4. Share the URL above with your teammate"
echo ""

echo "⚡ For instant setup, run these commands in separate terminals:"
echo "   Terminal 1: npm run backend:local"
echo "   Terminal 2: npm run dev:local"
echo ""

# Check if user wants to auto-start services
read -p "🤔 Would you like me to start both services now? (y/N): " start_services

if [[ $start_services =~ ^[Yy]$ ]]; then
    echo ""
    echo "🔄 Starting services..."
    
    # Start backend in background
    echo "Starting backend..."
    npm run backend:local &
    BACKEND_PID=$!
    
    # Wait a moment for backend to start
    sleep 3
    
    # Start frontend in background  
    echo "Starting frontend..."
    npm run dev:local &
    FRONTEND_PID=$!
    
    echo ""
    echo "✅ Services started!"
    echo "   Backend PID: $BACKEND_PID"
    echo "   Frontend PID: $FRONTEND_PID"
    echo ""
    echo "🌐 Your demo is ready at: http://$LOCAL_IP:3000/?room=$ROOM_ID"
    echo ""
    echo "⏹️  To stop services later, run:"
    echo "   kill $BACKEND_PID $FRONTEND_PID"
    echo ""
    
    # Save PIDs for cleanup
    echo "$BACKEND_PID" > .backend-pid
    echo "$FRONTEND_PID" > .frontend-pid
    
    # Wait for user input to stop
    echo "Press any key to stop services and exit..."
    read -n 1
    
    echo ""
    echo "🛑 Stopping services..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    rm -f .backend-pid .frontend-pid
    echo "✅ Services stopped"
    
else
    echo ""
    echo "👍 Manual setup chosen. Follow the instructions above!"
fi
