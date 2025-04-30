import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Button,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, usePathname } from 'expo-router';
import Colors from '@/constants/Colors';
import { signIn } from '@/lib/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function SignInScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSignIn() {
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    if (loading) return;

    try {
      setLoading(true);
      setError(null);
      await signIn(email, password);
      // Use replace to prevent going back to sign-in screen
      router.replace('/(tabs)');
    } catch (err) {
      setError('Invalid email or password');
      console.error('Sign in error:', err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Welcome Back 😏</Text>
          <Text style={styles.subtitle}>Sign in</Text>
        </View>

        {error && <Text style={styles.errorText}>{error}</Text>}

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="Enter your email"
              placeholderTextColor={Colors.gray[600]}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="Enter your password"
              placeholderTextColor={Colors.gray[600]}
              secureTextEntry
            />
          </View>

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleSignIn}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={Colors.white} />
            ) : (
              <Text style={styles.buttonText}>Sign In</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.linkButton}
            onPress={() => router.push('/sign-up')}
          >
            <Text style={styles.linkText}>Don't have an account? Sign Up</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontFamily: 'Rubik-Bold',
    fontSize: 32,
    color: Colors.white,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: 'DMSans-Regular',
    fontSize: 16,
    color: Colors.gray[400],
    textAlign: 'center',
  },
  form: {
    gap: 16,
  },
  inputContainer: {
    gap: 8,
  },
  label: {
    fontFamily: 'DMSans-Medium',
    fontSize: 14,
    color: Colors.white,
  },
  input: {
    backgroundColor: Colors.secondary[300],
    borderRadius: 12,
    padding: 16,
    fontFamily: 'DMSans-Regular',
    fontSize: 16,
    color: Colors.white,
    borderWidth: 1,
    borderColor: Colors.secondary[400],
  },
  button: {
    backgroundColor: Colors.secondary[500],
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
    borderWidth: 1,
    borderColor: Colors.secondary[600],
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    fontFamily: 'DMSans-Bold',
    fontSize: 16,
    color: Colors.white,
  },
  linkButton: {
    alignItems: 'center',
    marginTop: 16,
  },
  linkText: {
    fontFamily: 'DMSans-Medium',
    fontSize: 14,
    color: Colors.gray[400],
  },
  errorText: {
    fontFamily: 'DMSans-Medium',
    fontSize: 14,
    color: Colors.red[500],
    textAlign: 'center',
    marginBottom: 16,
  },
});
