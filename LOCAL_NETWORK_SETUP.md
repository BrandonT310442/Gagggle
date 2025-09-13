# 🌐 Local Network Whiteboard Demo Setup

## Quick Start (TL;DR)

**For the impatient developer:**

```bash
# Terminal 1: Get your IP and start backend
./scripts/get-local-ip.sh
npm run backend:local

# Terminal 2: Start frontend  
npm run dev:local

# Share this URL with your teammate:
# http://YOUR_IP:3000/?room=YOUR_ROOM_ID
```

---

## Prerequisites

✅ **Both you and your teammate must be on the same WiFi network**  
✅ **Your ports 3000 and 3001 should be available**  
✅ **Basic terminal/command line familiarity**

---

## Step 1: Find Your Local IP Address

### Automatic Method (Recommended)
```bash
npm run get-ip
```

This will automatically detect your local IP address and save it for easy access.

### Manual Method (Backup)

**macOS:**
```bash
ifconfig en0 | grep inet
```

**Linux:**
```bash
hostname -I
```

**Windows (PowerShell):**
```cmd
ipconfig | findstr IPv4
```

Look for an IP like `192.168.1.100` or `10.0.0.50` - **avoid `127.0.0.1`**

---

## Step 2: Start Your Services

### Terminal 1 - Backend Server
```bash
npm run backend:local
```

You should see:
```
🚀 BrainstormBoard Backend Server running on all interfaces port 3001
🌐 Backend accessible on local network...
```

### Terminal 2 - Frontend Server  
```bash
npm run dev:local
```

You should see:
```
▲ Next.js 15.5.3
- Local:        http://localhost:3000
- Network:      http://192.168.1.100:3000
```

**Important:** Use the "Network" URL, not "Local"!

---

## Step 3: Test Your Setup

1. **First, test on your own machine:**
   - Visit: `http://YOUR_IP:3000` (replace YOUR_IP with actual IP)
   - You should see the whiteboard interface
   - Move your mouse around - you should see your cursor

2. **Check backend connectivity:**
   - Visit: `http://YOUR_IP:3001/health`
   - Should return: `{"status":"healthy",...}`

---

## Step 4: Create a Room and Share

1. **Generate a room URL:**
   ```
   http://YOUR_IP:3000/?room=demo123
   ```

2. **Share with your teammate:**
   - Send them the exact URL above
   - Make sure they're on the same WiFi network

3. **Test real-time collaboration:**
   - Both of you should see each other's cursors
   - Latency should be near-instant (1-10ms)

---

## Step 5: Expected Performance

### ✅ Local Network (What you want)
- **Latency:** 1-10ms (feels instant)
- **Connection:** Direct IP address
- **Speed:** Near real-time cursor tracking

### ❌ ngrok (What you're replacing)  
- **Latency:** 100-500ms (noticeable delay)
- **Connection:** Through external servers
- **Speed:** Visible lag in cursor movement

---

## Troubleshooting Guide

### Problem: Teammate can't connect

**Check:**
- ✅ Same WiFi network?
- ✅ Correct IP address in URL?
- ✅ Both services running?
- ✅ Firewall blocking ports?

**Solutions:**
```bash
# Restart services
npm run backend:local  # Terminal 1
npm run dev:local      # Terminal 2

# Check if IP changed
npm run get-ip
```

### Problem: CORS errors in browser console

**Solution:** The backend is pre-configured for local networks, but if you see CORS errors:

1. Check the browser console for the exact error
2. Verify your IP is in the 192.168.x.x, 10.x.x.x, or 172.x.x.x range
3. Restart the backend service

### Problem: Still using localhost

**Make sure you're using:**
- ✅ `http://192.168.1.100:3000` (your actual IP)
- ❌ `http://localhost:3000` (won't work for teammates)

### Problem: Slow performance

**Check:**
- ✅ Using IP address, not ngrok
- ✅ Strong WiFi signal
- ✅ No VPN interfering
- ✅ Firewall not scanning packets

---

## Advanced: Custom Room IDs

```bash
# Generate a memorable room ID
ROOM_ID="demo-$(date +%s)"
echo "Room URL: http://$(cat .local-ip):3000/?room=$ROOM_ID"
```

---

## Script Reference

| Command | Purpose |
|---------|---------|
| `npm run get-ip` | Find and display your local IP |
| `npm run dev:local` | Start frontend on all interfaces |
| `npm run backend:local` | Start backend on all interfaces |
| `npm run demo:local` | Quick IP check and instructions |

---

## Comparison: Before vs After

### Before (ngrok)
```bash
# Complex setup with external dependencies
ngrok http 3001
# Update config files with ngrok URL
# Share ngrok URL with teammate
# Deal with 100-500ms latency
```

### After (Local Network)
```bash
# Simple, direct connection
npm run get-ip
npm run backend:local
npm run dev:local
# Share IP URL with teammate  
# Enjoy 1-10ms latency
```

---

## Security Notes

- **Local network only:** Your whiteboard is only accessible on your WiFi network
- **No external servers:** Traffic stays on your local network
- **Temporary:** Services stop when you close terminals
- **Room-based:** Each room is isolated

---

## Need Help?

1. **Check service status:**
   ```bash
   curl http://YOUR_IP:3001/health
   ```

2. **Verify network connectivity:**
   ```bash
   ping YOUR_IP
   ```

3. **Reset everything:**
   ```bash
   # Stop services (Ctrl+C in both terminals)
   npm run get-ip      # Get fresh IP
   npm run backend:local    # Restart backend
   npm run dev:local       # Restart frontend
   ```

**Happy collaborating! 🚀**
