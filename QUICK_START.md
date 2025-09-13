# 🚀 Quick Start - Local Network Demo

## One-Command Setup

```bash
npm run demo:local
```

This interactive script will:
- Find your IP address
- Generate a room ID
- Provide shareable URLs
- Optionally start both services

## Manual Setup (3 steps)

```bash
# Step 1: Get your IP
npm run get-ip

# Step 2: Start backend (Terminal 1)
npm run backend:local

# Step 3: Start frontend (Terminal 2)  
npm run dev:local
```

## Share With Teammate

```
http://YOUR_IP:3000/?room=YOUR_ROOM_ID
```

Replace `YOUR_IP` with the IP from step 1, and create any room ID you like.

## What Changed From ngrok

| Before (ngrok) | After (Local Network) |
|----------------|----------------------|
| 100-500ms latency | 1-10ms latency |
| External servers | Direct connection |
| Complex setup | Simple IP sharing |
| Dependency on ngrok | No external tools |

## Performance Comparison

- **ngrok**: Noticeable cursor lag, requires internet
- **Local**: Instant cursor tracking, works offline

## Files Changed

- ✅ `backend/src/server.ts` - Binds to 0.0.0.0, accepts local IPs
- ✅ `app/page.tsx` - Auto-detects IP vs localhost
- ✅ `package.json` - New local network scripts
- ✅ Added scripts for IP detection and setup

## Need Help?

See `LOCAL_NETWORK_SETUP.md` for detailed troubleshooting.
