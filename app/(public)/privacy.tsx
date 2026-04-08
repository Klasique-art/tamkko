import React from 'react';
import { Pressable, ScrollView, View } from 'react-native';

import AppText from '@/components/ui/AppText';
import Screen from '@/components/ui/Screen';
import { useColors } from '@/config/colors';
import { useToast } from '@/context/ToastContext';

const PRIVACY_SECTIONS = [
    {
        title: 'Data We Collect',
        body: 'Account identifiers, profile info, content metadata, and transaction events required for app functionality and security.',
    },
    {
        title: 'How We Use Data',
        body: 'To personalize feeds, process subscriptions and payouts, prevent fraud, and send service notifications.',
    },
    {
        title: 'Retention & Security',
        body: 'Security logs and payment records are retained according to legal and operational requirements with role-based access controls.',
    },
    {
        title: 'Your Controls',
        body: 'You can update profile settings, manage notifications, and request account deactivation or deletion.',
    },
];

export default function PrivacyScreen() {
    const colors = useColors();
    const { showToast } = useToast();

    return (
        <Screen title="Privacy Policy" className="pt-3">
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
                <View className="rounded-3xl border p-4" style={{ borderColor: colors.border, backgroundColor: colors.backgroundAlt }}>
                    <AppText className="text-lg font-black" color={colors.textPrimary}>Privacy Policy</AppText>
                    <AppText className="mt-1 text-sm" color={colors.textSecondary}>
                        Effective date: April 8, 2026
                    </AppText>
                </View>

                <View className="mt-4 gap-3">
                    {PRIVACY_SECTIONS.map((section) => (
                        <View
                            key={section.title}
                            className="rounded-2xl border p-4"
                            style={{ borderColor: colors.border, backgroundColor: colors.backgroundAlt }}
                        >
                            <AppText className="text-sm font-bold" color={colors.textPrimary}>{section.title}</AppText>
                            <AppText className="mt-1 text-sm leading-6" color={colors.textSecondary}>{section.body}</AppText>
                        </View>
                    ))}
                </View>

                <Pressable
                    onPress={() => showToast('Data export request submitted (simulated).', { variant: 'success', duration: 1700 })}
                    className="mt-4 rounded-xl border py-3"
                    style={{ borderColor: colors.border, backgroundColor: colors.backgroundAlt }}
                    accessibilityRole="button"
                    accessibilityLabel="Request data export"
                >
                    <AppText className="text-center text-sm font-semibold" color={colors.textPrimary}>
                        Request Data Export
                    </AppText>
                </Pressable>
            </ScrollView>
        </Screen>
    );
}
