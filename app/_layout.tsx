import { useEffect, useState } from 'react';
import { Slot, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import {
  DMSans_400Regular,
  DMSans_500Medium,
  DMSans_700Bold,
} from '@expo-google-fonts/dm-sans';
import { Rubik_500Medium, Rubik_700Bold } from '@expo-google-fonts/rubik';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ThemeProvider } from '@/context/ThemeContext';
import { AuthProvider } from '@/context/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SplashScreen } from 'expo-router';

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const router = useRouter();
  const [onboardingChecked, setOnboardingChecked] = useState(false);
  const [appMounted, setAppMounted] = useState(false);

  // Load fonts
  const [fontsLoaded] = useFonts({
    'DMSans-Regular': DMSans_400Regular,
    'DMSans-Medium': DMSans_500Medium,
    'DMSans-Bold': DMSans_700Bold,
    'Rubik-Medium': Rubik_500Medium,
    'Rubik-Bold': Rubik_700Bold,
  });

  // Handle hiding the splash screen after fonts are loaded
  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
      setAppMounted(true); // Mark app as mounted
    }
  }, [fontsLoaded]);

  // Run the onboarding check after fonts load and app is mounted
  useEffect(() => {
    const checkOnboardingStatus = async () => {
      try {
        const onboardingComplete = await AsyncStorage.getItem(
          'onboardingComplete'
        );
        console.log('onboardingComplete value:', onboardingComplete);

        if (onboardingComplete !== 'true') {
          console.log('Redirecting to onboarding...');
          router.replace('/onboarding/Page1');
        }
      } catch (e) {
        console.error('Error checking onboarding:', e);
      } finally {
        setOnboardingChecked(true); // Mark the onboarding check as done
      }
    };

    checkOnboardingStatus(); // Call the async function to check onboarding
  }, [fontsLoaded, appMounted, onboardingChecked, router]);

  // Prevent rendering until fonts are loaded, onboarding check is complete, and app is mounted
  if (!fontsLoaded || !onboardingChecked || !appMounted) {
    console.log('Waiting for fonts, app mount, and onboarding check...');
    return null; // Render nothing until both conditions are met
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <ThemeProvider>
          <Slot />
          <StatusBar style="light" />
        </ThemeProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}
