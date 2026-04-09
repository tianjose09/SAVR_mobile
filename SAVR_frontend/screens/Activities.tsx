import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView, ActivityIndicator, RefreshControl } from 'react-native';
import { ApiService } from '../services/api';

export default function Activities({ navigation }: any) {
  const [activities, setActivities] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    try {
      const response = await ApiService.getActivities();
      if (response.data.success) {
        setActivities(response.data.activities || []);
      }
    } catch (e) {
      console.error('Activities fetch error', e);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchActivities();
  };

  const getIconForType = (type: string) => {
    switch (type.toLowerCase()) {
      case 'financial': return '💳';
      case 'food': return '🍲';
      case 'service': return '🤝';
      default: return '📝';
    }
  };

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.activityCard}>
      <View style={[styles.iconContainer, 
        item.type === 'Food' ? { backgroundColor: '#FFF3E0' } :
        item.type === 'Financial' ? { backgroundColor: '#E8F5E9' } : { backgroundColor: '#E3F2FD' }
      ]}>
        <Text style={styles.icon}>{getIconForType(item.type)}</Text>
      </View>
      
      <View style={styles.contentContainer}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.desc}>{item.description}</Text>
        <View style={styles.metaRow}>
          <Text style={styles.metaText}>{item.status}</Text>
          <Text style={styles.metaDot}>•</Text>
          <Text style={styles.metaText}>{item.time_ago}</Text>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.canGoBack() ? navigation.goBack() : navigation.navigate('HomeTabs', { screen: 'Home' })}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Activity Feed</Text>
        <View style={{ width: 60 }} />
      </View>

      {isLoading && !refreshing ? (
        <View style={styles.loaderCenter}>
          <ActivityIndicator size="large" color="#38A3A5" />
        </View>
      ) : (
        <FlatList
          data={activities}
          keyExtractor={(item, index) => `${item.id || index}`}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>📭</Text>
              <Text style={styles.emptyTitle}>No Activities Yet</Text>
              <Text style={styles.emptyDesc}>Your donations and impact will appear here.</Text>
            </View>
          }
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#38A3A5']} />
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
    borderBottomWidth: 1, borderBottomColor: '#f0f0f0'
  },
  backButton: { padding: 10, marginLeft: -10 },
  backText: { fontSize: 16, color: '#333', fontWeight: '600' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#222' },
  
  loaderCenter: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  
  listContent: { padding: 20, paddingBottom: 50 },
  
  activityCard: {
    flexDirection: 'row', backgroundColor: '#fff', borderRadius: 16, padding: 16,
    marginBottom: 15, shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 5, elevation: 2, alignItems: 'center'
  },
  iconContainer: {
    width: 50, height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center', marginRight: 15
  },
  icon: { fontSize: 24 },
  
  contentContainer: { flex: 1 },
  title: { fontSize: 16, fontWeight: '700', color: '#222', marginBottom: 4 },
  desc: { fontSize: 14, color: '#666', lineHeight: 20, marginBottom: 8 },
  metaRow: { flexDirection: 'row', alignItems: 'center' },
  metaText: { fontSize: 12, color: '#999', fontWeight: '500', textTransform: 'capitalize' },
  metaDot: { fontSize: 12, color: '#999', marginHorizontal: 6 },

  emptyContainer: { alignItems: 'center', marginTop: 100 },
  emptyIcon: { fontSize: 64, marginBottom: 15 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: '#222', marginBottom: 8 },
  emptyDesc: { fontSize: 15, color: '#666' },
});
