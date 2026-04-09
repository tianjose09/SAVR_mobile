import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, StatusBar, Platform } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { ApiService } from '../services/api';

export default function FoodDonationPickup({ route, navigation }: any) {
  const [location, setLocation] = useState({
    latitude: 14.5995, 
    longitude: 120.9842,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });
  
  const [pickupDate, setPickupDate] = useState<Date>(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const { foodItems } = route.params || { foodItems: [] };

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;
      
      try {
        let loc = await Location.getCurrentPositionAsync({});
        setLocation({
          ...location,
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
        });
      } catch (e) {}
    })();
  }, []);

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      const formData = new FormData();
      
      // Send correct literal strings required by the PHP Backend
      formData.append('schedule_type', 'pickup');
      formData.append('pickup_latitude', location.latitude.toString());
      formData.append('pickup_longitude', location.longitude.toString());
      formData.append('pickup_address', 'Coordinates Pinned Location'); // Fulfill required_if
      
      const dateStr = pickupDate.toISOString().split('T')[0];
      const timeStr = pickupDate.toTimeString().split(' ')[0].substring(0, 5); 
      formData.append('preferred_date', dateStr);
      formData.append('time_slot', timeStr);

      formData.append('food_items', JSON.stringify(foodItems.map((fi: any) => ({
        type: fi.type,
        quantity: fi.quantity,
        expiry_date: fi.expiryDate
      }))));

      foodItems.forEach((item: any, idx: number) => {
        if (item.photoUri) {
          const filename = item.photoUri.split('/').pop() || `food_${idx}.jpg`;
          const match = /\.(\w+)$/.exec(filename);
          const type = match ? `image/${match[1]}` : `image`;
          // @ts-ignore
          formData.append(`food_images[${idx}]`, { uri: item.photoUri, name: filename, type });
        }
      });

      const response = await ApiService.submitFoodDonation(formData);
      if (response.data.success) {
        Alert.alert('Success', 'Donation pickup scheduled!');
        navigation.navigate('DonorDashboard');
      } else {
        Alert.alert('Error', response.data.message || 'Failed to submit.');
      }
    } catch (e: any) {
      console.log(e.response?.data);
      Alert.alert('Error', e.response?.data?.message || 'Connection error.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1E583A" translucent={false} />

      {/* MATCHING HCI HERO HEADER */}
      <View style={styles.heroBackground}>
        <View style={styles.topNav}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.canGoBack() ? navigation.goBack() : navigation.navigate('HomeTabs', { screen: 'Home' })}>
             <Ionicons name="arrow-undo" size={28} color="#FFF" />
          </TouchableOpacity>
          <View style={styles.logoRow}>
            <Text style={styles.logoText}>Philippine <Text style={{fontWeight: '900'}}>FoodBank</Text></Text>
            <Text style={styles.logoSub}>Foundation, Inc.</Text>
          </View>
          <View style={{width: 40}} />
        </View>

        <View style={styles.heroContent}>
          <Text style={styles.heroTitleMain}>
            SCHEDULE <Text style={styles.heroTitleHighlight}>PICKUP</Text>
          </Text>
        </View>
      </View>

      <View style={styles.mapContainer}>
        <MapView
          provider={PROVIDER_GOOGLE}
          style={styles.map}
          region={location}
          onRegionChangeComplete={(reg) => setLocation(reg)}
        />
        <View style={styles.markerFixed}>
          <Ionicons name="location" size={50} color="#CA6F2E" />
        </View>
        <View style={styles.mapOverlay}>
          <Text style={styles.mapOverlayText}>Drag the map to pinpoint your location</Text>
        </View>
      </View>

      <View style={styles.bottomPanel}>
        <Text style={styles.sectionTitle}>Pickup Time</Text>
        
        <View style={styles.dateRow}>
          <TouchableOpacity style={styles.dateBtn} onPress={() => setShowDatePicker(true)}>
            <Text style={styles.dateLabel}>Date: </Text>
            <Text style={styles.dateValue}>{pickupDate.toLocaleDateString()}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.dateBtn} onPress={() => setShowTimePicker(true)}>
            <Text style={styles.dateLabel}>Time: </Text>
            <Text style={styles.dateValue}>
              {pickupDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </TouchableOpacity>
        </View>

        {showDatePicker && (
          <DateTimePicker
            value={pickupDate}
            mode="date"
            minimumDate={new Date()}
            onChange={(event, selectedDate) => {
               setShowDatePicker(false);
               if (selectedDate) setPickupDate(selectedDate);
            }}
          />
        )}

        {showTimePicker && (
          <DateTimePicker
            value={pickupDate}
            mode="time"
            onChange={(event, selectedDate) => {
              setShowTimePicker(false);
              if (selectedDate) setPickupDate(selectedDate);
            }}
          />
        )}

        <TouchableOpacity 
          style={[styles.confirmBtn, isLoading && { backgroundColor: '#A7C2B2' }]} 
          onPress={handleSubmit}
          disabled={isLoading}
        >
          {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.confirmBtnText}>Confirm Schedule</Text>}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  
  heroBackground: {
    backgroundColor: '#1E583A', 
    borderBottomLeftRadius: 30, borderBottomRightRadius: 30,
    paddingTop: Platform.OS === 'ios' ? 45 : 35,
    paddingBottom: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 10, elevation: 8,
    zIndex: 2 // Keep it casting shadow over map
  },
  topNav: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, marginBottom: 15,
  },
  backButton: { padding: 5 },
  logoRow: { alignItems: 'center' },
  logoText: { color: '#FFF', fontSize: 16, fontFamily: 'sans-serif' },
  logoSub: { color: '#FFF', fontSize: 9, opacity: 0.8, marginTop: -2 },
  heroContent: { paddingHorizontal: 25 },
  heroTitleMain: { fontSize: 24, fontWeight: '900', color: '#FFF', letterSpacing: -0.5 },
  heroTitleHighlight: { color: '#FACC15' }, 
  
  mapContainer: { flex: 1, position: 'relative', marginTop: -25 }, // Suck it up under the curve
  map: { flex: 1 },
  markerFixed: {
    left: '50%', top: '50%', position: 'absolute',
    marginLeft: -25, marginTop: -50,
    justifyContent: 'flex-end', alignItems: 'center',
    shadowColor: '#000', shadowOffset: {width: 0, height: 4}, shadowOpacity: 0.3, shadowRadius: 4
  },
  mapOverlay: {
    position: 'absolute', top: 40, alignSelf: 'center',
    backgroundColor: '#CA6F2E', paddingHorizontal: 15, paddingVertical: 10, borderRadius: 20,
    alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2, shadowRadius: 4, elevation: 4,
  },
  mapOverlayText: { fontSize: 12, fontWeight: '800', color: '#FFF' },

  bottomPanel: {
    backgroundColor: '#fff', borderTopLeftRadius: 30, borderTopRightRadius: 30,
    padding: 25, shadowColor: '#000', shadowOffset: { width: 0, height: -5 },
    shadowOpacity: 0.1, shadowRadius: 10, elevation: 15, marginTop: -20,
  },
  sectionTitle: { fontSize: 18, fontWeight: '900', color: '#CA6F2E', marginBottom: 15 },
  dateRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 25 },
  dateBtn: {
    width: '48%', backgroundColor: '#F0F6F3', height: 50, borderRadius: 12,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: '#226E45'
  },
  dateLabel: { fontSize: 13, color: '#1E583A', fontWeight: '800' },
  dateValue: { fontSize: 13, fontWeight: '900', color: '#111' },

  confirmBtn: {
    backgroundColor: '#CA6F2E', height: 60, borderRadius: 16,
    justifyContent: 'center', alignItems: 'center',
    shadowColor: '#CA6F2E', shadowOffset: { width: 0, height: 6}, shadowOpacity: 0.3, shadowRadius: 10
  },
  confirmBtnText: { color: '#fff', fontSize: 16, fontWeight: '900', letterSpacing: 0.5 }
});
