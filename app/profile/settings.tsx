import { Ionicons } from '@expo/vector-icons';
import { Href, router } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, View } from 'react-native';

import Screen from '@/components/ui/Screen';
import ConfirmModal from '@/components/ui/ConfirmModal';
import AppText from '@/components/ui/AppText';
import { useColors } from '@/config/colors';
import { useAuth } from '@/context/AuthContext';

const settingItems: { label: string; subtitle: string; href: Href }[] = [
    {
        label: 'Account Settings',
        subtitle: 'Account-level preferences and controls.',
        href: '/profile/account-settings' as Href,
    },
    {
        label: 'Appearance Settings',
        subtitle: 'Theme mode and visual preferences.',
        href: '/profile/appearance' as Href,
    },
    {
        label: 'Security',
        subtitle: 'Password and account protection controls.',
        href: '/profile/security' as Href,
    },
    {
        label: 'Active Sessions',
        subtitle: 'View devices and revoke active sessions.',
        href: '/profile/sessions' as Href,
    },
    {
        label: 'Two-Factor Authentication',
        subtitle: 'Manage authenticator and backup codes.',
        href: '/profile/two-factor' as Href,
    },
];

export default function ProfileSettingsScreen() {
    const colors = useColors();
    const { logout } = useAuth();
    const [logoutConfirmVisible, setLogoutConfirmVisible] = React.useState(false);

    const handleLogoutConfirmed = async () => {
        setLogoutConfirmVisible(false);
        await logout();
        router.replace('/(auth)/login' as Href);
    };

    return (
        <Screen className="pt-4" title="Settings">
            <ScrollView contentContainerStyle={{ paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
                <View className="gap-3">
                    {settingItems.map((item) => (
                        <Pressable
                            key={item.label}
                            className="rounded-2xl border p-4"
                            style={{ borderColor: colors.border, backgroundColor: colors.backgroundAlt }}
                            onPress={() => router.push(item.href)}
                            accessibilityRole="button"
                            accessibilityLabel={item.label}
                            accessibilityHint={item.subtitle}
                        >
                            <View className="flex-row items-center justify-between">
                                <AppText className="text-base font-semibold" color={colors.textPrimary}>
                                    {item.label}
                                </AppText>
                                <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
                            </View>
                            <AppText className="mt-1 text-xs leading-5" color={colors.textSecondary}>
                                {item.subtitle}
                            </AppText>
                        </Pressable>
                    ))}
                </View>

                <Pressable
                    className="mt-5 rounded-xl border px-4 py-3"
                    style={{ borderColor: colors.error, backgroundColor: colors.backgroundAlt }}
                    onPress={() => setLogoutConfirmVisible(true)}
                    accessibilityRole="button"
                    accessibilityLabel="Log out"
                    accessibilityHint="Signs you out of this device"
                >
                    <AppText className="text-center text-sm font-semibold" color={colors.error}>
                        Log Out
                    </AppText>
                </Pressable>

                <ConfirmModal
                    visible={logoutConfirmVisible}
                    onClose={() => setLogoutConfirmVisible(false)}
                    onConfirm={handleLogoutConfirmed}
                    title="Log Out"
                    description="Are you sure you want to log out of this device?"
                    confirmText="Yes, Log Out"
                    isDestructive
                />
            </ScrollView>
        </Screen>
    );
}
