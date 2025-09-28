# FoodRunner AI Backend

A Python/Flask backend that provides AI-powered restaurant recommendations for road trips. The system learns from user preferences and choices to provide increasingly personalized suggestions.

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- Google Places API key (optional - mock data available)
- Google Maps API key (optional - for enhanced route planning)

### Installation

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your API keys (optional - works with mock data)
```

5. Run the server:
```bash
python server.py
```

The server will start on `http://localhost:5000`

## 🔑 API Keys Setup

### Google Places API Key
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable the "Places API" 
4. Create credentials (API Key)
5. Add the key to your `.env` file: `GOOGLE_PLACES_API_KEY=your_key_here`

### Google Maps API Key (Optional)
1. In the same Google Cloud project
2. Enable "Maps JavaScript API" and "Directions API"
3. Create another API key or use the same one
4. Add to `.env`: `GOOGLE_MAPS_API_KEY=your_key_here`

**Note:** The system works with mock data if no API keys are provided.

## 📡 API Endpoints

### Restaurant Search
```http
POST /api/restaurants/search-along-route
Content-Type: application/json

{
  "start_coords": [40.7128, -74.0060],
  "end_coords": [34.0522, -118.2437],
  "radius_miles": 10.0,
  "user_id": "user123",
  "dietary_restrictions": ["vegetarian"],
  "preferred_cuisines": ["italian", "mexican"]
}
```

### Trip Management
```http
POST /api/trips/create
Content-Type: application/json

{
  "user_id": "user123",
  "name": "Weekend Road Trip",
  "start_location": {
    "lat": 40.7128,
    "lng": -74.0060,
    "address": "New York, NY"
  },
  "end_location": {
    "lat": 34.0522,
    "lng": -118.2437,
    "address": "Los Angeles, CA"
  },
  "meal_preferences": {
    "breakfast": {"enabled": true, "radius_miles": 5.0},
    "lunch": {"enabled": true, "radius_miles": 10.0},
    "dinner": {"enabled": true, "radius_miles": 15.0}
  }
}
```

### AI Recommendations
```http
POST /api/recommendations/personalized
Content-Type: application/json

{
  "user_id": "user123",
  "restaurants": [...],
  "user_preferences": {
    "dietary_restrictions": ["vegetarian"],
    "preferred_cuisines": ["italian"],
    "meal_type": "lunch"
  },
  "trip_context": {
    "start_coords": [40.7128, -74.0060],
    "end_coords": [34.0522, -118.2437],
    "max_radius_miles": 10.0
  }
}
```

## 🤖 AI Learning System

The system learns from user behavior through:

1. **Restaurant Selections** - Which restaurants users choose
2. **Distance Preferences** - How far users are willing to travel
3. **Cuisine Preferences** - Which cuisine types are preferred
4. **Price Tolerance** - Preferred price ranges
5. **Contextual Factors** - Time of day, trip type, etc.

### Learning Data Storage
- User profiles: `data/users/{user_id}.json`
- Interaction history: `data/users/{user_id}_interactions.json` 
- AI model data: `models/restaurant_recommender.pkl`

## 🎯 Features

### Core Features
- ✅ **Route-based restaurant search** with radius control (0.5-20 miles)
- ✅ **AI-powered personalized recommendations**  
- ✅ **Learning from user behavior** and preferences
- ✅ **Dietary restriction filtering**
- ✅ **Trip planning and management**
- ✅ **Mock data support** for development

### AI Features  
- **Composite Scoring**: Combines rating, distance, cuisine, and price preferences
- **Historical Learning**: Tracks user choices to improve future recommendations
- **Contextual Awareness**: Considers trip context and meal type
- **Preference Evolution**: Adapts to changing user preferences over time

## 🏗️ Architecture

```
backend/
├── app/
│   ├── __init__.py              # Flask app factory
│   ├── routes/                  # API endpoints
│   │   ├── restaurants.py       # Restaurant search & details
│   │   ├── trips.py            # Trip management
│   │   ├── recommendations.py   # AI recommendations
│   │   └── users.py            # User management
│   └── services/               # Business logic
│       ├── google_places.py    # Google Places API integration
│       └── ai_recommendations.py # AI recommendation engine
├── data/                       # File-based data storage
│   ├── users/                  # User profiles & interactions
│   ├── trips/                  # Trip data
│   └── restaurants/            # Restaurant cache
├── models/                     # AI models & training data
├── logs/                       # Application logs
└── server.py                   # Main entry point
```

## 🛠️ Development

### Running in Development Mode
```bash
export FLASK_ENV=development
export FLASK_DEBUG=True
python server.py
```

### Testing with Mock Data
The system automatically uses mock restaurant data when Google API keys are not configured, making it easy to test and develop.

### Data Storage
Uses JSON file storage for simplicity and portability. Files are automatically created in the `data/` directory.

## 🔧 Configuration

Environment variables in `.env`:
```env
FLASK_ENV=development
FLASK_DEBUG=True
FLASK_PORT=5000

# Google APIs (optional - uses mock data if not provided)
GOOGLE_PLACES_API_KEY=your_key_here
GOOGLE_MAPS_API_KEY=your_key_here

# AI Model settings
MODEL_RETRAIN_INTERVAL_HOURS=24
MIN_DATA_POINTS_FOR_TRAINING=10
```

## 📊 Monitoring

- **Health Check**: `GET /` returns server status
- **User Statistics**: `GET /api/recommendations/stats`
- **User Learning Data**: `GET /api/users/{user_id}/learning-data`

## 🚀 Production Deployment

For production deployment:

1. Set `FLASK_ENV=production`
2. Use a proper WSGI server (gunicorn included)
3. Set up proper logging and monitoring
4. Configure file permissions for data directory
5. Set up database backups for JSON files

```bash
gunicorn -w 4 -b 0.0.0.0:5000 server:app
```

## 🤝 Integration with React Native

The React Native app can connect to this backend by:

1. Setting the backend URL in the app configuration
2. Using the API endpoints for trip planning and recommendations
3. Recording user interactions for AI learning
4. Syncing user preferences and dietary restrictions

Example React Native integration:
```javascript
// In your React Native app
const BACKEND_URL = 'http://your-server:5000';

const searchRestaurants = async (tripData) => {
  const response = await fetch(`${BACKEND_URL}/api/restaurants/search-along-route`, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(tripData)
  });
  return response.json();
};
```