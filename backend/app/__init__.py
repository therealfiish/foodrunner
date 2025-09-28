from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from dotenv import load_dotenv
import logging
from datetime import datetime

# Load environment variables
load_dotenv()

def create_app():
    app = Flask(__name__)
    
    # Configuration
    app.config['DEBUG'] = os.getenv('FLASK_DEBUG', 'False').lower() == 'true'
    app.config['SECRET_KEY'] = os.urandom(24)
    
    # Enable CORS for React Native app
    CORS(app, origins=["*"])
    
    # Setup logging
    if not os.path.exists('logs'):
        os.makedirs('logs')
    
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
        handlers=[
            logging.FileHandler('logs/app.log'),
            logging.StreamHandler()
        ]
    )
    
    # Initialize data directories
    data_dirs = ['data', 'data/users', 'data/trips', 'data/restaurants', 'models', 'logs']
    for dir_path in data_dirs:
        if not os.path.exists(dir_path):
            os.makedirs(dir_path)
    
    # Register blueprints
    from app.routes.restaurants import restaurants_bp
    from app.routes.trips import trips_bp
    from app.routes.recommendations import recommendations_bp
    from app.routes.users import users_bp
    
    app.register_blueprint(restaurants_bp, url_prefix='/api/restaurants')
    app.register_blueprint(trips_bp, url_prefix='/api/trips')
    app.register_blueprint(recommendations_bp, url_prefix='/api/recommendations')
    app.register_blueprint(users_bp, url_prefix='/api/users')
    
    # Health check endpoint
    @app.route('/')
    def health_check():
        return jsonify({
            'status': 'healthy',
            'message': 'FoodRunner AI Backend is running!',
            'timestamp': datetime.utcnow().isoformat(),
            'version': '1.0.0'
        })
    
    # Error handlers
    @app.errorhandler(404)
    def not_found(error):
        return jsonify({'error': 'Endpoint not found'}), 404
    
    @app.errorhandler(500)
    def internal_error(error):
        app.logger.error(f'Server Error: {error}')
        return jsonify({'error': 'Internal server error'}), 500
    
    return app

if __name__ == '__main__':
    app = create_app()
    port = int(os.getenv('FLASK_PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)