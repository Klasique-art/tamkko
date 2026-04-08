import React from 'react';
import { Pressable, ScrollView, View } from 'react-native';

import AppSwitch from '@/components/ui/AppSwitch';
import AppText from '@/components/ui/AppText';
import Screen from '@/components/ui/Screen';
import { useColors } from '@/config/colors';
import { Theme, useTheme } from '@/context/ThemeContext';
import { useToast } from '@/context/ToastContext';

export default function AppearanceSettingsScreen() {
    const colors = useColors();
    const { theme, setTheme } = useTheme();
    const { showToast } = useToast();
    const [reduceMotion, setReduceMotion] = React.useState(false);
    const [highContrast, setHighContrast] = React.useState(false);

    const setActiveTheme = (next: Theme) => {
        void setTheme(next);
        showToast(`Theme set to ${next}.`, { variant: 'success', duration: 1200 });
    };

    return (
        <Screen title="Appearance Settings" className="pt-3">
            <ScrollView contentContainerStyle={{ paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
                <View className="rounded-3xl border p-4" style={{ borderColor: colors.border, backgroundColor: colors.backgroundAlt }}>
                    <AppText className="text-lg font-black" color={colors.textPrimary}>Theme Mode</AppText>
                    <View className="mt-3 flex-row">
                        {(['light', 'dark'] as Theme[]).map((option) => {
                            const selected = theme === option;
                            return (
                                <Pressable
                                    key={option}
                                    onPress={() => setActiveTheme(option)}
                                    className="mr-2 rounded-full border px-4 py-2"
                                    style={{
                                        borderColor: selected ? colors.primary : colors.border,
                                        backgroundColor: selected ? colors.primary : colors.background,
                                    }}
                                    accessibilityRole="button"
                                    accessibilityState={{ selected }}
                                    accessibilityLabel={`Set ${option} theme`}
                                >
                                    <AppText className="text-sm font-semibold" color={selected ? colors.white : colors.textPrimary}>
                                        {option === 'light' ? 'Light' : 'Dark'}
                                    </AppText>
                                </Pressable>
                            );
                        })}
                    </View>
                </View>

                <View className="mt-4 rounded-3xl border p-4" style={{ borderColor: colors.border, backgroundColor: colors.backgroundAlt }}>
                    <AppText className="text-base font-bold" color={colors.textPrimary}>Accessibility Visuals</AppText>

                    <View className="mt-3 rounded-xl border px-3 py-3" style={{ borderColor: colors.border, backgroundColor: colors.background }}>
                        <View className="flex-row items-center justify-between">
                            <View className="pr-3">
                                <AppText className="text-sm font-semibold" color={colors.textPrimary}>Reduce motion</AppText>
                                <AppText className="mt-1 text-xs" color={colors.textSecondary}>
                                    Minimize decorative motion throughout the app.
                                </AppText>
                            </View>
                            <AppSwitch
                                value={reduceMotion}
                                onValueChange={setReduceMotion}
                                accessibilityRole="switch"
                                accessibilityState={{ checked: reduceMotion }}
                                accessibilityLabel="Reduce motion"
                            />
                        </View>
                    </View>

                    <View className="mt-3 rounded-xl border px-3 py-3" style={{ borderColor: colors.border, backgroundColor: colors.background }}>
                        <View className="flex-row items-center justify-between">
                            <View className="pr-3">
                                <AppText className="text-sm font-semibold" color={colors.textPrimary}>High contrast cards</AppText>
                                <AppText className="mt-1 text-xs" color={colors.textSecondary}>
                                    Increase card contrast in list-heavy screens.
                                </AppText>
                            </View>
                            <AppSwitch
                                value={highContrast}
                                onValueChange={setHighContrast}
                                accessibilityRole="switch"
                                accessibilityState={{ checked: highContrast }}
                                accessibilityLabel="High contrast mode"
                            />
                        </View>
                    </View>
                </View>
            </ScrollView>
        </Screen>
    );
}
