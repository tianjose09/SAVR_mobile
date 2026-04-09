import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert } from 'react-native';
import { DrawerContentScrollView } from '@react-navigation/drawer';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { StorageUtils, StorageKeys } from '../utils/storage';
import { LogoutHelper } from '../utils/logout';

export default function Sidebar(props: any) {
  const [displayName, setDisplayName] = useState('User');
  const [initial, setInitial] = useState('U');
  const [role, setRole] = useState('donor');

  useEffect(() => {
    const loadInfo = async () => {
      const name = await StorageUtils.getItem(StorageKeys.DISPLAY_NAME) || 'User';
      const userRole = await StorageUtils.getItem(StorageKeys.USER_ROLE) || 'donor';
      setDisplayName(name);
      setInitial(name.charAt(0).toUpperCase());
      setRole(userRole);
    };
    loadInfo();
  }, [props]);

  const navigateTo = (screen: string) => {
    props.navigation.navigate('HomeTabs', { screen });
  };

  const dashboardRoute = () => {
    return 'Home';
  };

  return (
    <DrawerContentScrollView {...props} contentContainerStyle={styles.container}>
      
      {/* Dark Green Header Box */}
      <View style={styles.headerBox}>
        <View style={styles.logoRow}>
           <Text style={styles.logoTiny}>SAVR</Text>
           <Text style={styles.logoBank}>FOODBANK</Text>
        </View>
        <View style={styles.profileRow}>
          <View style={styles.initialCircle}>
            <Text style={styles.initialText}>{initial}</Text>
          </View>
          <View style={{flex: 1}}>
             <Text style={styles.nameText} numberOfLines={1}>{displayName}</Text>
             <Text style={styles.roleText}>{role.toUpperCase()}</Text>
          </View>
        </View>
      </View>

      <View style={styles.navContainer}>
        <TouchableOpacity style={styles.navItem} onPress={() => navigateTo('Profile')}>
          <Ionicons name="person-outline" size={24} color="#1B5B39" style={styles.navIcon} />
          <Text style={styles.navText}>Profile Management</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} onPress={() => navigateTo(dashboardRoute())}>
          <Ionicons name="grid-outline" size={24} color="#1B5B39" style={styles.navIcon} />
          <Text style={styles.navText}>Dashboard</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} onPress={() => navigateTo('Donate')}>
          <FontAwesome5 name="hand-holding-heart" size={20} color="#1B5B39" style={[styles.navIcon, {marginLeft: 2, marginRight: 18}]} />
          <Text style={styles.navText}>{role === 'donor' ? 'Donate Now' : 'Request Resources'}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} onPress={() => navigateTo('Activities')}>
          <Ionicons name="receipt-outline" size={24} color="#1B5B39" style={styles.navIcon} />
          <Text style={styles.navText}>Activity History</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} onPress={() => navigateTo('AchievementBadges')}>
          <Ionicons name="ribbon-outline" size={24} color="#1B5B39" style={styles.navIcon} />
          <Text style={styles.navText}>My Achievements</Text>
        </TouchableOpacity>
      </View>

      <View style={{ flex: 1 }} />
      <View style={styles.divider} />

      {/* Logout */}
      <TouchableOpacity 
        style={styles.logoutBtn} 
        onPress={() => {
           Alert.alert(
             'Log Out', 
             'Are you sure you want to log out of your account?',
             [
               { text: 'Cancel', style: 'cancel' },
               { 
                 text: 'Log Out', 
                 style: 'destructive',
                 onPress: () => LogoutHelper.logout(props.navigation.getParent() || props.navigation)
               }
             ]
           );
        }}>
        <Ionicons name="log-out-outline" size={24} color="#d32f2f" style={styles.navIcon} />
        <Text style={styles.logoutText}>Secure Logout</Text>
      </TouchableOpacity>
    </DrawerContentScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 0,
  },
  headerBox: {
    backgroundColor: '#226E45',
    paddingTop: 50,
    paddingHorizontal: 25,
    paddingBottom: 30,
    borderBottomRightRadius: 30,
    marginBottom: 20
  },
  logoRow: {flexDirection: 'row', alignItems: 'flex-end', marginBottom: 25},
  logoTiny: { color: '#FFF', fontSize: 24, fontWeight: '900', marginRight: 5, letterSpacing: -1 },
  logoBank: { color: '#D4AA3A', fontSize: 14, fontWeight: '700', marginBottom: 3 },
  profileRow: { flexDirection: 'row', alignItems: 'center' },
  initialCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
    borderWidth: 2,
    borderColor: '#D4AA3A'
  },
  initialText: {
    color: '#226E45',
    fontSize: 26,
    fontWeight: '900',
  },
  nameText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFF',
    marginBottom: 2
  },
  roleText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#D1E6DA',
    letterSpacing: 1
  },
  divider: {
    height: 1,
    backgroundColor: '#EAEAEA',
    marginHorizontal: 25,
    marginBottom: 10
  },
  navContainer: {
    paddingHorizontal: 20,
    marginTop: 10
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 10,
    borderRadius: 12,
    marginBottom: 5
  },
  navIcon: {
    marginRight: 16
  },
  navText: {
    fontSize: 15,
    color: '#333',
    fontWeight: '600',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 30,
    marginBottom: 30,
  },
  logoutText: {
    fontSize: 16,
    color: '#d32f2f',
    fontWeight: 'bold',
  },
});
