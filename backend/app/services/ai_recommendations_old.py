import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.metrics import mean_squared_error, r2_score
import joblib
import os
import json
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Tuple, Optional
from collections import defaultdict

logger = logging.getLogger(__name__)

class RestaurantRecommendationEngine:
    def __init__(self):
        self.model = None
        self.scaler = StandardScaler()
        self.cuisine_encoder = LabelEncoder()
        self.models_dir = 'models'
        self.data_dir = 'data'
        
        # Feature weights for recommendation scoring
        self.feature_weights = {
            'rating': 0.25,
            'distance_preference': 0.20,
            'cuisine_preference': 0.25,
            'price_preference': 0.15,
            'historical_choices': 0.15
        }
        
        # Load or initialize model
        self._load_or_initialize_model()
    
    def _load_or_initialize_model(self):
        """Load existing model or create new one"""
        try:
            model_path = os.path.join(self.models_dir, 'restaurant_recommender.pkl')
            scaler_path = os.path.join(self.models_dir, 'feature_scaler.pkl')
            encoder_path = os.path.join(self.models_dir, 'cuisine_encoder.pkl')
            
            if os.path.exists(model_path):
                self.model = joblib.load(model_path)
                self.scaler = joblib.load(scaler_path)
                self.cuisine_encoder = joblib.load(encoder_path)
                logger.info("Loaded existing ML model")
            else:
                self._initialize_new_model()
                
        except Exception as e:
            logger.error(f"Error loading model: {e}")
            self._initialize_new_model()
    
    def _initialize_new_model(self):
        """Initialize a new model with default parameters"""
        self.model = RandomForestRegressor(
            n_estimators=100,
            max_depth=10,
            random_state=42,
            min_samples_split=5
        )
        logger.info("Initialized new ML model")
    
    def get_recommendations(self, user_id: str, 
                          restaurants: List[Dict], 
                          user_preferences: Dict,
                          trip_context: Dict) -> List[Dict]:
        """
        Get personalized restaurant recommendations
        
        Args:
            user_id: User identifier
            restaurants: List of restaurant candidates
            user_preferences: User's dietary and cuisine preferences
            trip_context: Context about the current trip
            
        Returns:
            Ranked list of restaurant recommendations with scores
        """
        try:
            if not restaurants:
                return []
            
            # Load user history
            user_history = self._load_user_history(user_id)
            
            # Calculate recommendation scores
            scored_restaurants = []
            for restaurant in restaurants:
                score = self._calculate_recommendation_score(
                    restaurant, user_preferences, user_history, trip_context
                )
                
                restaurant_copy = restaurant.copy()
                restaurant_copy['recommendation_score'] = score
                restaurant_copy['recommendation_reasons'] = self._get_recommendation_reasons(
                    restaurant, user_preferences, user_history
                )
                scored_restaurants.append(restaurant_copy)
            
            # Sort by recommendation score (highest first)
            scored_restaurants.sort(key=lambda x: x['recommendation_score'], reverse=True)
            
            return scored_restaurants
            
        except Exception as e:
            logger.error(f"Error getting recommendations: {e}")
            return restaurants
    
    def _calculate_recommendation_score(self, restaurant: Dict, 
                                      user_preferences: Dict, 
                                      user_history: Dict,
                                      trip_context: Dict) -> float:
        """Calculate a comprehensive recommendation score"""
        try:
            score = 0.0
            
            # 1. Rating score (0-1)
            rating_score = restaurant.get('rating', 3.0) / 5.0
            score += rating_score * self.feature_weights['rating']
            
            # 2. Distance preference score (0-1)
            distance_score = self._calculate_distance_score(restaurant, user_history, trip_context)
            score += distance_score * self.feature_weights['distance_preference']
            
            # 3. Cuisine preference score (0-1)
            cuisine_score = self._calculate_cuisine_score(restaurant, user_preferences, user_history)
            score += cuisine_score * self.feature_weights['cuisine_preference']
            
            # 4. Price preference score (0-1)
            price_score = self._calculate_price_score(restaurant, user_history)
            score += price_score * self.feature_weights['price_preference']
            
            # 5. Historical choices score (0-1)
            history_score = self._calculate_history_score(restaurant, user_history)
            score += history_score * self.feature_weights['historical_choices']
            
            # Apply dietary restrictions penalty
            if not self._matches_dietary_restrictions(restaurant, user_preferences.get('dietary_restrictions', [])):
                score *= 0.3  # Heavy penalty for non-matching dietary restrictions
            
            return min(1.0, max(0.0, score))
            
        except Exception as e:
            logger.error(f"Error calculating recommendation score: {e}")
            return 0.5
    
    def _calculate_distance_score(self, restaurant: Dict, 
                                 user_history: Dict, 
                                 trip_context: Dict) -> float:
        """Calculate score based on user's distance preferences"""
        try:
            # Get user's historical distance tolerance
            past_distances = user_history.get('selected_distances', [])
            if not past_distances:
                # Default preference for moderate distances
                preferred_distance = trip_context.get('max_radius_miles', 10) * 0.6
            else:
                preferred_distance = np.mean(past_distances)
            
            restaurant_distance = restaurant.get('distance_from_start', 0)
            max_radius = trip_context.get('max_radius_miles', 20)
            
            # Calculate score - closer to user's preferred distance is better
            distance_diff = abs(restaurant_distance - preferred_distance)
            score = max(0, 1 - (distance_diff / max_radius))
            
            return score
            
        except Exception as e:
            logger.error(f"Error calculating distance score: {e}")
            return 0.5
    
    def _calculate_cuisine_score(self, restaurant: Dict, 
                                user_preferences: Dict, 
                                user_history: Dict) -> float:
        """Calculate score based on cuisine preferences"""
        try:
            restaurant_cuisines = set(restaurant.get('cuisine_types', []))
            
            # User's stated preferences
            preferred_cuisines = set(user_preferences.get('preferred_cuisines', []))
            
            # User's historical choices
            historical_cuisines = user_history.get('cuisine_frequency', {})
            
            score = 0.0
            
            # Direct preference match
            if restaurant_cuisines.intersection(preferred_cuisines):
                score += 0.6
            
            # Historical preference match
            for cuisine in restaurant_cuisines:
                historical_score = historical_cuisines.get(cuisine, 0)
                if historical_score > 0:
                    # Higher score for more frequently chosen cuisines
                    score += min(0.4, historical_score / 10)
            
            return min(1.0, score)
            
        except Exception as e:
            logger.error(f"Error calculating cuisine score: {e}")
            return 0.5
    
    def _calculate_price_score(self, restaurant: Dict, user_history: Dict) -> float:
        """Calculate score based on price preferences"""
        try:
            restaurant_price = restaurant.get('price_level', 2)
            
            # Get user's historical price preferences
            past_prices = user_history.get('selected_price_levels', [])
            if not past_prices:
                preferred_price = 2  # Default to moderate pricing
            else:
                preferred_price = np.mean(past_prices)
            
            # Calculate score - closer to user's preferred price level is better
            price_diff = abs(restaurant_price - preferred_price)
            score = max(0, 1 - (price_diff / 3))  # Max difference is 3 price levels
            
            return score
            
        except Exception as e:
            logger.error(f"Error calculating price score: {e}")
            return 0.5
    
    def _calculate_history_score(self, restaurant: Dict, user_history: Dict) -> float:
        """Calculate score based on historical choices"""
        try:
            # Check if user has visited similar restaurants
            similar_restaurants = user_history.get('similar_restaurants', [])
            restaurant_name = restaurant.get('name', '').lower()
            
            score = 0.0
            
            # Boost score for restaurant types user has chosen before
            for similar in similar_restaurants:
                if similar.get('rating', 0) >= 4.0:  # Only consider highly rated past choices
                    # Simple similarity check based on name keywords
                    if any(word in restaurant_name for word in similar.get('name', '').lower().split()):
                        score += 0.3
                        break
            
            return min(1.0, score)
            
        except Exception as e:
            logger.error(f"Error calculating history score: {e}")
            return 0.0
    
    def _matches_dietary_restrictions(self, restaurant: Dict, restrictions: List[str]) -> bool:
        """Check if restaurant matches dietary restrictions"""
        if not restrictions:
            return True
        
        # This is simplified - in production you'd have more sophisticated matching
        restaurant_types = [t.lower() for t in restaurant.get('types', [])]
        restaurant_cuisines = [c.lower() for c in restaurant.get('cuisine_types', [])]
        
        for restriction in restrictions:
            restriction = restriction.lower()
            if restriction in ['vegetarian', 'vegan']:
                # Check if restaurant has vegetarian/vegan options
                # This is a placeholder - you'd implement real dietary matching
                if any(term in restaurant_types + restaurant_cuisines 
                       for term in ['vegetarian', 'vegan', 'healthy']):
                    continue
                else:
                    return False
        
        return True
    
    def _get_recommendation_reasons(self, restaurant: Dict, 
                                  user_preferences: Dict, 
                                  user_history: Dict) -> List[str]:
        """Generate human-readable reasons for recommendation"""
        reasons = []
        
        # High rating
        rating = restaurant.get('rating', 0)
        if rating >= 4.5:
            reasons.append(f"Highly rated ({rating}⭐)")
        elif rating >= 4.0:
            reasons.append(f"Well rated ({rating}⭐)")
        
        # Cuisine match
        restaurant_cuisines = restaurant.get('cuisine_types', [])
        preferred_cuisines = user_preferences.get('preferred_cuisines', [])
        matching_cuisines = set(restaurant_cuisines).intersection(set(preferred_cuisines))
        if matching_cuisines:
            reasons.append(f"Matches your preference for {', '.join(matching_cuisines)}")
        
        # Distance
        distance = restaurant.get('distance_from_start', 0)
        if distance <= 2:
            reasons.append("Very close to your route")
        elif distance <= 5:
            reasons.append("Conveniently located")
        
        # Price level
        price_level = restaurant.get('price_level', 2)
        price_labels = {1: "Budget-friendly", 2: "Moderately priced", 3: "Upscale", 4: "High-end"}
        reasons.append(price_labels.get(price_level, "Moderately priced"))
        
        return reasons
    
    def record_user_interaction(self, user_id: str, restaurant: Dict, 
                               action: str, trip_context: Dict):
        """Record user interaction for learning"""
        try:
            interaction = {
                'timestamp': datetime.utcnow().isoformat(),
                'user_id': user_id,
                'restaurant': restaurant,
                'action': action,  # 'selected', 'dismissed', 'visited', 'rated'
                'trip_context': trip_context
            }
            
            # Save to user's interaction history
            self._save_user_interaction(user_id, interaction)
            
            # Update user's learning profile
            self._update_user_profile(user_id, interaction)
            
            logger.info(f"Recorded interaction: {user_id} {action} {restaurant.get('name')}")
            
        except Exception as e:
            logger.error(f"Error recording user interaction: {e}")
    
    def _save_user_interaction(self, user_id: str, interaction: Dict):
        """Save interaction to user's history file"""
        try:
            interactions_file = os.path.join(self.data_dir, 'users', f'{user_id}_interactions.json')
            
            # Load existing interactions
            interactions = []
            if os.path.exists(interactions_file):
                with open(interactions_file, 'r') as f:
                    interactions = json.load(f)
            
            # Add new interaction
            interactions.append(interaction)
            
            # Keep only last 1000 interactions
            interactions = interactions[-1000:]
            
            # Save updated interactions
            with open(interactions_file, 'w') as f:
                json.dump(interactions, f, indent=2)
                
        except Exception as e:
            logger.error(f"Error saving user interaction: {e}")
    
    def _update_user_profile(self, user_id: str, interaction: Dict):
        """Update user's learning profile based on interaction"""
        try:
            profile_file = os.path.join(self.data_dir, 'users', f'{user_id}_profile.json')
            
            # Load existing profile
            profile = {
                'cuisine_frequency': defaultdict(int),
                'selected_distances': [],
                'selected_price_levels': [],
                'similar_restaurants': [],
                'last_updated': datetime.utcnow().isoformat()
            }
            
            if os.path.exists(profile_file):
                with open(profile_file, 'r') as f:
                    saved_profile = json.load(f)
                    profile.update(saved_profile)
                    profile['cuisine_frequency'] = defaultdict(int, profile.get('cuisine_frequency', {}))
            
            # Update profile based on interaction
            if interaction['action'] in ['selected', 'visited']:
                restaurant = interaction['restaurant']
                
                # Update cuisine frequency
                for cuisine in restaurant.get('cuisine_types', []):
                    profile['cuisine_frequency'][cuisine] += 1
                
                # Update distance preferences
                distance = restaurant.get('distance_from_start', 0)
                profile['selected_distances'].append(distance)
                profile['selected_distances'] = profile['selected_distances'][-50:]  # Keep last 50
                
                # Update price preferences
                price_level = restaurant.get('price_level', 2)
                profile['selected_price_levels'].append(price_level)
                profile['selected_price_levels'] = profile['selected_price_levels'][-50:]  # Keep last 50
                
                # Update similar restaurants
                similar_restaurant = {
                    'name': restaurant.get('name', ''),
                    'rating': restaurant.get('rating', 0),
                    'cuisine_types': restaurant.get('cuisine_types', []),
                    'price_level': restaurant.get('price_level', 2)
                }
                profile['similar_restaurants'].append(similar_restaurant)
                profile['similar_restaurants'] = profile['similar_restaurants'][-20:]  # Keep last 20
            
            profile['last_updated'] = datetime.utcnow().isoformat()
            
            # Convert defaultdict back to regular dict for JSON serialization
            profile['cuisine_frequency'] = dict(profile['cuisine_frequency'])
            
            # Save updated profile
            with open(profile_file, 'w') as f:
                json.dump(profile, f, indent=2)
                
        except Exception as e:
            logger.error(f"Error updating user profile: {e}")
    
    def _load_user_history(self, user_id: str) -> Dict:
        """Load user's learning profile"""
        try:
            profile_file = os.path.join(self.data_dir, 'users', f'{user_id}_profile.json')
            
            if os.path.exists(profile_file):
                with open(profile_file, 'r') as f:
                    return json.load(f)
            
            return {
                'cuisine_frequency': {},
                'selected_distances': [],
                'selected_price_levels': [],
                'similar_restaurants': []
            }
            
        except Exception as e:
            logger.error(f"Error loading user history: {e}")
            return {}
    
    def retrain_model(self):
        """Retrain the ML model with accumulated user data"""
        try:
            # Load all user interaction data
            training_data = self._prepare_training_data()
            
            if len(training_data) < 10:  # Need minimum data points
                logger.info("Insufficient data for model retraining")
                return False
            
            # Prepare features and targets
            X, y = self._extract_features_and_targets(training_data)
            
            if len(X) == 0:
                logger.info("No valid features extracted for training")
                return False
            
            # Split data
            X_train, X_test, y_train, y_test = train_test_split(
                X, y, test_size=0.2, random_state=42
            )
            
            # Scale features
            X_train_scaled = self.scaler.fit_transform(X_train)
            X_test_scaled = self.scaler.transform(X_test)
            
            # Train model
            self.model.fit(X_train_scaled, y_train)
            
            # Evaluate model
            y_pred = self.model.predict(X_test_scaled)
            mse = mean_squared_error(y_test, y_pred)
            r2 = r2_score(y_test, y_pred)
            
            logger.info(f"Model retrained - MSE: {mse:.4f}, R2: {r2:.4f}")
            
            # Save updated model
            self._save_model()
            
            return True
            
        except Exception as e:
            logger.error(f"Error retraining model: {e}")
            return False
    
    def _prepare_training_data(self) -> List[Dict]:
        """Prepare training data from user interactions"""
        # This is a placeholder - implement based on your data structure
        return []
    
    def _extract_features_and_targets(self, training_data: List[Dict]) -> Tuple[np.ndarray, np.ndarray]:
        """Extract features and targets from training data"""
        # This is a placeholder - implement feature extraction
        return np.array([]), np.array([])
    
    def _save_model(self):
        """Save the trained model"""
        try:
            os.makedirs(self.models_dir, exist_ok=True)
            
            joblib.dump(self.model, os.path.join(self.models_dir, 'restaurant_recommender.pkl'))
            joblib.dump(self.scaler, os.path.join(self.models_dir, 'feature_scaler.pkl'))
            joblib.dump(self.cuisine_encoder, os.path.join(self.models_dir, 'cuisine_encoder.pkl'))
            
            logger.info("Model saved successfully")
            
        except Exception as e:
            logger.error(f"Error saving model: {e}")