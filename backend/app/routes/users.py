from flask import Blueprint, request, jsonify
import json
import os
from datetime import datetime
import uuid
import logging

logger = logging.getLogger(__name__)

users_bp = Blueprint('users', __name__)
data_dir = 'data'

@users_bp.route('/create', methods=['POST'])
def create_user():
    """
    Create a new user profile
    
    Expected JSON body:
    {
        "name": "John Doe",
        "email": "john@example.com",
        "dietary_restrictions": ["vegetarian", "gluten-free"],
        "preferred_cuisines": ["italian", "mexican", "indian"],
        "meal_preferences": {
            "breakfast": {
                "enabled": true,
                "preferred_time": "08:00",
                "max_radius_miles": 5.0
            },
            "lunch": {
                "enabled": true,
                "preferred_time": "12:00", 
                "max_radius_miles": 10.0
            },
            "dinner": {
                "enabled": true,
                "preferred_time": "18:00",
                "max_radius_miles": 15.0
            }
        }
    }
    """
    try:
        data = request.get_json()
        
        # Generate user ID
        user_id = str(uuid.uuid4())
        
        # Create user profile
        user = {
            'user_id': user_id,
            'name': data.get('name', ''),
            'email': data.get('email', ''),
            'created_at': datetime.utcnow().isoformat(),
            'updated_at': datetime.utcnow().isoformat(),
            'dietary_restrictions': data.get('dietary_restrictions', []),
            'preferred_cuisines': data.get('preferred_cuisines', []),
            'meal_preferences': data.get('meal_preferences', {
                'breakfast': {'enabled': True, 'preferred_time': '08:00', 'max_radius_miles': 5.0},
                'lunch': {'enabled': True, 'preferred_time': '12:00', 'max_radius_miles': 10.0},
                'dinner': {'enabled': True, 'preferred_time': '18:00', 'max_radius_miles': 15.0}
            }),
            'preferences_version': '1.0'
        }
        
        # Save user profile
        user_file = os.path.join(data_dir, 'users', f'{user_id}.json')
        os.makedirs(os.path.dirname(user_file), exist_ok=True)
        
        with open(user_file, 'w') as f:
            json.dump(user, f, indent=2)
        
        return jsonify({
            'message': 'User created successfully',
            'user_id': user_id,
            'user': user
        }), 201
        
    except Exception as e:
        logger.error(f"Error creating user: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@users_bp.route('/<user_id>')
def get_user(user_id):
    """Get user profile by ID"""
    try:
        user_file = os.path.join(data_dir, 'users', f'{user_id}.json')
        
        if not os.path.exists(user_file):
            return jsonify({'error': 'User not found'}), 404
        
        with open(user_file, 'r') as f:
            user = json.load(f)
        
        return jsonify(user)
        
    except Exception as e:
        logger.error(f"Error getting user: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@users_bp.route('/<user_id>', methods=['PUT'])
def update_user(user_id):
    """
    Update user profile
    
    Expected JSON body can include any user fields to update
    """
    try:
        user_file = os.path.join(data_dir, 'users', f'{user_id}.json')
        
        if not os.path.exists(user_file):
            return jsonify({'error': 'User not found'}), 404
        
        # Load existing user
        with open(user_file, 'r') as f:
            user = json.load(f)
        
        # Update with new data
        update_data = request.get_json()
        user.update(update_data)
        user['updated_at'] = datetime.utcnow().isoformat()
        
        # Save updated user
        with open(user_file, 'w') as f:
            json.dump(user, f, indent=2)
        
        return jsonify({
            'message': 'User updated successfully',
            'user': user
        })
        
    except Exception as e:
        logger.error(f"Error updating user: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@users_bp.route('/<user_id>/preferences')
def get_user_preferences(user_id):
    """Get user's meal and dietary preferences"""
    try:
        user_file = os.path.join(data_dir, 'users', f'{user_id}.json')
        
        if not os.path.exists(user_file):
            return jsonify({'error': 'User not found'}), 404
        
        with open(user_file, 'r') as f:
            user = json.load(f)
        
        preferences = {
            'dietary_restrictions': user.get('dietary_restrictions', []),
            'preferred_cuisines': user.get('preferred_cuisines', []),
            'meal_preferences': user.get('meal_preferences', {}),
            'last_updated': user.get('updated_at', user.get('created_at'))
        }
        
        return jsonify(preferences)
        
    except Exception as e:
        logger.error(f"Error getting user preferences: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@users_bp.route('/<user_id>/preferences', methods=['PUT'])
def update_user_preferences(user_id):
    """
    Update user's preferences
    
    Expected JSON body:
    {
        "dietary_restrictions": ["vegetarian"],
        "preferred_cuisines": ["italian", "thai"],
        "meal_preferences": {
            "breakfast": {
                "enabled": true,
                "preferred_time": "08:00",
                "max_radius_miles": 3.0
            },
            ...
        }
    }
    """
    try:
        user_file = os.path.join(data_dir, 'users', f'{user_id}.json')
        
        if not os.path.exists(user_file):
            return jsonify({'error': 'User not found'}), 404
        
        # Load existing user
        with open(user_file, 'r') as f:
            user = json.load(f)
        
        # Update preferences
        update_data = request.get_json()
        
        if 'dietary_restrictions' in update_data:
            user['dietary_restrictions'] = update_data['dietary_restrictions']
        
        if 'preferred_cuisines' in update_data:
            user['preferred_cuisines'] = update_data['preferred_cuisines']
        
        if 'meal_preferences' in update_data:
            user['meal_preferences'] = update_data['meal_preferences']
        
        user['updated_at'] = datetime.utcnow().isoformat()
        
        # Save updated user
        with open(user_file, 'w') as f:
            json.dump(user, f, indent=2)
        
        return jsonify({
            'message': 'Preferences updated successfully',
            'preferences': {
                'dietary_restrictions': user['dietary_restrictions'],
                'preferred_cuisines': user['preferred_cuisines'],
                'meal_preferences': user['meal_preferences']
            }
        })
        
    except Exception as e:
        logger.error(f"Error updating user preferences: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@users_bp.route('/<user_id>/learning-data')
def get_user_learning_data(user_id):
    """Get user's AI learning data and statistics"""
    try:
        # Load learning profile
        profile_file = os.path.join(data_dir, 'users', f'{user_id}_profile.json')
        interactions_file = os.path.join(data_dir, 'users', f'{user_id}_interactions.json')
        trips_file = os.path.join(data_dir, 'users', f'{user_id}_trips.json')
        
        learning_data = {
            'user_id': user_id,
            'profile': {},
            'recent_interactions': [],
            'trip_history': [],
            'statistics': {}
        }
        
        # Load profile if exists
        if os.path.exists(profile_file):
            with open(profile_file, 'r') as f:
                learning_data['profile'] = json.load(f)
        
        # Load recent interactions
        if os.path.exists(interactions_file):
            with open(interactions_file, 'r') as f:
                interactions = json.load(f)
                # Get last 10 interactions
                learning_data['recent_interactions'] = interactions[-10:]
        
        # Load trip IDs
        if os.path.exists(trips_file):
            with open(trips_file, 'r') as f:
                trip_ids = json.load(f)
                learning_data['trip_history'] = trip_ids[-5:]  # Last 5 trips
        
        # Calculate statistics
        learning_data['statistics'] = {
            'total_interactions': len(learning_data.get('recent_interactions', [])),
            'total_trips': len(learning_data.get('trip_history', [])),
            'favorite_cuisines': list(learning_data['profile'].get('cuisine_frequency', {}).keys())[:5],
            'average_distance_preference': _calculate_average(learning_data['profile'].get('selected_distances', [])),
            'average_price_preference': _calculate_average(learning_data['profile'].get('selected_price_levels', []))
        }
        
        return jsonify(learning_data)
        
    except Exception as e:
        logger.error(f"Error getting user learning data: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@users_bp.route('/<user_id>/reset-learning-data', methods=['POST'])
def reset_user_learning_data(user_id):
    """Reset user's AI learning data (for testing or user request)"""
    try:
        files_to_remove = [
            os.path.join(data_dir, 'users', f'{user_id}_profile.json'),
            os.path.join(data_dir, 'users', f'{user_id}_interactions.json')
        ]
        
        removed_files = []
        for file_path in files_to_remove:
            if os.path.exists(file_path):
                os.remove(file_path)
                removed_files.append(os.path.basename(file_path))
        
        return jsonify({
            'message': 'Learning data reset successfully',
            'removed_files': removed_files,
            'user_id': user_id
        })
        
    except Exception as e:
        logger.error(f"Error resetting user learning data: {e}")
        return jsonify({'error': 'Internal server error'}), 500

def _calculate_average(values: list) -> float:
    """Calculate average of a list of numbers"""
    if not values:
        return 0.0
    return round(sum(values) / len(values), 2)