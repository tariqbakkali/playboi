import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

export default function Page2() {
  const router = useRouter();
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Step 2</Text>
      <Text style={styles.text}>Here's some more info about Playboi.</Text>
      <Button title="Next" onPress={() => router.push('/onboarding/Page3')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#111' },
  title: { fontSize: 28, fontWeight: 'bold', color: '#fff', marginBottom: 16 },
  text: { fontSize: 18, color: '#ccc', marginBottom: 32 },
}); 