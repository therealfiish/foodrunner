import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Dimensions,
  ScrollView,
  TextInput,
  Alert
} from 'react-native';
import { useOnboarding } from './datacollection';
import { useSystemTheme } from './theme';

const { width, height } = Dimensions.get('window');

const TripScreen = ({ onNext }) => {
  const { onboardingData, updateOnboardingData } = useOnboarding();
  const { isDarkMode, theme } = useSystemTheme();
  
  // Local state for addresses
  const [pointA, setPointA] = useState('');
  const [pointB, setPointB] = useState('');
  const [pointAPlaceId, setPointAPlaceId] = useState('');
  const [pointBPlaceId, setPointBPlaceId] = useState('');
  const [isLoadingA, setIsLoadingA] = useState(false);
  const [isLoadingB, setIsLoadingB] = useState(false);
  
  // Local state for departure time
  const [departureHour, setDepartureHour] = useState(12);
  const [departureMinute, setDepartureMinute] = useState(0);
  const [departureAmPm, setDepartureAmPm] = useState('PM');

  // Refs for autocomplete
  const pointARef = useRef(null);
  const pointBRef = useRef(null);

  // TODO: Implement Google Places Autocomplete integration
  // For now, using simple text inputs as placeholder
  const handleAddressChange = (text, point) => {
    if (point === 'A') {
      setPointA(text);
      // TODO: Trigger Google Places autocomplete API call
    } else {
      setPointB(text);
      // TODO: Trigger Google Places autocomplete API call
    }
  };

  const validateAddresses = () => {
    if (!pointA.trim()) {
      Alert.alert('Missing Address', 'Please enter your starting point (Point A)');
      return false;
    }
    if (!pointB.trim()) {
      Alert.alert('Missing Address', 'Please enter your destination (Point B)');
      return false;
    }
    
    // Format departure time for storage
    const formattedTime = `${departureHour}:${departureMinute.toString().padStart(2, '0')} ${departureAmPm}`;
    const departureTime = formattedTime;
    return true;
  };

  const handleContinue = () => {
    if (!validateAddresses()) return;

    // Format departure time for storage
    const formattedTime = `${departureHour}:${departureMinute.toString().padStart(2, '0')} ${departureAmPm}`;

    // Store trip data in onboarding context
    updateOnboardingData({
      trip: {
        pointA: pointA,
        pointB: pointB,
        pointAPlaceId: pointAPlaceId,
        pointBPlaceId: pointBPlaceId,
        departureTime: formattedTime,
        estimatedDuration: null,
        estimatedDistance: null,
        routeCompleted: false
      },
      currentStep: 'complete'
    });

    // Navigate to home page
    onNext('home');
  };

  const handleSkip = () => {
    updateOnboardingData({
      tripPointA: '',
      tripPointB: '',
      tripPointAPlaceId: '',
      tripPointBPlaceId: '',
      currentStep: 'complete'
    });
    onNext('home');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.appTitle, { color: theme.text, textAlign: 'center', flex: 1 }]}>FOOD RUNNER</Text>
      </View>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Page title */}
        <View style={styles.pageHeader}>
          <Text style={[styles.pageTitle, { color: theme.textSecondary }]}>Trip Planning</Text>
        </View>

        {/* Main question */}
        <View style={styles.titleSection}>
          <Text style={[styles.mainTitle, { color: theme.text }]}>
            Where are you traveling?
          </Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            Tell us your journey so we can find the best food stops along the way
          </Text>
        </View>

        {/* Point A Section */}
        <View style={styles.addressSection}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Point A (Starting Location)</Text>
          <View style={[styles.inputContainer, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
            <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>📍</Text>
            <TextInput
              ref={pointARef}
              style={[styles.addressInput, { color: theme.text }]}
              placeholder="Enter your starting address..."
              placeholderTextColor={theme.textSecondary}
              value={pointA}
              onChangeText={(text) => handleAddressChange(text, 'A')}
              multiline={false}
              autoCapitalize="words"
              autoComplete="street-address"
            />
          </View>
          <Text style={[styles.inputHint, { color: theme.textSecondary }]}>
            e.g., "123 Main St, New York, NY" or "Times Square"
          </Text>
        </View>

        {/* Point B Section */}
        <View style={styles.addressSection}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Point B (Destination)</Text>
          <View style={[styles.inputContainer, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
            <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>🎯</Text>
            <TextInput
              ref={pointBRef}
              style={[styles.addressInput, { color: theme.text }]}
              placeholder="Enter your destination address..."
              placeholderTextColor={theme.textSecondary}
              value={pointB}
              onChangeText={(text) => handleAddressChange(text, 'B')}
              multiline={false}
              autoCapitalize="words"
              autoComplete="street-address"
            />
          </View>
          <Text style={[styles.inputHint, { color: theme.textSecondary }]}>
            e.g., "456 Oak Ave, Los Angeles, CA" or "Hollywood Sign"
          </Text>
        </View>

        {/* Departure Time Section */}
        <View style={styles.addressSection}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Departure Time</Text>
          <Text style={[styles.inputHint, { color: theme.textSecondary, marginBottom: 15 }]}>
            When are you planning to leave Point A?
          </Text>
          <View style={styles.timePickerContainer}>
            {/* Hour Picker */}
            <ScrollView
              style={[styles.timePickerColumn, { backgroundColor: theme.cardBg, borderColor: theme.border }]}
              contentContainerStyle={styles.timePickerContent}
              showsVerticalScrollIndicator={false}
              snapToInterval={50}
              decelerationRate="fast"
              onMomentumScrollEnd={(event) => {
                const hour = Math.round(event.nativeEvent.contentOffset.y / 50) + 1;
                setDepartureHour(hour > 12 ? hour - 12 : (hour === 0 ? 12 : hour));
              }}
            >
              {Array.from({ length: 12 }, (_, i) => (
                <View key={i + 1} style={styles.timePickerItem}>
                  <Text style={[
                    styles.timePickerText,
                    { color: departureHour === (i + 1) ? theme.accent : theme.text }
                  ]}>
                    {i + 1}
                  </Text>
                </View>
              ))}
            </ScrollView>

            <Text style={[styles.timePickerSeparator, { color: theme.text }]}>:</Text>

            {/* Minute Picker */}
            <ScrollView
              style={[styles.timePickerColumn, { backgroundColor: theme.cardBg, borderColor: theme.border }]}
              contentContainerStyle={styles.timePickerContent}
              showsVerticalScrollIndicator={false}
              snapToInterval={50}
              decelerationRate="fast"
              onMomentumScrollEnd={(event) => {
                const minute = Math.round(event.nativeEvent.contentOffset.y / 50) * 5;
                setDepartureMinute(minute >= 60 ? 0 : minute);
              }}
            >
              {Array.from({ length: 12 }, (_, i) => (
                <View key={i * 5} style={styles.timePickerItem}>
                  <Text style={[
                    styles.timePickerText,
                    { color: departureMinute === (i * 5) ? theme.accent : theme.text }
                  ]}>
                    {(i * 5).toString().padStart(2, '0')}
                  </Text>
                </View>
              ))}
            </ScrollView>

            {/* AM/PM Picker */}
            <ScrollView
              style={[styles.timePickerColumn, { backgroundColor: theme.cardBg, borderColor: theme.border }]}
              contentContainerStyle={styles.timePickerContent}
              showsVerticalScrollIndicator={false}
              snapToInterval={50}
              decelerationRate="fast"
              onMomentumScrollEnd={(event) => {
                const amPmIndex = Math.round(event.nativeEvent.contentOffset.y / 50);
                setDepartureAmPm(amPmIndex === 0 ? 'AM' : 'PM');
              }}
            >
              {['AM', 'PM'].map((period) => (
                <View key={period} style={styles.timePickerItem}>
                  <Text style={[
                    styles.timePickerText,
                    { color: departureAmPm === period ? theme.accent : theme.text }
                  ]}>
                    {period}
                  </Text>
                </View>
              ))}
            </ScrollView>
          </View>
          
          <Text style={[styles.selectedTimeText, { color: theme.textSecondary, textAlign: 'center', marginTop: 15 }]}>
            Selected time: {departureHour}:{departureMinute.toString().padStart(2, '0')} {departureAmPm}
          </Text>
        </View>

        {/* Info Section */}
        <View style={styles.infoSection}>
          <Text style={[styles.infoText, { color: theme.textSecondary }]}>
            🗺️ We'll use this route to find amazing restaurants and food stops perfectly positioned along your journey.
          </Text>
        </View>
      </ScrollView>

      {/* Bottom Actions */}
      <View style={[styles.bottomActions, { backgroundColor: theme.bg }]}>
        <TouchableOpacity
          onPress={handleContinue}
          style={[styles.continueButton, { backgroundColor: theme.accent }]}
        >
          <Text style={[styles.continueButtonText, { color: theme.accentText }]}>
            Complete Setup
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
          <Text style={[styles.skipButtonText, { color: theme.textSecondary }]}>
            Skip for now
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
  header: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8,
  },
  appTitle: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  pageHeader: {
    marginTop: 20,
    marginBottom: 20,
  },
  pageTitle: {
    fontSize: 18,
    fontWeight: '500',
  },
  titleSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  mainTitle: {
    fontSize: width > 400 ? 32 : 28,
    fontWeight: '300',
    textAlign: 'center',
    lineHeight: width > 400 ? 40 : 36,
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  addressSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '500',
    marginBottom: 12,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 4,
    minHeight: 56,
  },
  inputLabel: {
    fontSize: 20,
    marginRight: 12,
  },
  addressInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 12,
    minHeight: 48,
  },
  inputHint: {
    fontSize: 14,
    marginTop: 8,
    fontStyle: 'italic',
  },
  infoSection: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderRadius: 12,
    padding: 20,
    marginTop: 20,
  },
  infoText: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
  },
  bottomActions: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  continueButton: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 12,
  },
  continueButtonText: {
    fontSize: 18,
    fontWeight: '600',
  },
  skipButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  skipButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  timePickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  timePickerColumn: {
    width: 80,
    height: 150,
    borderWidth: 1,
    borderRadius: 12,
    marginHorizontal: 8,
  },
  timePickerContent: {
    paddingVertical: 50,
  },
  timePickerItem: {
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timePickerText: {
    fontSize: 18,
    fontWeight: '500',
  },
  timePickerSeparator: {
    fontSize: 24,
    fontWeight: 'bold',
    marginHorizontal: 4,
  },
  selectedTimeText: {
    fontSize: 16,
    fontWeight: '500',
  },
});

export default TripScreen;