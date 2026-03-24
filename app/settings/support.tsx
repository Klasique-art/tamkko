import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Linking, Pressable, ScrollView, View } from 'react-native';

import { Nav, Screen } from '@/components';
import AppText from '@/components/ui/AppText';
import { useColors } from '@/config';
import { useToast } from '@/context/ToastContext';

const SUPPORT_EMAIL = 'support@thefourthbook.com';

const FAQS = [
    {
        id: 'faq-1',
        question: 'How do monthly contributions work?',
        answer: 'Contributions are collected monthly and used to build the draw pool for beneficiary selection.',
    },
    {
        id: 'faq-2',
        question: 'When are beneficiaries selected?',
        answer: 'Selection happens at the end of each cycle. Dates may vary slightly based on processing windows.',
    },
    {
        id: 'faq-3',
        question: 'How can I verify my participation status?',
        answer: 'Open your dashboard to review your current contribution status and draw entry details.',
    },
    {
        id: 'faq-4',
        question: 'What should I do if a payment fails?',
        answer: 'Check your payment method and retry. If it persists, contact support with your account email.',
    },
];

const SupportScreen = () => {
    const colors = useColors();
    const { showToast } = useToast();
    const { t } = useTranslation();
    const [openFaqIds, setOpenFaqIds] = useState<string[]>([FAQS[0].id]);

    const toggleFaq = (id: string) => {
        setOpenFaqIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
    };

    const handleContactPress = async () => {
        const subject = encodeURIComponent('Support Request - The Fourth Book');
        const body = encodeURIComponent('Hi Support Team,%0D%0A%0D%0AI need help with:%0D%0A');
        const mailto = `mailto:${SUPPORT_EMAIL}?subject=${subject}&body=${body}`;

        try {
            const canOpen = await Linking.canOpenURL(mailto);
            if (!canOpen) {
                showToast('No email app is available on this device.', { variant: 'error' });
                return;
            }

            await Linking.openURL(mailto);
        } catch (error) {
            console.log('Failed to open email client:', error);
            showToast('Unable to open your email app right now.', { variant: 'error' });
        }
    };

    return (
        <Screen>
            <Nav title="Help & Support" />
            <ScrollView className="pt-4" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 48 }}>
                <View className="mb-4 px-1">
                    <AppText className="text-lg font-bold mb-1" style={{ color: colors.textPrimary }}>
                        Frequently Asked Questions
                    </AppText>
                    <AppText className="text-sm" style={{ color: colors.textSecondary }}>
                        Find quick answers to common questions.
                    </AppText>
                </View>

                <View
                    className="mb-6 rounded-xl border overflow-hidden"
                    style={{ backgroundColor: colors.backgroundAlt, borderColor: colors.border }}
                >
                    {FAQS.map((item, index) => {
                        const isOpen = openFaqIds.includes(item.id);
                        return (
                            <View
                                key={item.id}
                                className={index !== FAQS.length - 1 ? 'border-b' : ''}
                                style={{ borderColor: colors.border }}
                            >
                                <Pressable
                                    onPress={() => toggleFaq(item.id)}
                                    className="flex-row items-center justify-between p-4"
                                    accessibilityRole="button"
                                    accessibilityState={{ expanded: isOpen }}
                                    accessibilityLabel={t(item.question)}
                                >
                                    <AppText className="flex-1 pr-3 text-base font-medium" style={{ color: colors.textPrimary }}>
                                        {item.question}
                                    </AppText>
                                    <Ionicons
                                        name={isOpen ? 'chevron-up' : 'chevron-down'}
                                        size={18}
                                        color={colors.textSecondary}
                                    />
                                </Pressable>

                                {isOpen && (
                                    <View className="px-4 pb-4">
                                        <AppText className="text-sm" style={{ color: colors.textSecondary }}>
                                            {item.answer}
                                        </AppText>
                                    </View>
                                )}
                            </View>
                        );
                    })}
                </View>

                <View
                    className="rounded-xl border p-4"
                    style={{ backgroundColor: colors.backgroundAlt, borderColor: colors.border }}
                >
                    <AppText className="text-base font-bold mb-1" style={{ color: colors.textPrimary }}>
                        Need more help?
                    </AppText>
                    <AppText className="text-sm mb-4" style={{ color: colors.textSecondary }}>
                        Reach out and we will get back to you as soon as possible.
                    </AppText>

                    <Pressable
                        onPress={handleContactPress}
                        className="flex-row items-center justify-center rounded-xl py-3 px-4"
                        style={{ backgroundColor: colors.accent }}
                        accessibilityRole="button"
                        accessibilityLabel={t('Contact support via email at {{email}}', { email: SUPPORT_EMAIL })}
                    >
                        <Ionicons name="mail-outline" size={18} color={colors.white} />
                        <AppText className="ml-2 text-sm font-bold" style={{ color: colors.white }}>
                            Contact via Email
                        </AppText>
                    </Pressable>
                </View>
            </ScrollView>
        </Screen>
    );
};

export default SupportScreen;
