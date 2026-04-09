import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, SafeAreaView, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { ApiService } from '../services/api';

export default function VerifyEmail({ route, navigation }: any) {
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds
  const [isTimerActive, setIsTimerActive] = useState(true);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Read all arguments from navigation
  const params = route.params || {};
  const { email, name, registrationType } = params;

  useEffect(() => {
    startTimer();
    return () => stopTimer();
  }, []);

  const startTimer = () => {
    setIsTimerActive(true);
    setTimeLeft(600);
    stopTimer();
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          stopTimer();
          setIsTimerActive(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const stopTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const formatTime = (seconds: number) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  const handleVerify = async () => {
    if (code.length !== 6) {
      Alert.alert('Error', 'Please enter the 6-digit code');
      return;
    }

    setIsLoading(true);
    try {
      // Step 1: Verify code
      const verifyRes = await ApiService.verifyCode({ email, code });
      
      if (!verifyRes.data.success) {
        Alert.alert('Error', verifyRes.data.message || 'Invalid code. Please try again.');
        setIsLoading(false);
        return;
      }

      // Step 2: Register
      let registerRes;
      if (registrationType === 'donor') {
        registerRes = await ApiService.registerDonor(params);
      } else if (registrationType === 'organization') {
        registerRes = await ApiService.registerOrganization(params);
      } else if (registrationType === 'partner_kitchen') {
        registerRes = await ApiService.registerPartnerKitchen(params);
      } else {
        throw new Error('Unknown registration type');
      }

      if (registerRes.data.success) {
        stopTimer();
        Alert.alert('Success', 'Account created successfully! Please log in.');
        navigation.navigate('Login');
      } else {
        const errorValues = Object.values(registerRes.data.errors || {})[0];
        // @ts-ignore
        const errorMessage = (errorValues && errorValues[0]) || registerRes.data.message || 'Registration failed';
        Alert.alert('Error', errorMessage);
      }
    } catch (e: any) {
      Alert.alert('Error', e.response?.data?.message || 'Connection error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setIsLoading(true);
    try {
      const response = await ApiService.resendCode({ email, name });
      if (response.data.success) {
        Alert.alert('Success', `New code sent to ${email}`);
        startTimer();
      } else {
        Alert.alert('Error', response.data.message || 'Failed to resend code.');
      }
    } catch (e: any) {
      Alert.alert('Error', 'Connection error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.content}>
        
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>

        <View style={styles.main}>
          <View style={styles.iconContainer}>
            <Text style={styles.icon}>✉️</Text>
          </View>
          
          <Text style={styles.title}>Check your email</Text>
          <Text style={styles.subtitle}>
            We sent a 6-digit verification code to
            {'\n'}
            <Text style={styles.emailText}>{email}</Text>
          </Text>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.codeInput}
              placeholder="000000"
              keyboardType="number-pad"
              maxLength={6}
              value={code}
              onChangeText={setCode}
            />
          </View>

          <View style={styles.timerContainer}>
            {isTimerActive ? (
              <Text style={styles.timerText}>Code expires in {formatTime(timeLeft)}</Text>
            ) : (
              <Text style={styles.timerExpiredText}>Code expired — please resend</Text>
            )}
          </View>

          <TouchableOpacity 
            style={[styles.button, (!isTimerActive || isLoading) && styles.buttonDisabled]} 
            onPress={handleVerify}
            disabled={!isTimerActive || isLoading}
          >
            {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Verify Email</Text>}
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Didn't receive the email? </Text>
            <TouchableOpacity onPress={handleResend} disabled={isTimerActive && timeLeft > 540}>
              <Text style={[styles.resendText, isTimerActive && timeLeft > 540 && styles.resendTextDisabled]}>
                Resend Code
              </Text>
            </TouchableOpacity>
          </View>
        </View>

      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  content: { flex: 1 },
  backButton: { padding: 20 },
  backText: { fontSize: 16, color: '#333', fontWeight: '600' },
  main: { flex: 1, paddingHorizontal: 30, paddingTop: 40, alignItems: 'center' },
  iconContainer: {
    width: 80, height: 80, borderRadius: 40, backgroundColor: '#E0F2F1',
    justifyContent: 'center', alignItems: 'center', marginBottom: 24,
  },
  icon: { fontSize: 40 },
  title: { fontSize: 28, fontWeight: '800', color: '#222', marginBottom: 12, textAlign: 'center' },
  subtitle: { fontSize: 16, color: '#666', textAlign: 'center', lineHeight: 24, marginBottom: 40 },
  emailText: { fontWeight: '700', color: '#38A3A5' },
  inputContainer: { width: '100%', marginBottom: 20 },
  codeInput: {
    backgroundColor: '#fff', height: 60, borderRadius: 12, textAlign: 'center',
    fontSize: 24, fontWeight: '700', letterSpacing: 8, color: '#333',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5, elevation: 2,
  },
  timerContainer: { marginBottom: 30 },
  timerText: { fontSize: 14, color: '#666', fontWeight: '500' },
  timerExpiredText: { fontSize: 14, color: '#d32f2f', fontWeight: 'bold' },
  button: {
    backgroundColor: '#38A3A5', width: '100%', height: 56, borderRadius: 16,
    justifyContent: 'center', alignItems: 'center', marginBottom: 30,
  },
  buttonDisabled: { backgroundColor: '#B2DFDB' },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: '700' },
  footer: { flexDirection: 'row', justifyContent: 'center' },
  footerText: { color: '#666', fontSize: 15 },
  resendText: { color: '#38A3A5', fontSize: 15, fontWeight: 'bold' },
  resendTextDisabled: { color: '#B2DFDB' }
});
