import { Href, router } from 'expo-router';
import React from 'react';
import { Pressable, View } from 'react-native';

import Screen from '@/components/ui/Screen';
import AppText from '@/components/ui/AppText';
import { useColors } from '@/config/colors';
import { useAuth } from '@/context/AuthContext';

export default function RegisterScreen() {
    const colors = useColors();
    const { signup } = useAuth();

    const handleMockRegister = async () => {
        await signup({
            email: 'new.user@tamkko.app',
            password: 'MockPassword1!',
            re_password: 'MockPassword1!',
            first_name: 'New',
            last_name: 'User',
            phone: '+233200000000',
            date_of_birth: '2000-01-01',
            agree_to_terms: true,
        });

        router.replace('/(auth)/verify-email' as Href);
    };

    return (
        <Screen className="pt-4">
            <View className="flex-1 justify-center rounded-2xl border p-5" style={{ borderColor: colors.border, backgroundColor: colors.backgroundAlt }}>
                <AppText className="text-2xl font-bold" color={colors.textPrimary}>Register</AppText>
                <AppText className="mt-2 text-sm" color={colors.textSecondary}>
                    Simulation mode: creates a local pending user and proceeds to OTP step.
                </AppText>

                <Pressable
                    className="mt-5 rounded-xl px-4 py-3"
                    style={{ backgroundColor: colors.textPrimary }}
                    onPress={handleMockRegister}
                >
                    <AppText className="text-center font-semibold" color={colors.background}>Register (Mock)</AppText>
                </Pressable>

                <Pressable
                    className="mt-3 rounded-xl border px-4 py-3"
                    style={{ borderColor: colors.border }}
                    onPress={() => router.push('/(auth)/login' as Href)}
                >
                    <AppText className="text-center font-semibold" color={colors.textPrimary}>Back To Login</AppText>
                </Pressable>
            </View>
        </Screen>
    );
}
