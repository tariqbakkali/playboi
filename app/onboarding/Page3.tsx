import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Page3() {
  const router = useRouter();
  const handleFinish = async () => {
    await AsyncStorage.setItem('onboardingComplete', 'true');
    router.replace('/(auth)/sign-up');
  };
  return (
    <View style={styles.container}>
      <Text style={styles.title}>You're all set!</Text>
      <Text style={styles.text}>Let's get you signed up and started.</Text>
      <Button title="Sign Up" onPress={handleFinish} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#111' },
  title: { fontSize: 28, fontWeight: 'bold', color: '#fff', marginBottom: 16 },
  text: { fontSize: 18, color: '#ccc', marginBottom: 32 },
}); 