import React from 'react';
import { View, Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

// Import Screens (we will create these next)
import LandingPage from '../screens/LandingPage';
import Login from '../screens/Login';
import Registration from '../screens/Registration';
import DonorRegistration from '../screens/DonorRegistration';
import OrgRegistration from '../screens/OrgRegistration';
import PkRegistration from '../screens/PkRegistration';
import VerifyEmail from '../screens/VerifyEmail';
import ForgotPassword from '../screens/ForgotPassword';

// Drawer screens
import DonorDashboard from '../screens/DonorDashboard';
import OrgDashboard from '../screens/OrgDashboard';
import PkDashboard from '../screens/PkDashboard';
import ChooseDonation from '../screens/ChooseDonation';
import FinancialDonation from '../screens/FinancialDonation';
import FoodDonationDetails from '../screens/FoodDonationDetails';
import FoodDonationPickup from '../screens/FoodDonationPickup';
import FoodDonationDelivery from '../screens/FoodDonationDelivery';
import ServiceDonation from '../screens/ServiceDonation';
import Activities from '../screens/Activities';
import AchievementBadges from '../screens/AchievementBadges';
import Profile from '../screens/Profile';
import EditProfile from '../screens/EditProfile';

// Custom Sidebar Component
import Sidebar from '../components/Sidebar';
import DashboardSwitcher from '../screens/DashboardSwitcher';

const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: '#FFF',
        tabBarInactiveTintColor: 'rgba(255,255,255,0.6)',
        tabBarStyle: {
          backgroundColor: '#226E45',
          borderTopLeftRadius: 30,
          borderTopRightRadius: 30,
          height: 70,
          paddingBottom: Platform.OS === 'ios' ? 20 : 10,
          paddingTop: 10,
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          borderTopWidth: 0,
          elevation: 10,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.1,
          shadowRadius: 10,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: 'bold',
          marginBottom: Platform.OS === 'ios' ? -5 : 0
        },
        tabBarIcon: ({ focused, color, size }) => {
          if (route.name === 'Home') {
            return (
              <View style={{
                marginTop: -35,
                backgroundColor: '#226E45',
                width: 66,
                height: 66,
                borderRadius: 33,
                justifyContent: 'center',
                alignItems: 'center',
                borderWidth: 5,
                borderColor: '#FFF',
                elevation: 5,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.2,
                shadowRadius: 5,
              }}>
                <Ionicons name="home" size={30} color="#FFF" />
              </View>
            );
          }
          
          let iconName: any;
          if (route.name === 'Donate') {
            iconName = focused ? 'gift' : 'gift-outline';
          } else if (route.name === 'Activities') {
            iconName = focused ? 'heart' : 'heart-outline';
          }
          return <Ionicons name={iconName} size={28} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Donate" component={ChooseDonation} />
      <Tab.Screen 
        name="Home" 
        component={DashboardSwitcher} 
        options={{ tabBarLabel: '' }} 
      />
      <Tab.Screen name="Activities" component={Activities} />
      
      {/* Hidden Tab Screens so they keep the Bottom Bar */}
      <Tab.Screen name="FinancialDonation" component={FinancialDonation} options={{ tabBarItemStyle: { display: 'none' } }} />
      <Tab.Screen name="FoodDonationDetails" component={FoodDonationDetails} options={{ tabBarItemStyle: { display: 'none' } }} />
      <Tab.Screen name="ServiceDonation" component={ServiceDonation} options={{ tabBarItemStyle: { display: 'none' } }} />
      <Tab.Screen name="Profile" component={Profile} options={{ tabBarItemStyle: { display: 'none' } }} />
      <Tab.Screen name="EditProfile" component={EditProfile} options={{ tabBarItemStyle: { display: 'none' } }} />
      <Tab.Screen name="AchievementBadges" component={AchievementBadges} options={{ tabBarItemStyle: { display: 'none' } }} />
    </Tab.Navigator>
  );
}

function MainDrawer() {
  return (
    <Drawer.Navigator 
      drawerContent={(props) => <Sidebar {...props} />}
      screenOptions={{ headerShown: false, drawerPosition: 'right' }}
    >
      <Drawer.Screen name="HomeTabs" component={MainTabs} />
      <Drawer.Screen name="DonorDashboard" component={DonorDashboard} />
      <Drawer.Screen name="OrgDashboard" component={OrgDashboard} />
      <Drawer.Screen name="PkDashboard" component={PkDashboard} />
      <Drawer.Screen name="FoodDonationPickup" component={FoodDonationPickup} />
      <Drawer.Screen name="FoodDonationDelivery" component={FoodDonationDelivery} />
    </Drawer.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="LandingPage" screenOptions={{ headerShown: false }}>
        {/* Unauthenticated routes */}
        <Stack.Screen name="LandingPage" component={LandingPage} />
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="Registration" component={Registration} />
        <Stack.Screen name="DonorRegistration" component={DonorRegistration} />
        <Stack.Screen name="OrgRegistration" component={OrgRegistration} />
        <Stack.Screen name="PkRegistration" component={PkRegistration} />
        <Stack.Screen name="VerifyEmail" component={VerifyEmail} />
        <Stack.Screen name="ForgotPassword" component={ForgotPassword} />

        {/* Authenticated routes (Drawer handles inside) */}
        <Stack.Screen name="MainDrawer" component={MainDrawer} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
