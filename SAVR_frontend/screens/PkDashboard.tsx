import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, ActivityIndicator } from 'react-native';
import { StorageUtils, StorageKeys } from '../utils/storage';
import { ApiService } from '../services/api';

export default function PkDashboard({ navigation }: any) {
  const [userName, setUserName] = useState('');
  const [initial, setInitial] = useState('P');
  const [mealsServed, setMealsServed] = useState(0);
  const [activities, setActivities] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchDashboardData();
    });
    fetchDashboardData();
    return unsubscribe;
  }, [navigation]);

  const fetchDashboardData = async () => {
    const localName = await StorageUtils.getItem(StorageKeys.DISPLAY_NAME) || 'Partner Kitchen';
    setUserName(localName);
    setInitial(localName.charAt(0).toUpperCase());

    setIsLoading(true);
    try {
      const dashRes = await ApiService.getDashboard();
      if (dashRes.data.success) {
        const data = dashRes.data;
        if (data.display_name) {
          setUserName(data.display_name);
          setInitial(data.display_name.charAt(0).toUpperCase());
        }
        setMealsServed(data.total_meals_served || 0);
        setActivities(data.recent_activities || []);
      }
    } catch (e) {
      console.error('Failed to load PK dashboard', e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.userInfo}>
            <TouchableOpacity onPress={() => navigation.navigate('Profile')} style={styles.avatar}>
              <Text style={styles.avatarText}>{initial}</Text>
            </TouchableOpacity>
            <View>
              <Text style={styles.greeting}>Partner Kitchen Hub</Text>
              <Text style={styles.userName}>{userName}</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.menuButton} onPress={() => navigation.openDrawer()}>
            <Text style={styles.menuIcon}>☰</Text>
          </TouchableOpacity>
        </View>

        {/* Hero Card */}
        <View style={styles.heroCard}>
          <Text style={styles.heroTitle}>Total Meals Served</Text>
          <Text style={styles.heroAmount}>{mealsServed.toLocaleString()}</Text>
          
          <View style={styles.divider} />
          
          <Text style={styles.heroSubtitle}>Kitchen Status</Text>
          <View style={styles.resourceRow}>
            <View style={styles.resourceItem}>
              <Text style={styles.resourceCount}>Active</Text>
              <Text style={styles.resourceLabel}>Operations</Text>
            </View>
            <View style={styles.resourceItem}>
              <Text style={styles.resourceCount}>3</Text>
              <Text style={styles.resourceLabel}>Incoming Deliveries</Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActionsContainer}>
          <TouchableOpacity style={styles.actionCard}>
            <View style={[styles.actionIconBg, { backgroundColor: '#FFF3E0' }]}><Text style={styles.actionIcon}>🥘</Text></View>
            <Text style={styles.actionText}>Cook Menu</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionCard}>
            <View style={[styles.actionIconBg, { backgroundColor: '#E8F5E9' }]}><Text style={styles.actionIcon}>🥦</Text></View>
            <Text style={styles.actionText}>Ingredients</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionCard} onPress={() => navigation.navigate('Activities')}>
            <View style={[styles.actionIconBg, { backgroundColor: '#E3F2FD' }]}><Text style={styles.actionIcon}>📊</Text></View>
            <Text style={styles.actionText}>Impact</Text>
          </TouchableOpacity>
        </View>

        {/* Recent Activities */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Kitchen Log</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Activities')}>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.activitiesContainer}>
          {isLoading && activities.length === 0 ? (
            <ActivityIndicator style={{ padding: 20 }} />
          ) : activities.length === 0 ? (
            <Text style={styles.emptyText}>No kitchen activity.</Text>
          ) : (
            activities.map((act, i) => (
              <View key={i} style={styles.activityRow}>
                <View style={styles.actIconPlaceholder}>
                   <Text>🧑‍🍳</Text>
                </View>
                <View style={styles.actDetails}>
                  <Text style={styles.actTitle}>{act.title}</Text>
                  <Text style={styles.actDesc}>{act.description}</Text>
                  <Text style={styles.actTime}>{act.time_ago}</Text>
                </View>
              </View>
            ))
          )}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingTop: 20, paddingBottom: 15
  },
  userInfo: { flexDirection: 'row', alignItems: 'center' },
  avatar: {
    width: 48, height: 48, borderRadius: 24, backgroundColor: '#F57C00',
    justifyContent: 'center', alignItems: 'center', marginRight: 12
  },
  avatarText: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  greeting: { fontSize: 12, color: '#666', textTransform: 'uppercase', letterSpacing: 1 },
  userName: { fontSize: 18, fontWeight: '700', color: '#222' },
  menuButton: { padding: 10 },
  menuIcon: { fontSize: 24, color: '#333' },
  
  heroCard: {
    marginHorizontal: 20, backgroundColor: '#F57C00', borderRadius: 20,
    padding: 24, shadowColor: '#F57C00', shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3, shadowRadius: 12, elevation: 6, marginBottom: 25,
  },
  heroTitle: { color: 'rgba(255,255,255,0.8)', fontSize: 14, fontWeight: '600', marginBottom: 5 },
  heroAmount: { color: '#fff', fontSize: 32, fontWeight: '800', marginBottom: 20 },
  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.2)', marginBottom: 15 },
  heroSubtitle: { color: 'rgba(255,255,255,0.9)', fontSize: 13, fontWeight: '600', marginBottom: 10 },
  resourceRow: { flexDirection: 'row', justifyContent: 'space-between' },
  resourceItem: { flex: 1 },
  resourceCount: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  resourceLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 12 },

  quickActionsContainer: {
    flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, marginBottom: 30
  },
  actionCard: {
    backgroundColor: '#fff', width: '31%', borderRadius: 16, paddingVertical: 15,
    alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 6, elevation: 2,
  },
  actionIconBg: {
    width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', marginBottom: 8
  },
  actionIcon: { fontSize: 20 },
  actionText: { fontSize: 13, fontWeight: '600', color: '#333' },

  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, marginBottom: 15
  },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#222' },
  viewAllText: { fontSize: 14, color: '#F57C00', fontWeight: '600' },

  activitiesContainer: { paddingHorizontal: 20 },
  activityRow: {
    flexDirection: 'row', backgroundColor: '#fff', padding: 15, borderRadius: 16,
    marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 3, elevation: 1, alignItems: 'center'
  },
  actIconPlaceholder: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: '#f0f0f0',
    justifyContent: 'center', alignItems: 'center', marginRight: 15
  },
  actDetails: { flex: 1 },
  actTitle: { fontSize: 15, fontWeight: '700', color: '#333', marginBottom: 4 },
  actDesc: { fontSize: 13, color: '#666', marginBottom: 4 },
  actTime: { fontSize: 11, color: '#aaa', fontWeight: '500' },
  emptyText: { color: '#888', fontStyle: 'italic', paddingHorizontal: 20 }
});
