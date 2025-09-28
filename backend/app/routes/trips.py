from flask import Blueprint, request, jsonify
import json
import os
from datetime import datetime, timedelta
from typing import Dict, List, Tuple
import logging
from geopy.distance import geodesic
import uuid

from ..services.openroute_service import openroute_service
from ..services.overpass_api import overpass_service

logger = logging.getLogger(__name__)

trips_bp = Blueprint('trips', __name__)
data_dir = 'data'

@trips_bp.route('/create', methods=['POST'])
def create_trip():
    """
    Create a new trip
    
    Expected JSON body:
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
            "breakfast": {
                "enabled": true,
                "radius_miles": 5.0,
                "time": "08:00"
            },
            "lunch": {
                "enabled": true,
                "radius_miles": 10.0,
                "time": "12:00"
            },
            "dinner": {
                "enabled": true,
                "radius_miles": 15.0,
                "time": "18:00"
            }
        },
        "dietary_restrictions": ["vegetarian"],
        "preferred_cuisines": ["italian", "mexican"]
    }
    """
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['user_id', 'start_location', 'end_location']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        # Generate trip ID
        trip_id = str(uuid.uuid4())
        
        # Calculate trip distance
        start_coords = (data['start_location']['lat'], data['start_location']['lng'])
        end_coords = (data['end_location']['lat'], data['end_location']['lng'])
        total_distance = geodesic(start_coords, end_coords).miles
        
        # Create trip object
        trip = {
            'trip_id': trip_id,
            'user_id': data['user_id'],
            'name': data.get('name', f'Trip {datetime.now().strftime("%Y-%m-%d")}'),
            'status': 'planned',
            'created_at': datetime.utcnow().isoformat(),
            'start_location': data['start_location'],
            'end_location': data['end_location'],
            'total_distance_miles': round(total_distance, 2),
            'meal_preferences': data.get('meal_preferences', {}),
            'dietary_restrictions': data.get('dietary_restrictions', []),
            'preferred_cuisines': data.get('preferred_cuisines', []),
            'restaurants': {
                'breakfast': [],
                'lunch': [],
                'dinner': []
            },
            'selected_restaurants': [],
            'completed_at': None
        }
        
        # Save trip to file
        trip_file = os.path.join(data_dir, 'trips', f'{trip_id}.json')
        os.makedirs(os.path.dirname(trip_file), exist_ok=True)
        
        with open(trip_file, 'w') as f:
            json.dump(trip, f, indent=2)
        
        # Add to user's trip list
        _add_trip_to_user_list(data['user_id'], trip_id)
        
        return jsonify({
            'message': 'Trip created successfully',
            'trip_id': trip_id,
            'trip': trip
        }), 201
        
    except Exception as e:
        logger.error(f"Error creating trip: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@trips_bp.route('/<trip_id>')
def get_trip(trip_id):
    """Get trip details by ID"""
    try:
        trip_file = os.path.join(data_dir, 'trips', f'{trip_id}.json')
        
        if not os.path.exists(trip_file):
            return jsonify({'error': 'Trip not found'}), 404
        
        with open(trip_file, 'r') as f:
            trip = json.load(f)
        
        return jsonify(trip)
        
    except Exception as e:
        logger.error(f"Error getting trip: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@trips_bp.route('/<trip_id>', methods=['PUT'])
def update_trip(trip_id):
    """
    Update trip details
    
    Expected JSON body can include any trip fields to update
    """
    try:
        trip_file = os.path.join(data_dir, 'trips', f'{trip_id}.json')
        
        if not os.path.exists(trip_file):
            return jsonify({'error': 'Trip not found'}), 404
        
        # Load existing trip
        with open(trip_file, 'r') as f:
            trip = json.load(f)
        
        # Update with new data
        update_data = request.get_json()
        trip.update(update_data)
        trip['updated_at'] = datetime.utcnow().isoformat()
        
        # Save updated trip
        with open(trip_file, 'w') as f:
            json.dump(trip, f, indent=2)
        
        return jsonify({
            'message': 'Trip updated successfully',
            'trip': trip
        })
        
    except Exception as e:
        logger.error(f"Error updating trip: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@trips_bp.route('/<trip_id>/restaurants/<meal_type>', methods=['POST'])
def add_restaurants_to_trip(trip_id, meal_type):
    """
    Add restaurants to a specific meal in the trip
    
    Expected JSON body:
    {
        "restaurants": [...list of restaurant objects...]
    }
    """
    try:
        if meal_type not in ['breakfast', 'lunch', 'dinner']:
            return jsonify({'error': 'Invalid meal_type. Must be breakfast, lunch, or dinner'}), 400
        
        trip_file = os.path.join(data_dir, 'trips', f'{trip_id}.json')
        
        if not os.path.exists(trip_file):
            return jsonify({'error': 'Trip not found'}), 404
        
        # Load existing trip
        with open(trip_file, 'r') as f:
            trip = json.load(f)
        
        # Add restaurants
        data = request.get_json()
        restaurants = data.get('restaurants', [])
        
        if meal_type not in trip['restaurants']:
            trip['restaurants'][meal_type] = []
        
        trip['restaurants'][meal_type].extend(restaurants)
        trip['updated_at'] = datetime.utcnow().isoformat()
        
        # Save updated trip
        with open(trip_file, 'w') as f:
            json.dump(trip, f, indent=2)
        
        return jsonify({
            'message': f'Added {len(restaurants)} restaurants to {meal_type}',
            'trip': trip
        })
        
    except Exception as e:
        logger.error(f"Error adding restaurants to trip: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@trips_bp.route('/<trip_id>/select-restaurant', methods=['POST'])
def select_restaurant_for_trip(trip_id):
    """
    Record that user selected a specific restaurant
    
    Expected JSON body:
    {
        "restaurant": {...restaurant object...},
        "meal_type": "lunch",
        "user_id": "user123"
    }
    """
    try:
        data = request.get_json()
        
        required_fields = ['restaurant', 'meal_type', 'user_id']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        trip_file = os.path.join(data_dir, 'trips', f'{trip_id}.json')
        
        if not os.path.exists(trip_file):
            return jsonify({'error': 'Trip not found'}), 404
        
        # Load existing trip
        with open(trip_file, 'r') as f:
            trip = json.load(f)
        
        # Add selected restaurant
        selected_restaurant = {
            'restaurant': data['restaurant'],
            'meal_type': data['meal_type'],
            'selected_at': datetime.utcnow().isoformat(),
            'user_id': data['user_id']
        }
        
        trip['selected_restaurants'].append(selected_restaurant)
        trip['updated_at'] = datetime.utcnow().isoformat()
        
        # Save updated trip
        with open(trip_file, 'w') as f:
            json.dump(trip, f, indent=2)
        
        # Record interaction for AI learning (import here to avoid circular imports)
        from app.services.ai_recommendations import ai_engine
        
        trip_context = {
            'trip_id': trip_id,
            'meal_type': data['meal_type'],
            'start_coords': (trip['start_location']['lat'], trip['start_location']['lng']),
            'end_coords': (trip['end_location']['lat'], trip['end_location']['lng'])
        }
        
        ai_engine.record_user_interaction(
            user_id=data['user_id'],
            restaurant=data['restaurant'],
            interaction_type='selected',
            trip_id=data.get('trip_id')
        )
        
        return jsonify({
            'message': 'Restaurant selection recorded',
            'trip': trip
        })
        
    except Exception as e:
        logger.error(f"Error selecting restaurant for trip: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@trips_bp.route('/user/<user_id>')
def get_user_trips(user_id):
    """Get all trips for a specific user"""
    try:
        user_trips_file = os.path.join(data_dir, 'users', f'{user_id}_trips.json')
        
        if not os.path.exists(user_trips_file):
            return jsonify({'trips': []})
        
        with open(user_trips_file, 'r') as f:
            trip_ids = json.load(f)
        
        # Load trip details
        trips = []
        for trip_id in trip_ids:
            trip_file = os.path.join(data_dir, 'trips', f'{trip_id}.json')
            if os.path.exists(trip_file):
                with open(trip_file, 'r') as f:
                    trip = json.load(f)
                    trips.append(trip)
        
        # Sort by created_at (newest first)
        trips.sort(key=lambda x: x.get('created_at', ''), reverse=True)
        
        return jsonify({'trips': trips})
        
    except Exception as e:
        logger.error(f"Error getting user trips: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@trips_bp.route('/<trip_id>/complete', methods=['POST'])
def complete_trip(trip_id):
    """Mark a trip as completed"""
    try:
        trip_file = os.path.join(data_dir, 'trips', f'{trip_id}.json')
        
        if not os.path.exists(trip_file):
            return jsonify({'error': 'Trip not found'}), 404
        
        # Load existing trip
        with open(trip_file, 'r') as f:
            trip = json.load(f)
        
        # Mark as completed
        trip['status'] = 'completed'
        trip['completed_at'] = datetime.utcnow().isoformat()
        trip['updated_at'] = datetime.utcnow().isoformat()
        
        # Save updated trip
        with open(trip_file, 'w') as f:
            json.dump(trip, f, indent=2)
        
        return jsonify({
            'message': 'Trip marked as completed',
            'trip': trip
        })
        
    except Exception as e:
        logger.error(f"Error completing trip: {e}")
        return jsonify({'error': 'Internal server error'}), 500

def _add_trip_to_user_list(user_id: str, trip_id: str):
    """Add trip ID to user's trip list"""
    try:
        user_trips_file = os.path.join(data_dir, 'users', f'{user_id}_trips.json')
        os.makedirs(os.path.dirname(user_trips_file), exist_ok=True)
        
        # Load existing trip list
        trip_ids = []
        if os.path.exists(user_trips_file):
            with open(user_trips_file, 'r') as f:
                trip_ids = json.load(f)
        
        # Add new trip ID
        if trip_id not in trip_ids:
            trip_ids.append(trip_id)
        
        # Save updated list
        with open(user_trips_file, 'w') as f:
            json.dump(trip_ids, f, indent=2)

@trips_bp.route('/plan-route', methods=['POST'])
def plan_route():
    """
    Plan a route and find restaurants along the way
    
    Expected JSON body:
    {
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
        "departure_time": "09:00 AM",
        "meal_preferences": {
            "breakfast": {
                "enabled": true,
                "radius_miles": 5.0,
                "time": "08:00 AM",
                "preferred_time": { "hour": 8, "minute": 0, "period": "AM" }
            },
            "lunch": {
                "enabled": true,
                "radius_miles": 10.0,
                "time": "12:00 PM",
                "preferred_time": { "hour": 12, "minute": 0, "period": "PM" }
            },
            "dinner": {
                "enabled": true,
                "radius_miles": 15.0,
                "time": "18:00 PM",
                "preferred_time": { "hour": 6, "minute": 0, "period": "PM" }
            }
        },
        "dietary_restrictions": ["vegetarian"],
        "preferred_cuisines": ["italian", "mexican"],
        "daily_budget": 50.0
    }
    """
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['start_location', 'end_location']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        # Extract coordinates
        start_coords = (data['start_location']['lat'], data['start_location']['lng'])
        end_coords = (data['end_location']['lat'], data['end_location']['lng'])
        
        logger.info(f"Planning route from {start_coords} to {end_coords}")
        
        # Get route from OpenRouteService
        route_data = openroute_service.get_route(start_coords, end_coords)
        
        if not route_data:
            return jsonify({'error': 'Could not calculate route'}), 400
        
        # Extract route points for restaurant searching
        route_points = openroute_service.get_route_points_with_spacing(
            route_data['geometry'], 
            spacing_miles=10.0  # Search every 10 miles along route
        )
        
        logger.info(f"Generated {len(route_points)} search points along route")
        
        # Get meal preferences
        meal_preferences = data.get('meal_preferences', {})
        dietary_restrictions = data.get('dietary_restrictions', [])
        preferred_cuisines = data.get('preferred_cuisines', [])
        daily_budget = data.get('daily_budget')
        
        # Find restaurants for each enabled meal
        restaurants_by_meal = {}
        
        for meal_type in ['breakfast', 'lunch', 'dinner']:
            meal_pref = meal_preferences.get(meal_type, {})
            
            if meal_pref.get('enabled', False):
                radius_miles = meal_pref.get('radius_miles', 10.0)
                
                logger.info(f"Searching for {meal_type} restaurants within {radius_miles} miles of route")
                
                restaurants = overpass_service.find_restaurants_along_route(
                    route_points=route_points,
                    radius_miles=radius_miles,
                    cuisine_types=preferred_cuisines,
                    dietary_restrictions=dietary_restrictions,
                    max_budget=daily_budget
                )
                
                # Add meal type and timing info
                for restaurant in restaurants:
                    restaurant['meal_type'] = meal_type
                    restaurant['meal_time'] = meal_pref.get('time', '')
                    restaurant['preferred_time'] = meal_pref.get('preferred_time', {})
                
                restaurants_by_meal[meal_type] = restaurants[:20]  # Limit to top 20 per meal
                logger.info(f"Found {len(restaurants)} {meal_type} restaurants")
        
        # Calculate timing estimates
        departure_time = data.get('departure_time', '09:00 AM')
        timing_estimates = _calculate_meal_timing(
            route_data['duration_seconds'], 
            departure_time, 
            meal_preferences
        )
        
        # Prepare response
        response = {
            'route': {
                'geometry': route_data['geometry'],
                'distance_meters': route_data['distance_meters'],
                'distance_miles': round(route_data['distance_meters'] / 1609.34, 2),
                'duration_seconds': route_data['duration_seconds'],
                'duration_hours': round(route_data['duration_seconds'] / 3600, 1),
                'bbox': route_data['bbox']
            },
            'restaurants_by_meal': restaurants_by_meal,
            'timing_estimates': timing_estimates,
            'search_metadata': {
                'route_points_searched': len(route_points),
                'total_restaurants_found': sum(len(restaurants) for restaurants in restaurants_by_meal.values()),
                'search_radius_miles': {meal: meal_preferences.get(meal, {}).get('radius_miles', 10) 
                                      for meal in restaurants_by_meal.keys()}
            }
        }
        
        return jsonify(response)
        
    except Exception as e:
        logger.error(f"Error planning route: {e}")
        return jsonify({'error': 'Internal server error'}), 500

def _calculate_meal_timing(duration_seconds: float, departure_time: str, meal_preferences: Dict) -> Dict:
    """Calculate estimated timing for meals along the route"""
    try:
        # Parse departure time
        departure_hour, departure_minute, departure_period = _parse_time_string(departure_time)
        
        # Convert to 24-hour format
        if departure_period.upper() == 'PM' and departure_hour != 12:
            departure_hour += 12
        elif departure_period.upper() == 'AM' and departure_hour == 12:
            departure_hour = 0
        
        departure_datetime = datetime.now().replace(
            hour=departure_hour, 
            minute=departure_minute, 
            second=0, 
            microsecond=0
        )
        
        # Calculate arrival time
        arrival_datetime = departure_datetime + timedelta(seconds=duration_seconds)
        
        # Calculate meal timing suggestions
        timing_estimates = {
            'departure_time': departure_datetime.strftime('%I:%M %p'),
            'arrival_time': arrival_datetime.strftime('%I:%M %p'),
            'total_travel_hours': round(duration_seconds / 3600, 1),
            'suggested_meal_times': {}
        }
        
        # Suggest meal times based on travel duration and preferences
        for meal_type, meal_pref in meal_preferences.items():
            if meal_pref.get('enabled', False):
                preferred_time = meal_pref.get('preferred_time', {})
                if preferred_time:
                    # Calculate when user should have this meal during travel
                    meal_hour = preferred_time.get('hour', 12)
                    meal_minute = preferred_time.get('minute', 0)
                    meal_period = preferred_time.get('period', 'PM')
                    
                    if meal_period.upper() == 'PM' and meal_hour != 12:
                        meal_hour += 12
                    elif meal_period.upper() == 'AM' and meal_hour == 12:
                        meal_hour = 0
                    
                    meal_datetime = departure_datetime.replace(
                        hour=meal_hour, 
                        minute=meal_minute
                    )
                    
                    # Adjust to next day if meal time has passed
                    if meal_datetime < departure_datetime:
                        meal_datetime += timedelta(days=1)
                    
                    timing_estimates['suggested_meal_times'][meal_type] = {
                        'suggested_time': meal_datetime.strftime('%I:%M %p'),
                        'hours_from_departure': round((meal_datetime - departure_datetime).seconds / 3600, 1)
                    }
        
        return timing_estimates
        
    except Exception as e:
        logger.error(f"Error calculating meal timing: {e}")
        return {}

def _parse_time_string(time_str: str) -> Tuple[int, int, str]:
    """Parse time string like '09:00 AM' into components"""
    try:
        time_part, period = time_str.split()
        hour, minute = map(int, time_part.split(':'))
        return hour, minute, period
    except Exception:
        # Default to 9:00 AM if parsing fails
        return 9, 0, 'AM'
            
    except Exception as e:
        logger.error(f"Error adding trip to user list: {e}")