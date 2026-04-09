import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Alert, Image, StatusBar } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';

interface FoodItem {
  id: string;
  name: string;
  quantity: string;
  unit: string;
  category: string;
  expiryDate: Date | null;
  specialNotes: string;
  photoUri: string | null;
}

export default function FoodDonationDetails({ navigation }: any) {
  const [items, setItems] = useState<FoodItem[]>([
    { id: '1', name: '', quantity: '', unit: '', category: '', expiryDate: null, specialNotes: '', photoUri: null }
  ]);
  const [showDatePickerId, setShowDatePickerId] = useState<string | null>(null);

  const addItem = () => {
    setItems([...items, { id: Math.random().toString(), name: '', quantity: '', unit: '', category: '', expiryDate: null, specialNotes: '', photoUri: null }]);
  };

  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id));
    } else {
      Alert.alert('Notice', 'You must donate at least one item.');
    }
  };

  const updateItem = (id: string, field: keyof FoodItem, value: any) => {
    setItems(items.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const pickImage = async (id: string) => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      updateItem(id, 'photoUri', result.assets[0].uri);
    }
  };

  const handleNext = (method: 'pickup' | 'delivery') => {
    // Validate
    for (let item of items) {
      if (!item.name || !item.quantity || !item.category || !item.expiryDate) {
        Alert.alert('Error', 'Please fill in all core fields (Name, Quantity, Category, Expiry) for every item.');
        return;
      }
    }

    // Pass data forward (Mapping schema to backward-compatible API shape implicitly)
    navigation.navigate(method === 'pickup' ? 'FoodDonationPickup' : 'FoodDonationDelivery', {
      foodItems: items.map(item => ({
        type: item.name,
        quantity: `${item.quantity} ${item.unit}`,
        expiryDate: item.expiryDate?.toISOString().split('T')[0],
        photoUri: item.photoUri
      }))
    });
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1E583A" translucent={false} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        
        {/* HERO SECTION WITH CURVED BOTTOM */}
        <View style={styles.heroBackground}>
          {/* Top Navbar */}
          <View style={styles.topNav}>
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.canGoBack() ? navigation.goBack() : navigation.navigate('HomeTabs', { screen: 'Home' })}>
               <Ionicons name="arrow-undo" size={28} color="#FFF" />
            </TouchableOpacity>
            <View style={styles.logoRow}>
              <Text style={styles.logoText}>Philippine <Text style={{fontWeight: '900'}}>FoodBank</Text></Text>
              <Text style={styles.logoSub}>Foundation, Inc.</Text>
            </View>
            <View style={{width: 40}} />{/* Spacer */}
          </View>

          {/* Hero Content */}
          <View style={styles.heroContent}>
            <Text style={styles.heroTitleMain}>
              FOOD <Text style={styles.heroTitleHighlight}>DONATION</Text>
            </Text>
            <Text style={styles.heroSubText}>
              Share surplus food items that can help nourish families and communities. Let's list what you want to donate below.
            </Text>
          </View>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          
          <View style={styles.headerFlexRow}>
             <Text style={styles.sectionTitle}>Food Donation Details</Text>
             <TouchableOpacity style={styles.addMoreBtn} onPress={addItem}>
                <Text style={styles.addMoreText}>Add More</Text>
             </TouchableOpacity>
          </View>

          {items.map((item, index) => (
            <View key={item.id} style={styles.bronzeCard}>
              
              {/* Card Header & Delete Button */}
              <View style={styles.cardHeader}>
                 <Text style={styles.cardNumber}>ITEM {index + 1}</Text>
                 <TouchableOpacity onPress={() => removeItem(item.id)} style={styles.deleteIconWrap} hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
                    <Ionicons name="trash-outline" size={20} color="#FFF" />
                 </TouchableOpacity>
              </View>

              {/* Row 1: Full Name */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Food Item Name</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Canned vegetables, Fresh fruits"
                  placeholderTextColor="rgba(255,255,255,0.6)"
                  value={item.name}
                  onChangeText={(val) => updateItem(item.id, 'name', val)}
                />
              </View>

              {/* Row 2: Quantity & Units */}
              <View style={styles.row}>
                <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                  <Text style={styles.label}>Quantity</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="##"
                    placeholderTextColor="rgba(255,255,255,0.6)"
                    keyboardType="numeric"
                    value={item.quantity}
                    onChangeText={(val) => updateItem(item.id, 'quantity', val)}
                  />
                </View>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.label}>Units</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. kg, packs"
                    placeholderTextColor="rgba(255,255,255,0.6)"
                    value={item.unit}
                    onChangeText={(val) => updateItem(item.id, 'unit', val)}
                  />
                </View>
              </View>

              {/* Row 3: Category & Expiration Date */}
              <View style={styles.row}>
                <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                  <Text style={styles.label}>Category</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Perishable"
                    placeholderTextColor="rgba(255,255,255,0.6)"
                    value={item.category}
                    onChangeText={(val) => updateItem(item.id, 'category', val)}
                  />
                </View>
                <View style={[styles.inputGroup, { flex: 1.2 }]}>
                  <Text style={styles.label}>Expiration Date</Text>
                  <TouchableOpacity style={[styles.dateInput, { overflow: 'hidden' }]} onPress={() => Platform.OS !== 'ios' && setShowDatePickerId(item.id)}>
                    <Text style={[styles.dateText, !item.expiryDate && {color: 'rgba(255,255,255,0.6)'}]}>
                      {item.expiryDate ? item.expiryDate.toLocaleDateString() : 'DD/MM/YYYY'}
                    </Text>
                    {Platform.OS === 'ios' && (
                       <DateTimePicker
                         style={{ position: 'absolute', width: '100%', height: '100%', opacity: 0.011 }}
                         value={item.expiryDate || new Date()}
                         mode="date"
                         display="compact"
                         minimumDate={new Date()}
                         onChange={(event, date) => {
                           if (date) updateItem(item.id, 'expiryDate', date);
                         }}
                       />
                    )}
                  </TouchableOpacity>
                  
                  {/* Android specific DatePicker rendering */}
                  {Platform.OS !== 'ios' && showDatePickerId === item.id && (
                    <DateTimePicker
                      value={item.expiryDate || new Date()}
                      mode="date"
                      display="default"
                      minimumDate={new Date()}
                      onChange={(event, date) => {
                        setShowDatePickerId(null);
                        if (event.type === 'set' && date) {
                          updateItem(item.id, 'expiryDate', date);
                        }
                      }}
                    />
                  )}
                </View>
              </View>

              {/* Row 4: Notes & Photo Upload */}
              <View style={[styles.row, {alignItems: 'flex-end', marginBottom: 0}]}>
                <View style={[styles.inputGroup, { flex: 2, marginRight: 10, marginBottom: 0 }]}>
                  <Text style={styles.label}>Special Notes</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Allergies, storage..."
                    placeholderTextColor="rgba(255,255,255,0.6)"
                    value={item.specialNotes}
                    onChangeText={(val) => updateItem(item.id, 'specialNotes', val)}
                  />
                </View>
                <View style={[styles.inputGroup, { flex: 1, marginBottom: 0 }]}>
                  <TouchableOpacity style={styles.uploadBtn} onPress={() => pickImage(item.id)}>
                    {item.photoUri ? (
                       <Image source={{ uri: item.photoUri }} style={{width: '100%', height: '100%', borderRadius: 8, resizeMode: 'cover'}} />
                    ) : (
                       <>
                         <Text style={styles.uploadText}>Upload</Text>
                         <Ionicons name="push-outline" size={14} color="#FFF" style={{marginLeft: 4, marginTop: -2}} />
                       </>
                    )}
                  </TouchableOpacity>
                </View>
              </View>

            </View>
          ))}

          {/* Delivery Logic UI - Preserved functionality, updated aesthetics */}
          <View style={styles.logisticsContainer}>
            <Text style={styles.logisticsHeader}>How will we receive this?</Text>
            
            <TouchableOpacity style={styles.logisticOption} onPress={() => handleNext('pickup')}>
              <View style={styles.logisticIconBg}><Ionicons name="location" size={24} color="#226E45" /></View>
              <View style={styles.logisticContent}>
                <Text style={styles.logisticTitle}>Request Pickup</Text>
                <Text style={styles.logisticDesc}>We'll route a SAVR transport.</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#CCC" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.logisticOption} onPress={() => handleNext('delivery')}>
              <View style={[styles.logisticIconBg, { backgroundColor: '#F0EFF8' }]}><Ionicons name="cube" size={24} color="#605B98" /></View>
              <View style={styles.logisticContent}>
                <Text style={styles.logisticTitle}>I'll Deliver It Directly</Text>
                <Text style={styles.logisticDesc}>Bring it safely to our warehouse.</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#CCC" />
            </TouchableOpacity>
          </View>

          <View style={{ height: 60 }} />
        </ScrollView>
      </KeyboardAvoidingView>
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
  heroTitleMain: { fontSize: 28, fontWeight: '900', color: '#FFF', letterSpacing: -0.5, marginBottom: 8 },
  heroTitleHighlight: { color: '#FACC15' }, 
  heroSubText: { fontSize: 13, color: 'rgba(255,255,255,0.9)', lineHeight: 18, fontWeight: '500' },

  scrollContent: { paddingHorizontal: 20, paddingTop: 25 },
  
  headerFlexRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  sectionTitle: { fontSize: 20, fontWeight: '900', color: '#111', letterSpacing: -0.5 },
  addMoreBtn: { 
    borderWidth: 1.5, borderColor: '#1E583A', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 6,
    flexDirection: 'row', alignItems: 'center' 
  },
  addMoreText: { color: '#1E583A', fontSize: 12, fontWeight: '800' },

  bronzeCard: {
    backgroundColor: '#CA6F2E', // The requested bronze/brown color
    padding: 20, borderRadius: 16, marginBottom: 20,
    shadowColor: '#CA6F2E', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  cardNumber: { color: '#FFF', fontSize: 14, fontWeight: '900', letterSpacing: 1 },
  deleteIconWrap: { backgroundColor: 'rgba(255,255,255,0.2)', padding: 6, borderRadius: 15, justifyContent: 'center', alignItems: 'center' },

  inputGroup: { marginBottom: 12 },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  
  label: { color: '#FFF', fontSize: 11, fontWeight: '800', marginBottom: 6, marginLeft: 2 },
  input: {
    backgroundColor: 'rgba(255,255,255, 0.15)', // Semi-transparent overlay to map image aesthetics natively
    height: 48, borderRadius: 10, paddingHorizontal: 15,
    fontSize: 13, color: '#FFF', borderWidth: 1, borderColor: 'rgba(255,255,255,0.4)',
    fontWeight: '600'
  },
  
  dateInput: {
    backgroundColor: 'rgba(255,255,255, 0.15)', height: 48, borderRadius: 10, paddingHorizontal: 15,
    justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.4)'
  },
  dateText: { color: '#FFF', fontSize: 13, fontWeight: '600' },

  uploadBtn: {
    flexDirection: 'row', backgroundColor: 'rgba(255,255,255, 0.15)', height: 48, borderRadius: 10,
    justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.4)'
  },
  uploadText: { color: '#FFF', fontSize: 12, fontWeight: '800' },

  logisticsContainer: { marginTop: 25 },
  logisticsHeader: { fontSize: 18, fontWeight: '900', color: '#1E583A', marginBottom: 15, letterSpacing: -0.5 },
  
  logisticOption: {
    flexDirection: 'row', backgroundColor: '#FFF', padding: 20, borderRadius: 16, marginBottom: 15,
    alignItems: 'center', borderColor: '#E1E9E4', borderWidth: 1.5,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5, elevation: 2
  },
  logisticIconBg: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#E1EDCD', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  logisticContent: { flex: 1 },
  logisticTitle: { fontSize: 15, fontWeight: '900', color: '#1B5B39', marginBottom: 2 },
  logisticDesc: { fontSize: 12, color: '#888', fontWeight: '600' }
});
