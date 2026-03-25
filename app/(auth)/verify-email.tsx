import { Href, router } from 'expo-router';
import React from 'react';
import { Pressable, View } from 'react-native';

import Screen from '@/components/ui/Screen';
import AppText from '@/components/ui/AppText';
import { useColors } from '@/config/colors';
import { useAuth } from '@/context/AuthContext';

export default function VerifyEmailScreen() {
    const colors = useColors();
    const { verifySignupCode } = useAuth();

    const handleVerify = async () => {
        await verifySignupCode('new.user@tamkko.app', '123456');
        router.replace('/profile' as Href);
    };

    return (
        <Screen className="pt-4">
            <View className="flex-1 justify-center rounded-2xl border p-5" style={{ borderColor: colors.border, backgroundColor: colors.backgroundAlt }}>
                <AppText className="text-2xl font-bold" color={colors.textPrimary}>Verify Email</AppText>
                <AppText className="mt-2 text-sm" color={colors.textSecondary}>
                    Simulation mode: OTP 123456 confirms registration locally.
                </AppText>

                <Pressable
                    className="mt-5 rounded-xl px-4 py-3"
                    style={{ backgroundColor: colors.textPrimary }}
                    onPress={handleVerify}
                >
                    <AppText className="text-center font-semibold" color={colors.background}>Verify OTP (Mock)</AppText>
                </Pressable>
            </View>
        </Screen>
    );
}
