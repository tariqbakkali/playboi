import { Stack } from 'expo-router';

export default function OnboardingLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Page1" />
      <Stack.Screen name="Page2" />
      <Stack.Screen name="Page3" />
    </Stack>
  );
} 