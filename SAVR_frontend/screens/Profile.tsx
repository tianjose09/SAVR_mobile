import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, ActivityIndicator, Alert, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ApiService } from '../services/api';

export default function Profile({ navigation }: any) {
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchProfile();
    });
    fetchProfile();
    return unsubscribe;
  }, [navigation]);

  const fetchProfile = async () => {
    setIsLoading(true);
    try {
      const response = await ApiService.getProfile();
      if (response.data.success) {
        setProfile(response.data.user);
      }
    } catch (e) {
      console.error('Profile fetch error', e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeactivate = () => {
    Alert.alert(
      'Deactivate Account',
      'Are you sure you want to deactivate your account? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Deactivate', 
          style: 'destructive',
          onPress: async () => {
            try {
              await ApiService.deactivateAccount();
              Alert.alert('Success', 'Your account has been deactivated.');
              import('../utils/logout').then(({LogoutHelper}) => LogoutHelper.logout(navigation));
            } catch(e) {
              Alert.alert('Error', 'Failed to deactivate account.');
            }
          }
        }
      ]
    );
  };

  if (isLoading && !profile) {
    return (
      <SafeAreaView style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#226E45" />
      </SafeAreaView>
    );
  }

  // Value Extracts - Falling back intelligently
  const isDonor = profile?.role !== 'organization';
  const roleDisplay = isDonor ? 'DONOR DETAILS' : 'ORGANIZATION DETAILS';
  
  const fName = profile?.first_name || profile?.name?.split(' ')[0] || 'User';
  const lName = profile?.last_name || profile?.name?.split(' ').slice(1).join(' ') || '';
  const mInit = profile?.middle_initial || '-';
  const suff = profile?.suffix || 'None';
  const dob = profile?.date_of_birth || 'Not Specified';
  const gender = profile?.gender || 'Not Specified';
  
  const houseNo = profile?.house_no || '-';
  const street = profile?.street || 'Not Specified';
  const brgy = profile?.barangay || 'Not Specified';
  const city = profile?.city_municipality || 'Not Specified';
  const prov = profile?.province_region || 'Not Specified';
  const zip = profile?.postal_zip_code || '-';

  return (
    <SafeAreaView style={styles.container}>
      
      {/* Top Navigation Bar */}
      <View style={styles.topNav}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate('HomeTabs', { screen: 'Home' })}>
          <Ionicons name="arrow-undo" size={30} color="#1B5B39" />
        </TouchableOpacity>
        <Text style={styles.pageTitle}>My Profile</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Dark Green Hero Banner */}
        <View style={styles.heroBanner}>
          <View style={styles.heroTop}>
             <View style={styles.avatarCircle}>
                <Text style={styles.avatarText}>{fName.charAt(0).toUpperCase()}</Text>
             </View>
             <View style={styles.heroTextCol}>
               <Text style={styles.heroName} numberOfLines={1}>{profile?.name || `${fName} ${lName}`}</Text>
               <Text style={styles.heroSub}>Manage your personal information and account details</Text>
             </View>
          </View>
          
          <View style={styles.heroDivider} />
          
          <View style={styles.heroBottomRow}>
             <View style={{flexDirection: 'row', alignItems: 'center'}}>
               <Ionicons name="id-card" size={20} color="#FFF" style={{marginRight: 6}} />
               <Text style={styles.personalInfoText}>Personal Information</Text>
             </View>
             
             <TouchableOpacity style={styles.editBtn} onPress={() => navigation.navigate('EditProfile', { profile })}>
               <Ionicons name="pencil" size={14} color="#1B5B39" style={{marginRight: 4}} />
               <Text style={styles.editBtnText}>Edit</Text>
             </TouchableOpacity>
          </View>
        </View>

        {/* Section Header */}
        <View style={styles.sectionHeaderRow}>
          <View>
            <Text style={styles.sectionOverline}>{roleDisplay}</Text>
            <Text style={styles.sectionTitle}>Your Information</Text>
          </View>
          <View style={styles.updatedBadge}>
             <Text style={styles.updatedBadgeText}>Updated Today</Text>
          </View>
        </View>

        {/* Dynamic Pills */}
        <View style={styles.pillBox}>
          <Text style={styles.pillLabel}>First Name</Text>
          <Text style={styles.pillValue}>{fName}</Text>
        </View>

        <View style={styles.pillBox}>
          <Text style={styles.pillLabel}>Last Name</Text>
          <Text style={styles.pillValue}>{lName}</Text>
        </View>

        <View style={styles.pillBox}>
          <Text style={styles.pillLabel}>Middle Initial</Text>
          <Text style={styles.pillValue}>{mInit}</Text>
        </View>

        <View style={styles.pillBox}>
          <Text style={styles.pillLabel}>Suffix</Text>
          <Text style={styles.pillValue}>{suff}</Text>
        </View>

        <View style={styles.pillBox}>
          <Text style={styles.pillLabel}>Date of Birth</Text>
          <Text style={styles.pillValue}>{dob}</Text>
        </View>

        <View style={styles.pillBox}>
          <Text style={styles.pillLabel}>Gender</Text>
          <Text style={styles.pillValue}>{gender}</Text>
        </View>

        <View style={styles.pillBox}>
          <Text style={styles.pillLabel}>House #</Text>
          <Text style={styles.pillValue}>{houseNo}</Text>
        </View>

        <View style={styles.pillBox}>
          <Text style={styles.pillLabel}>Street</Text>
          <Text style={styles.pillValue}>{street}</Text>
        </View>

        <View style={styles.pillBox}>
          <Text style={styles.pillLabel}>Brgy.</Text>
          <Text style={styles.pillValue}>{brgy}</Text>
        </View>

        <View style={styles.pillBox}>
          <Text style={styles.pillLabel}>City / Municipality</Text>
          <Text style={styles.pillValue}>{city}</Text>
        </View>

        <View style={styles.pillBox}>
          <Text style={styles.pillLabel}>Province / Region</Text>
          <Text style={styles.pillValue}>{prov}</Text>
        </View>

        <View style={styles.pillBox}>
          <Text style={styles.pillLabel}>Postal / ZIP Code</Text>
          <Text style={styles.pillValue}>{zip}</Text>
        </View>

        <View style={styles.pillBox}>
          <Text style={styles.pillLabel}>Email Address</Text>
          <Text style={styles.pillValue}>{profile?.email}</Text>
        </View>

        <View style={styles.pillBox}>
          <Text style={styles.pillLabel}>Contact Number</Text>
          <Text style={styles.pillValue}>{profile?.contact_number || '-++'}</Text>
        </View>

        <TouchableOpacity style={styles.deactivateWrapper} onPress={handleDeactivate}>
          <Text style={styles.deactivateText}>Deactivate My Account</Text>
        </TouchableOpacity>

        {/* Removed bottom tab spacer */}
        <View style={{height: 40}} />

      </ScrollView>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#E1E9E4' }, // Matches visual light moss grey-green
  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  
  topNav: {
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
    paddingVertical: 15, paddingHorizontal: 20, position: 'relative',
    marginTop: Platform.OS === 'android' ? 20 : 0
  },
  backButton: { position: 'absolute', left: 20 },
  pageTitle: { fontSize: 18, fontWeight: '800', color: '#1B5B39' },

  scrollContent: { paddingHorizontal: 20, paddingTop: 10 },

  heroBanner: { 
    backgroundColor: '#226E45', borderRadius: 20, padding: 25, marginBottom: 30,
    shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4
  },
  heroTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  avatarCircle: { 
    width: 66, height: 66, borderRadius: 33, backgroundColor: 'rgba(255,255,255,0.2)', 
    justifyContent: 'center', alignItems: 'center', marginRight: 15
  },
  avatarText: { color: '#FFF', fontSize: 32, fontWeight: '900' },
  heroTextCol: { flex: 1 },
  heroName: { fontSize: 18, fontWeight: '900', color: '#FFF', marginBottom: 4, letterSpacing: -0.5 },
  heroSub: { fontSize: 11, color: 'rgba(255,255,255,0.9)', lineHeight: 16 },
  
  heroDivider: { height: 1.5, backgroundColor: 'rgba(255,255,255,0.15)', marginBottom: 15 },
  
  heroBottomRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  personalInfoText: { color: '#FFF', fontWeight: '800', fontSize: 14 },
  editBtn: { 
    backgroundColor: '#FFF', flexDirection: 'row', alignItems: 'center', 
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 
  },
  editBtnText: { color: '#1B5B39', fontWeight: 'bold', fontSize: 11 },

  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 20 },
  sectionOverline: { color: '#226E45', fontWeight: '900', fontSize: 10, letterSpacing: 1, marginBottom: 2 },
  sectionTitle: { fontSize: 24, fontWeight: '900', color: '#685D52', letterSpacing: -0.5 },
  updatedBadge: { backgroundColor: '#E4F1EB', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  updatedBadgeText: { color: '#1B5B39', fontWeight: 'bold', fontSize: 11 },

  pillBox: { 
    backgroundColor: '#FFF', borderRadius: 16, paddingHorizontal: 20, paddingVertical: 15, 
    marginBottom: 12, borderWidth: 1, borderColor: '#F0F0F0',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 2
  },
  pillLabel: { fontSize: 11, fontWeight: '800', color: '#999', marginBottom: 4 },
  pillValue: { fontSize: 16, fontWeight: '900', color: '#1B5B39' },

  deactivateWrapper: {
    marginTop: 25, paddingVertical: 18, alignItems: 'center', 
    borderWidth: 1.5, borderColor: '#FA8072', borderRadius: 20, backgroundColor: 'rgba(250, 128, 114, 0.05)'
  },
  deactivateText: { color: '#FA8072', fontWeight: '800', fontSize: 15 }
});
