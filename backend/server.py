#!/usr/bin/env python3
"""
FoodRunner AI Backend Server

This server provides AI-powered restaurant recommendations for road trips.
It learns from user preferences and choices to provide increasingly personalized suggestions.

Usage:
    python server.py

Environment Variables:
    FLASK_ENV=development|production
    FLASK_DEBUG=True|False
    FLASK_PORT=5000
    GOOGLE_PLACES_API_KEY=your_api_key_here
    GOOGLE_MAPS_API_KEY=your_api_key_here
"""

import os
import sys
import logging
from dotenv import load_dotenv

# Add app directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Load environment variables
load_dotenv()

from app import create_app

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

def main():
    """Main entry point for the FoodRunner backend server"""
    
    # Create Flask app
    app = create_app()
    
    # Configure logging
    log_level = logging.DEBUG if app.config['DEBUG'] else logging.INFO
    logging.basicConfig(
        level=log_level,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    
    logger = logging.getLogger(__name__)
    
    # Check for API keys in development
    api_key = os.getenv('GOOGLE_PLACES_API_KEY', 'YOUR_GOOGLE_PLACES_API_KEY_HERE')
    if api_key == 'YOUR_GOOGLE_PLACES_API_KEY_HERE':
        logger.warning("🔑 Google Places API key not set - using mock data")
        logger.warning("   Set GOOGLE_PLACES_API_KEY environment variable for real data")
    
    # Get port and host
    port = int(os.getenv('FLASK_PORT', 5000))
    host = '0.0.0.0'
    
    # Print startup info
    logger.info("🍔 FoodRunner AI Backend Starting...")
    logger.info(f"   Environment: {os.getenv('FLASK_ENV', 'development')}")
    logger.info(f"   Debug Mode: {app.config['DEBUG']}")
    logger.info(f"   Server: http://{host}:{port}")
    logger.info(f"   Health Check: http://{host}:{port}/")
    
    # Print API endpoints
    logger.info("📡 Available API Endpoints:")
    logger.info("   POST /api/restaurants/search-along-route - Search restaurants along route")
    logger.info("   POST /api/restaurants/nearby - Search nearby restaurants")
    logger.info("   POST /api/trips/create - Create new trip")
    logger.info("   POST /api/recommendations/personalized - Get AI recommendations")
    logger.info("   POST /api/users/create - Create user profile")
    
    # Start the server
    try:
        app.run(
            host=host,
            port=port,
            debug=app.config['DEBUG'],
            use_reloader=True if app.config['DEBUG'] else False
        )
    except KeyboardInterrupt:
        logger.info("👋 FoodRunner Backend shutting down...")
    except Exception as e:
        logger.error(f"❌ Server error: {e}")
        sys.exit(1)

if __name__ == '__main__':
    # Create Flask application
    app = create_app()
    
    # Development configuration
    app.config['DEBUG'] = True
    
    # Initialize data directories
    data_dirs = ['data', 'logs', 'models']
    for directory in data_dirs:
        if not os.path.exists(directory):
            os.makedirs(directory)
            logger.info(f"Created directory: {directory}")
    
    # Start the development server
    logger.info("Starting FoodRunner Backend Server...")
    logger.info(f"Environment: {app.config.get('ENV', 'development')}")
    logger.info(f"Debug mode: {app.config.get('DEBUG', False)}")
    
    try:
        app.run(
            host='0.0.0.0',
            port=3001,  # Changed from 5000 to 3001
            debug=True,
            threaded=True
        )
    except Exception as e:
        logger.error(f"Failed to start server: {e}")
        raise