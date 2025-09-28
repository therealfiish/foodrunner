#!/bin/bash

# FoodRunner Backend Startup Script

echo "🍕 FoodRunner Backend Startup"
echo "================================"

# Navigate to backend directory
cd /Users/krrishk/foodrunner/backend

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "❌ Virtual environment not found! Creating one..."
    python3 -m venv venv
    source venv/bin/activate
    pip install -r requirements.txt
else
    echo "✅ Virtual environment found"
fi

# Start the server
echo "🚀 Starting FoodRunner AI Backend Server..."
echo "   - Server will run on: http://localhost:3001"
echo "   - Press Ctrl+C to stop the server"
echo "   - Server includes:"
echo "     * AI-powered restaurant recommendations"
echo "     * Google Places integration (mock data ready)"
echo "     * Route-based restaurant search"
echo "     * User preference learning"
echo ""

# Run the server
/Users/krrishk/foodrunner/backend/venv/bin/python3 test_server.py