import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Alert, ActivityIndicator, StatusBar } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { ApiService } from '../services/api';

export default function ServiceDonation({ navigation }: any) {
  // Field States matching backend requirements perfectly
  const [serviceType, setServiceType] = useState('');
  const [quantity, setQuantity] = useState('');
  const [frequency, setFrequency] = useState('');
  const [address, setAddress] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [description, setDescription] = useState('');
  
  // Logistics States
  const [date, setDate] = useState<Date>(new Date());
  const [startTime, setStartTime] = useState<Date>(new Date());
  const [endTime, setEndTime] = useState<Date>(new Date());
  const [isAllDay, setIsAllDay] = useState(false);
  
  // Overlays
  const [datePickerMode, setDatePickerMode] = useState<'date' | 'start' | 'end' | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!serviceType || !quantity || !frequency || !address || !firstName || !lastName || !email) {
      Alert.alert('Error', 'Please fill in all core fields in the service form.');
      return;
    }

    setIsLoading(true);
    try {
      const timeString = isAllDay 
          ? "All Day" 
          : `${startTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - ${endTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`;

      const payload = {
        service_type: serviceType,
        quantity: parseInt(quantity) || 1,
        frequency: frequency,
        service_date: date.toISOString().split('T')[0],
        service_time: timeString,
        address: address,
        contact_first_name: firstName,
        contact_last_name: lastName,
        contact_email: email,
        description: description,
      };

      const response = await ApiService.submitServiceDonation(payload);
      
      if (response.data.success) {
        Alert.alert('Success', 'Thank you for pledging your service! Our team will contact you soon.');
        navigation.navigate('HomeTabs', { screen: 'Home' });
      } else {
        Alert.alert('Error', response.data.message || 'Failed to submit service donation.');
      }
    } catch (e: any) {
      Alert.alert('Error', e.response?.data?.message || 'Connection error.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1E583A" translucent={false} />

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
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
              SERVICE <Text style={styles.heroTitleHighlight}>DONATION</Text>
            </Text>
            <Text style={styles.heroSubText}>
              Pledge your skills, vehicles, or equipment to assist our daily operations.
            </Text>
          </View>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          
          {/* Main Gold Card */}
          <View style={styles.goldCard}>
            
            {/* ROW 1: Type & Quantity */}
            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 2.5, marginRight: 10 }]}>
                <Text style={styles.label}>Service Donation Type</Text>
                <TextInput
                   style={styles.input}
                   placeholder="e.g. Delivery Truck, Chef"
                   placeholderTextColor="rgba(255,255,255,0.6)"
                   value={serviceType}
                   onChangeText={setServiceType}
                />
              </View>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.label}>Quantity</Text>
                <TextInput
                   style={styles.input}
                   placeholder="1"
                   placeholderTextColor="rgba(255,255,255,0.6)"
                   keyboardType="numeric"
                   value={quantity}
                   onChangeText={setQuantity}
                />
              </View>
            </View>

            {/* ROW 2: Frequency & Target Date */}
            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 1.5, marginRight: 10 }]}>
                <Text style={styles.label}>Frequency</Text>
                <TextInput
                   style={styles.input}
                   placeholder="e.g. Weekly, One-time"
                   placeholderTextColor="rgba(255,255,255,0.6)"
                   value={frequency}
                   onChangeText={setFrequency}
                />
              </View>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.label}>Date</Text>
                <TouchableOpacity style={[styles.pickerBox, {overflow: 'hidden'}]} onPress={() => Platform.OS !== 'ios' && setDatePickerMode('date')}>
                  <Text style={styles.pickerText}>{date.toLocaleDateString()}</Text>
                  <Ionicons name="calendar-outline" size={16} color="#FFF" />
                  {Platform.OS === 'ios' && (
                       <DateTimePicker
                         style={{ position: 'absolute', width: '100%', height: '100%', opacity: 0.011 }}
                         value={date}
                         mode="date"
                         display="compact"
                         minimumDate={new Date()}
                         onChange={(event, selectedDate) => {
                           if (selectedDate) setDate(selectedDate);
                         }}
                       />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* ROW 3: Time Bounds */}
            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                 <Text style={styles.label}>Starts At</Text>
                 <TouchableOpacity 
                   style={[styles.pickerBox, {overflow: 'hidden'}, isAllDay && {opacity: 0.5}]} 
                   onPress={() => Platform.OS !== 'ios' && !isAllDay && setDatePickerMode('start')}
                   disabled={isAllDay}
                 >
                    <Text style={styles.pickerText}>
                       {isAllDay ? '--:--' : startTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </Text>
                    <Ionicons name="time-outline" size={16} color="#FFF" />
                    {Platform.OS === 'ios' && !isAllDay && (
                       <DateTimePicker
                         style={{ position: 'absolute', width: '100%', height: '100%', opacity: 0.011 }}
                         value={startTime}
                         mode="time"
                         display="compact"
                         onChange={(event, selectedDate) => {
                           if (selectedDate) setStartTime(selectedDate);
                         }}
                       />
                    )}
                 </TouchableOpacity>
              </View>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                 <Text style={styles.label}>Ends At</Text>
                 <TouchableOpacity 
                   style={[styles.pickerBox, {overflow: 'hidden'}, isAllDay && {opacity: 0.5}]} 
                   onPress={() => Platform.OS !== 'ios' && !isAllDay && setDatePickerMode('end')}
                   disabled={isAllDay}
                 >
                    <Text style={styles.pickerText}>
                       {isAllDay ? '--:--' : endTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </Text>
                    <Ionicons name="time-outline" size={16} color="#FFF" />
                    {Platform.OS === 'ios' && !isAllDay && (
                       <DateTimePicker
                         style={{ position: 'absolute', width: '100%', height: '100%', opacity: 0.011 }}
                         value={endTime}
                         mode="time"
                         display="compact"
                         onChange={(event, selectedDate) => {
                           if (selectedDate) setEndTime(selectedDate);
                         }}
                       />
                    )}
                 </TouchableOpacity>
              </View>
            </View>
            
            <TouchableOpacity style={styles.checkboxRow} onPress={() => setIsAllDay(!isAllDay)}>
               <View style={styles.checkbox}>
                 {isAllDay && <Ionicons name="checkmark" size={16} color="#CA6F2E" />}
               </View>
               <Text style={styles.checkboxLabel}>All Day</Text>
            </TouchableOpacity>

            {/* ROW 4: Location */}
            <View style={styles.inputGroup}>
               <Text style={styles.label}>Address / Coverage</Text>
               <TextInput
                  style={styles.input}
                  placeholder="Input Address / Coverage Area"
                  placeholderTextColor="rgba(255,255,255,0.6)"
                  value={address}
                  onChangeText={setAddress}
               />
            </View>

            {/* ROW 5: Contact Details */}
            <Text style={styles.label}>Contact Person</Text>
            <View style={styles.row}>
               <TextInput
                  style={[styles.input, { flex: 1, marginRight: 8 }]}
                  placeholder="First Name"
                  placeholderTextColor="rgba(255,255,255,0.6)"
                  value={firstName}
                  onChangeText={setFirstName}
               />
               <TextInput
                  style={[styles.input, { flex: 1, marginRight: 8 }]}
                  placeholder="Last Name"
                  placeholderTextColor="rgba(255,255,255,0.6)"
                  value={lastName}
                  onChangeText={setLastName}
               />
               <TextInput
                  style={[styles.input, { flex: 1.2 }]}
                  placeholder="Email"
                  placeholderTextColor="rgba(255,255,255,0.6)"
                  keyboardType="email-address"
                  value={email}
                  onChangeText={setEmail}
               />
            </View>

            {/* ROW 6: Optional Payload */}
            <View style={[styles.inputGroup, { marginTop: 15 }]}>
               <Text style={styles.label}>Service Description / Extra Notes (optional)</Text>
               <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Input service description or extra notes..."
                  placeholderTextColor="rgba(255,255,255,0.6)"
                  multiline
                  numberOfLines={4}
                  value={description}
                  onChangeText={setDescription}
               />
            </View>

          </View>

          <TouchableOpacity 
            style={[styles.submitButton, isLoading && { backgroundColor: '#F3D580' }]} 
            onPress={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitBtnText}>Submit</Text>}
          </TouchableOpacity>

          <View style={{height: 60}} />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Shared Absolute OS Date/Time Picker */}
      {Platform.OS !== 'ios' && datePickerMode && (
        <DateTimePicker
          value={datePickerMode === 'date' ? date : (datePickerMode === 'start' ? startTime : endTime)}
          mode={datePickerMode === 'date' ? 'date' : 'time'}
          minimumDate={datePickerMode === 'date' ? new Date() : undefined}
          display="default"
          onChange={(event, selectedDate) => {
            const currentMode = datePickerMode;
            setDatePickerMode(null);
            
            if (event.type === 'set' && selectedDate) {
              if (currentMode === 'date') setDate(selectedDate);
              else if (currentMode === 'start') setStartTime(selectedDate);
              else if (currentMode === 'end') setEndTime(selectedDate);
            }
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  
  heroBackground: {
    backgroundColor: '#1E583A', 
    borderBottomLeftRadius: 30, borderBottomRightRadius: 30,
    paddingTop: Platform.OS === 'ios' ? 45 : 35,
    paddingBottom: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 10, elevation: 8,
  },
  topNav: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, marginBottom: 10,
  },
  backButton: { padding: 5 },
  logoRow: { alignItems: 'center' },
  logoText: { color: '#FFF', fontSize: 16, fontFamily: Platform.OS === 'ios' ? 'Helvetica' : 'sans-serif' },
  logoSub: { color: '#FFF', fontSize: 9, opacity: 0.8, marginTop: -2 },
  heroContent: { paddingHorizontal: 25 },
  heroTitleMain: { fontSize: 26, fontWeight: '900', color: '#FFF', letterSpacing: -0.5, marginBottom: 4 },
  heroTitleHighlight: { color: '#FACC15' }, 
  heroSubText: { fontSize: 13, color: 'rgba(255,255,255,0.9)', lineHeight: 18, fontWeight: '500' },

  scrollContent: { paddingHorizontal: 20, paddingTop: 25 },
  
  goldCard: {
    backgroundColor: '#EAA13A', // Matches the provided image explicitly
    padding: 20, borderRadius: 16, marginBottom: 20,
    shadowColor: '#EAA13A', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8, elevation: 5
  },

  row: { flexDirection: 'row', justifyContent: 'space-between' },
  inputGroup: { marginBottom: 15 },
  
  label: { color: '#FFF', fontSize: 12, fontWeight: '800', marginBottom: 6, marginLeft: 2 },
  input: {
    backgroundColor: 'rgba(255,255,255, 0.25)', 
    height: 48, borderRadius: 10, paddingHorizontal: 15,
    fontSize: 13, color: '#FFF', borderWidth: 1, borderColor: 'rgba(255,255,255,0.5)',
    fontWeight: '600'
  },
  textArea: { height: 100, paddingTop: 15, textAlignVertical: 'top' },

  pickerBox: {
    backgroundColor: 'rgba(255,255,255, 0.25)', height: 48, borderRadius: 10, paddingHorizontal: 15,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.5)',
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'
  },
  pickerText: { color: '#FFF', fontSize: 13, fontWeight: '600' },

  checkboxRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  checkbox: { width: 22, height: 22, backgroundColor: '#FFF', borderRadius: 4, justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  checkboxLabel: { color: '#FFF', fontSize: 13, fontWeight: '800' },

  submitButton: {
    backgroundColor: '#1E583A', height: 60, borderRadius: 16,
    justifyContent: 'center', alignItems: 'center',
    shadowColor: '#1E583A', shadowOffset: { width: 0, height: 6}, shadowOpacity: 0.3, shadowRadius: 10
  },
  submitBtnText: { color: '#FFF', fontSize: 16, fontWeight: '900', letterSpacing: 0.5 }
});
