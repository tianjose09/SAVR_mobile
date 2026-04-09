import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ImageBackground, 
  SafeAreaView,
  Platform
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

export default function Registration({ navigation }: any) {
  return (
    <ImageBackground 
      source={{ uri: 'https://images.unsplash.com/photo-1593113563332-e147ce8aadb6?q=80&w=600' }} 
      style={styles.background}
    >
      <View style={styles.overlay}>
        <SafeAreaView style={styles.safeArea}>
          {/* HCI-friendly Back Button */}
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Ionicons name="arrow-back" size={32} color="#FFF" />
          </TouchableOpacity>

          <View style={styles.container}>
            {/* Header / Logo */}
            <View style={styles.logoContainer}>
              <Text style={styles.logoTop}>Philippine</Text>
              <View style={styles.logoMainRow}>
                <Text style={styles.logoMainFood}>Food</Text>
                <Text style={styles.logoMainBank}>Bank</Text>
              </View>
              <Text style={styles.logoSub}>Foundation, Inc.</Text>
            </View>

            {/* Title Section */}
            <View style={styles.titleContainer}>
              <Text style={styles.mainTitle}>
                CHOOSE YOUR <Text style={styles.highlightText}>ROLE</Text>
              </Text>
              <Text style={styles.subtitle}>Select your role to create an account.</Text>
            </View>

            {/* Role Cards */}
            <TouchableOpacity 
              style={styles.roleCard}
              activeOpacity={0.8}
              onPress={() => navigation.navigate('DonorRegistration')}
            >
              <View style={styles.iconContainer}>
                <MaterialCommunityIcons name="account" size={50} color="#E8E8E8" />
              </View>
              <View style={styles.cardTextContainer}>
                <Text style={styles.cardTitle}>DONOR</Text>
                <Text style={styles.cardDesc}>Donate food to individuals or communities in need</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.roleCard}
              activeOpacity={0.8}
              onPress={() => navigation.navigate('OrgRegistration')}
            >
              <View style={styles.iconContainer}>
                <MaterialCommunityIcons name="account-group" size={50} color="#E8E8E8" />
              </View>
              <View style={styles.cardTextContainer}>
                <Text style={styles.cardTitle}>ORGANIZATION</Text>
                <Text style={styles.cardDesc}>Organizations donate food or funds to support communities in need.</Text>
              </View>
            </TouchableOpacity>

          </View>
        </SafeAreaView>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(34, 110, 69, 0.85)',
  },
  safeArea: {
    flex: 1,
  },
  backButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 45,
    left: 15,
    zIndex: 999,
    elevation: 10,
    padding: 15, // Large touch area for HCI
  },
  container: {
    flex: 1,
    paddingHorizontal: 30,
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 50,
  },
  logoTop: {
    color: '#FFF',
    fontSize: 14,
    marginBottom: -4,
  },
  logoMainRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoMainFood: {
    color: '#FFF',
    fontSize: 36,
    fontWeight: 'bold',
  },
  logoMainBank: {
    color: '#FFF',
    fontSize: 36,
    fontWeight: 'bold',
  },
  logoSub: {
    color: '#D1E6DA',
    fontSize: 12,
    marginTop: -2,
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  mainTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#FFF',
    letterSpacing: 0.5,
  },
  highlightText: {
    color: '#D4AA3A',
  },
  subtitle: {
    color: '#E8E8E8',
    fontSize: 13,
    marginTop: 8,
  },
  roleCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
  },
  iconContainer: {
    marginRight: 20,
  },
  cardTextContainer: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#D4AA3A',
    marginBottom: 4,
  },
  cardDesc: {
    fontSize: 12,
    color: '#FFF',
    lineHeight: 16,
  }
});
