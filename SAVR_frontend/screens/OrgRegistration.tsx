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
  SafeAreaView,
  ScrollView,
  Modal
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { ApiService } from '../services/api';

export default function OrgRegistration({ navigation }: any) {
  // Form State
  const [form, setForm] = useState({
    organization_name: '',
    website_url: '',
    industry_sector: '',
    organization_type: '',
    contact_person: '',
    position_role: '',
    email: '',
    contact_number: '',
    password: '',
    password_confirmation: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // OTP Validation State
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  const updateForm = (key: string, value: string) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const handleInitialSubmit = async () => {
    if (form.password !== form.password_confirmation) {
      Alert.alert('Validation Check', 'Passwords do not match.');
      return;
    }
    
    try {
      setIsLoading(true);
      // Pre-validate by attempting registration full payload.
      await ApiService.registerOrganization(form);
      
    } catch (error: any) {
      if (error.response?.status === 403) {
        // Form is perfectly valid! Proceed to send OTP.
        try {
          const response = await ApiService.sendVerificationEmail({ email: form.email });
          if (response.data.success) {
            setShowOtpModal(true);
          } else {
            Alert.alert('Error', response.data.message || 'Failed to send OTP.');
          }
        } catch (otpError: any) {
          Alert.alert('Error', otpError.response?.data?.message || 'Failed to request OTP code.');
        }
      } else {
        // It failed actual validation (422) or something else (500)
        const errMsg = error.response?.data?.message || 'Registration Validation Failed.';
        let details = error.response?.data?.error || '';
        if (error.response?.data?.errors) {
           details += '\n' + Object.values(error.response.data.errors).flat().join('\n');
        }
        Alert.alert('Please fix the following:', details ? details.trim() : errMsg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyAndRegister = async () => {
    if (otpCode.length < 6) {
      Alert.alert('Error', 'Please enter the 6-digit verification code.');
      return;
    }

    try {
      setIsVerifying(true);
      
      // 1. Verify Code First
      const verifyRes = await ApiService.verifyCode({ email: form.email, code: otpCode });
      
      if (verifyRes.data.success) {
        
        // 2. Proceed with full registration
        const regRes = await ApiService.registerOrganization(form);
        if (regRes.data.success) {
          setShowOtpModal(false);
          Alert.alert('Success!', 'Organization registered successfully. You can now log in.', [
            { text: 'OK', onPress: () => navigation.navigate('Login') }
          ]);
        }
      }
    } catch (error: any) {
      const errMsg = error.response?.data?.message || 'Verification or Registration failed.';
      let details = '';
      if (error.response?.data?.errors) {
         details = Object.values(error.response.data.errors).flat().join('\n');
      }
      Alert.alert('Error', details ? `${errMsg}\n\n${details}` : errMsg);
    } finally {
      setIsVerifying(false);
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
            style={{ flex: 1 }} 
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

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
              {/* Registration Card */}
              <View style={styles.card}>
                <Text style={styles.title}>Register as Organization!</Text>
                <Text style={styles.subtitle}>Please enter your details</Text>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Organization Name</Text>
                  <TextInput style={styles.input} value={form.organization_name} onChangeText={(val) => updateForm('organization_name', val)} />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Website URL</Text>
                  <View style={styles.websiteContainer}>
                    <TextInput style={styles.websiteInput} value={form.website_url} onChangeText={(val) => updateForm('website_url', val)} autoCapitalize="none" keyboardType="url" />
                    <Ionicons name="link-outline" size={18} color="#666" style={{ padding: 4 }} />
                  </View>
                </View>

                {/* 2 Column Row: Industry / Org Type */}
                <View style={styles.row}>
                  <View style={[styles.inputGroup, styles.halfCol]}>
                    <Text style={styles.label}>Industry / Sector</Text>
                    <TextInput style={styles.input} value={form.industry_sector} onChangeText={(val) => updateForm('industry_sector', val)} />
                  </View>
                  <View style={[styles.inputGroup, styles.halfCol]}>
                    <Text style={styles.label}>Organization Type</Text>
                    <TextInput style={styles.input} value={form.organization_type} onChangeText={(val) => updateForm('organization_type', val)} />
                  </View>
                </View>

                {/* 2 Column Row: Contact Person / Position */}
                <View style={styles.row}>
                  <View style={[styles.inputGroup, styles.halfCol]}>
                    <Text style={styles.label}>Contact Person</Text>
                    <TextInput style={styles.input} value={form.contact_person} onChangeText={(val) => updateForm('contact_person', val)} />
                  </View>
                  <View style={[styles.inputGroup, styles.halfCol]}>
                    <Text style={styles.label}>Position / Role</Text>
                    <TextInput style={styles.input} value={form.position_role} onChangeText={(val) => updateForm('position_role', val)} />
                  </View>
                </View>

                {/* Full Width Info */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Email Address</Text>
                  <TextInput style={styles.input} value={form.email} onChangeText={(val) => updateForm('email', val)} keyboardType="email-address" autoCapitalize="none" />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Contact Number</Text>
                  <TextInput style={styles.input} value={form.contact_number} onChangeText={(val) => updateForm('contact_number', val)} keyboardType="phone-pad" maxLength={11} />
                </View>

                {/* Passwords */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Password</Text>
                  <View style={styles.passwordContainer}>
                    <TextInput style={styles.passwordInput} secureTextEntry={!showPassword} value={form.password} onChangeText={(val) => updateForm('password', val)} autoCapitalize="none" />
                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                      <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={20} color="#666" />
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Confirm Password</Text>
                  <View style={styles.passwordContainer}>
                    <TextInput style={styles.passwordInput} secureTextEntry={!showConfirmPassword} value={form.password_confirmation} onChangeText={(val) => updateForm('password_confirmation', val)} autoCapitalize="none" />
                    <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={styles.eyeIcon}>
                      <Ionicons name={showConfirmPassword ? 'eye-off' : 'eye'} size={20} color="#666" />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Submit */}
                <TouchableOpacity 
                  style={styles.actionBtn} 
                  onPress={handleInitialSubmit}
                  disabled={isLoading}
                >
                  {isLoading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.actionBtnText}>Register</Text>}
                </TouchableOpacity>

                {/* Login Link */}
                <View style={styles.authLinkRow}>
                  <Text style={styles.authLinkText}>Already have an account? </Text>
                  <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                    <Text style={styles.authLinkHighlight}>Log In</Text>
                  </TouchableOpacity>
                </View>

              </View>
            </ScrollView>
          </KeyboardAvoidingView>

          {/* OTP Validation Modal */}
          <Modal visible={showOtpModal} animationType="fade" transparent={true}>
            <View style={styles.modalOverlay}>
              <View style={styles.modalCard}>
                <View style={styles.modalIconBox}>
                  <Ionicons name="mail-open-outline" size={32} color="#D4AA3A" />
                </View>
                <Text style={styles.modalTitle}>Verify Your Email</Text>
                <Text style={styles.modalSub}>We've sent a 6-digit confirmation code to:{"\n"}<Text style={{fontWeight:'bold', color:'#333'}}>{form.email}</Text></Text>
                <TextInput
                  style={styles.modalInput}
                  value={otpCode}
                  onChangeText={setOtpCode}
                  keyboardType="number-pad"
                  maxLength={6}
                  placeholder="000000"
                  textAlign="center"
                  placeholderTextColor="#bbb"
                />
                
                <TouchableOpacity 
                  style={styles.modalBtn} 
                  onPress={handleVerifyAndRegister} 
                  disabled={isVerifying}
                >
                  {isVerifying ? (
                    <ActivityIndicator color="#FFF" />
                  ) : (
                    <Text style={styles.modalBtnText}>Verify & Complete Registration</Text>
                  )}
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.modalCancelBtn} 
                  onPress={() => setShowOtpModal(false)} 
                  disabled={isVerifying}
                >
                  <Text style={styles.modalCancelText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>

        </SafeAreaView>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1, width: '100%', height: '100%' },
  overlay: { flex: 1, backgroundColor: 'rgba(34, 110, 69, 0.85)' },
  safeArea: { flex: 1 },
  scrollContent: { paddingHorizontal: 15, paddingBottom: 30 },
  logoContainer: { alignItems: 'center', marginVertical: 20 },
  logoTop: { color: '#FFF', fontSize: 14, marginBottom: -4 },
  logoMainRow: { flexDirection: 'row', alignItems: 'center' },
  logoMainFood: { color: '#FFF', fontSize: 36, fontWeight: 'bold' },
  logoMainBank: { color: '#FFF', fontSize: 36, fontWeight: 'bold' },
  logoSub: { color: '#D1E6DA', fontSize: 12, marginTop: -2 },
  card: {
    backgroundColor: 'rgba(235, 240, 235, 0.95)',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000', shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1, shadowRadius: 10, elevation: 5,
  },
  title: { fontSize: 24, fontWeight: '900', color: '#4A4A4A', textAlign: 'center', marginBottom: 4 },
  subtitle: { fontSize: 13, color: '#777', textAlign: 'center', marginBottom: 25 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  halfCol: { flex: 0.48 },
  inputGroup: { marginBottom: 15 },
  label: { fontSize: 12, color: '#555', fontWeight: '700', marginBottom: 4 },
  input: {
    borderBottomWidth: 1, borderBottomColor: '#666',
    paddingVertical: 5, fontSize: 14, color: '#333',
  },
  websiteContainer: {
    flexDirection: 'row', alignItems: 'center',
    borderBottomWidth: 1, borderBottomColor: '#666',
  },
  websiteInput: { flex: 1, paddingVertical: 5, fontSize: 14, color: '#333' },
  passwordContainer: {
    flexDirection: 'row', alignItems: 'center',
    borderBottomWidth: 1, borderBottomColor: '#666',
  },
  passwordInput: { flex: 1, paddingVertical: 5, fontSize: 14, color: '#333' },
  eyeIcon: { padding: 4 },
  actionBtn: {
    backgroundColor: '#CA8846', borderRadius: 30,
    paddingVertical: 14, alignItems: 'center', marginTop: 10, marginBottom: 20,
  },
  actionBtnText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  authLinkRow: { flexDirection: 'row', justifyContent: 'center' },
  authLinkText: { fontSize: 12, color: '#666' },
  authLinkHighlight: { fontSize: 12, color: '#1A6B3E', fontWeight: 'bold' },
  modalOverlay: {
    flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.6)'
  },
  modalCard: {
    width: '85%', backgroundColor: '#FFF', borderRadius: 24, padding: 30, alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.15, shadowRadius: 15, elevation: 10
  },
  modalIconBox: {
    backgroundColor: '#F3EFE6', padding: 15, borderRadius: 50, marginBottom: 15
  },
  modalTitle: { fontSize: 24, fontWeight: '900', color: '#226E45', marginBottom: 8, textAlign: 'center' },
  modalSub: { fontSize: 13, color: '#666', textAlign: 'center', marginBottom: 25, lineHeight: 20 },
  modalInput: {
    borderWidth: 1.5, borderColor: '#D1E6DA', borderRadius: 12,
    width: '100%', fontSize: 28, letterSpacing: 8, paddingVertical: 15, marginBottom: 25,
    backgroundColor: '#F9FBF9', color: '#226E45', fontWeight: 'bold'
  },
  modalBtn: {
    backgroundColor: '#D4AA3A', borderRadius: 30, width: '100%', paddingVertical: 16, alignItems: 'center', justifyContent: 'center', marginBottom: 15,
    shadowColor: '#D4AA3A', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 5, elevation: 4
  },
  modalBtnText: { color: '#FFF', fontSize: 16, fontWeight: 'bold', textAlign: 'center' },
  modalCancelBtn: { padding: 8 },
  modalCancelText: { color: '#888', fontSize: 14, fontWeight: '600' }
});
