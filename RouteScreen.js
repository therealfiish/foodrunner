import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Dimensions,
  FlatList
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { useSystemTheme } from './theme';
import { useOnboarding } from './datacollection';

const { width, height } = Dimensions.get('window');

const RouteScreen = ({ navigation }) => {
  const { onboardingData } = useOnboarding();
  const { isDarkMode, theme } = useSystemTheme();
  
  // State for route and restaurant data
  const [routeData, setRouteData] = useState(null);
  const [restaurantsByMeal, setRestaurantsByMeal] = useState({});
  const [selectedRestaurants, setSelectedRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('map'); // 'map' or 'list'
  const [selectedMealFilter, setSelectedMealFilter] = useState('all'); // 'all', 'breakfast', 'lunch', 'dinner'
  
  // Map reference
  const [mapRef, setMapRef] = useState(null);

  useEffect(() => {
    loadRouteData();
  }, []);

  const loadRouteData = async () => {
    try {
      setLoading(true);

      // Get trip data from onboarding
      const trip = onboardingData.trip;
      console.log('Trip data:', trip); // Debug log
      console.log('Full onboarding data:', JSON.stringify(onboardingData, null, 2)); // Debug log
      console.log('Meal preferences debug:', onboardingData.mealPreferences); // Meal preferences debug
      
      if (!trip || !trip.pointA || !trip.pointB) {
        Alert.alert('Error', 'Trip information is missing. Please complete the trip setup.');
        navigation.goBack();
        return;
      }

      console.log('Point A:', trip.pointA);
      console.log('Point B:', trip.pointB);

      // Prepare request data
      const requestData = {
        start_location: {
          lat: 40.7128, // Default NYC - will be updated when we have geocoding
          lng: -74.0060,
          address: trip.pointA
        },
        end_location: {
          lat: 34.0522, // Default LA - will be updated when we have geocoding
          lng: -118.2437,
          address: trip.pointB
        },
        departure_time: trip.departureTime || '09:00 AM',
        meal_preferences: {
          breakfast: {
            enabled: true, // Always enable for route planning
            radius_miles: 5.0,
            time: formatTimePreference(onboardingData.mealPreferences?.breakfast?.time),
            preferred_time: onboardingData.mealPreferences?.breakfast?.time || {}
          },
          lunch: {
            enabled: true, // Always enable for route planning
            radius_miles: 10.0,
            time: formatTimePreference(onboardingData.mealPreferences?.lunch?.time),
            preferred_time: onboardingData.mealPreferences?.lunch?.time || {}
          },
          dinner: {
            enabled: true, // Always enable for route planning
            radius_miles: 15.0,
            time: formatTimePreference(onboardingData.mealPreferences?.dinner?.time),
            preferred_time: onboardingData.mealPreferences?.dinner?.time || {}
          }
        },
        dietary_restrictions: onboardingData.dietaryRestrictions || [],
        preferred_cuisines: [], // Will be populated from cuisines if available
        daily_budget: onboardingData.dailyBudget || 50.0
      };

      console.log('Sending request to backend:', JSON.stringify(requestData, null, 2));

      // Call backend API
      const response = await fetch('http://35.3.252.14:3001/api/trips/plan-route', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData)
      });

      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Backend error:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const data = await response.json();
      console.log('Received data:', data);
      
      setRouteData(data.route);
      setRestaurantsByMeal(data.restaurants_by_meal);
      
      // Fit map to route
      if (mapRef && data.route.bbox) {
        const [minLon, minLat, maxLon, maxLat] = data.route.bbox;
        mapRef.fitToCoordinates(
          [
            { latitude: minLat, longitude: minLon },
            { latitude: maxLat, longitude: maxLon }
          ],
          {
            edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
            animated: true
          }
        );
      }

    } catch (error) {
      console.error('Error loading route data:', error);
      Alert.alert('Error', 'Failed to load route data. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatTimePreference = (timeObj) => {
    if (!timeObj || !timeObj.hour) return '12:00 PM';
    const { hour, minute = 0, period = 'PM' } = timeObj;
    return `${hour}:${minute.toString().padStart(2, '0')} ${period}`;
  };

  const getMealColor = (mealType) => {
    const colors = {
      breakfast: '#FF6B35',  // Orange
      lunch: '#4ECDC4',      // Teal
      dinner: '#6C5CE7'      // Purple
    };
    return colors[mealType] || theme.accent;
  };

  const getRouteCoordinates = () => {
    if (!routeData?.geometry?.coordinates) return [];
    
    // Convert from [lon, lat] to {latitude, longitude}
    return routeData.geometry.coordinates.map(coord => ({
      latitude: coord[1],
      longitude: coord[0]
    }));
  };

  const getAllRestaurants = () => {
    if (selectedMealFilter === 'all') {
      return Object.values(restaurantsByMeal).flat();
    }
    return restaurantsByMeal[selectedMealFilter] || [];
  };

  const toggleRestaurantSelection = (restaurant) => {
    setSelectedRestaurants(prev => {
      const isSelected = prev.some(r => r.osm_id === restaurant.osm_id);
      if (isSelected) {
        return prev.filter(r => r.osm_id !== restaurant.osm_id);
      } else {
        return [...prev, restaurant];
      }
    });
  };

  const isRestaurantSelected = (restaurant) => {
    return selectedRestaurants.some(r => r.osm_id === restaurant.osm_id);
  };

  const handleFinishSelection = async () => {
    if (selectedRestaurants.length === 0) {
      Alert.alert('No Selection', 'Please select at least one restaurant before finishing.');
      return;
    }

    try {
      // Send selections to backend for AI learning
      const learningData = {
        user_id: onboardingData.userId || 'anonymous',
        trip_context: {
          start_coords: [routeData?.start_location?.lat, routeData?.start_location?.lng],
          end_coords: [routeData?.end_location?.lat, routeData?.end_location?.lng],
          departure_time: onboardingData.trip?.departureTime || '09:00 AM',
          total_distance_miles: routeData?.distance_miles || 0,
          travel_duration_hours: routeData?.duration_hours || 0
        },
        selected_restaurants: selectedRestaurants.map(restaurant => ({
          osm_id: restaurant.osm_id,
          name: restaurant.name,
          cuisine: restaurant.cuisine,
          meal_type: restaurant.meal_type,
          lat: restaurant.lat,
          lon: restaurant.lon,
          distance_from_route_miles: restaurant.distance_from_route_miles,
          price_level: restaurant.price_level,
          rating: restaurant.rating,
          dietary_info: restaurant.dietary_info
        })),
        user_preferences: {
          dietary_restrictions: onboardingData.dietaryRestrictions || [],
          preferred_cuisines: [], // Add if available
          daily_budget: onboardingData.dailyBudget || 50.0
        }
      };

      await fetch('http://35.3.252.14:3001/api/recommendations/learn-selections', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(learningData)
      });

      Alert.alert(
        'Route Planned!',
        `You've selected ${selectedRestaurants.length} restaurants for your trip. Have a great journey!`,
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('AuthScreen') // Navigate to home screen
          }
        ]
      );

    } catch (error) {
      console.error('Error saving selections:', error);
      Alert.alert('Success', `Route planned with ${selectedRestaurants.length} restaurants selected!`);
      navigation.navigate('AuthScreen');
    }
  };

  const renderRestaurantItem = ({ item: restaurant }) => (
    <TouchableOpacity
      style={[
        styles.restaurantCard,
        {
          backgroundColor: theme.cardBg,
          borderColor: isRestaurantSelected(restaurant) ? getMealColor(restaurant.meal_type) : theme.border
        },
        isRestaurantSelected(restaurant) && { borderWidth: 2 }
      ]}
      onPress={() => toggleRestaurantSelection(restaurant)}
    >
      <View style={styles.restaurantHeader}>
        <View style={styles.restaurantInfo}>
          <Text style={[styles.restaurantName, { color: theme.text }]}>{restaurant.name}</Text>
          <Text style={[styles.restaurantCuisine, { color: theme.textSecondary }]}>
            {restaurant.cuisine} • {restaurant.meal_type}
          </Text>
        </View>
        <View style={[styles.mealBadge, { backgroundColor: getMealColor(restaurant.meal_type) }]}>
          <Text style={styles.mealBadgeText}>{restaurant.meal_type.charAt(0).toUpperCase()}</Text>
        </View>
      </View>
      
      <Text style={[styles.restaurantAddress, { color: theme.textSecondary }]}>
        {restaurant.address}
      </Text>
      
      <View style={styles.restaurantMetrics}>
        <Text style={[styles.metric, { color: theme.textSecondary }]}>
          ⭐ {restaurant.rating.toFixed(1)}
        </Text>
        <Text style={[styles.metric, { color: theme.textSecondary }]}>
          📍 {restaurant.distance_from_route_miles.toFixed(1)}mi
        </Text>
        <Text style={[styles.metric, { color: theme.textSecondary }]}>
          💰 {'$'.repeat(restaurant.price_level)}
        </Text>
      </View>
      
      {isRestaurantSelected(restaurant) && (
        <View style={styles.selectedIndicator}>
          <Text style={styles.selectedText}>✓ Selected</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.accent} />
          <Text style={[styles.loadingText, { color: theme.text }]}>
            Planning your route and finding restaurants...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.bg, borderBottomColor: theme.border }]}>
        <Text style={[styles.title, { color: theme.text }]}>Your Route</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity
            style={[
              styles.viewModeButton,
              viewMode === 'map' && { backgroundColor: theme.accent }
            ]}
            onPress={() => setViewMode('map')}
          >
            <Text style={[
              styles.viewModeText,
              { color: viewMode === 'map' ? theme.accentText : theme.text }
            ]}>
              Map
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.viewModeButton,
              viewMode === 'list' && { backgroundColor: theme.accent }
            ]}
            onPress={() => setViewMode('list')}
          >
            <Text style={[
              styles.viewModeText,
              { color: viewMode === 'list' ? theme.accentText : theme.text }
            ]}>
              List
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Route Info */}
      {routeData && (
        <View style={[styles.routeInfo, { backgroundColor: theme.cardBg }]}>
          <Text style={[styles.routeText, { color: theme.text }]}>
            {routeData.distance_miles} mi • {routeData.duration_hours} hours
          </Text>
          <Text style={[styles.routeText, { color: theme.textSecondary }]}>
            {selectedRestaurants.length} restaurants selected
          </Text>
        </View>
      )}

      {/* Meal Filter */}
      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {['all', 'breakfast', 'lunch', 'dinner'].map(meal => (
            <TouchableOpacity
              key={meal}
              style={[
                styles.filterButton,
                selectedMealFilter === meal && { backgroundColor: getMealColor(meal) }
              ]}
              onPress={() => setSelectedMealFilter(meal)}
            >
              <Text style={[
                styles.filterText,
                { color: selectedMealFilter === meal ? 'white' : theme.text }
              ]}>
                {meal.charAt(0).toUpperCase() + meal.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Content */}
      {viewMode === 'map' ? (
        <MapView
          ref={setMapRef}
          style={styles.map}
          initialRegion={{
            latitude: 39.8283,
            longitude: -98.5795,
            latitudeDelta: 20,
            longitudeDelta: 20,
          }}
          mapType={isDarkMode ? 'mutedStandard' : 'standard'}
        >
          {/* Route Line */}
          {getRouteCoordinates().length > 0 && (
            <Polyline
              coordinates={getRouteCoordinates()}
              strokeColor={theme.accent}
              strokeWidth={3}
            />
          )}

          {/* Restaurant Markers */}
          {getAllRestaurants().map((restaurant, index) => (
            <Marker
              key={`${restaurant.osm_id}-${index}`}
              coordinate={{
                latitude: restaurant.lat,
                longitude: restaurant.lon
              }}
              pinColor={getMealColor(restaurant.meal_type)}
              onPress={() => toggleRestaurantSelection(restaurant)}
            >
              <View style={[
                styles.markerContainer,
                { backgroundColor: getMealColor(restaurant.meal_type) },
                isRestaurantSelected(restaurant) && styles.selectedMarker
              ]}>
                <Text style={styles.markerText}>
                  {restaurant.meal_type.charAt(0).toUpperCase()}
                </Text>
              </View>
            </Marker>
          ))}
        </MapView>
      ) : (
        <FlatList
          data={getAllRestaurants()}
          renderItem={renderRestaurantItem}
          keyExtractor={(item, index) => `${item.osm_id}-${index}`}
          style={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Bottom Actions */}
      <View style={[styles.bottomActions, { backgroundColor: theme.bg }]}>
        <TouchableOpacity
          onPress={handleFinishSelection}
          style={[styles.finishButton, { backgroundColor: theme.accent }]}
        >
          <Text style={[styles.finishButtonText, { color: theme.accentText }]}>
            Complete Route Planning ({selectedRestaurants.length})
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  loadingText: {
    marginTop: 20,
    fontSize: 16,
    textAlign: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    flexShrink: 0, // Prevent header from shrinking
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerButtons: {
    flexDirection: 'row',
  },
  viewModeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginLeft: 8,
  },
  viewModeText: {
    fontSize: 14,
    fontWeight: '500',
  },
  routeInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    minHeight: 50, // Set minimum height to prevent expansion
  },
  routeText: {
    fontSize: 14,
    fontWeight: '500',
  },
  filterContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    maxHeight: 60, // Limit height to prevent stretching
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: 'transparent',
    minWidth: 80, // Ensure consistent button width
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
  },
  map: {
    flex: 1,
  },
  markerContainer: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  selectedMarker: {
    borderColor: '#FFD700',
    borderWidth: 3,
  },
  markerText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  list: {
    flex: 1,
    paddingHorizontal: 16,
  },
  restaurantCard: {
    padding: 16,
    marginVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
  },
  restaurantHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  restaurantInfo: {
    flex: 1,
  },
  restaurantName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  restaurantCuisine: {
    fontSize: 14,
  },
  mealBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mealBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  restaurantAddress: {
    fontSize: 12,
    marginBottom: 8,
  },
  restaurantMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metric: {
    fontSize: 12,
    flex: 1,
  },
  selectedIndicator: {
    marginTop: 8,
    alignItems: 'center',
  },
  selectedText: {
    color: '#10B981',
    fontSize: 14,
    fontWeight: '600',
  },
  bottomActions: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
    flexShrink: 0, // Prevent bottom actions from shrinking
  },
  finishButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  finishButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default RouteScreen;