# Ngrok Setup Guide for Real-Time Collaborative Apps

This guide shows how to set up ngrok tunnels for a Next.js frontend + Node.js backend application with real-time Socket.IO functionality.

## Prerequisites

- [ngrok account](https://dashboard.ngrok.com/signup) (free tier works)
- ngrok CLI installed (`brew install ngrok` on macOS)
- Your application running locally

## Architecture Overview

```
Remote Users → ngrok frontend tunnel → localhost:3000 (Next.js)
                      ↓
               ngrok backend tunnel → localhost:3001 (Node.js + Socket.IO)
```

**Why both tunnels are needed:**
- Frontend tunnel: Serves the React app to remote users
- Backend tunnel: Enables Socket.IO connections from remote browsers

## Step 1: Configure Ngrok

### 1.1 Set up your ngrok config file

Edit `~/.ngrok2/ngrok.yml` (or `~/Library/Application Support/ngrok/ngrok.yml` on newer versions):

```yaml
version: "3"
agent:
    authtoken: YOUR_AUTH_TOKEN_HERE
tunnels:
  frontend:
    addr: 3000
    proto: http
  backend:
    addr: 3001
    proto: http
```

### 1.2 Get your auth token
1. Visit [ngrok dashboard](https://dashboard.ngrok.com/get-started/your-authtoken)
2. Copy your authtoken
3. Replace `YOUR_AUTH_TOKEN_HERE` in the config above

## Step 2: Start Your Application

### 2.1 Start both servers
```bash
# Terminal 1: Start backend
npm run backend:dev

# Terminal 2: Start frontend  
npm run dev
```

### 2.2 Start ngrok tunnels
```bash
# Terminal 3: Start both tunnels
ngrok start --all
```

### 2.3 Get tunnel URLs
```bash
# Get the URLs
curl -s http://localhost:4040/api/tunnels | python3 -c "
import sys, json
data = json.load(sys.stdin)
for tunnel in data['tunnels']:
    print(f'{tunnel[\"name\"]}: {tunnel[\"public_url\"]}')
"
```

## Step 3: Update Frontend Configuration

### 3.1 Dynamic backend URL

In your frontend code (`app/page.tsx`), use this pattern:

```typescript
// Use localhost for local development, ngrok backend for remote access
const backendUrl = window.location.hostname === 'localhost' 
  ? 'http://localhost:3001'
  : 'https://YOUR_BACKEND_NGROK_URL'; // Replace with actual URL
```

### 3.2 Update the hardcoded URL

Replace `YOUR_BACKEND_NGROK_URL` with your actual backend tunnel URL (e.g., `https://abc123.ngrok-free.app`).

## Step 4: Configure CORS

### 4.1 Backend CORS (Socket.IO)

In `backend/src/server.ts`:

```typescript
const io = new Server(httpServer, {
  cors: {
    origin: [
      "http://localhost:3000",
      /^https:\/\/.*\.ngrok\.io$/,        // Legacy ngrok domains
      /^https:\/\/.*\.ngrok-free\.app$/   // Current ngrok free domains
    ],
    methods: ["GET", "POST"],
    credentials: true
  }
});
```

### 4.2 Express CORS

```typescript
app.use(cors({
  origin: [
    "http://localhost:3000",
    /^https:\/\/.*\.ngrok\.io$/,
    /^https:\/\/.*\.ngrok-free\.app$/
  ],
  credentials: true
}));
```

## Step 5: Update Frontend Configuration (Automated)

### 5.1 Use the automated script
Instead of manually editing the frontend file, use the provided script:

```bash
./update-ngrok-url.sh
```

This script will:
- Automatically fetch your current backend ngrok URL
- Update `app/page.tsx` with the correct URL
- Show you the frontend URL to share

### 5.2 Manual alternative
If you prefer to do it manually, update line 49 in `app/page.tsx`:
```typescript
const backendUrl = window.location.hostname === 'localhost' 
  ? 'http://localhost:3001'
  : 'https://YOUR_NEW_BACKEND_URL'; // Replace with current backend tunnel
```

## Step 6: Share & Test

### 6.1 Get the shareable URL
The frontend tunnel URL is what you share:
```
https://xyz789.ngrok-free.app/?room=YOUR_ROOM_ID
```

### 6.2 Test the connection
- Local users: `http://localhost:3000/?room=YOUR_ROOM_ID`
- Remote users: `https://xyz789.ngrok-free.app/?room=YOUR_ROOM_ID`

Both should connect to the same backend and see each other's real-time activity.

## Troubleshooting

### Common Issues

**"Connecting..." in red (most common):**
- This means your frontend is trying to connect to an old/wrong backend URL
- **Solution**: Run `./update-ngrok-url.sh` to fix it automatically
- **Manual fix**: Update the backend URL in `app/page.tsx` line 49

**"Connecting..." stuck:**
- Check if both tunnels are running: `curl -s http://localhost:4040/api/tunnels`
- Verify backend tunnel works: `curl https://YOUR_BACKEND_URL/health`
- Check browser console for connection errors

**CORS errors:**
- Ensure ngrok domains are in CORS allowlist
- Temporarily use `origin: true` to test if CORS is the issue

**Socket.IO connection fails:**
- Verify Socket.IO transports include 'polling': `transports: ['websocket', 'polling']`
- Check if backend tunnel accepts Socket.IO requests

### Debugging Commands

```bash
# Check tunnel status
curl -s http://localhost:4040/api/tunnels

# Test backend health
curl https://YOUR_BACKEND_URL/health

# Test Socket.IO endpoint
curl "https://YOUR_BACKEND_URL/socket.io/?EIO=4&transport=polling"
```

## Quick Setup Script

Create a `start-tunnels.sh` script:

```bash
#!/bin/bash
echo "Starting servers and tunnels..."

# Start backend in background
npm run backend:dev &
BACKEND_PID=$!

# Start frontend in background  
npm run dev &
FRONTEND_PID=$!

# Wait for servers to start
sleep 3

# Start ngrok tunnels
ngrok start --all &
NGROK_PID=$!

echo "Backend PID: $BACKEND_PID"
echo "Frontend PID: $FRONTEND_PID" 
echo "Ngrok PID: $NGROK_PID"

# Wait for ngrok to start
sleep 5

# Display URLs
echo "Tunnel URLs:"
curl -s http://localhost:4040/api/tunnels | python3 -c "
import sys, json
data = json.load(sys.stdin)
for tunnel in data['tunnels']:
    if 'frontend' in tunnel['name']:
        print(f'Share this: {tunnel[\"public_url\"]}/?room=YOUR_ROOM')
"
```

## Next Time Checklist

1. Start backend (`npm run backend:dev`)
2. Start frontend (`npm run dev`) 
3. Start ngrok tunnels (`ngrok start --all`)
4. **Update frontend URLs (`./update-ngrok-url.sh`)** ⚡
5. Share frontend tunnel URL with collaborators

### Alternative Manual Checklist
1. Start backend (`npm run backend:dev`)
2. Start frontend (`npm run dev`) 
3. Start ngrok tunnels (`ngrok start --all`)
4. Get tunnel URLs (`curl localhost:4040/api/tunnels`)
5. Manually update `app/page.tsx` line 49 with new backend URL
6. Share frontend tunnel URL with collaborators

## Pro Tips

- **URL Management**: Consider using environment variables for ngrok URLs in production
- **Free Tier Limits**: ngrok free allows 1 simultaneous session, but multiple tunnels per session
- **Persistent URLs**: Upgrade to ngrok Pro for permanent URLs that don't change
- **Local Testing**: Always test locally first, then with ngrok
- **HTTPS**: ngrok provides HTTPS by default, which is required for many browser features

---

*Generated for HackTheNorth project - Real-time collaborative brainstorming application*
