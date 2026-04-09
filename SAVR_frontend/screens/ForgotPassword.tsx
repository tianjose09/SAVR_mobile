import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, SafeAreaView, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { ApiService } from '../services/api';

export default function ForgotPassword({ navigation }: any) {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  
  // Form State
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Timer State
  const [timeLeft, setTimeLeft] = useState(600);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startTimer = () => {
    setIsTimerActive(true);
    setTimeLeft(600);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          setIsTimerActive(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const formatTime = (seconds: number) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  const handleSendCode = async () => {
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      Alert.alert('Error', 'Please enter a valid email address.');
      return;
    }
    
    setIsLoading(true);
    try {
      const response = await ApiService.forgotPassword({ email });
      if (response.data.success) {
        Alert.alert('Success', `Reset code sent to ${email}`);
        setStep(2);
        startTimer();
      } else {
        Alert.alert('Error', response.data.message || 'Failed to send code.');
      }
    } catch (e: any) {
      Alert.alert('Error', e.response?.data?.message || 'Connection error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (code.length !== 6) {
      Alert.alert('Error', 'Please enter the 6-digit code.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await ApiService.verifyResetCode({ email, code });
      if (response.data.success) {
        if (timerRef.current) clearInterval(timerRef.current);
        setStep(3);
      } else {
        Alert.alert('Error', response.data.message || 'Invalid code.');
      }
    } catch (e: any) {
      Alert.alert('Error', e.response?.data?.message || 'Connection error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (newPassword.length < 8) {
      Alert.alert('Error', 'Password must be at least 8 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await ApiService.resetPassword({
        email,
        password: newPassword,
        password_confirmation: confirmPassword
      });
      
      if (response.data.success) {
        Alert.alert('Success', 'Password reset successfully! Please log in.');
        navigation.navigate('Login');
      } else {
        const errorValues = Object.values(response.data.errors || {})[0];
        // @ts-ignore
        const errorMessage = (errorValues && errorValues[0]) || response.data.message || 'Failed to reset password.';
        Alert.alert('Error', errorMessage);
      }
    } catch (e: any) {
      Alert.alert('Error', e.response?.data?.message || 'Connection error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.content}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backText}>← Back to Login</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.main}>
          <Text style={styles.title}>Reset Password</Text>
          
          {step === 1 && (
            <View style={styles.card}>
              <Text style={styles.cardSubtitle}>Enter your registered email address to receive a 6-digit secure reset code.</Text>
              
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Email Address</Text>
                <TextInput
                  style={styles.input}
                  placeholder="you@email.com"
                  placeholderTextColor="#999"
                  autoCapitalize="none"
                  keyboardType="email-address"
                  value={email}
                  onChangeText={setEmail}
                />
              </View>

              <TouchableOpacity 
                style={[styles.button, isLoading && styles.buttonDisabled]} 
                onPress={handleSendCode}
                disabled={isLoading}
              >
                {isLoading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.buttonText}>Send Reset Code</Text>}
              </TouchableOpacity>
            </View>
          )}

          {step === 2 && (
            <View style={styles.card}>
              <Text style={styles.cardSubtitle}>We've sent a 6-digit confirmation code to:{"\n"}<Text style={{fontWeight:'bold', color:'#333'}}>{email}</Text></Text>
              
              <TextInput
                style={[styles.input, styles.codeInput]}
                placeholder="000000"
                placeholderTextColor="#bbb"
                keyboardType="number-pad"
                maxLength={6}
                value={code}
                onChangeText={setCode}
              />
              
              <View style={styles.timerContainer}>
                {isTimerActive ? (
                  <Text style={styles.timerText}>Code expires in <Text style={{fontWeight:'bold', color:'#D4AA3A'}}>{formatTime(timeLeft)}</Text></Text>
                ) : (
                  <Text style={styles.timerExpiredText}>Verification code has expired</Text>
                )}
              </View>

              <TouchableOpacity 
                style={[styles.button, (!isTimerActive || isLoading) && styles.buttonDisabled]} 
                onPress={handleVerifyCode}
                disabled={!isTimerActive || isLoading}
              >
                {isLoading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.buttonText}>Verify Secure Code</Text>}
              </TouchableOpacity>

              <TouchableOpacity style={styles.resendButton} onPress={handleSendCode} disabled={isTimerActive && timeLeft > 540}>
                <Text style={[styles.resendText, (isTimerActive && timeLeft > 540) && {color: '#ccc'}]}>Resend Code</Text>
              </TouchableOpacity>
            </View>
          )}

          {step === 3 && (
            <View style={styles.card}>
              <Text style={styles.cardSubtitle}>Create a new secure password. It must contain at least 8 characters, an uppercase letter, a number, and a symbol.</Text>
              
              <View style={styles.inputGroup}>
                <Text style={styles.label}>New Password</Text>
                <TextInput
                  style={styles.input}
                  placeholder="••••••••"
                  placeholderTextColor="#999"
                  secureTextEntry
                  value={newPassword}
                  onChangeText={setNewPassword}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Confirm New Password</Text>
                <TextInput
                  style={styles.input}
                  placeholder="••••••••"
                  placeholderTextColor="#999"
                  secureTextEntry
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                />
              </View>

              <TouchableOpacity 
                style={[styles.button, isLoading && styles.buttonDisabled, { marginTop: 10 }]} 
                onPress={handleResetPassword}
                disabled={isLoading}
              >
                {isLoading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.buttonText}>Confirm New Password</Text>}
              </TouchableOpacity>
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3EFE6' },
  content: { flex: 1 },
  header: { paddingHorizontal: 20, paddingTop: Platform.OS === 'ios' ? 10 : 30, paddingBottom: 10 },
  backButton: { paddingVertical: 10 },
  backText: { fontSize: 16, color: '#226E45', fontWeight: 'bold' },
  main: { flex: 1, paddingHorizontal: 25, paddingTop: 10 },
  title: { fontSize: 34, fontWeight: '900', color: '#226E45', marginBottom: 25 },
  card: {
    backgroundColor: '#FFF', padding: 30, borderRadius: 24,
    shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.1, shadowRadius: 15, elevation: 5,
  },
  cardSubtitle: { fontSize: 14, color: '#666', marginBottom: 25, lineHeight: 22 },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 13, fontWeight: 'bold', color: '#226E45', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 },
  input: {
    borderBottomWidth: 1.5, borderBottomColor: '#D1E6DA',
    height: 45, fontSize: 16, color: '#333',
  },
  codeInput: { 
    textAlign: 'center', fontSize: 32, fontWeight: '800', letterSpacing: 12, 
    height: 70, borderBottomWidth: 2, borderBottomColor: '#226E45', marginBottom: 15, color: '#226E45' 
  },
  button: {
    backgroundColor: '#D4AA3A', height: 55, borderRadius: 30,
    justifyContent: 'center', alignItems: 'center', marginTop: 10,
    shadowColor: '#D4AA3A', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 5, elevation: 4
  },
  buttonDisabled: { backgroundColor: '#E5CD89', shadowOpacity: 0 },
  buttonText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  timerContainer: { alignItems: 'center', marginBottom: 25 },
  timerText: { fontSize: 14, color: '#666' },
  timerExpiredText: { fontSize: 14, color: '#d32f2f', fontWeight: 'bold' },
  resendButton: { marginTop: 25, alignItems: 'center' },
  resendText: { color: '#226E45', fontWeight: 'bold', fontSize: 14 },
});
