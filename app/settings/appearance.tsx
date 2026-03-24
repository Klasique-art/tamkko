import React from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { AppSwitch, Nav, Screen } from '@/components';
import { useColors } from '@/config';
import { useTheme } from '@/context/ThemeContext';

import AppText from '@/components/ui/AppText';
export default function AppearanceScreen() {
    const colors = useColors();
    const { t } = useTranslation();
    const { theme, setTheme } = useTheme();
    const isDarkMode = theme === 'dark';

    return (
        <Screen>
            <Nav title="Appearance" />
            <View className="pt-4">
                <AppText
                    className="text-base mb-4 px-2"
                    style={{ color: colors.textSecondary }}
                >
                    Choose your preferred theme appearance.
                </AppText>

                <View
                    className="rounded-xl border p-4"
                    style={{
                        backgroundColor: colors.backgroundAlt,
                        borderColor: colors.border
                    }}
                >
                    <View className="flex-row items-center justify-between">
                        <View className="flex-1 mr-4">
                            <AppText
                                className="font-medium text-base"
                                style={{ color: colors.textPrimary }}
                            >
                                Dark Mode
                            </AppText>
                            <AppText
                                className="text-xs mt-1"
                                style={{ color: colors.textSecondary }}
                            >
                                Turn on dark mode for lower-light viewing.
                            </AppText>
                        </View>

                        <AppSwitch
                            value={isDarkMode}
                            onValueChange={(enabled) => setTheme(enabled ? 'dark' : 'light')}
                            activeTrackColor={colors.accent50}
                            activeThumbColor={colors.accent}
                            inactiveThumbColor={colors.textSecondary}
                            accessibilityLabel={t('Dark mode toggle')}
                            accessibilityRole="switch"
                            accessibilityState={{ checked: isDarkMode }}
                        />
                    </View>
                </View>
            </View>
        </Screen>
    );
}
