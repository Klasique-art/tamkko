import { Href, router } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, View } from 'react-native';

import Screen from '@/components/ui/Screen';
import AppText from '@/components/ui/AppText';
import { useColors } from '@/config/colors';
import { useAuth } from '@/context/AuthContext';

export default function ProfileWorkspaceScreen() {
    const colors = useColors();
    const { isAuthenticated, user } = useAuth();

    if (!isAuthenticated) {
        return (
            <Screen className="pt-4">
                <View className="flex-1 justify-center rounded-2xl border p-5" style={{ borderColor: colors.border, backgroundColor: colors.backgroundAlt }}>
                    <AppText className="text-2xl font-bold" color={colors.textPrimary}>Join TAMKKO</AppText>
                    <AppText className="mt-2 text-sm" color={colors.textSecondary}>
                        You can browse videos without login. Sign in to follow creators, tip, join VIP rooms, and manage your profile.
                    </AppText>

                    <Pressable
                        className="mt-5 rounded-xl px-4 py-3"
                        style={{ backgroundColor: colors.textPrimary }}
                        onPress={() => router.push('/(auth)/login' as Href)}
                    >
                        <AppText className="text-center font-semibold" color={colors.background}>Login</AppText>
                    </Pressable>

                    <Pressable
                        className="mt-3 rounded-xl border px-4 py-3"
                        style={{ borderColor: colors.border }}
                        onPress={() => router.push('/(auth)/register' as Href)}
                    >
                        <AppText className="text-center font-semibold" color={colors.textPrimary}>Create Account</AppText>
                    </Pressable>
                </View>
            </Screen>
        );
    }

    return (
        <Screen className="pt-4">
            <ScrollView contentContainerStyle={{ paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
                <View className="rounded-2xl border p-5" style={{ borderColor: colors.border, backgroundColor: colors.backgroundAlt }}>
                    <AppText className="text-2xl font-bold" color={colors.textPrimary}>Profile</AppText>
                    <AppText className="mt-1 text-sm" color={colors.textSecondary}>
                        {user?.first_name} {user?.last_name} - {user?.email}
                    </AppText>
                </View>

                <View className="mt-4 gap-3">
                    {[ 
                        { label: 'Edit Profile', href: '/profile/edit' },
                        { label: 'Followers', href: '/profile/followers' },
                        { label: 'Following', href: '/profile/following' },
                    ].map((item) => (
                        <Pressable
                            key={item.label}
                            className="rounded-xl border px-4 py-3"
                            style={{ borderColor: colors.border, backgroundColor: colors.backgroundAlt }}
                            onPress={() => router.push(item.href as Href)}
                        >
                            <AppText className="font-semibold" color={colors.textPrimary}>{item.label}</AppText>
                        </Pressable>
                    ))}
                </View>
            </ScrollView>
        </Screen>
    );
}
