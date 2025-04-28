import { Stack } from 'expo-router';
import Colors from '@/constants/Colors';

export default function RosterLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: Colors.gray[50] },
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="[id]" />
      <Stack.Screen 
        name="[id]/add-meeting" 
        options={{
          presentation: 'modal',
        }}
      />
      <Stack.Screen 
        name="add-player" 
        options={{
          presentation: 'modal',
        }}
      />
    </Stack>
  );
}