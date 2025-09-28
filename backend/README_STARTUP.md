# 🍕 FoodRunner Backend - Quick Start Guide

## How to Start the Server

### Option 1: Using the Startup Script (Recommended)
```bash
cd /Users/krrishk/foodrunner/backend
./start_server.sh
```

### Option 2: Manual Start
```bash
cd /Users/krrishk/foodrunner/backend
/Users/krrishk/foodrunner/backend/venv/bin/python3 test_server.py
```

## How to Know It's Working

When the server starts successfully, you'll see:
```
✅ Flask app created successfully!
✅ AI engine and Google Places imported successfully!
🚀 Starting server on http://localhost:3001...
* Running on http://127.0.0.1:3001
* Debugger is active!
```

## Testing the Server

### Quick Health Check
Open a new terminal and run:
```bash
curl http://localhost:3001/health
```

Should return:
```json
{
  "status": "healthy",
  "timestamp": "2025-09-28T...",
  "version": "1.0.0",
  "ai_engine": "operational",
  "google_places": "operational"
}
```

### Full API Test Suite
```bash
cd /Users/krrishk/foodrunner/backend
python3 test_api.py
```

This will test all endpoints and show you exactly what's working.

## What the Backend Does

✅ **AI-Powered Recommendations**: Learns your food preferences over multiple road trips
✅ **Route-Based Search**: Finds restaurants within 0.5-20 miles of your travel route  
✅ **Google Places Integration**: Real restaurant data (currently using mock data for development)
✅ **User Learning**: Tracks distance preferences, cuisine choices, and ratings
✅ **Trip Management**: Creates and manages road trip data
✅ **Real-time Feedback**: Records user interactions to improve recommendations

## API Endpoints Available

- `GET /health` - Check server status
- `POST /restaurants/search-along-route` - Find restaurants along your route
- `POST /recommendations/personalized` - Get AI recommendations
- `POST /recommendations/feedback` - Record user feedback
- `POST /trips/create` - Create new road trip
- `POST /trips/{id}/select-restaurant` - Record restaurant selections

## Next Steps

1. Start the server using the startup script
2. Run the test suite to verify everything works
3. Update your React Native app to call `http://localhost:3001`
4. Replace the mock Google API keys in `.env` when you get real ones

## Troubleshooting

If the server won't start:
1. Make sure you're in the `/Users/krrishk/foodrunner/backend` directory
2. Check that the virtual environment exists: `ls -la venv/`
3. Verify Python 3.13 is installed: `python3 --version`
4. Check port 3001 isn't in use: `lsof -i :3001`

The server is designed to be robust and includes comprehensive error handling and logging.