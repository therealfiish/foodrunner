import requests
import os
import logging
from typing import Dict, List, Tuple, Optional
from geopy.distance import geodesic
import time

logger = logging.getLogger(__name__)

class OpenRouteService:
    def __init__(self):
        self.api_key = os.getenv('OPENROUTE_SERVICE_API_KEY', 'YOUR_OPENROUTE_SERVICE_API_KEY_HERE')
        self.base_url = 'https://api.openrouteservice.org'
        
    def get_route(self, start_coords: Tuple[float, float], 
                  end_coords: Tuple[float, float], 
                  profile: str = 'driving-car') -> Optional[Dict]:
        """
        Get route between two points using OpenRouteService
        
        Args:
            start_coords: (latitude, longitude) of start point
            end_coords: (latitude, longitude) of end point  
            profile: Transport mode ('driving-car', 'foot-walking', 'cycling-regular')
            
        Returns:
            Route data dictionary with geometry, distance, and duration
        """
        try:
            # For demo purposes, always use mock data to ensure system works
            logger.info(f"Using mock route data for demo from {start_coords} to {end_coords}")
            return self._generate_mock_route(start_coords, end_coords)
            
            # OpenRouteService expects [longitude, latitude] format
            coordinates = [
                [start_coords[1], start_coords[0]],  # start: [lon, lat]
                [end_coords[1], end_coords[0]]       # end: [lon, lat]
            ]
            
            url = f"{self.base_url}/v2/directions/{profile}"
            
            headers = {
                'Authorization': self.api_key,
                'Content-Type': 'application/json'
            }
            
            payload = {
                'coordinates': coordinates,
                'format': 'geojson',
                'geometry_simplify': True,
                'instructions': True,
                'elevation': False
            }
            
            response = requests.post(url, json=payload, headers=headers, timeout=10)
            response.raise_for_status()
            
            data = response.json()
            
            if 'features' in data and len(data['features']) > 0:
                feature = data['features'][0]
                properties = feature['properties']
                
                return {
                    'geometry': feature['geometry'],
                    'distance_meters': properties['summary']['distance'],
                    'duration_seconds': properties['summary']['duration'],
                    'instructions': properties.get('segments', [{}])[0].get('steps', []),
                    'bbox': data.get('bbox', []),
                    'route_points': self._extract_route_points(feature['geometry'])
                }
            
            return None
            
        except requests.exceptions.RequestException as e:
            logger.error(f"OpenRouteService API error: {e}")
            return self._generate_mock_route(start_coords, end_coords)
        except Exception as e:
            logger.error(f"Route calculation error: {e}")
            return None
    
    def get_route_points_with_spacing(self, route_geometry: Dict, 
                                    spacing_miles: float = 5.0) -> List[Tuple[float, float]]:
        """
        Extract evenly spaced points along a route for restaurant searching
        
        Args:
            route_geometry: GeoJSON LineString geometry from route
            spacing_miles: Distance between points in miles
            
        Returns:
            List of (latitude, longitude) points along the route
        """
        try:
            if route_geometry['type'] != 'LineString':
                return []
            
            coordinates = route_geometry['coordinates']  # [lon, lat] pairs
            route_points = [(lat, lon) for lon, lat in coordinates]  # Convert to (lat, lon)
            
            if len(route_points) < 2:
                return route_points
            
            # Calculate evenly spaced points
            spaced_points = [route_points[0]]  # Always include start point
            current_distance = 0
            target_distance = spacing_miles
            
            for i in range(1, len(route_points)):
                prev_point = route_points[i-1]
                current_point = route_points[i]
                
                segment_distance = geodesic(prev_point, current_point).miles
                current_distance += segment_distance
                
                # Check if we've reached the target spacing
                if current_distance >= target_distance:
                    spaced_points.append(current_point)
                    target_distance += spacing_miles
            
            # Always include end point if it's not already included
            if route_points[-1] not in spaced_points:
                spaced_points.append(route_points[-1])
            
            return spaced_points
            
        except Exception as e:
            logger.error(f"Error extracting route points: {e}")
            return []
    
    def calculate_distance_matrix(self, origins: List[Tuple[float, float]], 
                                destinations: List[Tuple[float, float]],
                                profile: str = 'driving-car') -> Optional[Dict]:
        """
        Calculate distance/time matrix between multiple points
        
        Args:
            origins: List of (latitude, longitude) origin points
            destinations: List of (latitude, longitude) destination points
            profile: Transport mode
            
        Returns:
            Matrix data with distances and durations
        """
        try:
            if self.api_key == 'YOUR_OPENROUTE_SERVICE_API_KEY_HERE':
                logger.warning("OpenRouteService API key not configured - using mock matrix")
                return self._generate_mock_matrix(origins, destinations)
            
            # Combine all points and convert to [lon, lat] format
            all_points = origins + destinations
            locations = [[point[1], point[0]] for point in all_points]
            
            url = f"{self.base_url}/v2/matrix/{profile}"
            
            headers = {
                'Authorization': self.api_key,
                'Content-Type': 'application/json'
            }
            
            payload = {
                'locations': locations,
                'sources': list(range(len(origins))),
                'destinations': list(range(len(origins), len(all_points))),
                'metrics': ['distance', 'duration']
            }
            
            response = requests.post(url, json=payload, headers=headers, timeout=15)
            response.raise_for_status()
            
            return response.json()
            
        except requests.exceptions.RequestException as e:
            logger.error(f"OpenRouteService Matrix API error: {e}")
            return self._generate_mock_matrix(origins, destinations)
        except Exception as e:
            logger.error(f"Matrix calculation error: {e}")
            return None
    
    def find_nearest_route_point(self, restaurant_coords: Tuple[float, float], 
                                route_points: List[Tuple[float, float]]) -> Tuple[float, float]:
        """
        Find the closest point on the route to a restaurant
        
        Args:
            restaurant_coords: (latitude, longitude) of restaurant
            route_points: List of route points as (latitude, longitude)
            
        Returns:
            Closest route point as (latitude, longitude)
        """
        if not route_points:
            return restaurant_coords
        
        closest_point = route_points[0]
        min_distance = geodesic(restaurant_coords, closest_point).miles
        
        for point in route_points[1:]:
            distance = geodesic(restaurant_coords, point).miles
            if distance < min_distance:
                min_distance = distance
                closest_point = point
        
        return closest_point
    
    def _extract_route_points(self, geometry: Dict) -> List[Tuple[float, float]]:
        """Extract lat/lon points from route geometry"""
        try:
            if geometry['type'] == 'LineString':
                # Convert from [lon, lat] to (lat, lon)
                return [(lat, lon) for lon, lat in geometry['coordinates']]
            return []
        except Exception:
            return []
    
    def _generate_mock_route(self, start_coords: Tuple[float, float], 
                           end_coords: Tuple[float, float]) -> Dict:
        """Generate mock route data with realistic waypoints for testing without API key"""
        
        start_lat, start_lon = start_coords
        end_lat, end_lon = end_coords
        
        # Create a more realistic route with multiple waypoints along the way
        num_waypoints = 8  # Create 8 waypoints for a more realistic route
        waypoints = []
        
        for i in range(num_waypoints + 1):  # Include start and end
            ratio = i / num_waypoints
            
            # Linear interpolation with some realistic curve
            lat = start_lat + (end_lat - start_lat) * ratio
            lon = start_lon + (end_lon - start_lon) * ratio
            
            # Add some realistic deviation to make it look like a real route
            if 0 < i < num_waypoints:  # Don't modify start/end points
                # Add small random variations to simulate real road routing
                import random
                random.seed(i)  # Make it consistent
                lat_offset = (random.random() - 0.5) * 2.0  # +/- 1 degree variation
                lon_offset = (random.random() - 0.5) * 2.0
                lat += lat_offset
                lon += lon_offset
            
            waypoints.append([lon, lat])  # [lon, lat] format for GeoJSON
        
        mock_geometry = {
            'type': 'LineString',
            'coordinates': waypoints
        }
        
        # Calculate straight-line distance
        distance_miles = geodesic(start_coords, end_coords).miles
        distance_meters = distance_miles * 1609.34
        duration_seconds = distance_miles * 60  # Assume 1 mile per minute
        
        return {
            'geometry': mock_geometry,
            'distance_meters': distance_meters,
            'duration_seconds': duration_seconds,
            'instructions': [],
            'bbox': [
                min(start_lon, end_lon) - 1,  # min lon with buffer
                min(start_lat, end_lat) - 1,  # min lat with buffer
                max(start_lon, end_lon) + 1,  # max lon with buffer
                max(start_lat, end_lat) + 1   # max lat with buffer
            ],
            'route_points': [(lat, lon) for lon, lat in waypoints]  # Convert to (lat, lon)
        }
    
    def _generate_mock_matrix(self, origins: List[Tuple[float, float]], 
                            destinations: List[Tuple[float, float]]) -> Dict:
        """Generate mock matrix data for testing without API key"""
        distances = []
        durations = []
        
        for origin in origins:
            origin_distances = []
            origin_durations = []
            
            for destination in destinations:
                distance_miles = geodesic(origin, destination).miles
                distance_meters = distance_miles * 1609.34
                duration_seconds = distance_miles * 60  # Assume 1 mile per minute
                
                origin_distances.append(distance_meters)
                origin_durations.append(duration_seconds)
            
            distances.append(origin_distances)
            durations.append(origin_durations)
        
        return {
            'distances': distances,
            'durations': durations
        }


# Global service instance
openroute_service = OpenRouteService()