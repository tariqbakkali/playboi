import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

export default function Page1() {
  const router = useRouter();
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to Playboi!</Text>
      <Text style={styles.text}>Let's get you started with a quick onboarding.</Text>
      <Button title="Next" onPress={() => router.push('/onboarding/Page2')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#111' },
  title: { fontSize: 28, fontWeight: 'bold', color: '#fff', marginBottom: 16 },
  text: { fontSize: 18, color: '#ccc', marginBottom: 32 },
}); 