import { Href, router } from 'expo-router';
import React from 'react';
import { Pressable, View } from 'react-native';

import AppText from '@/components/ui/AppText';
import { useColors } from '@/config/colors';

type AuthLinkRowProps = {
    prompt: string;
    actionLabel: string;
    href: Href;
};

export default function AuthLinkRow({ prompt, actionLabel, href }: AuthLinkRowProps) {
    const colors = useColors();

    return (
        <View className="mt-4 flex-row items-center justify-center">
            <AppText className="text-sm" color={colors.textSecondary}>
                {prompt}
            </AppText>
            <Pressable
                className="ml-1 px-1 py-1"
                onPress={() => router.push(href)}
                accessibilityRole="button"
                accessibilityLabel={actionLabel}
            >
                <AppText className="text-sm font-semibold" color={colors.textPrimary}>
                    {actionLabel}
                </AppText>
            </Pressable>
        </View>
    );
}
