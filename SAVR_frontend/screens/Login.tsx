import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ImageBackground,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ApiService } from '../services/api';
import { StorageUtils, StorageKeys } from '../utils/storage';

export default function Login({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password.');
      return;
    }

    try {
      setIsLoading(true);
      const response = await ApiService.login({ email, password });

      if (response.data.success) {
        // Save token and user info globally
        await StorageUtils.setItem(StorageKeys.AUTH_TOKEN, response.data.token);
        await StorageUtils.setItem(StorageKeys.USER_INFO, JSON.stringify(response.data.user));

        // Navigate inside the authenticated drawer and reset stack to prevent LandingPage fallback
        navigation.reset({
          index: 0,
          routes: [{ name: 'MainDrawer' }],
        });
      } else {
        Alert.alert('Login Failed', response.data.message || 'Invalid credentials');
      }
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Something went wrong connecting to the server.';
      Alert.alert('Login Failed', msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ImageBackground
      source={{ uri: 'https://images.unsplash.com/photo-1593113563332-e147ce8aadb6?q=80&w=600' }}
      style={styles.background}
    >
      <View style={styles.overlay}>
        <SafeAreaView style={styles.safeArea}>


          <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          >
            {/* Header / Logo */}
            <View style={styles.logoContainer}>
              <Text style={styles.logoTop}>Philippine</Text>
              <View style={styles.logoMainRow}>
                <Text style={styles.logoMainFood}>Food</Text>
                <Text style={styles.logoMainBank}>Bank</Text>
              </View>
              <Text style={styles.logoSub}>Foundation, Inc.</Text>
            </View>

            {/* Login Card */}
            <View style={styles.card}>
              <Text style={styles.title}>Welcome back!</Text>
              <Text style={styles.subtitle}>Please enter your details</Text>

              {/* Email Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Email</Text>
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              {/* Password Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Password</Text>
                <View style={styles.passwordContainer}>
                  <TextInput
                    style={styles.passwordInput}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                  />
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                    <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={20} color="#666" />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Utilities */}
              <View style={styles.utilsRow}>
                <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
                  <Text style={styles.utilText}>Forgot Password?</Text>
                </TouchableOpacity>
              </View>

              {/* Login Button */}
              <TouchableOpacity
                style={styles.loginBtn}
                onPress={handleLogin}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <Text style={styles.loginBtnText}>Log In</Text>
                )}
              </TouchableOpacity>

              {/* Register Link */}
              <View style={styles.registerRow}>
                <Text style={styles.utilText}>Don't have an account? </Text>
                <TouchableOpacity onPress={() => navigation.navigate('Registration')}>
                  <Text style={styles.registerText}>Register</Text>
                </TouchableOpacity>
              </View>

            </View>
          </KeyboardAvoidingView>
          
          {/* Back Button Configured AFTER Main Content For Native Z-Stack Prioritization */}
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={32} color="#FFF" />
          </TouchableOpacity>
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
    backgroundColor: 'rgba(34, 110, 69, 0.85)', // Dark green overlay
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
    padding: 15,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
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
  card: {
    backgroundColor: 'rgba(235, 240, 235, 0.95)',
    borderRadius: 20,
    padding: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: '#4A4A4A',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: '#777',
    textAlign: 'center',
    marginBottom: 30,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    color: '#555',
    fontWeight: '700',
    marginBottom: 5,
  },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: '#666',
    paddingVertical: 8,
    fontSize: 16,
    color: '#333',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#666',
  },
  passwordInput: {
    flex: 1,
    paddingVertical: 8,
    fontSize: 16,
    color: '#333',
  },
  eyeIcon: {
    padding: 8,
  },
  utilsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: 30,
  },
  utilText: {
    fontSize: 12,
    color: '#666',
  },
  loginBtn: {
    backgroundColor: '#CA8846',
    borderRadius: 30,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 20,
  },
  loginBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  registerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  registerText: {
    fontSize: 12,
    color: '#1A6B3E',
    fontWeight: 'bold',
  }
});
