import requests
import json
import logging
from typing import Dict, List, Tuple, Optional, Set
from geopy.distance import geodesic
import time

logger = logging.getLogger(__name__)

class OverpassAPIService:
    def __init__(self):
        self.base_url = 'https://overpass-api.de/api/interpreter'
        self.backup_urls = [
            'https://lz4.overpass-api.de/api/interpreter',
            'https://z.overpass-api.de/api/interpreter'
        ]
    
    def find_restaurants_along_route(self, 
                                   route_points: List[Tuple[float, float]], 
                                   radius_miles: float = 5.0,
                                   cuisine_types: Optional[List[str]] = None,
                                   dietary_restrictions: Optional[List[str]] = None,
                                   max_budget: Optional[float] = None) -> List[Dict]:
        """
        Find restaurants along a route using OpenStreetMap data via Overpass API
        
        Args:
            route_points: List of (latitude, longitude) points along the route
            radius_miles: Search radius around each route point in miles
            cuisine_types: List of preferred cuisine types (e.g., ['italian', 'mexican'])
            dietary_restrictions: List of dietary restrictions (e.g., ['vegetarian', 'vegan'])
            max_budget: Maximum budget per meal (used to filter by price level)
            
        Returns:
            List of restaurant data dictionaries
        """
        try:
            # Convert radius to meters for Overpass API
            radius_meters = int(radius_miles * 1609.34)
            
            all_restaurants = []
            seen_osm_ids = set()
            
            # Search around each route point
            for i, point in enumerate(route_points):
                lat, lon = point
                
                logger.info(f"Searching for restaurants around route point {i+1}/{len(route_points)}")
                
                restaurants = self._search_restaurants_near_point(
                    lat, lon, radius_meters, cuisine_types, dietary_restrictions
                )
                
                # Add route context and remove duplicates
                for restaurant in restaurants:
                    osm_id = restaurant.get('osm_id')
                    if osm_id and osm_id not in seen_osm_ids:
                        seen_osm_ids.add(osm_id)
                        restaurant['route_point_index'] = i
                        restaurant['distance_from_route_miles'] = self._calculate_distance_from_route(
                            (restaurant['lat'], restaurant['lon']), route_points
                        )
                        all_restaurants.append(restaurant)
                
                # Rate limiting - Overpass API has usage limits
                if i < len(route_points) - 1:
                    time.sleep(0.5)  # Small delay between requests
            
            # Filter by budget if specified
            if max_budget:
                all_restaurants = self._filter_by_budget(all_restaurants, max_budget)
            
            # Sort by distance from route and rating
            all_restaurants.sort(key=lambda r: (
                r.get('distance_from_route_miles', 999),
                -r.get('rating', 0)
            ))
            
            logger.info(f"Found {len(all_restaurants)} restaurants along route")
            return all_restaurants
            
        except Exception as e:
            logger.error(f"Error finding restaurants along route: {e}")
            return []
    
    def _search_restaurants_near_point(self, 
                                     lat: float, 
                                     lon: float, 
                                     radius_meters: int,
                                     cuisine_types: Optional[List[str]] = None,
                                     dietary_restrictions: Optional[List[str]] = None) -> List[Dict]:
        """
        Search for restaurants near a specific point using Overpass API
        """
        try:
            # Build Overpass query
            query = self._build_overpass_query(lat, lon, radius_meters, cuisine_types)
            
            # Try main URL first, then backups
            urls_to_try = [self.base_url] + self.backup_urls
            
            for url in urls_to_try:
                try:
                    response = requests.post(
                        url,
                        data={'data': query},
                        timeout=30
                    )
                    response.raise_for_status()
                    data = response.json()
                    
                    restaurants = self._parse_overpass_response(data, dietary_restrictions)
                    return restaurants
                    
                except requests.exceptions.RequestException as e:
                    logger.warning(f"Overpass API URL {url} failed: {e}")
                    continue
            
            logger.error("All Overpass API URLs failed")
            return []
            
        except Exception as e:
            logger.error(f"Error searching restaurants near point: {e}")
            return []
    
    def _build_overpass_query(self, 
                            lat: float, 
                            lon: float, 
                            radius_meters: int,
                            cuisine_types: Optional[List[str]] = None) -> str:
        """
        Build Overpass QL query for restaurants
        """
        # Base query for restaurants and cafes
        query = f"""
        [out:json][timeout:25];
        (
          node["amenity"="restaurant"](around:{radius_meters},{lat},{lon});
          node["amenity"="cafe"](around:{radius_meters},{lat},{lon});
          node["amenity"="fast_food"](around:{radius_meters},{lat},{lon});
          node["amenity"="pub"](around:{radius_meters},{lat},{lon});
          node["amenity"="bar"](around:{radius_meters},{lat},{lon});
        );
        out geom;
        """
        
        return query
    
    def _parse_overpass_response(self, 
                               data: Dict, 
                               dietary_restrictions: Optional[List[str]] = None) -> List[Dict]:
        """
        Parse Overpass API response and extract restaurant information
        """
        restaurants = []
        
        try:
            for element in data.get('elements', []):
                if element.get('type') != 'node':
                    continue
                
                tags = element.get('tags', {})
                
                # Extract basic information
                restaurant = {
                    'osm_id': element.get('id'),
                    'lat': element.get('lat'),
                    'lon': element.get('lon'),
                    'name': tags.get('name', 'Unknown Restaurant'),
                    'amenity': tags.get('amenity', 'restaurant'),
                    'cuisine': tags.get('cuisine', 'unknown'),
                    'website': tags.get('website', ''),
                    'phone': tags.get('phone', ''),
                    'opening_hours': tags.get('opening_hours', ''),
                    'address': self._extract_address(tags),
                    'rating': self._extract_rating(tags),
                    'price_level': self._extract_price_level(tags),
                    'dietary_info': self._extract_dietary_info(tags)
                }
                
                # Filter by dietary restrictions if specified
                if dietary_restrictions and not self._meets_dietary_restrictions(
                    restaurant, dietary_restrictions
                ):
                    continue
                
                restaurants.append(restaurant)
            
            return restaurants
            
        except Exception as e:
            logger.error(f"Error parsing Overpass response: {e}")
            return []
    
    def _extract_address(self, tags: Dict) -> str:
        """Extract address from OSM tags"""
        address_parts = []
        
        # House number and street
        if 'addr:housenumber' in tags and 'addr:street' in tags:
            address_parts.append(f"{tags['addr:housenumber']} {tags['addr:street']}")
        elif 'addr:street' in tags:
            address_parts.append(tags['addr:street'])
        
        # City
        if 'addr:city' in tags:
            address_parts.append(tags['addr:city'])
        
        # State/Province
        if 'addr:state' in tags:
            address_parts.append(tags['addr:state'])
        
        # Postal code
        if 'addr:postcode' in tags:
            address_parts.append(tags['addr:postcode'])
        
        return ', '.join(address_parts) if address_parts else 'Address not available'
    
    def _extract_rating(self, tags: Dict) -> float:
        """Extract rating from OSM tags (limited availability)"""
        # OSM doesn't typically have ratings, so we'll use other quality indicators
        rating = 3.0  # Default neutral rating
        
        # Boost rating for certain quality indicators
        if tags.get('stars'):
            try:
                rating = float(tags['stars'])
            except ValueError:
                pass
        
        # Quality indicators
        if tags.get('brand'):
            rating += 0.3
        if tags.get('website'):
            rating += 0.2
        if tags.get('opening_hours'):
            rating += 0.1
        
        return min(rating, 5.0)  # Cap at 5.0
    
    def _extract_price_level(self, tags: Dict) -> int:
        """Extract price level from OSM tags (1-4 scale)"""
        # Check for explicit price information
        if 'price' in tags:
            price_tag = tags['price'].lower()
            if 'cheap' in price_tag or '$' in price_tag:
                return 1
            elif 'expensive' in price_tag or '$$$' in price_tag:
                return 3
            elif 'moderate' in price_tag or '$$' in price_tag:
                return 2
        
        # Infer from amenity type
        amenity = tags.get('amenity', 'restaurant')
        if amenity == 'fast_food':
            return 1
        elif amenity == 'pub' or amenity == 'bar':
            return 2
        elif amenity == 'restaurant':
            return 2  # Default moderate
        else:
            return 2
    
    def _extract_dietary_info(self, tags: Dict) -> Dict[str, bool]:
        """Extract dietary restriction information from OSM tags"""
        dietary_info = {
            'vegetarian': False,
            'vegan': False,
            'gluten_free': False,
            'halal': False,
            'kosher': False
        }
        
        # Check for explicit dietary tags
        for diet in dietary_info.keys():
            if tags.get(f'diet:{diet}') == 'yes':
                dietary_info[diet] = True
            elif tags.get(f'diet:{diet}') == 'only':
                dietary_info[diet] = True
        
        # Check cuisine for dietary clues
        cuisine = tags.get('cuisine', '').lower()
        if 'vegetarian' in cuisine or 'vegan' in cuisine:
            dietary_info['vegetarian'] = True
            if 'vegan' in cuisine:
                dietary_info['vegan'] = True
        
        return dietary_info
    
    def _meets_dietary_restrictions(self, 
                                  restaurant: Dict, 
                                  restrictions: List[str]) -> bool:
        """Check if restaurant meets dietary restrictions"""
        dietary_info = restaurant.get('dietary_info', {})
        
        for restriction in restrictions:
            restriction_key = restriction.lower()
            if restriction_key in dietary_info and not dietary_info[restriction_key]:
                # If we have explicit info saying they don't support this diet
                continue
            # If no explicit info, we'll be optimistic and include it
        
        return True  # Be inclusive when dietary info is limited
    
    def _filter_by_budget(self, restaurants: List[Dict], max_budget: float) -> List[Dict]:
        """Filter restaurants by maximum budget per meal"""
        if max_budget >= 30:  # High budget
            return restaurants
        elif max_budget >= 15:  # Medium budget
            return [r for r in restaurants if r.get('price_level', 2) <= 2]
        else:  # Low budget
            return [r for r in restaurants if r.get('price_level', 2) <= 1]
    
    def _calculate_distance_from_route(self, 
                                     restaurant_coords: Tuple[float, float], 
                                     route_points: List[Tuple[float, float]]) -> float:
        """Calculate minimum distance from restaurant to any point on the route"""
        if not route_points:
            return 999.0
        
        min_distance = float('inf')
        for route_point in route_points:
            distance = geodesic(restaurant_coords, route_point).miles
            min_distance = min(min_distance, distance)
        
        return min_distance
    
    def get_restaurant_details(self, osm_id: int) -> Optional[Dict]:
        """
        Get detailed information about a specific restaurant
        """
        try:
            query = f"""
            [out:json][timeout:10];
            node(id:{osm_id});
            out geom;
            """
            
            response = requests.post(
                self.base_url,
                data={'data': query},
                timeout=15
            )
            response.raise_for_status()
            data = response.json()
            
            elements = data.get('elements', [])
            if elements:
                return self._parse_overpass_response(data, None)[0]
            
            return None
            
        except Exception as e:
            logger.error(f"Error getting restaurant details: {e}")
            return None


# Global service instance
overpass_service = OverpassAPIService()