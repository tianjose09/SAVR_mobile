import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView, ActivityIndicator } from 'react-native';
import { ApiService } from '../services/api';

export default function AchievementBadges({ navigation }: any) {
  const [badges, setBadges] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchBadges();
  }, []);

  const fetchBadges = async () => {
    try {
      const response = await ApiService.getBadges();
      if (response.data.success) {
        setBadges(response.data.badges || []);
      }
    } catch (e) {
      console.error('Badges fetch error', e);
    } finally {
      setIsLoading(false);
    }
  };

  const getEmojiForBadge = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'bronze': return '🥉';
      case 'silver': return '🥈';
      case 'gold': return '🥇';
      case 'platinum': return '💎';
      default: return '🎖️';
    }
  };

  const renderBadge = ({ item }: { item: any }) => {
    const isEarned = item.status === 'earned';
    
    return (
      <View style={[styles.badgeCard, !isEarned && styles.badgeLocked]}>
        <View style={[styles.iconBox, !isEarned && styles.iconBoxLocked]}>
          <Text style={styles.badgeEmoji}>{getEmojiForBadge(item.tier)}</Text>
        </View>
        <Text style={styles.badgeName} numberOfLines={2}>{item.name}</Text>
        <Text style={styles.badgeDesc} numberOfLines={3}>{item.description}</Text>
        
        {isEarned ? (
          <View style={styles.statusPillEarned}>
            <Text style={styles.statusTextEarned}>Earned</Text>
          </View>
        ) : (
          <View style={styles.statusPillLocked}>
            <Text style={styles.statusTextLocked}>Locked</Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.canGoBack() ? navigation.goBack() : navigation.navigate('HomeTabs', { screen: 'Home' })}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Achievements</Text>
        <View style={{ width: 60 }} />
      </View>

      <View style={styles.heroSection}>
        <Text style={styles.heroTitle}>Your Impact Trophies</Text>
        <Text style={styles.heroSub}>Keep donating to unlock them all!</Text>
      </View>

      {isLoading ? (
        <View style={styles.loaderCenter}>
          <ActivityIndicator size="large" color="#38A3A5" />
        </View>
      ) : (
        <FlatList
          data={badges}
          keyExtractor={(item, index) => `${item.id || index}`}
          renderItem={renderBadge}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>🏆</Text>
              <Text style={styles.emptyTitle}>No Badges Available</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 10, paddingBottom: 15, backgroundColor: '#fff',
  },
  backButton: { padding: 10, marginLeft: -10 },
  backText: { fontSize: 16, color: '#333', fontWeight: '600' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#222' },
  
  loaderCenter: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  
  heroSection: {
    paddingHorizontal: 25, paddingVertical: 20, backgroundColor: '#fff',
    borderBottomWidth: 1, borderBottomColor: '#f0f0f0', marginBottom: 10
  },
  heroTitle: { fontSize: 24, fontWeight: '800', color: '#222', marginBottom: 5 },
  heroSub: { fontSize: 14, color: '#666' },

  listContent: { padding: 15, paddingBottom: 50 },
  row: { justifyContent: 'space-between', marginBottom: 15 },
  
  badgeCard: {
    width: '48%', backgroundColor: '#fff', borderRadius: 16, padding: 20,
    alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
  },
  badgeLocked: { opacity: 0.6, backgroundColor: '#fafafa' },
  
  iconBox: {
    width: 64, height: 64, borderRadius: 32, backgroundColor: '#FFF9C4',
    justifyContent: 'center', alignItems: 'center', marginBottom: 12,
    borderWidth: 2, borderColor: '#FFF176'
  },
  iconBoxLocked: { backgroundColor: '#eee', borderColor: '#ddd' },
  badgeEmoji: { fontSize: 32 },
  
  badgeName: { fontSize: 15, fontWeight: '700', color: '#222', textAlign: 'center', marginBottom: 4 },
  badgeDesc: { fontSize: 11, color: '#888', textAlign: 'center', marginBottom: 12, lineHeight: 16 },
  
  statusPillEarned: { backgroundColor: '#E8F5E9', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 10 },
  statusTextEarned: { color: '#2E7D32', fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase' },
  
  statusPillLocked: { backgroundColor: '#f0f0f0', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 10 },
  statusTextLocked: { color: '#888', fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase' },

  emptyContainer: { alignItems: 'center', marginTop: 80 },
  emptyIcon: { fontSize: 64, marginBottom: 15 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: '#222' },
});
