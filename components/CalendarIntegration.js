import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, Alert } from 'react-native';
import GoogleAuthService from './services/GoogleAuthService';

const CalendarIntegration = ({ theme }) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchCalendarEvents = async () => {
    setLoading(true);
    try {
      const result = await GoogleAuthService.getCalendarEvents();
      if (result.success) {
        setEvents(result.events);
        Alert.alert(
          'Calendar Access Success',
          `Found ${result.events.length} events in your calendar!`
        );
      } else {
        Alert.alert('Error', result.error);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch calendar events');
    } finally {
      setLoading(false);
    }
  };

  const renderEvent = ({ item }) => (
    <View style={[styles.eventItem, { backgroundColor: theme.cardBg }]}>
      <Text style={[styles.eventTitle, { color: theme.text }]}>
        {item.summary || 'No Title'}
      </Text>
      <Text style={[styles.eventTime, { color: theme.textSecondary }]}>
        {item.start?.dateTime 
          ? new Date(item.start.dateTime).toLocaleDateString()
          : item.start?.date || 'No date'
        }
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.button, { backgroundColor: theme.accent }]}
        onPress={fetchCalendarEvents}
        disabled={loading}
      >
        <Text style={[styles.buttonText, { color: theme.accentText }]}>
          {loading ? 'Loading...' : 'Fetch Calendar Events'}
        </Text>
      </TouchableOpacity>

      {events.length > 0 && (
        <FlatList
          data={events.slice(0, 5)} // Show first 5 events
          keyExtractor={(item) => item.id}
          renderItem={renderEvent}
          style={styles.eventsList}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  eventsList: {
    marginTop: 15,
    maxHeight: 200,
  },
  eventItem: {
    padding: 12,
    marginVertical: 4,
    borderRadius: 8,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  eventTime: {
    fontSize: 14,
    marginTop: 4,
  },
});

export default CalendarIntegration;