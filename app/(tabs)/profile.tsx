import { Ionicons } from '@expo/vector-icons';
import { Href, router } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, View } from 'react-native';

import AppButton from '@/components/ui/AppButton';
import ConfirmModal from '@/components/ui/ConfirmModal';
import AppText from '@/components/ui/AppText';
import Screen from '@/components/ui/Screen';
import { useColors } from '@/config/colors';
import { useAuth } from '@/context/AuthContext';

const guestBenefits = [
    'Follow your favorite creators',
    'Save videos and manage preferences',
    'Tip creators and track your support',
];

const guestQuickActions = [
    { title: 'Privacy & Safety', subtitle: 'How we protect your account and data.' },
    { title: 'Help Center', subtitle: 'Get support and common answers quickly.' },
    { title: 'Community Guidelines', subtitle: 'Rules for respectful content and interactions.' },
];

export default function ProfileTab() {
    const colors = useColors();
    const { isAuthenticated, user, logout } = useAuth();
    const [logoutConfirmVisible, setLogoutConfirmVisible] = React.useState(false);

    const openLogin = () => {
        router.push('/(auth)/login' as Href);
    };

    const openRegister = () => {
        router.push('/(auth)/register' as Href);
    };

    const openProfileWorkspace = () => {
        router.push('/profile' as Href);
    };

    const openSettings = () => {
        router.push('/profile/settings' as Href);
    };

    const handleLogoutConfirmed = async () => {
        setLogoutConfirmVisible(false);
        await logout();
    };

    if (!isAuthenticated) {
        return (
            <Screen className="pt-4">
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
                    <View
                        className="rounded-3xl border p-6"
                        style={{
                            borderColor: colors.border,
                            backgroundColor: colors.backgroundAlt,
                        }}
                    >
                        <View className="h-16 w-16 items-center justify-center rounded-full" style={{ backgroundColor: colors.textPrimary }}>
                            <Ionicons name="person" size={30} color={colors.background} />
                        </View>

                        <AppText className="mt-4 text-2xl font-bold" color={colors.textPrimary}>
                            Build Your Profile
                        </AppText>
                        <AppText className="mt-2 text-sm leading-6" color={colors.textSecondary}>
                            You can watch videos as a guest. Log in when you are ready to personalize your profile and unlock social features.
                        </AppText>

                        <View className="mt-5 gap-3">
                            {guestBenefits.map((benefit) => (
                                <View key={benefit} className="flex-row items-start">
                                    <View className="mr-3 mt-1 h-5 w-5 items-center justify-center rounded-full" style={{ backgroundColor: colors.textPrimary }}>
                                        <Ionicons name="checkmark" size={12} color={colors.background} />
                                    </View>
                                    <AppText className="flex-1 text-sm" color={colors.textPrimary}>
                                        {benefit}
                                    </AppText>
                                </View>
                            ))}
                        </View>

                        <AppButton
                            title="Log In"
                            onClick={openLogin}
                            style={{ marginTop: 20 }}
                            accessibilityLabel="Log in to your account"
                            accessibilityHint="Opens the login screen"
                        />

                        <Pressable
                            onPress={openRegister}
                            className="mt-3 rounded-xl border px-4 py-3"
                            style={{ borderColor: colors.border }}
                            accessibilityRole="button"
                            accessibilityLabel="Create an account"
                            accessibilityHint="Opens registration screen"
                        >
                            <AppText className="text-center text-sm font-semibold" color={colors.textPrimary}>
                                Create Account
                            </AppText>
                        </Pressable>
                    </View>

                    <View className="mt-5 gap-3">
                        {guestQuickActions.map((item) => (
                            <Pressable
                                key={item.title}
                                className="rounded-2xl border p-4"
                                style={{ borderColor: colors.border, backgroundColor: colors.backgroundAlt }}
                                accessibilityRole="button"
                                accessibilityLabel={`${item.title}. ${item.subtitle}`}
                                accessibilityHint="This section will be interactive in a later update"
                            >
                                <View className="flex-row items-center justify-between">
                                    <AppText className="text-base font-semibold" color={colors.textPrimary}>
                                        {item.title}
                                    </AppText>
                                    <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
                                </View>
                                <AppText className="mt-1 text-xs leading-5" color={colors.textSecondary}>
                                    {item.subtitle}
                                </AppText>
                            </Pressable>
                        ))}
                    </View>
                </ScrollView>
            </Screen>
        );
    }

    return (
        <Screen className="pt-4">
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
                <View
                    className="rounded-3xl border p-6"
                    style={{
                        borderColor: colors.border,
                        backgroundColor: colors.backgroundAlt,
                    }}
                >
                    <View className="h-16 w-16 items-center justify-center rounded-full" style={{ backgroundColor: colors.textPrimary }}>
                        <Ionicons name="person" size={30} color={colors.background} />
                    </View>

                    <AppText className="mt-4 text-xl font-bold" color={colors.textPrimary}>
                        {user?.first_name} {user?.last_name}
                    </AppText>
                    <AppText className="mt-1 text-sm" color={colors.textSecondary}>
                        {user?.email}
                    </AppText>
                </View>

                <View className="mt-5 gap-3">
                    <Pressable
                        onPress={openProfileWorkspace}
                        className="rounded-2xl border p-4"
                        style={{ borderColor: colors.border, backgroundColor: colors.backgroundAlt }}
                        accessibilityRole="button"
                        accessibilityLabel="Open profile workspace"
                        accessibilityHint="Manage profile details, followers, and following"
                    >
                        <View className="flex-row items-center justify-between">
                            <AppText className="text-base font-semibold" color={colors.textPrimary}>
                                Profile Workspace
                            </AppText>
                            <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
                        </View>
                        <AppText className="mt-1 text-xs leading-5" color={colors.textSecondary}>
                            Edit profile details and view followers/following.
                        </AppText>
                    </Pressable>

                    <Pressable
                        onPress={openSettings}
                        className="rounded-2xl border p-4"
                        style={{ borderColor: colors.border, backgroundColor: colors.backgroundAlt }}
                        accessibilityRole="button"
                        accessibilityLabel="Open settings"
                        accessibilityHint="Manage account, appearance, and security settings"
                    >
                        <View className="flex-row items-center justify-between">
                            <AppText className="text-base font-semibold" color={colors.textPrimary}>
                                Settings
                            </AppText>
                            <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
                        </View>
                        <AppText className="mt-1 text-xs leading-5" color={colors.textSecondary}>
                            Account settings, appearance, security, and sessions.
                        </AppText>
                    </Pressable>
                </View>

                <Pressable
                    onPress={() => setLogoutConfirmVisible(true)}
                    className="mt-5 rounded-xl border px-4 py-3"
                    style={{ borderColor: colors.error, backgroundColor: colors.backgroundAlt }}
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
