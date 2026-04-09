import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform, ActivityIndicator, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ApiService } from '../services/api';

export default function ChooseDonation({ navigation }: any) {
  const [pickups, setPickups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPickups = async () => {
      try {
        const response = await ApiService.getUpcomingPickups();
        if (response.data.success) {
          setPickups(response.data.pickups || []);
        }
      } catch (e) {
        console.error("Failed to fetch pickups", e);
      } finally {
        setLoading(false);
      }
    };
    
    // Refresh whenever screen focuses
    const unsubscribe = navigation.addListener('focus', () => {
      fetchPickups();
    });
    fetchPickups();
    
    return unsubscribe;
  }, [navigation]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1E583A" translucent={false} />
      {/* 
        HERO SECTION WITH CURVED BOTTOM
      */}
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
            CHOOSE WHAT TO <Text style={styles.heroTitleHighlight}>DONATE</Text>
          </Text>
          <Text style={styles.heroSubText}>
            Select a donation type and continue supporting communities through food, financial assistance, or service-based help.
          </Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Section Header */}
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionOverline}>DONATION OPTIONS</Text>
            <Text style={styles.sectionTitle}>Ways to Contribute</Text>
          </View>
          <View style={styles.badgePill}>
            <Text style={styles.badgeText}>3 Categories</Text>
          </View>
        </View>

        {/* Donation Buttons in Columns (Vertical Stack for HCI readability) */}
        <View style={styles.cardsColumn}>
          {/* Financial */}
          <TouchableOpacity 
            style={[styles.donationCard, { backgroundColor: '#1B5B39' }]}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('FinancialDonation')}
          >
            <Ionicons name="cash-outline" size={36} color="#FFF" style={styles.cardIcon} />
            <View style={styles.cardTextCol}>
              <Text style={styles.cardTitle}>Financial Donation</Text>
              <Text style={styles.cardDesc}>Provide direct monetary support for urgent and ongoing needs.</Text>
            </View>
          </TouchableOpacity>

          {/* Food */}
          <TouchableOpacity 
            style={[styles.donationCard, { backgroundColor: '#226E45' }]}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('FoodDonationDetails')}
          >
            <Ionicons name="basket-outline" size={36} color="#FFF" style={styles.cardIcon} />
            <View style={styles.cardTextCol}>
              <Text style={styles.cardTitle}>Food Donation</Text>
              <Text style={styles.cardDesc}>Share food items that can help nourish families and communities.</Text>
            </View>
          </TouchableOpacity>

          {/* Service */}
          <TouchableOpacity 
            style={[styles.donationCard, { backgroundColor: '#2A8655' }]}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('ServiceDonation')}
          >
            <Ionicons name="bus-outline" size={36} color="#FFF" style={styles.cardIcon} />
            <View style={styles.cardTextCol}>
              <Text style={styles.cardTitle}>Service Donation</Text>
              <Text style={styles.cardDesc}>Offer transport, manpower, or helpful services for operations.</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Upcoming Pickups */}
        <View style={styles.pickupsHeaderInfoRow}>
          <Text style={styles.pickupsTitle}>Upcoming Pickups</Text>
          <TouchableOpacity style={styles.viewAllBtn}>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
           <ActivityIndicator size="small" color="#226E45" style={{marginVertical: 20}} />
        ) : pickups.length === 0 ? (
           <Text style={styles.noPickupsText}>You have no upcoming pickups scheduled.</Text>
        ) : (
           pickups.map(item => (
             <View key={item.id} style={styles.pickupRow}>
               <View style={styles.pickupLeft}>
                 <Text style={styles.pickupDateTime}>
                   {item.preferred_date || 'TBD'} | {item.time_slot || 'Anytime'}
                 </Text>
                 <Text style={styles.pickupAddress} numberOfLines={1}>
                   Address: {item.pickup_address || 'TBD'} | Contact: Pending
                 </Text>
               </View>
               <View style={styles.pickupRight}>
                 <TouchableOpacity>
                   <Text style={styles.editText}>edit</Text>
                 </TouchableOpacity>
                 <Text style={styles.pickupSep}>/</Text>
                 <TouchableOpacity>
                   <Text style={styles.deleteText}>delete</Text>
                 </TouchableOpacity>
               </View>
             </View>
           ))
        )}

        <View style={{height: 100}} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  
  heroBackground: {
    backgroundColor: '#1E583A', // Matches exact green base in image
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    paddingTop: Platform.OS === 'ios' ? 45 : 35,
    paddingBottom: 15,
    // Add shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
  },
  topNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 5,
  },
  backButton: {
    padding: 5,
  },
  logoRow: {
    alignItems: 'center',
  },
  logoText: { color: '#FFF', fontSize: 16, fontFamily: Platform.OS === 'ios' ? 'Helvetica' : 'sans-serif' },
  logoSub: { color: '#FFF', fontSize: 9, opacity: 0.8, marginTop: -2 },
  
  heroContent: { paddingHorizontal: 25 },
  heroTitleMain: { fontSize: 22, fontWeight: '900', color: '#FFF', letterSpacing: -0.5, marginBottom: 4 },
  heroTitleHighlight: { color: '#FACC15' }, // Exact prominent gold yellow
  heroSubText: { fontSize: 11, color: 'rgba(255,255,255,0.9)', lineHeight: 16, fontWeight: '500' },

  scrollContent: { paddingHorizontal: 20, paddingTop: 25 },
  
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 20 },
  sectionOverline: { color: '#1E583A', fontWeight: '900', fontSize: 11, letterSpacing: 1, marginBottom: 2 },
  sectionTitle: { fontSize: 24, fontWeight: '900', color: '#C07D4F', letterSpacing: -0.5 }, // Coppery orange title text
  badgePill: { backgroundColor: '#F0F6F3', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  badgeText: { color: '#666', fontWeight: 'bold', fontSize: 11 },

  cardsColumn: { gap: 12 },
  donationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 16,
    // Slightly lighter shadow mapping to the dark base
    shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.1, shadowRadius: 5, elevation: 4
  },
  cardIcon: { marginRight: 15 },
  cardTextCol: { flex: 1 },
  cardTitle: { color: '#FFF', fontSize: 16, fontWeight: '800', marginBottom: 3 },
  cardDesc: { color: 'rgba(255,255,255,0.9)', fontSize: 12, lineHeight: 16 },

  divider: { height: 1, backgroundColor: '#E0E0E0', marginVertical: 30 },

  pickupsHeaderInfoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  pickupsTitle: { fontSize: 18, fontWeight: '800', color: '#111' },
  viewAllBtn: { backgroundColor: '#CA8846', paddingHorizontal: 15, paddingVertical: 5, borderRadius: 20 }, // Gold-brown view all pill
  viewAllText: { color: '#FFF', fontSize: 11, fontWeight: '800' },

  noPickupsText: { color: '#888', fontStyle: 'italic', fontSize: 13 },
  
  pickupRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: '#CCC',
    borderRadius: 20,
    marginBottom: 10,
    backgroundColor: '#FFF'
  },
  pickupLeft: { flex: 1, paddingRight: 10 },
  pickupDateTime: { fontSize: 12, fontWeight: '800', color: '#222', marginBottom: 4 },
  pickupAddress: { fontSize: 10, color: '#666' },
  
  pickupRight: { flexDirection: 'row', alignItems: 'center' },
  editText: { fontSize: 11, color: '#888', fontWeight: '600' },
  pickupSep: { fontSize: 11, color: '#CCC', marginHorizontal: 4 },
  deleteText: { fontSize: 11, color: '#888', fontWeight: '600' }
});
