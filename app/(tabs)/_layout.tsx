import { Tabs } from 'expo-router';
import React from 'react';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { PALETTE, T } from '@/constants/travel';
import { useTrips } from '@/contexts/trips-context';

export default function TabLayout() {
  const { dil } = useTrips();
  const t = T[dil];

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarActiveTintColor: PALETTE.coral,
        tabBarInactiveTintColor: PALETTE.moss,
        tabBarStyle: { backgroundColor: PALETTE.cream, borderTopColor: PALETTE.sage },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: t.home,
          tabBarIcon: ({ color }) => <IconSymbol size={26} name="house.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="ekle"
        options={{
          title: t.add,
          tabBarIcon: ({ color }) => <IconSymbol size={26} name="plus.circle.fill" color={color} />,
        }}
      />
    </Tabs>
  );
}
