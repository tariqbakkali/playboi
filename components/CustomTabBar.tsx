import { BottomTabBar, BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useRouter, useSegments } from 'expo-router';
import React from 'react';
import { Pressable } from 'react-native';

export default function CustomTabBar(props: BottomTabBarProps) {
  const router = useRouter();
  const segments = useSegments();

  // Clone the descriptors to override the tabBarButton for the roster tab
  const descriptors = { ...props.descriptors };
  const rosterKey = Object.keys(descriptors).find(
    key => descriptors[key].route.name === 'roster'
  );
  if (rosterKey) {
    const original = descriptors[rosterKey];
    descriptors[rosterKey] = {
      ...original,
      options: {
        ...original.options,
        tabBarButton: ({ children, ...btnProps }) => (
          <Pressable
            {...btnProps}
            onPress={e => {
              // Only reset if not already on the root
              if (segments[1] !== 'roster' || segments.length > 2) {
                router.replace('/roster');
              } else if (btnProps.onPress) {
                btnProps.onPress(e);
              }
            }}
          >
            {children}
          </Pressable>
        ),
      },
    };
  }

  return <BottomTabBar {...props} descriptors={descriptors} />;
} 