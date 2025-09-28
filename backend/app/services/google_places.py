import requests
import os
import logging
from typing import Dict, List, Tuple, Optional
from geopy.distance import geodesic
import time

logger = logging.getLogger(__name__)

class GooglePlacesService:
    def __init__(self):
        self.api_key = os.getenv('GOOGLE_PLACES_API_KEY', 'YOUR_GOOGLE_PLACES_API_KEY_HERE')
        self.base_url = 'https://maps.googleapis.com/maps/api/place'
        
    def search_restaurants_along_route(self, start_coords: Tuple[float, float], 
                                     end_coords: Tuple[float, float], 
                                     radius_miles: float = 5.0,
                                     cuisine_types: List[str] = None) -> List[Dict]:
        """
        Find restaurants along a route between two points
        
        Args:
            start_coords: (latitude, longitude) of start point
            end_coords: (latitude, longitude) of end point  
            radius_miles: Search radius in miles (0.5-20 miles)
            cuisine_types: List of preferred cuisine types
            
        Returns:
            List of restaurant data dictionaries
        """
        try:
            # Convert miles to meters for Google API
            radius_meters = int(radius_miles * 1609.34)
            
            # Generate search points along the route
            search_points = self._generate_route_points(start_coords, end_coords, radius_miles)
            
            all_restaurants = []
            seen_place_ids = set()
            
            for point in search_points:
                restaurants = self._search_nearby_restaurants(
                    point, radius_meters, cuisine_types
                )
                
                # Remove duplicates
                for restaurant in restaurants:
                    if restaurant['place_id'] not in seen_place_ids:
                        seen_place_ids.add(restaurant['place_id'])
                        all_restaurants.append(restaurant)
                
                # Rate limiting
                time.sleep(0.1)
            
            # Sort by rating and distance from route
            return self._rank_restaurants(all_restaurants, start_coords, end_coords)
            
        except Exception as e:
            logger.error(f"Error searching restaurants along route: {e}")
            return []
    
    def _generate_route_points(self, start: Tuple[float, float], 
                              end: Tuple[float, float], 
                              radius_miles: float) -> List[Tuple[float, float]]:
        """Generate search points along the route"""
        # Calculate total distance
        total_distance = geodesic(start, end).miles
        
        # Determine number of search points based on distance and radius
        if total_distance <= radius_miles * 2:
            return [start, end]
        
        # Create search points every radius_miles distance
        num_points = max(3, int(total_distance / radius_miles))
        points = []
        
        for i in range(num_points):
            ratio = i / (num_points - 1)
            lat = start[0] + (end[0] - start[0]) * ratio
            lng = start[1] + (end[1] - start[1]) * ratio
            points.append((lat, lng))
        
        return points
    
    def _search_nearby_restaurants(self, location: Tuple[float, float], 
                                  radius: int, 
                                  cuisine_types: List[str] = None) -> List[Dict]:
        """Search for restaurants near a specific location"""
        try:
            # Mock response for development (remove when you have API key)
            if self.api_key == 'YOUR_GOOGLE_PLACES_API_KEY_HERE':
                return self._generate_mock_restaurants(location, cuisine_types)
            
            # Real Google Places API call
            params = {
                'location': f"{location[0]},{location[1]}",
                'radius': radius,
                'type': 'restaurant',
                'key': self.api_key
            }
            
            # Add cuisine filtering if specified
            if cuisine_types:
                cuisine_keywords = ' '.join(cuisine_types)
                params['keyword'] = cuisine_keywords
            
            response = requests.get(f"{self.base_url}/nearbysearch/json", params=params)
            response.raise_for_status()
            
            data = response.json()
            restaurants = []
            
            for place in data.get('results', []):
                restaurant = {
                    'place_id': place['place_id'],
                    'name': place['name'],
                    'rating': place.get('rating', 0),
                    'price_level': place.get('price_level', 2),
                    'location': {
                        'lat': place['geometry']['location']['lat'],
                        'lng': place['geometry']['location']['lng']
                    },
                    'address': place.get('vicinity', ''),
                    'types': place.get('types', []),
                    'cuisine_types': self._extract_cuisine_types(place.get('types', [])),
                    'is_open': place.get('opening_hours', {}).get('open_now', None),
                    'photos': [photo['photo_reference'] for photo in place.get('photos', [])][:3]
                }
                restaurants.append(restaurant)
            
            return restaurants
            
        except Exception as e:
            logger.error(f"Error searching nearby restaurants: {e}")
            return []
    
    def _generate_mock_restaurants(self, location: Tuple[float, float], 
                                  cuisine_types: List[str] = None) -> List[Dict]:
        """Generate mock restaurant data for development"""
        import random
        
        mock_names = [
            "Burger Palace", "Pizza Corner", "Taco Fiesta", "Sushi House", 
            "Italian Garden", "Thai Spice", "BBQ Junction", "Cafe Delight",
            "Chinese Express", "Indian Curry", "Mexican Grill", "Seafood Shack"
        ]
        
        cuisine_mapping = {
            'burger': ['american', 'fast_food'],
            'pizza': ['italian', 'pizza'],
            'taco': ['mexican', 'latin'],
            'sushi': ['japanese', 'asian'],
            'italian': ['italian', 'european'],
            'thai': ['thai', 'asian'],
            'bbq': ['american', 'barbecue'],
            'chinese': ['chinese', 'asian'],
            'indian': ['indian', 'asian'],
            'mexican': ['mexican', 'latin'],
            'seafood': ['seafood', 'american']
        }
        
        restaurants = []
        for i in range(random.randint(3, 8)):
            name = random.choice(mock_names)
            # Add small random offset to location
            lat_offset = random.uniform(-0.01, 0.01)
            lng_offset = random.uniform(-0.01, 0.01)
            
            # Determine cuisine type
            cuisine_key = name.lower().split()[0]
            cuisines = cuisine_mapping.get(cuisine_key, ['american'])
            
            restaurant = {
                'place_id': f"mock_{location[0]:.4f}_{location[1]:.4f}_{i}",
                'name': name,
                'rating': round(random.uniform(3.0, 5.0), 1),
                'price_level': random.randint(1, 4),
                'location': {
                    'lat': location[0] + lat_offset,
                    'lng': location[1] + lng_offset
                },
                'address': f"123 Main St, City, State",
                'types': ['restaurant', 'food', 'establishment'],
                'cuisine_types': cuisines,
                'is_open': random.choice([True, False, None]),
                'photos': [f"mock_photo_{i}_1", f"mock_photo_{i}_2"]
            }
            restaurants.append(restaurant)
        
        return restaurants
    
    def _extract_cuisine_types(self, place_types: List[str]) -> List[str]:
        """Extract cuisine types from Google Places types"""
        cuisine_mapping = {
            'meal_takeaway': 'takeaway',
            'meal_delivery': 'delivery', 
            'restaurant': 'restaurant',
            'bakery': 'bakery',
            'cafe': 'cafe',
            'bar': 'bar',
            'food': 'food'
        }
        
        cuisines = []
        for place_type in place_types:
            if place_type in cuisine_mapping:
                cuisines.append(cuisine_mapping[place_type])
        
        return cuisines if cuisines else ['restaurant']
    
    def _rank_restaurants(self, restaurants: List[Dict], 
                         start_coords: Tuple[float, float], 
                         end_coords: Tuple[float, float]) -> List[Dict]:
        """Rank restaurants by rating, price, and proximity to route"""
        try:
            for restaurant in restaurants:
                rest_coords = (restaurant['location']['lat'], restaurant['location']['lng'])
                
                # Calculate distance from start and end points
                dist_from_start = geodesic(start_coords, rest_coords).miles
                dist_from_end = geodesic(end_coords, rest_coords).miles
                
                # Calculate route proximity score (lower is better)
                route_distance = geodesic(start_coords, end_coords).miles
                route_deviation = abs(dist_from_start + dist_from_end - route_distance)
                
                restaurant['distance_from_start'] = round(dist_from_start, 2)
                restaurant['distance_from_end'] = round(dist_from_end, 2)
                restaurant['route_deviation'] = round(route_deviation, 2)
                
                # Calculate composite score (higher is better)
                rating_score = restaurant['rating'] / 5.0  # 0-1
                price_score = (5 - restaurant['price_level']) / 4.0  # 0-1 (lower price = higher score)
                proximity_score = max(0, 1 - (route_deviation / route_distance))  # 0-1
                
                restaurant['composite_score'] = (
                    rating_score * 0.4 + 
                    price_score * 0.2 + 
                    proximity_score * 0.4
                )
            
            # Sort by composite score (highest first)
            restaurants.sort(key=lambda x: x['composite_score'], reverse=True)
            return restaurants
            
        except Exception as e:
            logger.error(f"Error ranking restaurants: {e}")
            return restaurants
    
    def get_restaurant_details(self, place_id: str) -> Optional[Dict]:
        """Get detailed information about a specific restaurant"""
        try:
            # Mock response for development
            if self.api_key == 'YOUR_GOOGLE_PLACES_API_KEY_HERE':
                return {
                    'place_id': place_id,
                    'name': 'Mock Restaurant',
                    'rating': 4.2,
                    'phone': '+1-555-0123',
                    'website': 'https://mockrestaurant.com',
                    'address': '123 Main St, City, State 12345',
                    'hours': {
                        'monday': '9:00 AM – 10:00 PM',
                        'tuesday': '9:00 AM – 10:00 PM',
                        'wednesday': '9:00 AM – 10:00 PM',
                        'thursday': '9:00 AM – 10:00 PM',
                        'friday': '9:00 AM – 11:00 PM',
                        'saturday': '9:00 AM – 11:00 PM',
                        'sunday': '10:00 AM – 9:00 PM'
                    },
                    'reviews': [
                        {
                            'author': 'John D.',
                            'rating': 5,
                            'text': 'Great food and service!',
                            'time': '2024-01-15'
                        }
                    ]
                }
            
            # Real API call
            params = {
                'place_id': place_id,
                'fields': 'name,rating,formatted_phone_number,website,formatted_address,opening_hours,reviews,price_level,photos',
                'key': self.api_key
            }
            
            response = requests.get(f"{self.base_url}/details/json", params=params)
            response.raise_for_status()
            
            return response.json().get('result', {})
            
        except Exception as e:
            logger.error(f"Error getting restaurant details: {e}")
            return None

# Create global instance
google_places = GooglePlacesService()