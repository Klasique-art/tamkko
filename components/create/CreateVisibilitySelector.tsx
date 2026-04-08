import React from 'react';
import { Pressable, View } from 'react-native';

import AppText from '@/components/ui/AppText';
import { useColors } from '@/config/colors';
import { createVisibilityOptions } from '@/data/mock';
import { CreateVisibility } from '@/types/create.types';

type CreateVisibilitySelectorProps = {
    value: CreateVisibility;
    onChange: (value: CreateVisibility) => void;
};

export default function CreateVisibilitySelector({ value, onChange }: CreateVisibilitySelectorProps) {
    const colors = useColors();

    return (
        <View>
            <AppText className="text-sm font-semibold" color={colors.textPrimary}>
                Who can see this post
            </AppText>
            <View className="mt-3 gap-2">
                {createVisibilityOptions.map((option) => {
                    const active = option.value === value;
                    return (
                        <Pressable
                            key={option.value}
                            className="rounded-xl border px-4 py-3"
                            style={{
                                borderColor: active ? colors.textPrimary : colors.border,
                                backgroundColor: active ? colors.background : colors.backgroundAlt,
                            }}
                            onPress={() => onChange(option.value)}
                            accessibilityRole="radio"
                            accessibilityState={{ selected: active }}
                            accessibilityLabel={option.label}
                            accessibilityHint={option.description}
                        >
                            <AppText className="text-sm font-semibold" color={colors.textPrimary}>
                                {option.label}
                            </AppText>
                            <AppText className="mt-1 text-xs" color={colors.textSecondary}>
                                {option.description}
                            </AppText>
                        </Pressable>
                    );
                })}
            </View>
        </View>
    );
}
