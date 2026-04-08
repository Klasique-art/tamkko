import { Ionicons } from '@expo/vector-icons';
import { Href, router } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, View } from 'react-native';

import AppText from '@/components/ui/AppText';
import Screen from '@/components/ui/Screen';
import { useColors } from '@/config/colors';

const ACTIONS: { label: string; subtitle: string; href: Href; icon: keyof typeof Ionicons.glyphMap }[] = [
    { label: 'Onboarding', subtitle: 'Learn the core Tamkko flow in under 2 minutes.', href: '/onboarding', icon: 'sparkles-outline' },
    { label: 'Login', subtitle: 'Return to your account and creator workspace.', href: '/(auth)/login', icon: 'log-in-outline' },
    { label: 'Register', subtitle: 'Create a new account to follow and subscribe.', href: '/(auth)/register', icon: 'person-add-outline' },
    { label: 'Privacy', subtitle: 'Review how data and payments are handled.', href: '/(public)/privacy', icon: 'shield-checkmark-outline' },
];

export default function WelcomeScreen() {
    const colors = useColors();

    return (
        <Screen title="Welcome" className="pt-3">
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
                <View className="rounded-3xl border p-5" style={{ borderColor: colors.border, backgroundColor: colors.primary }}>
                    <AppText className="text-2xl font-black" color={colors.white}>Welcome To Tamkko</AppText>
                    <AppText className="mt-2 text-sm leading-6" color="rgba(255,255,255,0.92)">
                        Explore creators, premium videos, rooms, and monetization tools.
                    </AppText>
                </View>

                <View className="mt-4 gap-3">
                    {ACTIONS.map((action) => (
                        <Pressable
                            key={action.label}
                            onPress={() => router.push(action.href)}
                            className="rounded-2xl border p-4"
                            style={{ borderColor: colors.border, backgroundColor: colors.backgroundAlt }}
                            accessibilityRole="button"
                            accessibilityLabel={`Open ${action.label}`}
                            accessibilityHint={action.subtitle}
                        >
                            <View className="flex-row items-center justify-between">
                                <View className="flex-row items-center">
                                    <View
                                        className="mr-3 h-9 w-9 items-center justify-center rounded-full"
                                        style={{ backgroundColor: colors.background }}
                                    >
                                        <Ionicons name={action.icon} size={18} color={colors.textPrimary} />
                                    </View>
                                    <View>
                                        <AppText className="text-base font-semibold" color={colors.textPrimary}>{action.label}</AppText>
                                        <AppText className="text-xs" color={colors.textSecondary}>{action.subtitle}</AppText>
                                    </View>
                                </View>
                                <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
                            </View>
                        </Pressable>
                    ))}
                </View>
            </ScrollView>
        </Screen>
    );
}
