import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useColors } from '@/config/colors';

const tabIcons: Record<string, keyof typeof Ionicons.glyphMap> = {
    index: 'home-outline',
    create: 'add-circle-outline',
    community: 'people-outline',
    profile: 'person-outline',
};

export default function TabsLayout() {
    const insets = useSafeAreaInsets();
    const colors = useColors();

    return (
        <Tabs
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarActiveTintColor: colors.accent,
                tabBarInactiveTintColor: colors.textSecondary,
                tabBarStyle: {
                    backgroundColor: colors.background,
                    borderTopColor: colors.border,
                    height: 58 + insets.bottom,
                    paddingBottom: insets.bottom,
                },
                tabBarLabelStyle: {
                    fontSize: 11,
                },
                tabBarIcon: ({ color, size }) => (
                    <Ionicons name={tabIcons[route.name] ?? 'ellipse-outline'} size={size} color={color} />
                ),
            })}
        >
            <Tabs.Screen name="index" options={{ title: 'Home' }} />
            <Tabs.Screen name="create" options={{ title: 'Create' }} />
            <Tabs.Screen name="community" options={{ title: 'Community' }} />
            <Tabs.Screen name="profile" options={{ title: 'Profile' }} />

            <Tabs.Screen name="dashboard" options={{ href: null }} />
            <Tabs.Screen name="discover" options={{ href: null }} />
            <Tabs.Screen name="wallet" options={{ href: null }} />
            <Tabs.Screen name="inbox" options={{ href: null }} />
            <Tabs.Screen name="draws" options={{ href: null }} />
        </Tabs>
    );
}
