import React from 'react';
import { ScrollView, View } from 'react-native';

import AppText from '@/components/ui/AppText';
import Screen from '@/components/ui/Screen';
import { useColors } from '@/config/colors';

const SECTIONS = [
    {
        title: '1. Platform Use',
        body: 'You agree to use Tamkko lawfully, respect creators, and avoid abuse, fraud, or impersonation.',
    },
    {
        title: '2. Payments & Subscriptions',
        body: 'Subscriptions unlock premium content for the active billing period. Wallet and payout events are tracked with settlement records.',
    },
    {
        title: '3. Content Responsibility',
        body: 'Creators are responsible for uploaded media and rights. We may remove content that violates policy or local regulations.',
    },
    {
        title: '4. Enforcement',
        body: 'Accounts may be restricted or suspended for repeated violations, fraud attempts, or harmful behavior.',
    },
    {
        title: '5. Changes',
        body: 'Terms may evolve as features expand. Material changes are announced in-app through notifications.',
    },
];

export default function TermsScreen() {
    const colors = useColors();

    return (
        <Screen title="Terms and Conditions" className="pt-3">
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
                <View className="rounded-3xl border p-4" style={{ borderColor: colors.border, backgroundColor: colors.backgroundAlt }}>
                    <AppText className="text-lg font-black" color={colors.textPrimary}>Tamkko Terms</AppText>
                    <AppText className="mt-1 text-sm" color={colors.textSecondary}>
                        Effective date: April 8, 2026
                    </AppText>
                </View>

                <View className="mt-4 gap-3">
                    {SECTIONS.map((section) => (
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
            </ScrollView>
        </Screen>
    );
}
