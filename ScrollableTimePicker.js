import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Dimensions,
  TouchableOpacity
} from 'react-native';

const { width } = Dimensions.get('window');

const ScrollableTimePicker = ({ selectedTime, onTimeChange, theme }) => {
  const hourScrollRef = useRef(null);
  const minuteScrollRef = useRef(null);
  const periodScrollRef = useRef(null);

  const hours = Array.from({ length: 12 }, (_, i) => i + 1);
  const minutes = Array.from({ length: 4 }, (_, i) => i * 15);
  const periods = ['AM', 'PM'];

  const ITEM_HEIGHT = 50;
  const VISIBLE_ITEMS = 3;

  useEffect(() => {
    // Scroll to selected values on mount
    setTimeout(() => {
      if (hourScrollRef.current) {
        hourScrollRef.current.scrollTo({
          y: (selectedTime.hour - 1) * ITEM_HEIGHT,
          animated: false
        });
      }
      if (minuteScrollRef.current) {
        minuteScrollRef.current.scrollTo({
          y: (selectedTime.minute / 15) * ITEM_HEIGHT,
          animated: false
        });
      }
      if (periodScrollRef.current) {
        periodScrollRef.current.scrollTo({
          y: (selectedTime.period === 'PM' ? 1 : 0) * ITEM_HEIGHT,
          animated: false
        });
      }
    }, 100);
  }, []);

  const handleHourScroll = (event) => {
    const y = event.nativeEvent.contentOffset.y;
    const index = Math.round(y / ITEM_HEIGHT);
    const hour = hours[Math.max(0, Math.min(hours.length - 1, index))];
    if (hour !== selectedTime.hour) {
      onTimeChange('hour', hour);
    }
  };

  const handleMinuteScroll = (event) => {
    const y = event.nativeEvent.contentOffset.y;
    const index = Math.round(y / ITEM_HEIGHT);
    const minute = minutes[Math.max(0, Math.min(minutes.length - 1, index))];
    if (minute !== selectedTime.minute) {
      onTimeChange('minute', minute);
    }
  };

  const handlePeriodScroll = (event) => {
    const y = event.nativeEvent.contentOffset.y;
    const index = Math.round(y / ITEM_HEIGHT);
    const period = periods[Math.max(0, Math.min(periods.length - 1, index))];
    if (period !== selectedTime.period) {
      onTimeChange('period', period);
    }
  };

  const renderScrollItems = (items, selectedValue, isNumeric = false) => {
    return items.map((item, index) => {
      const isSelected = item === selectedValue;
      const displayValue = isNumeric && typeof item === 'number' 
        ? item.toString().padStart(2, '0') 
        : item.toString();
      
      return (
        <View key={index} style={styles.scrollItem}>
          <Text style={[
            styles.scrollItemText,
            {
              color: isSelected ? theme.text : theme.textSecondary,
              opacity: isSelected ? 1 : 0.5,
              fontSize: isSelected ? 24 : 20,
              fontWeight: isSelected ? 'bold' : 'normal',
            }
          ]}>
            {displayValue}
          </Text>
        </View>
      );
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.cardBg }]}>
      {/* Selection Overlay */}
      <View style={[styles.selectionOverlay, { borderColor: theme.border }]} />
      
      <View style={styles.pickersContainer}>
        {/* Hours */}
        <View style={styles.pickerColumn}>
          <ScrollView
            ref={hourScrollRef}
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            snapToInterval={ITEM_HEIGHT}
            decelerationRate="fast"
            onMomentumScrollEnd={handleHourScroll}
            scrollEventThrottle={16}
          >
            <View style={{ height: ITEM_HEIGHT }} />
            {renderScrollItems(hours, selectedTime.hour)}
            <View style={{ height: ITEM_HEIGHT }} />
          </ScrollView>
        </View>

        {/* Separator */}
        <View style={styles.separator}>
          <Text style={[styles.separatorText, { color: theme.text }]}>:</Text>
        </View>

        {/* Minutes */}
        <View style={styles.pickerColumn}>
          <ScrollView
            ref={minuteScrollRef}
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            snapToInterval={ITEM_HEIGHT}
            decelerationRate="fast"
            onMomentumScrollEnd={handleMinuteScroll}
            scrollEventThrottle={16}
          >
            <View style={{ height: ITEM_HEIGHT }} />
            {renderScrollItems(minutes, selectedTime.minute, true)}
            <View style={{ height: ITEM_HEIGHT }} />
          </ScrollView>
        </View>

        {/* Separator */}
        <View style={styles.separator}>
          <Text style={[styles.separatorText, { color: theme.textSecondary }]}> </Text>
        </View>

        {/* AM/PM */}
        <View style={styles.pickerColumn}>
          <ScrollView
            ref={periodScrollRef}
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            snapToInterval={ITEM_HEIGHT}
            decelerationRate="fast"
            onMomentumScrollEnd={handlePeriodScroll}
            scrollEventThrottle={16}
          >
            <View style={{ height: ITEM_HEIGHT }} />
            {renderScrollItems(periods, selectedTime.period)}
            <View style={{ height: ITEM_HEIGHT }} />
          </ScrollView>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 150,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
    marginVertical: 20,
  },
  selectionOverlay: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    height: 50,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    zIndex: 1,
    pointerEvents: 'none',
    opacity: 0.3,
  },
  pickersContainer: {
    flexDirection: 'row',
    height: '100%',
  },
  pickerColumn: {
    flex: 1,
    alignItems: 'center',
  },
  separator: {
    width: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  separatorText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    alignItems: 'center',
  },
  scrollItem: {
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  scrollItemText: {
    textAlign: 'center',
  },
});

export default ScrollableTimePicker;