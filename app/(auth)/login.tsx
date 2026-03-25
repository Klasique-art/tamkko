import { Href, router } from 'expo-router';
import React from 'react';
import { Pressable, View } from 'react-native';

import Screen from '@/components/ui/Screen';
import AppText from '@/components/ui/AppText';
import { useColors } from '@/config/colors';
import { useAuth } from '@/context/AuthContext';

export default function LoginScreen() {
    const colors = useColors();
    const { login, isLoading } = useAuth();

    const handleMockLogin = async () => {
        await login({ email: 'fan.viewer@tamkko.app', password: 'mock_password' });
        router.replace('/profile' as Href);
    };

    return (
        <Screen className="pt-4">
            <View className="flex-1 justify-center rounded-2xl border p-5" style={{ borderColor: colors.border, backgroundColor: colors.backgroundAlt }}>
                <AppText className="text-2xl font-bold" color={colors.textPrimary}>Login</AppText>
                <AppText className="mt-2 text-sm" color={colors.textSecondary}>
                    Simulation mode: this signs you in locally without backend.
                </AppText>

                <Pressable
                    className="mt-5 rounded-xl px-4 py-3"
                    style={{ backgroundColor: colors.textPrimary }}
                    onPress={handleMockLogin}
                    disabled={isLoading}
                >
                    <AppText className="text-center font-semibold" color={colors.background}>Login (Mock)</AppText>
                </Pressable>

                <Pressable
                    className="mt-3 rounded-xl border px-4 py-3"
                    style={{ borderColor: colors.border }}
                    onPress={() => router.push('/(auth)/register' as Href)}
                >
                    <AppText className="text-center font-semibold" color={colors.textPrimary}>Go To Register</AppText>
                </Pressable>
            </View>
        </Screen>
    );
}
