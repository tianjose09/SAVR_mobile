import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Alert, Linking, ActivityIndicator, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ApiService } from '../services/api';

export default function FinancialDonation({ navigation }: any) {
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const presetAmounts = ['500', '1000', '2000', '5000'];

  const handleDonate = async () => {
    const amountNum = parseFloat(amount);
    if (!amountNum || amountNum <= 0) {
      Alert.alert('Error', 'Please enter a valid amount.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await ApiService.createPaymongoCheckout({ amount: amountNum });
      if (response.data.success && response.data.checkout_url) {
        Linking.openURL(response.data.checkout_url);
        Alert.alert(
          'Payment Page Opened ✅',
          'Complete your payment in the browser. Your dashboard will update automatically when you return.',
          [{ text: 'Got it', onPress: () => navigation.goBack() }]
        );
      } else {
        Alert.alert('Error', 'Failed to generate payment link.');
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
              FINANCIAL <Text style={styles.heroTitleHighlight}>DONATION</Text>
            </Text>
            <Text style={styles.heroSubText}>
              Provide immediate monetary assistance to purchase bulk resources and sustain critical operations safely.
            </Text>
          </View>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          
          <View style={styles.sectionHeader}>
             <Text style={styles.sectionTitle}>Select Amount</Text>
          </View>

          {/* Preset Chips */}
          <View style={styles.amountGrid}>
            {presetAmounts.map((amt) => {
              const isActive = amount === amt;
              return (
                <TouchableOpacity 
                  key={amt} 
                  style={[styles.presetCard, isActive && styles.presetCardActive]}
                  onPress={() => setAmount(amt)}
                >
                  <Text style={[styles.presetText, isActive && styles.presetTextActive]}>₱ {amt}</Text>
                </TouchableOpacity>
              )
            })}
          </View>
          
          <Text style={styles.label}>Or enter custom amount (₱)</Text>
          <TextInput
            style={styles.input}
            placeholder="0.00"
            placeholderTextColor="#AAA"
            keyboardType="decimal-pad"
            value={amount}
            onChangeText={setAmount}
          />

          <View style={[styles.sectionHeader, { marginTop: 30 }]}>
            <Text style={styles.sectionTitle}>Payment Context</Text>
          </View>

          {/* Secure Payment Context - Solely PayMongo */}
          <View style={styles.secureMethodCard}>
             <Ionicons name="shield-checkmark" size={32} color="#1B5B39" style={{marginBottom: 8}} />
             <Text style={styles.secureMethodTitle}>Secured via PayMongo</Text>
             <Text style={styles.secureMethodDesc}>Accepts GCash, Maya, Credit & Debit Cards</Text>
             <View style={styles.badgesRow}>
                <View style={styles.miniBadge}><Text style={styles.miniBadgeText}>GCash</Text></View>
                <View style={styles.miniBadge}><Text style={styles.miniBadgeText}>Maya</Text></View>
                <View style={styles.miniBadge}><Text style={styles.miniBadgeText}>Visa/MC</Text></View>
             </View>
          </View>

          <TouchableOpacity 
            style={[styles.donateButton, isLoading && { backgroundColor: '#A7C2B2' }]} 
            onPress={handleDonate}
            disabled={isLoading}
          >
            {isLoading ? <ActivityIndicator color="#fff" /> : (
              <>
                 <Text style={styles.donateBtnText}>
                   Proceed Details via PayMongo
                 </Text>
              </>
            )}
          </TouchableOpacity>

          <View style={{height: 50}} />

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
    paddingBottom: 20,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 10, elevation: 8,
  },
  topNav: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, marginBottom: 10,
  },
  backButton: { padding: 5 },
  logoRow: { alignItems: 'center' },
  logoText: { color: '#FFF', fontSize: 16, fontFamily: Platform.OS === 'ios' ? 'Helvetica' : 'sans-serif' },
  logoSub: { color: '#FFF', fontSize: 9, opacity: 0.8, marginTop: -2 },
  
  heroContent: { paddingHorizontal: 25 },
  heroTitleMain: { fontSize: 26, fontWeight: '900', color: '#FFF', letterSpacing: -0.5, marginBottom: 8 },
  heroTitleHighlight: { color: '#FACC15' }, 
  heroSubText: { fontSize: 12, color: 'rgba(255,255,255,0.9)', lineHeight: 18, fontWeight: '500' },

  scrollContent: { paddingHorizontal: 20, paddingTop: 25 },
  
  sectionHeader: { marginBottom: 15 },
  sectionTitle: { fontSize: 20, fontWeight: '900', color: '#C07D4F', letterSpacing: -0.5 }, 
  
  amountGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 20 },
  presetCard: {
    width: '48%', backgroundColor: '#FFF', borderRadius: 16, paddingVertical: 18,
    alignItems: 'center', marginBottom: 15, borderWidth: 1.5, borderColor: '#E1E9E4',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2
  },
  presetCardActive: { backgroundColor: '#F0F6F3', borderColor: '#226E45' },
  presetText: { fontSize: 18, fontWeight: '900', color: '#888' },
  presetTextActive: { color: '#1B5B39' },

  label: { fontSize: 12, fontWeight: '800', color: '#685D52', marginBottom: 8, marginTop: 5 },
  input: {
    backgroundColor: '#FFF', height: 55, borderRadius: 16, paddingHorizontal: 20,
    fontSize: 18, fontWeight: '800', color: '#1B5B39', borderWidth: 1.5, borderColor: '#E1E9E4',
  },

  secureMethodCard: {
    backgroundColor: '#F0F6F3', borderRadius: 16, padding: 25,
    alignItems: 'center', borderWidth: 1.5, borderColor: '#226E45', marginBottom: 25,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 5, elevation: 2
  },
  secureMethodTitle: { fontSize: 16, fontWeight: '900', color: '#1B5B39', marginBottom: 4 },
  secureMethodDesc: { fontSize: 11, color: '#666', textAlign: 'center', fontWeight: '700', marginBottom: 15 },
  badgesRow: { flexDirection: 'row', gap: 10 },
  miniBadge: { backgroundColor: '#FFF', paddingHorizontal: 12, paddingVertical: 5, borderRadius: 10, borderWidth: 1, borderColor: '#E1E9E4' },
  miniBadgeText: { fontSize: 10, fontWeight: '900', color: '#444' },

  donateButton: {
    backgroundColor: '#CA8846', height: 60, borderRadius: 20,
    justifyContent: 'center', alignItems: 'center', marginTop: 10,
    shadowColor: '#CA8846', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 6
  },
  donateBtnText: { color: '#FFF', fontSize: 16, fontWeight: '900', letterSpacing: 0.5 }
});
