import { Href, router } from 'expo-router';
import React from 'react';
import { Pressable, View } from 'react-native';

import Screen from '@/components/ui/Screen';
import AppText from '@/components/ui/AppText';
import { useColors } from '@/config/colors';
import { useAuth } from '@/context/AuthContext';

export default function ProfileTab() {
    const colors = useColors();
    const { isAuthenticated } = useAuth();

    return (
        <Screen className="pt-4">
            <View className="flex-1 justify-center rounded-2xl border p-5" style={{ borderColor: colors.border, backgroundColor: colors.backgroundAlt }}>
                <AppText className="text-2xl font-bold" color={colors.textPrimary}>Profile</AppText>
                <AppText className="mt-2 text-sm" color={colors.textSecondary}>
                    {isAuthenticated
                        ? 'You are logged in. Open profile workspace to manage your account.'
                        : 'You are browsing as guest. Login/signup to unlock creator and social features.'}
                </AppText>

                <Pressable
                    className="mt-5 rounded-xl px-4 py-3"
                    style={{ backgroundColor: colors.textPrimary }}
                    onPress={() => router.push('/profile' as Href)}
                >
                    <AppText className="text-center font-semibold" color={colors.background}>
                        {isAuthenticated ? 'Open Profile Workspace' : 'Go To Profile Login Area'}
                    </AppText>
                </Pressable>
            </View>
        </Screen>
    );
}
