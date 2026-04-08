import React from 'react';
import { ScrollView, View } from 'react-native';

import AppText from '@/components/ui/AppText';
import Screen from '@/components/ui/Screen';
import { useColors } from '@/config/colors';

type AuthShellProps = {
    title: string;
    subtitle: string;
    children: React.ReactNode;
    footer?: React.ReactNode;
};

export default function AuthShell({ title, subtitle, children, footer }: AuthShellProps) {
    const colors = useColors();

    return (
        <Screen>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 56 }}>
                <View
                    className="rounded-3xl border p-5"
                    style={{ borderColor: colors.border, backgroundColor: colors.backgroundAlt }}
                >
                    <AppText className="text-2xl font-bold" color={colors.textPrimary}>
                        {title}
                    </AppText>
                    <AppText className="mt-2 text-sm leading-6" color={colors.textSecondary}>
                        {subtitle}
                    </AppText>

                    <View className="mt-6">{children}</View>
                </View>

                {footer ? <View className="mt-4">{footer}</View> : null}
            </ScrollView>
        </Screen>
    );
}
