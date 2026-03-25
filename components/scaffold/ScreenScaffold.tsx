import { router } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, View } from 'react-native';

import Screen from '@/components/ui/Screen';
import AppText from '@/components/ui/AppText';
import { useColors } from '@/config/colors';

export type ScaffoldAction = {
    label: string;
    href?: string;
    onPress?: () => void;
};

type ScreenScaffoldProps = {
    title: string;
    subtitle: string;
    actions?: ScaffoldAction[];
};

export default function ScreenScaffold({ title, subtitle, actions = [] }: ScreenScaffoldProps) {
    const colors = useColors();

    return (
        <Screen className="pt-4">
            <ScrollView contentContainerStyle={{ paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
                <View
                    className="rounded-2xl border p-5"
                    style={{ borderColor: colors.border, backgroundColor: colors.backgroundAlt }}
                >
                    <AppText className="text-2xl font-bold" color={colors.textPrimary}>{title}</AppText>
                    <AppText className="mt-2 text-sm" color={colors.textSecondary}>{subtitle}</AppText>
                </View>

                {actions.length > 0 ? (
                    <View className="mt-4 gap-3">
                        {actions.map((action) => (
                            <Pressable
                                key={action.label}
                                onPress={() => {
                                    if (action.onPress) {
                                        action.onPress();
                                        return;
                                    }
                                    if (action.href) {
                                        router.push(action.href as any);
                                    }
                                }}
                                className="rounded-xl border px-4 py-3"
                                style={{ borderColor: colors.border, backgroundColor: colors.background }}
                            >
                                <AppText className="font-semibold" color={colors.textPrimary}>{action.label}</AppText>
                            </Pressable>
                        ))}
                    </View>
                ) : null}
            </ScrollView>
        </Screen>
    );
}
