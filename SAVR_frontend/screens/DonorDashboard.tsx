import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, ActivityIndicator, Image, AppState } from 'react-native';
import { Ionicons, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import { StorageUtils, StorageKeys } from '../utils/storage';
import { ApiService } from '../services/api';

export default function DonorDashboard({ navigation }: any) {
  const [userName, setUserName] = useState('');
  const [splitName, setSplitName] = useState('User');
  const [initial, setInitial] = useState('U');
  const [donationAmount, setDonationAmount] = useState(0);
  const [totalFoodDonations, setTotalFoodDonations] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Refresh when navigating back within the app
    const unsubscribeFocus = navigation.addListener('focus', () => {
      fetchDashboardData();
    });

    // Refresh when returning to the app from Safari/Web Browser
    const appStateSubscription = AppState.addEventListener('change', nextAppState => {
      if (nextAppState === 'active') {
        fetchDashboardData();
      }
    });

    fetchDashboardData();
    
    return () => {
      unsubscribeFocus();
      appStateSubscription.remove();
    };
  }, [navigation]);

  const fetchDashboardData = async () => {
    let localName = await StorageUtils.getItem(StorageKeys.DISPLAY_NAME) || 'Donor User';
    setUserName(localName);
    setInitial(localName.charAt(0).toUpperCase());
    setSplitName(localName.split(' ')[0]);

    setIsLoading(true);
    try {
      const dashRes = await ApiService.getDashboard();
      if (dashRes.data.success) {
        const data = dashRes.data;
        if (data.display_name) {
          setUserName(data.display_name);
          setInitial(data.display_name.charAt(0).toUpperCase());
          setSplitName(data.display_name.split(' ')[0]);
          StorageUtils.setItem(StorageKeys.DISPLAY_NAME, data.display_name);
        }
        setDonationAmount(data.total_donations || 0); 
        setTotalFoodDonations(data.total_food || 0);
      }
    } catch (e) {
      console.error('Failed to load dashboard', e);
      setDonationAmount(0); 
      setTotalFoodDonations(0);
    } finally {
      setIsLoading(false);
    }
  };

  const currentLevel = Math.floor(donationAmount / 50000);
  const currentStart = currentLevel * 50000;
  const currentGoal = (currentLevel + 1) * 50000;
  const progressRange = currentGoal - currentStart;
  const rawPct = ((donationAmount - currentStart) / progressRange) * 100;
  const progressPct = Math.max(0, Math.min(rawPct, 100));

  return (
    <SafeAreaView style={styles.container}>
      
      {/* Green Top Section Header */}
      <View style={styles.topHeader}>
        <View style={styles.headerRow}>
          {/* Logo Builder */}
          <View style={styles.logoWrapper}>
            <Text style={styles.logoTiny}>Philippine</Text>
            <View style={styles.logoMainBlock}>
              <Text style={styles.logoFood}>Food</Text>
              <Text style={styles.logoBank}>Bank</Text>
            </View>
            <Text style={styles.logoTinyUnder}>Foundation, Inc.</Text>
          </View>
          
          <View style={styles.headerIcons}>
            <TouchableOpacity style={{marginRight: 15}}>
              <Ionicons name="notifications-outline" size={24} color="#FFF" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.openDrawer()}>
              <Ionicons name="menu" size={30} color="#FFF" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.profileRow}>
          <TouchableOpacity style={styles.avatar} onPress={() => navigation.navigate('Profile')}>
            <Ionicons name="person" size={32} color="#888" />
          </TouchableOpacity>
          <Text style={styles.userNameHeader} numberOfLines={1}>{userName}</Text>
        </View>
      </View>

      {/* Main White Content Card */}
      <View style={styles.sheetContainer}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          
          <Text style={styles.dashboardTitle}>Donor Dashboard</Text>
          <Text style={styles.welcomeSubtitle}>
            Welcome back, <Text style={{fontWeight: '900', color: '#444'}}>{splitName}</Text>! Here's your activity overview - keep making an impact
          </Text>

          {/* Goal Card */}
          <View style={styles.goalCard}>
            <View style={styles.goalTitleRow}>
               <FontAwesome5 name="hand-holding-usd" size={18} color="#226E45" style={{marginRight: 8}} />
               <Text style={styles.goalTitle}>Total Donations Made</Text>
            </View>
            <Text style={styles.goalAmount}>₱ {donationAmount.toLocaleString('en-US')}</Text>
            
            {/* Progress Slider */}
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${progressPct}%` }]} />
              <View style={[styles.progressDot, { left: `${progressPct - 4}%` }]} />
              <View style={styles.progressEndDot} />
            </View>
            
            <View style={styles.progressLabels}>
              <Text style={styles.progressLabelCurrent}>₱ {currentStart.toLocaleString('en-US')}</Text>
              <Text style={styles.progressLabelGoal}>₱ {currentGoal.toLocaleString('en-US')}</Text>
            </View>
          </View>

          {/* Dual Action Tracking Cards */}
          <View style={styles.dualCardsRow}>
             {/* Financial */}
             <TouchableOpacity style={[styles.trackingCard, { backgroundColor: '#226E45' }]} onPress={() => navigation.navigate('FinancialDonation')}>
                <View style={styles.trackingIconWrap}>
                   <FontAwesome5 name="hand-holding-heart" size={36} color="#FFF" style={{opacity: 0.9}} />
                </View>
                <View style={styles.trackingTextWrap}>
                  <Text style={styles.trackingValue} adjustsFontSizeToFit numberOfLines={1}>₱ {donationAmount.toLocaleString('en-US')}</Text>
                  <Text style={styles.trackingLabel}>TOTAL FINANCIAL DONATION</Text>
                </View>
             </TouchableOpacity>

             {/* Food */}
             <TouchableOpacity style={[styles.trackingCard, { backgroundColor: '#D77B41' }]} onPress={() => navigation.navigate('FoodDonationDetails')}>
                <View style={styles.trackingIconWrap}>
                   <MaterialCommunityIcons name="food-apple" size={42} color="#FFF" style={{opacity: 0.9}} />
                </View>
                <View style={styles.trackingTextWrap}>
                  <Text style={[styles.trackingValue, {fontSize: 26}]} adjustsFontSizeToFit numberOfLines={1}>{totalFoodDonations}</Text>
                  <Text style={styles.trackingLabel}>TOTAL FOOD DONATION</Text>
                </View>
             </TouchableOpacity>
          </View>

          {/* Achievement Badges */}
          <View style={styles.badgesHeader}>
            <Text style={styles.badgesTitle}>Achievement Badges</Text>
            <TouchableOpacity style={styles.viewAllBtn} onPress={() => navigation.navigate('AchievementBadges')}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.badgesScroll}>
            {/* Badge 1 */}
            <View style={[styles.badgeBox, { borderColor: '#F2ECE5' }]}>
               <View style={[styles.badgeCircle, { backgroundColor: '#FFF5E6', borderColor: '#FFF5E6' }]}>
                  <MaterialCommunityIcons name="medal" size={44} color="#D4AA3A" />
               </View>
               <Text style={styles.badgeName}>Food Angel</Text>
               <Text style={styles.badgeDesc}>First giving milestone</Text>
            </View>

            {/* Badge 2 */}
            <View style={[styles.badgeBox, { borderColor: '#F0EFF8' }]}>
               <View style={[styles.badgeCircle, { backgroundColor: '#F0EFF8', borderColor: '#F0EFF8' }]}>
                  <MaterialCommunityIcons name="shield-star" size={44} color="#605B98" />
               </View>
               <Text style={styles.badgeName}>Legacy Builder</Text>
               <Text style={styles.badgeDesc}>Top impact contributor</Text>
            </View>

            {/* Badge 3 */}
            <View style={[styles.badgeBox, { borderColor: '#F4F4F4' }]}>
               <View style={[styles.badgeCircle, { backgroundColor: '#FFFDF5', borderColor: '#F4F4F4' }]}>
                  <MaterialCommunityIcons name="crown" size={44} color="#D4AA3A" />
               </View>
               <Text style={styles.badgeName}>Golden Giver</Text>
               <Text style={styles.badgeDesc}>Consistent donor award</Text>
            </View>
          </ScrollView>

          <View style={{height: 100}} />
          {/* Space for Bottom Tabs */}
        </ScrollView>
      </View>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#226E45' },
  
  topHeader: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 25 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  
  logoWrapper: { alignItems: 'flex-start' },
  logoTiny: { color: '#FFF', fontSize: 10, fontWeight: '700', marginBottom: -2 },
  logoMainBlock: { flexDirection: 'row', alignItems: 'center' },
  logoFood: { color: '#FFF', fontSize: 22, fontWeight: '900' },
  logoBank: { color: '#FFF', fontSize: 22, fontWeight: '900' },
  logoTinyUnder: { color: '#D1E6DA', fontSize: 8, marginTop: -2, fontWeight: '500' },
  headerIcons: { flexDirection: 'row', alignItems: 'center' },

  profileRow: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#627D72', justifyContent: 'center', alignItems: 'center', marginRight: 15, borderWidth: 2, borderColor: '#FFF' },
  userNameHeader: { color: '#FFF', fontSize: 22, fontWeight: 'bold' },

  sheetContainer: { 
    flex: 1, backgroundColor: '#FFF', borderTopLeftRadius: 35, borderTopRightRadius: 35,
    shadowColor: '#000', shadowOffset: { width: 0, height: -10 }, shadowOpacity: 0.1, shadowRadius: 15, elevation: 15,
  },
  scrollContent: { paddingHorizontal: 25, paddingTop: 30, paddingBottom: 20 },

  dashboardTitle: { fontSize: 36, fontWeight: '900', color: '#1B5B39', textAlign: 'center', marginBottom: 10, letterSpacing: -0.5 },
  welcomeSubtitle: { fontSize: 16, color: '#666', textAlign: 'center', marginHorizontal: 15, marginBottom: 30, lineHeight: 22 },

  goalCard: {
    backgroundColor: '#FFF', borderRadius: 20, padding: 25, marginBottom: 25,
    shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 4, borderWidth: 1, borderColor: '#F0F0F0'
  },
  goalTitleRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  goalTitle: { fontSize: 15, fontWeight: 'bold', color: '#1B5B39' },
  goalAmount: { fontSize: 28, fontWeight: '900', color: '#1B5B39', textAlign: 'center', marginBottom: 20 },
  
  progressTrack: { height: 8, backgroundColor: '#AFAFAF', borderRadius: 4, position: 'relative', marginBottom: 10 },
  progressFill: { height: '100%', backgroundColor: '#D4AA3A', borderRadius: 4, zIndex: 2 },
  progressDot: { width: 18, height: 18, borderRadius: 9, backgroundColor: '#D4AA3A', position: 'absolute', top: -5, zIndex: 3, elevation: 2 },
  progressEndDot: { width: 14, height: 14, borderRadius: 7, backgroundColor: '#888', position: 'absolute', right: -2, top: -3, zIndex: 1 },
  
  progressLabels: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 5 },
  progressLabelCurrent: { fontSize: 13, fontWeight: '800', color: '#1B5B39' },
  progressLabelGoal: { fontSize: 13, fontWeight: '800', color: '#A0A0A0' },

  dualCardsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 35 },
  trackingCard: { 
    width: '48%', borderRadius: 16, padding: 15, flexDirection: 'row', alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 6, elevation: 5
  },
  trackingIconWrap: { width: 50, alignItems: 'flex-start' },
  trackingTextWrap: { flex: 1, alignItems: 'center' },
  trackingValue: { color: '#FFF', fontSize: 20, fontWeight: '900', marginBottom: 2 },
  trackingLabel: { color: 'rgba(255,255,255,0.9)', fontSize: 9, fontWeight: '800', textAlign: 'center', lineHeight: 12 },

  badgesHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  badgesTitle: { fontSize: 20, fontWeight: '900', color: '#555' },
  viewAllBtn: { backgroundColor: '#1B5B39', paddingHorizontal: 15, paddingVertical: 6, borderRadius: 12 },
  viewAllText: { color: '#FFF', fontSize: 12, fontWeight: '800' },

  badgesScroll: { paddingBottom: 10 },
  badgeBox: { 
    width: 140, height: 160, backgroundColor: '#FFF', borderRadius: 20, borderWidth: 1, 
    marginRight: 15, alignItems: 'center', paddingTop: 20, paddingHorizontal: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 
  },
  badgeCircle: { width: 66, height: 66, borderRadius: 33, borderWidth: 1, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  badgeName: { fontSize: 14, fontWeight: '800', color: '#444', textAlign: 'center', marginBottom: 4 },
  badgeDesc: { fontSize: 11, color: '#999', textAlign: 'center', lineHeight: 14 }
});
