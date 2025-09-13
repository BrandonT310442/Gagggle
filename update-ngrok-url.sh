#!/bin/bash

echo "🔄 Updating frontend with current ngrok backend URL..."

# Get the current backend tunnel URL
BACKEND_URL=$(curl -s http://localhost:4040/api/tunnels | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    for tunnel in data['tunnels']:
        if tunnel['name'] == 'backend':
            print(tunnel['public_url'])
            break
except:
    print('ERROR: Could not get ngrok URL')
    sys.exit(1)
")

if [[ $BACKEND_URL == *"ERROR"* ]] || [[ -z "$BACKEND_URL" ]]; then
    echo "❌ Could not get backend URL. Make sure ngrok is running with 'ngrok start --all'"
    exit 1
fi

echo "📡 Found backend URL: $BACKEND_URL"

# Update the frontend file
sed -i '' "s|: 'https://[^']*\.ngrok-free\.app';|: '$BACKEND_URL';|g" app/page.tsx

echo "✅ Updated app/page.tsx with new backend URL"
echo "🌐 Your frontend should now connect successfully!"

# Show the frontend URL for sharing
FRONTEND_URL=$(curl -s http://localhost:4040/api/tunnels | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    for tunnel in data['tunnels']:
        if tunnel['name'] == 'frontend':
            print(tunnel['public_url'])
            break
except:
    pass
")

if [[ ! -z "$FRONTEND_URL" ]]; then
    echo ""
    echo "🚀 Share this URL: $FRONTEND_URL/?room=YOUR_ROOM_ID"
fi
