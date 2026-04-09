import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Image, 
  SafeAreaView, 
  ScrollView,
  Platform,
  StatusBar
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

export default function LandingPage({ navigation }: any) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#226E45" />
      <ScrollView 
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* --- HEADER SECTION --- */}
        <View style={styles.header}>
          {/* Logo mockup */}
          <View style={styles.logoContainer}>
            <Text style={styles.logoTop}>Philippine</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={styles.logoMain}>Food</Text>
              <Text style={styles.logoMain}>Bank</Text>
            </View>
            <Text style={styles.logoSub}>Foundation, Inc.</Text>
          </View>

          {/* Auth Buttons */}
          <View style={styles.authButtons}>
            <TouchableOpacity 
              style={styles.loginBtn}
              onPress={() => navigation.navigate('Login')}
            >
              <Text style={styles.loginBtnText}>Login</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.registerBtn}
              onPress={() => navigation.navigate('Registration')}
            >
              <Text style={styles.registerBtnText}>Register</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* --- HERO SECTION --- */}
        <View style={styles.heroSection}>
          <Text style={styles.heroHeadline}>
            Together, we fight hunger &{'\n'}ensure no food goes to{' '}
            <Text style={styles.heroHeadlineHighlight}>waste.</Text>
          </Text>

          <Text style={styles.heroParagraph}>
            We are a non-profit organization , we rescue surplus food from donors and deliver it to communities in need—fighting hunger while promoting sustainability and social responsibility.
          </Text>

          {/* Stats */}
          <View style={styles.statsRow}>
            <View style={styles.statColumn}>
              <Text style={styles.statNumber}>2.3M+</Text>
              <Text style={styles.statLabel}>meals served</Text>
            </View>
            <View style={styles.statColumn}>
              <Text style={styles.statNumber}>850+</Text>
              <Text style={styles.statLabel}>partners</Text>
            </View>
            <View style={styles.statColumn}>
              <Text style={styles.statNumber}>48</Text>
              <Text style={styles.statLabel}>provinces</Text>
            </View>
          </View>
        </View>

        {/* --- WHITE CONTENT AREA --- */}
        <View style={styles.whiteSection}>
          
          {/* Donate Now Button */}
          <View style={styles.donateNowContainer}>
            <TouchableOpacity 
              style={styles.donateNowBtn}
              activeOpacity={0.8}
              onPress={() => navigation.navigate('Login')}
            >
              <MaterialCommunityIcons name="charity" size={28} color="#FFF" style={{ marginRight: 10 }} />
              <Text style={styles.donateNowText}>DONATE NOW</Text>
            </TouchableOpacity>
          </View>

          {/* Placeholder Image */}
          {/* TO CHANGE THE IMAGE, replace the uri below with require('../assets/your_image.jpg') */}
          <View style={styles.imageWrapper}>
            <Image 
              source={{ uri: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=800' }} 
              style={styles.mainImage}
            />
          </View>

          {/* Goals Section */}
          <View style={styles.goalsContainer}>
            <Text style={styles.goalsTitle}>OUR MAIN GOALS</Text>
            
            <View style={styles.goalItem}>
              <Ionicons name="checkmark-circle" size={24} color="#226E45" style={styles.checkIcon} />
              <View style={styles.goalTextContainer}>
                <Text style={styles.goalItemTitle}>Hunger Relief</Text>
                <Text style={styles.goalItemDesc}>by distributing surplus food to religious orphanages, schools, parishes and other charitable institutions in communities in need.</Text>
              </View>
            </View>

            <View style={styles.goalItem}>
              <Ionicons name="checkmark-circle" size={24} color="#226E45" style={styles.checkIcon} />
              <View style={styles.goalTextContainer}>
                <Text style={styles.goalItemTitle}>Food Waste Reduction</Text>
                <Text style={styles.goalItemDesc}>through collaborating with food business to minimize excess and waste added to landfill.</Text>
              </View>
            </View>

            <View style={styles.goalItem}>
              <Ionicons name="checkmark-circle" size={24} color="#226E45" style={styles.checkIcon} />
              <View style={styles.goalTextContainer}>
                <Text style={styles.goalItemTitle}>Promote Learning Abilities</Text>
                <Text style={styles.goalItemDesc}>by providing nourishment to avoid brain damage especially for young children from newly born to 2 years old.</Text>
              </View>
            </View>

            <View style={styles.goalItem}>
              <Ionicons name="checkmark-circle" size={24} color="#226E45" style={styles.checkIcon} />
              <View style={styles.goalTextContainer}>
                <Text style={styles.goalItemTitle}>Community Empowerment</Text>
                <Text style={styles.goalItemDesc}>by providing nutritional education and supporting local hunger-fighting initiatives.</Text>
              </View>
            </View>
          </View>

          {/* Mission Card */}
          <View style={styles.missionCard}>
            <Text style={styles.missionTitle}>Our Mission</Text>
            <Text style={styles.missionDesc}>
              To combat food insecurity while fostering sustainability and social responsibility — making sure that surplus food reaches people who need it most instead of going to waste.
            </Text>
            {/* Decorative background circles for the card can be added here if needed */}
          </View>

          {/* Get Involved Section */}
          <View style={styles.getInvolvedContainer}>
            <View style={styles.getInvolvedBadge}>
              <Text style={styles.getInvolvedBadgeText}>GET INVOLVED</Text>
            </View>
            <Text style={styles.getInvolvedHeadline}>Be part of the solution</Text>
            <Text style={styles.getInvolvedSub}>
              Whether you donate, partner with us, or support our mission in other ways, every contribution helps bring meals, hope, and care to people in need.
            </Text>

            <View style={styles.cardsRow}>
              {/* Donor Card */}
              <View style={styles.actionCard}>
                <View style={styles.cardHeader}>
                  <View style={styles.cardIconBox}>
                    <MaterialCommunityIcons name="hand-heart" size={20} color="#D4AA3A" />
                  </View>
                  <Text style={styles.cardTitle}>Become a Donor</Text>
                </View>
                <Text style={styles.cardDesc}>
                  Food, funds, or your time — every contribution helps provide meals and support people in need.
                </Text>
                <TouchableOpacity style={styles.cardBtn} onPress={() => navigation.navigate('DonorRegistration')}>
                  <MaterialCommunityIcons name="hand-heart" size={14} color="#FFF" />
                  <Text style={styles.cardBtnText}>Donate</Text>
                </TouchableOpacity>
              </View>

              {/* Partner Card */}
              <View style={styles.actionCard}>
                <View style={styles.cardHeader}>
                  <View style={styles.cardIconBox}>
                    <MaterialCommunityIcons name="handshake" size={20} color="#D4AA3A" />
                  </View>
                  <Text style={styles.cardTitle}>Partner With Us</Text>
                </View>
                <Text style={styles.cardDesc}>
                  Businesses, organizations, and institutions can join our network to rescue and redistribute surplus food.
                </Text>
                <TouchableOpacity style={styles.cardBtn} onPress={() => navigation.navigate('OrgRegistration')}>
                  <MaterialCommunityIcons name="handshake" size={14} color="#FFF" />
                  <Text style={styles.cardBtnText}>Partner Organization</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
          
          <View style={styles.bottomPadding} />
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const BRAND_GREEN = '#226E45';
const BRAND_YELLOW = '#D1A041';
const ORANGE = '#DA702C';

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: BRAND_GREEN,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 25,
  },
  logoContainer: {
    flexDirection: 'column',
  },
  logoTop: {
    color: '#FFF',
    fontSize: 10,
    marginBottom: -2,
  },
  logoMain: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: 'bold',
    letterSpacing: -0.5,
  },
  logoSub: {
    color: '#D1E6DA',
    fontSize: 9,
    marginTop: -2,
  },
  authButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loginBtn: {
    borderWidth: 1,
    borderColor: '#FFF',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 16,
    marginRight: 8,
  },
  loginBtnText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 12,
  },
  registerBtn: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 16,
  },
  registerBtnText: {
    color: BRAND_GREEN,
    fontWeight: '700',
    fontSize: 12,
  },
  heroSection: {
    paddingHorizontal: 20,
    paddingBottom: 80, // Increased bottom padding to prevent donate button from overlapping stats
  },
  heroHeadline: {
    fontSize: 34,
    fontWeight: '900',
    color: '#FFF',
    lineHeight: 38,
    marginBottom: 16,
  },
  heroHeadlineHighlight: {
    color: BRAND_YELLOW,
  },
  heroParagraph: {
    color: '#EAF3EE',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 24,
    fontWeight: '500',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingRight: 20,
  },
  statColumn: {
    flexDirection: 'column',
  },
  statNumber: {
    color: BRAND_YELLOW,
    fontSize: 24,
    fontWeight: '900',
  },
  statLabel: {
    color: '#A0D2B4',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  whiteSection: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    paddingHorizontal: 20,
    alignItems: 'center',
    paddingTop: 0,
    flex: 1,
    marginTop: -20,
  },
  donateNowContainer: {
    marginTop: -28, // Overlap the green background
    width: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 8,
    marginBottom: 25,
  },
  donateNowBtn: {
    backgroundColor: BRAND_YELLOW,
    borderRadius: 30,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#C69335',
  },
  donateNowText: {
    color: '#FFF',
    fontSize: 22,
    fontWeight: '900',
    textShadowColor: 'rgba(0,0,0,0.1)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  imageWrapper: {
    width: '100%',
    borderRadius: 24,
    borderWidth: 4,
    borderColor: '#2D8152',
    overflow: 'hidden',
    marginBottom: 30,
  },
  mainImage: {
    width: '100%',
    aspectRatio: 1.6,
    resizeMode: 'cover',
  },
  goalsContainer: {
    width: '100%',
    paddingHorizontal: 5,
    marginBottom: 40,
  },
  goalsTitle: {
    color: ORANGE,
    fontSize: 20,
    fontWeight: '900',
    marginBottom: 20,
    textShadowColor: 'rgba(218, 112, 44, 0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  goalItem: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-start',
  },
  checkIcon: {
    marginTop: 2,
    marginRight: 10,
  },
  goalTextContainer: {
    flex: 1,
  },
  goalItemTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  goalItemDesc: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },
  missionCard: {
    backgroundColor: BRAND_GREEN,
    width: '100%',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 40,
    // Add subtle shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  missionTitle: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: '900',
    marginBottom: 12,
  },
  missionDesc: {
    color: '#FFF',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 20,
    fontWeight: '500',
  },
  getInvolvedContainer: {
    width: '100%',
    alignItems: 'center',
    backgroundColor: '#FCFAF5',
    paddingVertical: 30,
    paddingHorizontal: 10,
    borderRadius: 20,
    marginBottom: 20,
  },
  getInvolvedBadge: {
    borderWidth: 1,
    borderColor: '#4EA976',
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginBottom: 16,
  },
  getInvolvedBadgeText: {
    color: '#4EA976',
    fontWeight: 'bold',
    fontSize: 12,
  },
  getInvolvedHeadline: {
    fontSize: 24,
    fontWeight: '900',
    color: '#1a1a1a',
    marginBottom: 10,
  },
  getInvolvedSub: {
    textAlign: 'center',
    fontSize: 13,
    color: '#666',
    lineHeight: 20,
    marginBottom: 30,
    paddingHorizontal: 10,
  },
  cardsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  actionCard: {
    flex: 1,
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 5,
    elevation: 3,
    justifyContent: 'space-between', // Push button to bottom
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardIconBox: {
    backgroundColor: '#FFF8E7',
    padding: 6,
    borderRadius: 8,
    marginRight: 8,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: BRAND_GREEN,
    flex: 1,
  },
  cardDesc: {
    fontSize: 11,
    color: '#666',
    lineHeight: 16,
    marginBottom: 16,
  },
  cardBtn: {
    backgroundColor: BRAND_GREEN,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  cardBtnText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: 'bold',
    marginLeft: 6,
  },
  bottomPadding: {
    height: 40,
  }
});
