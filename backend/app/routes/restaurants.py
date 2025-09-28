from flask import Blueprint, request, jsonify
from app.services.google_places import GooglePlacesService
from app.services.ai_recommendations import ai_engine
import logging

logger = logging.getLogger(__name__)

restaurants_bp = Blueprint('restaurants', __name__)
places_service = GooglePlacesService()

@restaurants_bp.route('/search-along-route', methods=['POST'])
def search_restaurants_along_route():
    """
    Search for restaurants along a route between two points
    
    Expected JSON body:
    {
        "start_coords": [latitude, longitude],
        "end_coords": [latitude, longitude], 
        "radius_miles": 5.0,
        "user_id": "user123",
        "dietary_restrictions": ["vegetarian", "gluten-free"],
        "preferred_cuisines": ["italian", "mexican"],
        "meal_type": "lunch"
    }
    """
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['start_coords', 'end_coords', 'user_id']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        # Extract parameters
        start_coords = tuple(data['start_coords'])
        end_coords = tuple(data['end_coords'])
        radius_miles = data.get('radius_miles', 5.0)
        user_id = data['user_id']
        dietary_restrictions = data.get('dietary_restrictions', [])
        preferred_cuisines = data.get('preferred_cuisines', [])
        meal_type = data.get('meal_type', 'lunch')
        
        # Validate coordinates
        if not (isinstance(start_coords, tuple) and len(start_coords) == 2):
            return jsonify({'error': 'Invalid start_coords format'}), 400
        if not (isinstance(end_coords, tuple) and len(end_coords) == 2):
            return jsonify({'error': 'Invalid end_coords format'}), 400
        
        # Validate radius
        if not (0.5 <= radius_miles <= 20):
            return jsonify({'error': 'radius_miles must be between 0.5 and 20'}), 400
        
        # Search for restaurants
        restaurants = places_service.search_restaurants_along_route(
            start_coords=start_coords,
            end_coords=end_coords,
            radius_miles=radius_miles,
            cuisine_types=preferred_cuisines
        )
        
        if not restaurants:
            return jsonify({
                'restaurants': [],
                'message': 'No restaurants found along the specified route'
            })
        
        # Get personalized recommendations
        user_preferences = {
            'dietary_restrictions': dietary_restrictions,
            'preferred_cuisines': preferred_cuisines,
            'meal_type': meal_type
        }
        
        trip_context = {
            'start_coords': start_coords,
            'end_coords': end_coords,
            'max_radius_miles': radius_miles,
            'meal_type': meal_type
        }
        
        recommended_restaurants = ai_engine.get_recommendations(
            user_id=user_id,
            restaurants=restaurants,
            dietary_restrictions=dietary_restrictions
        )
        
        # Format response
        response = {
            'total_found': len(restaurants),
            'restaurants': recommended_restaurants[:20],  # Limit to top 20
            'search_params': {
                'start_coords': start_coords,
                'end_coords': end_coords,
                'radius_miles': radius_miles,
                'dietary_restrictions': dietary_restrictions,
                'preferred_cuisines': preferred_cuisines
            }
        }
        
        return jsonify(response)
        
    except Exception as e:
        logger.error(f"Error in search_restaurants_along_route: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@restaurants_bp.route('/details/<place_id>')
def get_restaurant_details(place_id):
    """Get detailed information about a specific restaurant"""
    try:
        details = places_service.get_restaurant_details(place_id)
        
        if not details:
            return jsonify({'error': 'Restaurant not found'}), 404
        
        return jsonify(details)
        
    except Exception as e:
        logger.error(f"Error getting restaurant details: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@restaurants_bp.route('/record-interaction', methods=['POST'])
def record_restaurant_interaction():
    """
    Record user interaction with a restaurant for AI learning
    
    Expected JSON body:
    {
        "user_id": "user123",
        "restaurant": {...restaurant_object...},
        "action": "selected|dismissed|visited|rated",
        "trip_context": {...trip_context...},
        "rating": 4.5 (optional, for rated action)
    }
    """
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['user_id', 'restaurant', 'action']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        user_id = data['user_id']
        restaurant = data['restaurant']
        action = data['action']
        trip_context = data.get('trip_context', {})
        rating = data.get('rating')
        
        # Validate action
        valid_actions = ['selected', 'dismissed', 'visited', 'rated']
        if action not in valid_actions:
            return jsonify({'error': f'Invalid action. Must be one of: {valid_actions}'}), 400
        
        # Add rating to restaurant if provided
        if rating is not None and action == 'rated':
            restaurant['user_rating'] = rating
        
        # Record interaction
        ai_engine.record_user_interaction(
            user_id=user_id,
            restaurant=restaurant,
            interaction_type=action,
            trip_id=trip_context.get('trip_id')
        )
        
        return jsonify({
            'message': 'Interaction recorded successfully',
            'user_id': user_id,
            'action': action
        })
        
    except Exception as e:
        logger.error(f"Error recording restaurant interaction: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@restaurants_bp.route('/nearby', methods=['POST'])
def search_nearby_restaurants():
    """
    Search for restaurants near a single location
    
    Expected JSON body:
    {
        "location": [latitude, longitude],
        "radius_miles": 5.0,
        "cuisine_types": ["italian", "mexican"] (optional)
    }
    """
    try:
        data = request.get_json()
        
        if 'location' not in data:
            return jsonify({'error': 'Missing required field: location'}), 400
        
        location = tuple(data['location'])
        radius_miles = data.get('radius_miles', 5.0)
        cuisine_types = data.get('cuisine_types', None)
        
        # Validate location
        if not (isinstance(location, tuple) and len(location) == 2):
            return jsonify({'error': 'Invalid location format'}), 400
        
        # Validate radius
        if not (0.5 <= radius_miles <= 20):
            return jsonify({'error': 'radius_miles must be between 0.5 and 20'}), 400
        
        # Convert miles to meters
        radius_meters = int(radius_miles * 1609.34)
        
        # Search for restaurants
        restaurants = places_service._search_nearby_restaurants(
            location=location,
            radius=radius_meters,
            cuisine_types=cuisine_types
        )
        
        response = {
            'total_found': len(restaurants),
            'restaurants': restaurants,
            'search_params': {
                'location': location,
                'radius_miles': radius_miles,
                'cuisine_types': cuisine_types
            }
        }
        
        return jsonify(response)
        
    except Exception as e:
        logger.error(f"Error in search_nearby_restaurants: {e}")
        return jsonify({'error': 'Internal server error'}), 500