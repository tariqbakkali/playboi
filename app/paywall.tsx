import { router } from 'expo-router';
import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Purchases from 'react-native-purchases';
import RevenueCatUI from 'react-native-purchases-ui';

export default function PaywallScreen() {
  useEffect(() => {
    Purchases.addCustomerInfoUpdateListener((customerInfo) => {
      if (Object.values(customerInfo.entitlements.active).length > 0) {
        router.replace('/(tabs)');
      }
    });
  }, []);

  return (
    <View style={styles.container}>
      <RevenueCatUI.Paywall />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
