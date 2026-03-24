import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ScrollView, View } from 'react-native';

import { Nav, Screen } from '@/components';
import AppText from '@/components/ui/AppText';
import { useColors } from '@/config';

const AboutScreen = () => {
    const colors = useColors();

    const highlights = [
        {
            id: 'monthly-cycle',
            icon: 'calendar-outline' as const,
            title: 'Monthly Cycle',
            body: 'Each month runs as an independent cycle for active participants.',
        },
        {
            id: 'fixed-participation',
            icon: 'cash-outline' as const,
            title: 'Fixed Participation',
            body: 'Members participate by making a fixed monthly contribution of $20.',
        },
        {
            id: 'automated-selection',
            icon: 'shuffle-outline' as const,
            title: 'Automated Selection',
            body: 'Eligible members are selected randomly through a system-driven process.',
        },
        {
            id: 'transparent-results',
            icon: 'shield-checkmark-outline' as const,
            title: 'Transparent Results',
            body: 'Draw and payout outcomes are tracked with clear statuses and monthly summaries.',
        },
    ];

    return (
        <Screen>
            <Nav title="About App" />
            <ScrollView className="pt-4" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 48 }}>
                <View
                    className="rounded-xl border p-4 mb-4"
                    style={{ backgroundColor: colors.backgroundAlt, borderColor: colors.border }}
                >
                    <AppText className="text-lg font-bold mb-2" style={{ color: colors.textPrimary }}>
                        The Fourth Book
                    </AppText>
                    <AppText className="text-sm leading-6" style={{ color: colors.textSecondary }}>
                        The Fourth Book is a monthly participation-based platform designed for diaspora communities to
                        contribute together, build a shared pool, and support financial impact through structured monthly cycles.
                    </AppText>
                </View>

                <View className="mb-4 px-1">
                    <AppText className="text-base font-bold mb-2" style={{ color: colors.textPrimary }}>
                        How It Works
                    </AppText>
                    <AppText className="text-sm leading-6" style={{ color: colors.textSecondary }}>
                        Members who successfully pay for the current month become eligible for that month&apos;s draw.
                        At cycle end, eligible participants are randomly selected and the monthly pool is distributed equally
                        among selected beneficiaries.
                    </AppText>
                </View>

                <View
                    className="rounded-xl border overflow-hidden mb-4"
                    style={{ backgroundColor: colors.backgroundAlt, borderColor: colors.border }}
                >
                    {highlights.map((item, index) => (
                        <View
                            key={item.id}
                            className={`p-4 flex-row ${index !== highlights.length - 1 ? 'border-b' : ''}`}
                            style={{ borderColor: colors.border }}
                        >
                            <View
                                className="w-9 h-9 rounded-full items-center justify-center mr-3"
                                style={{ backgroundColor: `${colors.accent}20` }}
                            >
                                <Ionicons name={item.icon} size={18} color={colors.accent} />
                            </View>
                            <View className="flex-1">
                                <AppText className="text-sm font-bold mb-1" style={{ color: colors.textPrimary }}>
                                    {item.title}
                                </AppText>
                                <AppText className="text-sm" style={{ color: colors.textSecondary }}>
                                    {item.body}
                                </AppText>
                            </View>
                        </View>
                    ))}
                </View>

                <View
                    className="rounded-xl border p-4"
                    style={{ backgroundColor: colors.backgroundAlt, borderColor: colors.border }}
                >
                    <AppText className="text-base font-bold mb-2" style={{ color: colors.textPrimary }}>
                        Trust and Transparency
                    </AppText>
                    <AppText className="text-sm leading-6" style={{ color: colors.textSecondary }}>
                        The product direction emphasizes fairness, clear monthly summaries, anonymized result visibility,
                        and auditable draw outcomes so members can track participation and payout progress with confidence.
                    </AppText>
                </View>
            </ScrollView>
        </Screen>
    );
};

export default AboutScreen;
