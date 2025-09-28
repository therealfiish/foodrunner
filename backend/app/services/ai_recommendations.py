"""
Simple AI-powered restaurant recommendation service
Learns from user preferences and behavior over multiple road trips
"""
import json
import os
import random
from datetime import datetime
from typing import Dict, List, Any, Optional

class AIRecommendationEngine:
    """
    AI engine that learns user preferences for restaurants based on:
    - Distance preferences (0.5-20 miles from route)
    - Cuisine preferences
    - Restaurant ratings and selections
    - Road trip patterns
    """
    
    def __init__(self, data_dir='data'):
        self.data_dir = data_dir
        self.user_profiles_file = os.path.join(data_dir, 'user_profiles.json')
        self.interactions_file = os.path.join(data_dir, 'user_interactions.json')
        
        # Ensure data directory exists
        os.makedirs(data_dir, exist_ok=True)
        
        # Initialize files if they don't exist
        self._initialize_data_files()
    
    def _initialize_data_files(self):
        """Initialize data files if they don't exist"""
        if not os.path.exists(self.user_profiles_file):
            with open(self.user_profiles_file, 'w') as f:
                json.dump({}, f)
        
        if not os.path.exists(self.interactions_file):
            with open(self.interactions_file, 'w') as f:
                json.dump({}, f)
    
    def get_recommendations(self, 
                          user_id: str,
                          restaurants: List[Dict],
                          trip_id: Optional[str] = None,
                          dietary_restrictions: Optional[List[str]] = None) -> List[Dict]:
        """
        Get AI-powered restaurant recommendations based on learned preferences
        
        Args:
            user_id: User identifier
            restaurants: List of candidate restaurants
            trip_id: Current trip ID for context
            dietary_restrictions: User's dietary restrictions
            
        Returns:
            Ranked list of restaurants with recommendation scores
        """
        if not restaurants:
            return []
        
        # Load user profile and interaction history
        user_profile = self._load_user_profile(user_id)
        user_interactions = self._load_user_interactions(user_id)
        
        # Calculate recommendation scores for each restaurant
        scored_restaurants = []
        for restaurant in restaurants:
            score = self._calculate_recommendation_score(
                restaurant, user_profile, user_interactions, dietary_restrictions
            )
            restaurant['ai_score'] = score
            restaurant['recommendation_reason'] = self._generate_recommendation_reason(
                restaurant, user_profile, score
            )
            scored_restaurants.append(restaurant)
        
        # Sort by AI score (highest first) and return top recommendations
        scored_restaurants.sort(key=lambda x: x['ai_score'], reverse=True)
        
        return scored_restaurants
    
    def _calculate_recommendation_score(self, 
                                      restaurant: Dict,
                                      user_profile: Dict,
                                      user_interactions: List[Dict],
                                      dietary_restrictions: Optional[List[str]] = None) -> float:
        """
        Calculate AI recommendation score for a restaurant
        Combines multiple factors learned from user behavior
        """
        score = 0.0
        
        # Base score from restaurant rating
        rating = restaurant.get('rating', 3.0)
        score += rating * 0.2  # 20% weight on base rating
        
        # Distance preference scoring
        distance = restaurant.get('distance_miles', 10.0)
        distance_score = self._score_distance_preference(distance, user_profile)
        score += distance_score * 0.3  # 30% weight on distance
        
        # Cuisine preference scoring
        cuisine_types = restaurant.get('cuisine_types', [])
        cuisine_score = self._score_cuisine_preference(cuisine_types, user_profile)
        score += cuisine_score * 0.25  # 25% weight on cuisine
        
        # Price level preference
        price_level = restaurant.get('price_level', 2)
        price_score = self._score_price_preference(price_level, user_profile)
        score += price_score * 0.15  # 15% weight on price
        
        # Dietary restriction compliance
        if dietary_restrictions:
            dietary_score = self._score_dietary_compliance(restaurant, dietary_restrictions)
            score += dietary_score * 0.1  # 10% weight on dietary compliance
        
        return min(5.0, max(0.0, score))  # Clamp between 0-5
    
    def _score_distance_preference(self, distance: float, user_profile: Dict) -> float:
        """Score based on learned distance preferences"""
        distance_preferences = user_profile.get('distance_preferences', {})
        
        if not distance_preferences:
            # Default: prefer restaurants within 5 miles
            return max(0, 1.0 - (distance / 10.0))
        
        # Calculate score based on historical distance selections
        preferred_ranges = distance_preferences.get('preferred_ranges', [])
        total_selections = distance_preferences.get('total_selections', 1)
        
        score = 0.0
        for range_data in preferred_ranges:
            min_dist, max_dist = range_data['range']
            selections = range_data['selections']
            
            if min_dist <= distance <= max_dist:
                weight = selections / total_selections
                score += weight
        
        return score
    
    def _score_cuisine_preference(self, cuisine_types: List[str], user_profile: Dict) -> float:
        """Score based on learned cuisine preferences"""
        cuisine_preferences = user_profile.get('cuisine_preferences', {})
        
        if not cuisine_preferences or not cuisine_types:
            return 0.5  # Neutral score
        
        total_selections = cuisine_preferences.get('total_selections', 1)
        score = 0.0
        
        for cuisine in cuisine_types:
            cuisine_data = cuisine_preferences.get(cuisine.lower(), {})
            selections = cuisine_data.get('selections', 0)
            avg_rating = cuisine_data.get('avg_rating', 3.0)
            
            # Combine selection frequency with average rating
            frequency_score = selections / total_selections
            rating_score = (avg_rating - 1) / 4  # Normalize 1-5 to 0-1
            
            cuisine_score = (frequency_score * 0.7) + (rating_score * 0.3)
            score += cuisine_score
        
        return min(1.0, score)
    
    def _score_price_preference(self, price_level: int, user_profile: Dict) -> float:
        """Score based on learned price level preferences"""
        price_preferences = user_profile.get('price_preferences', {})
        
        if not price_preferences:
            return 0.5  # Neutral score
        
        price_data = price_preferences.get(str(price_level), {})
        selections = price_data.get('selections', 0)
        total_selections = price_preferences.get('total_selections', 1)
        
        if total_selections == 0:
            return 0.5
        
        return selections / total_selections
    
    def _score_dietary_compliance(self, restaurant: Dict, dietary_restrictions: List[str]) -> float:
        """Score based on dietary restriction compliance"""
        # This would integrate with restaurant data that includes dietary info
        # For now, return neutral score
        return 0.5
    
    def _generate_recommendation_reason(self, restaurant: Dict, user_profile: Dict, score: float) -> str:
        """Generate human-readable recommendation reason"""
        reasons = []
        
        if score >= 4.0:
            reasons.append("Highly recommended based on your preferences")
        elif score >= 3.0:
            reasons.append("Good match for your tastes")
        else:
            reasons.append("Might be worth trying")
        
        # Add specific reasons based on user profile
        cuisine_types = restaurant.get('cuisine_types', [])
        if cuisine_types and user_profile.get('cuisine_preferences'):
            for cuisine in cuisine_types:
                if cuisine.lower() in user_profile['cuisine_preferences']:
                    reasons.append(f"You've enjoyed {cuisine} food before")
                    break
        
        distance = restaurant.get('distance_miles', 0)
        if distance <= 2:
            reasons.append("Very close to your route")
        elif distance <= 5:
            reasons.append("Conveniently located")
        
        rating = restaurant.get('rating', 0)
        if rating >= 4.5:
            reasons.append("Highly rated by other customers")
        
        return ". ".join(reasons)
    
    def record_user_interaction(self, 
                              user_id: str,
                              restaurant: Dict,
                              interaction_type: str,
                              trip_id: Optional[str] = None,
                              rating: Optional[float] = None) -> None:
        """
        Record user interaction with restaurant for learning
        
        Args:
            user_id: User identifier
            restaurant: Restaurant data
            interaction_type: 'selected', 'visited', 'skipped', 'rated'
            trip_id: Associated trip ID
            rating: User rating if provided
        """
        interaction = {
            'timestamp': datetime.now().isoformat(),
            'user_id': user_id,
            'restaurant_id': restaurant.get('place_id', ''),
            'restaurant_name': restaurant.get('name', ''),
            'cuisine_types': restaurant.get('cuisine_types', []),
            'distance_miles': restaurant.get('distance_miles', 0),
            'price_level': restaurant.get('price_level', 2),
            'restaurant_rating': restaurant.get('rating', 0),
            'interaction_type': interaction_type,
            'trip_id': trip_id,
            'user_rating': rating
        }
        
        # Save interaction
        interactions = self._load_all_interactions()
        if user_id not in interactions:
            interactions[user_id] = []
        
        interactions[user_id].append(interaction)
        
        with open(self.interactions_file, 'w') as f:
            json.dump(interactions, f, indent=2)
        
        # Update user profile based on interaction
        self._update_user_profile(user_id, interaction)
    
    def _update_user_profile(self, user_id: str, interaction: Dict) -> None:
        """Update user profile based on interaction"""
        profiles = self._load_all_user_profiles()
        
        if user_id not in profiles:
            profiles[user_id] = {
                'user_id': user_id,
                'created_at': datetime.now().isoformat(),
                'distance_preferences': {'preferred_ranges': [], 'total_selections': 0},
                'cuisine_preferences': {'total_selections': 0},
                'price_preferences': {'total_selections': 0},
                'dietary_restrictions': [],
                'trip_count': 0,
                'total_interactions': 0
            }
        
        profile = profiles[user_id]
        profile['total_interactions'] += 1
        profile['last_interaction'] = datetime.now().isoformat()
        
        # Update based on interaction type
        if interaction['interaction_type'] in ['selected', 'visited']:
            self._update_distance_preferences(profile, interaction['distance_miles'])
            self._update_cuisine_preferences(profile, interaction['cuisine_types'], interaction.get('user_rating'))
            self._update_price_preferences(profile, interaction['price_level'])
        
        # Save updated profile
        with open(self.user_profiles_file, 'w') as f:
            json.dump(profiles, f, indent=2)
    
    def _update_distance_preferences(self, profile: Dict, distance: float) -> None:
        """Update distance preferences based on selection"""
        distance_prefs = profile['distance_preferences']
        
        # Define distance ranges
        ranges = [
            (0.0, 1.0),    # Very close
            (1.0, 3.0),    # Close
            (3.0, 7.0),    # Moderate
            (7.0, 15.0),   # Far
            (15.0, 25.0)   # Very far
        ]
        
        # Find the range this distance falls into
        for min_dist, max_dist in ranges:
            if min_dist <= distance <= max_dist:
                # Update preferences for this range
                range_found = False
                for range_data in distance_prefs['preferred_ranges']:
                    if range_data['range'] == [min_dist, max_dist]:
                        range_data['selections'] += 1
                        range_found = True
                        break
                
                if not range_found:
                    distance_prefs['preferred_ranges'].append({
                        'range': [min_dist, max_dist],
                        'selections': 1
                    })
                
                distance_prefs['total_selections'] += 1
                break
    
    def _update_cuisine_preferences(self, profile: Dict, cuisine_types: List[str], rating: Optional[float]) -> None:
        """Update cuisine preferences based on selection"""
        cuisine_prefs = profile['cuisine_preferences']
        
        for cuisine in cuisine_types:
            cuisine = cuisine.lower()
            
            if cuisine not in cuisine_prefs:
                cuisine_prefs[cuisine] = {
                    'selections': 0,
                    'total_rating': 0,
                    'rating_count': 0,
                    'avg_rating': 0
                }
            
            cuisine_data = cuisine_prefs[cuisine]
            cuisine_data['selections'] += 1
            
            if rating and rating > 0:
                cuisine_data['total_rating'] += rating
                cuisine_data['rating_count'] += 1
                cuisine_data['avg_rating'] = cuisine_data['total_rating'] / cuisine_data['rating_count']
        
        cuisine_prefs['total_selections'] += 1
    
    def _update_price_preferences(self, profile: Dict, price_level: int) -> None:
        """Update price level preferences based on selection"""
        price_prefs = profile['price_preferences']
        price_key = str(price_level)
        
        if price_key not in price_prefs:
            price_prefs[price_key] = {'selections': 0}
        
        price_prefs[price_key]['selections'] += 1
        price_prefs['total_selections'] += 1
    
    def _load_user_profile(self, user_id: str) -> Dict:
        """Load user profile from file"""
        profiles = self._load_all_user_profiles()
        return profiles.get(user_id, {})
    
    def _load_user_interactions(self, user_id: str) -> List[Dict]:
        """Load user interactions from file"""
        interactions = self._load_all_interactions()
        return interactions.get(user_id, [])
    
    def _load_all_user_profiles(self) -> Dict:
        """Load all user profiles from file"""
        try:
            with open(self.user_profiles_file, 'r') as f:
                return json.load(f)
        except (FileNotFoundError, json.JSONDecodeError):
            return {}
    
    def _load_all_interactions(self) -> Dict:
        """Load all user interactions from file"""
        try:
            with open(self.interactions_file, 'r') as f:
                return json.load(f)
        except (FileNotFoundError, json.JSONDecodeError):
            return {}

# Global instance
ai_engine = AIRecommendationEngine()