import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { View } from 'react-native';

import { useColors } from '@/config/colors';

import AppText from './AppText';

type EmptyStateProps = {
    title: string;
    description?: string;
    iconName?: React.ComponentProps<typeof Ionicons>['name'];
};

export default function EmptyState({
    title,
    description,
    iconName = 'search-outline',
}: EmptyStateProps) {
    const colors = useColors();

    return (
        <View
            className="items-center rounded-xl border px-4 py-6"
            style={{ borderColor: colors.border, backgroundColor: colors.backgroundAlt }}
        >
            <View
                className="h-12 w-12 items-center justify-center rounded-full"
                style={{ backgroundColor: `${colors.info}18` }}
            >
                <Ionicons name={iconName} size={22} color={colors.info} />
            </View>
            <AppText className="mt-3 text-base font-bold" color={colors.textPrimary}>
                {title}
            </AppText>
            {description ? (
                <AppText className="mt-1 text-center text-sm" color={colors.textSecondary}>
                    {description}
                </AppText>
            ) : null}
        </View>
    );
}
