from flask import Blueprint, request, jsonify
import logging
from datetime import datetime
from typing import Dict
from ..services.ai_recommendations import ai_engine
from ..services.overpass_api import overpass_service
from ..services.openroute_service import openroute_service

logger = logging.getLogger(__name__)

recommendations_bp = Blueprint('recommendations', __name__)

@recommendations_bp.route('/personalized', methods=['POST'])
def get_personalized_recommendations():
    """
    Get personalized restaurant recommendations for a user
    
    Expected JSON body:
    {
        "user_id": "user123",
        "restaurants": [...list of restaurant objects...],
        "user_preferences": {
            "dietary_restrictions": ["vegetarian"],
            "preferred_cuisines": ["italian", "mexican"],
            "meal_type": "lunch"
        },
        "trip_context": {
            "start_coords": [40.7128, -74.0060],
            "end_coords": [34.0522, -118.2437],
            "max_radius_miles": 10.0,
            "meal_type": "lunch"
        }
    }
    """
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['user_id', 'restaurants', 'user_preferences', 'trip_context']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        user_id = data['user_id']
        restaurants = data['restaurants']
        user_preferences = data['user_preferences']
        trip_context = data['trip_context']
        
        if not restaurants:
            return jsonify({
                'recommendations': [],
                'message': 'No restaurants provided for recommendation'
            })
        
        # Get personalized recommendations
        recommendations = ai_engine.get_recommendations(
            user_id=user_id,
            restaurants=restaurants,
            dietary_restrictions=data.get('dietary_restrictions', [])
        )
        
        response = {
            'recommendations': recommendations,
            'total_count': len(recommendations),
            'user_id': user_id,
            'generated_at': datetime.now().isoformat()
        }
        
        return jsonify(response)
        
    except Exception as e:
        logger.error(f"Error getting personalized recommendations: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@recommendations_bp.route('/user-profile/<user_id>')
def get_user_profile(user_id):
    """Get user's learning profile and preferences"""
    try:
        user_profile = ai_engine._load_user_profile(user_id)
        user_interactions = ai_engine._load_user_interactions(user_id)
        
        # Calculate some interesting stats
        profile_stats = {
            'user_id': user_id,
            'total_cuisines_tried': len(user_history.get('cuisine_frequency', {})),
            'most_preferred_cuisines': _get_top_cuisines(user_history.get('cuisine_frequency', {})),
            'average_distance_preference': _calculate_average_distance(user_history.get('selected_distances', [])),
            'average_price_preference': _calculate_average_price(user_history.get('selected_price_levels', [])),
            'total_restaurants_visited': len(user_history.get('similar_restaurants', [])),
            'last_updated': user_history.get('last_updated', 'Never')
        }
        
        return jsonify({
            'profile': profile_stats,
            'raw_data': user_history
        })
        
    except Exception as e:
        logger.error(f"Error getting user profile: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@recommendations_bp.route('/record-feedback', methods=['POST'])
def record_user_feedback():
    """
    Record user feedback on recommendations for AI improvement
    
    Expected JSON body:
    {
        "user_id": "user123",
        "restaurant": {...restaurant object...},
        "feedback": {
            "rating": 4.5,
            "liked": true,
            "visited": true,
            "comments": "Great recommendation!"
        },
        "trip_context": {...trip context...}
    }
    """
    try:
        data = request.get_json()
        
        required_fields = ['user_id', 'restaurant', 'feedback']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        user_id = data['user_id']
        restaurant = data['restaurant']
        feedback = data['feedback']
        trip_context = data.get('trip_context', {})
        
        # Determine action based on feedback
        action = 'rated'
        if feedback.get('visited'):
            action = 'visited'
        elif feedback.get('liked'):
            action = 'selected'
        else:
            action = 'dismissed'
        
        # Add feedback data to restaurant object
        restaurant['user_feedback'] = feedback
        
        # Record the interaction
        ai_engine.record_user_interaction(
            user_id=user_id,
            restaurant=restaurant,
            interaction_type=action,
            rating=feedback.get('rating') if feedback else None
        )
        
        return jsonify({
            'message': 'Feedback recorded successfully',
            'user_id': user_id,
            'action': action
        })
        
    except Exception as e:
        logger.error(f"Error recording user feedback: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@recommendations_bp.route('/retrain-model', methods=['POST'])
def retrain_model():
    """
    Manual trigger for model updates (with simple AI, this just returns success)
    """
    try:
        # Simple AI system doesn't need explicit retraining
        return jsonify({
            'message': 'AI system updated (learning happens automatically)',
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f"Error retraining model: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@recommendations_bp.route('/stats')
def get_recommendation_stats():
    """Get overall recommendation system statistics"""
    try:
        # This would normally query your data to get real stats
        # For now, returning mock stats
        stats = {
            'total_users': 0,
            'total_interactions': 0,
            'total_restaurants_recommended': 0,
            'model_accuracy': 0.85,
            'last_model_update': 'Never',
            'top_cuisines_globally': ['Italian', 'Mexican', 'American', 'Asian', 'Mediterranean'],
            'average_recommendation_score': 0.78
        }
        
        # Try to get real data from files if available
        try:
            import glob
            
            # Count users
            user_files = glob.glob(os.path.join('data', 'users', '*_profile.json'))
            stats['total_users'] = len(user_files)
            
            # Count interactions
            interaction_files = glob.glob(os.path.join('data', 'users', '*_interactions.json'))
            total_interactions = 0
            for file_path in interaction_files:
                try:
                    with open(file_path, 'r') as f:
                        import json
                        interactions = json.load(f)
                        total_interactions += len(interactions)
                except:
                    pass
            stats['total_interactions'] = total_interactions
            
        except Exception:
            pass  # Use default values
        
        return jsonify(stats)
        
    except Exception as e:
        logger.error(f"Error getting recommendation stats: {e}")
        return jsonify({'error': 'Internal server error'}), 500

def _get_top_cuisines(cuisine_frequency: dict, top_n: int = 5) -> list:
    """Get top N most preferred cuisines"""
    if not cuisine_frequency:
        return []
    
    sorted_cuisines = sorted(cuisine_frequency.items(), key=lambda x: x[1], reverse=True)
    return [cuisine for cuisine, count in sorted_cuisines[:top_n]]

def _calculate_average_distance(distances: list) -> float:
    """Calculate average preferred distance"""
    if not distances:
        return 0.0
    
    return round(sum(distances) / len(distances), 2)

def _calculate_average_price(price_levels: list) -> float:
    """Calculate average preferred price level"""
    if not price_levels:
        return 2.0  # Default to moderate pricing
    
    return round(sum(price_levels) / len(price_levels), 2)

# Add this method to RestaurantRecommendationEngine if not present
def _get_current_timestamp():
    from datetime import datetime
    return datetime.utcnow().isoformat()

@recommendations_bp.route('/learn-selections', methods=['POST'])
def learn_from_selections():
    """
    Learn from user restaurant selections to improve future recommendations
    
    Expected JSON body:
    {
        "user_id": "user123",
        "trip_context": {
            "start_coords": [40.7128, -74.0060],
            "end_coords": [34.0522, -118.2437],
            "departure_time": "09:00 AM",
            "total_distance_miles": 2789.5,
            "travel_duration_hours": 41.2
        },
        "selected_restaurants": [
            {
                "osm_id": 12345,
                "name": "Joe's Italian",
                "cuisine": "italian",
                "meal_type": "lunch",
                "lat": 39.9526, 
                "lon": -75.1652,
                "distance_from_route_miles": 2.3,
                "price_level": 2,
                "rating": 4.2,
                "dietary_info": {"vegetarian": true}
            }
        ],
        "rejected_restaurants": [
            {
                "osm_id": 67890,
                "name": "Fast Burger",
                "cuisine": "fast_food", 
                "meal_type": "lunch",
                "rejection_reason": "too_expensive"
            }
        ],
        "user_preferences": {
            "dietary_restrictions": ["vegetarian"],
            "preferred_cuisines": ["italian", "mexican"],
            "daily_budget": 50.0
        }
    }
    """
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['user_id', 'selected_restaurants']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        user_id = data['user_id']
        selected_restaurants = data['selected_restaurants']
        rejected_restaurants = data.get('rejected_restaurants', [])
        trip_context = data.get('trip_context', {})
        user_preferences = data.get('user_preferences', {})
        
        logger.info(f"Learning from {len(selected_restaurants)} selected restaurants for user {user_id}")
        
        # Prepare learning data for AI engine
        learning_data = {
            'user_id': user_id,
            'timestamp': datetime.utcnow().isoformat(),
            'trip_context': trip_context,
            'user_preferences': user_preferences,
            'interactions': []
        }
        
        # Process selected restaurants (positive feedback)
        for restaurant in selected_restaurants:
            interaction = {
                'restaurant_id': str(restaurant.get('osm_id', '')),
                'restaurant_name': restaurant.get('name', ''),
                'cuisine': restaurant.get('cuisine', ''),
                'meal_type': restaurant.get('meal_type', ''),
                'coordinates': [restaurant.get('lat'), restaurant.get('lon')],
                'distance_from_route_miles': restaurant.get('distance_from_route_miles', 0),
                'price_level': restaurant.get('price_level', 2),
                'rating': restaurant.get('rating', 3.0),
                'dietary_info': restaurant.get('dietary_info', {}),
                'interaction_type': 'selected',
                'feedback_score': 1.0  # Positive feedback
            }
            learning_data['interactions'].append(interaction)
        
        # Process rejected restaurants (negative feedback)
        for restaurant in rejected_restaurants:
            interaction = {
                'restaurant_id': str(restaurant.get('osm_id', '')),
                'restaurant_name': restaurant.get('name', ''),
                'cuisine': restaurant.get('cuisine', ''),
                'meal_type': restaurant.get('meal_type', ''),
                'rejection_reason': restaurant.get('rejection_reason', 'other'),
                'interaction_type': 'rejected',
                'feedback_score': -0.5  # Negative feedback
            }
            learning_data['interactions'].append(interaction)
        
        # Send to AI engine for learning
        learning_result = ai_engine.learn_from_user_choices(learning_data)
        
        # Store interaction data for future analysis
        _store_user_interactions(user_id, learning_data)
        
        return jsonify({
            'message': 'Successfully learned from user selections',
            'interactions_processed': len(learning_data['interactions']),
            'learning_result': learning_result,
            'user_id': user_id
        })
        
    except Exception as e:
        logger.error(f"Error learning from selections: {e}")
        return jsonify({'error': 'Internal server error'}), 500

def _store_user_interactions(user_id: str, learning_data: Dict):
    """Store user interaction data for analysis"""
    try:
        import json
        import os
        
        # Create interactions file path
        interactions_file = os.path.join('data', 'users', f'{user_id}_interactions.json')
        os.makedirs(os.path.dirname(interactions_file), exist_ok=True)
        
        # Load existing interactions
        interactions = []
        if os.path.exists(interactions_file):
            with open(interactions_file, 'r') as f:
                interactions = json.load(f)
        
        # Add new interaction data
        interactions.append(learning_data)
        
        # Keep only last 100 interactions to prevent file bloat
        if len(interactions) > 100:
            interactions = interactions[-100:]
        
        # Save updated interactions
        with open(interactions_file, 'w') as f:
            json.dump(interactions, f, indent=2)
        
        logger.info(f"Stored interaction data for user {user_id}")
        
    except Exception as e:
        logger.error(f"Error storing user interactions: {e}")