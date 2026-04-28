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
import { useNotificationCenter } from '@/context/NotificationCenterContext';

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
    const { unreadCount } = useNotificationCenter();
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
    const openAnalytics = () => {
        router.push('/profile/analytics' as Href);
    };
    const openReferral = () => {
        router.push('/referral' as Href);
    };
    const openWallet = () => {
        router.push('/wallet' as Href);
    };
    const openNotifications = () => {
        router.push('/notifications' as Href);
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
                        {user?.profile?.displayName || user?.username || 'TAMKKO User'}
                    </AppText>
                    <AppText className="mt-1 text-sm" color={colors.textSecondary}>
                        @{user?.username || 'username'}  -  {user?.email}
                    </AppText>
                    <AppText className="mt-1 text-xs" color={colors.textSecondary}>
                        {user?.phone}
                    </AppText>

                    <View className="mt-4 flex-row gap-2">
                        <View className="flex-1 rounded-xl border p-2" style={{ borderColor: colors.border }}>
                            <AppText className="text-xs" color={colors.textSecondary}>Followers</AppText>
                            <AppText className="text-sm font-semibold" color={colors.textPrimary}>
                                {user?.stats?.followersCount ?? 0}
                            </AppText>
                        </View>
                        <View className="flex-1 rounded-xl border p-2" style={{ borderColor: colors.border }}>
                            <AppText className="text-xs" color={colors.textSecondary}>Following</AppText>
                            <AppText className="text-sm font-semibold" color={colors.textPrimary}>
                                {user?.stats?.followingCount ?? 0}
                            </AppText>
                        </View>
                        <View className="flex-1 rounded-xl border p-2" style={{ borderColor: colors.border }}>
                            <AppText className="text-xs" color={colors.textSecondary}>Videos</AppText>
                            <AppText className="text-sm font-semibold" color={colors.textPrimary}>
                                {user?.stats?.videosCount ?? 0}
                            </AppText>
                        </View>
                    </View>
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

                    <Pressable
                        onPress={openAnalytics}
                        className="rounded-2xl border p-4"
                        style={{ borderColor: colors.border, backgroundColor: colors.backgroundAlt }}
                        accessibilityRole="button"
                        accessibilityLabel="Open analytics"
                        accessibilityHint="View creator analytics and performance trends"
                    >
                        <View className="flex-row items-center justify-between">
                            <AppText className="text-base font-semibold" color={colors.textPrimary}>
                                Analytics
                            </AppText>
                            <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
                        </View>
                        <AppText className="mt-1 text-xs leading-5" color={colors.textSecondary}>
                            View views, engagement, watch-time, and earnings insights.
                        </AppText>
                    </Pressable>

                    <Pressable
                        onPress={openReferral}
                        className="rounded-2xl border p-4"
                        style={{ borderColor: colors.border, backgroundColor: colors.backgroundAlt }}
                        accessibilityRole="button"
                        accessibilityLabel="Open referral"
                        accessibilityHint="Manage referral code, earnings, leaderboard, and ambassador status"
                    >
                        <View className="flex-row items-center justify-between">
                            <AppText className="text-base font-semibold" color={colors.textPrimary}>
                                Referral
                            </AppText>
                            <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
                        </View>
                        <AppText className="mt-1 text-xs leading-5" color={colors.textSecondary}>
                            Referral code, network, earnings, leaderboard, and ambassador flows.
                        </AppText>
                    </Pressable>

                    <Pressable
                        onPress={openNotifications}
                        className="rounded-2xl border p-4"
                        style={{ borderColor: colors.border, backgroundColor: colors.backgroundAlt }}
                        accessibilityRole="button"
                        accessibilityLabel="Open notifications"
                        accessibilityHint="View notification center and preferences"
                    >
                        <View className="flex-row items-center justify-between">
                            <View className="flex-row items-center">
                                <AppText className="text-base font-semibold" color={colors.textPrimary}>
                                    Notifications
                                </AppText>
                                {unreadCount > 0 ? (
                                    <View className="ml-2 rounded-full px-2 py-0.5" style={{ backgroundColor: colors.error }}>
                                        <AppText className="text-[10px] font-bold" color={colors.white}>
                                            {unreadCount > 99 ? '99+' : unreadCount}
                                        </AppText>
                                    </View>
                                ) : null}
                            </View>
                            <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
                        </View>
                        <AppText className="mt-1 text-xs leading-5" color={colors.textSecondary}>
                            Preferences, unread updates, and deep-link notifications.
                        </AppText>
                    </Pressable>

                    <Pressable
                        onPress={openWallet}
                        className="rounded-2xl border p-4"
                        style={{ borderColor: colors.border, backgroundColor: colors.backgroundAlt }}
                        accessibilityRole="button"
                        accessibilityLabel="Open wallet"
                        accessibilityHint="Manage transactions, subscriptions, withdrawals, and payout account"
                    >
                        <View className="flex-row items-center justify-between">
                            <AppText className="text-base font-semibold" color={colors.textPrimary}>
                                Wallet
                            </AppText>
                            <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
                        </View>
                        <AppText className="mt-1 text-xs leading-5" color={colors.textSecondary}>
                            Transactions, earnings, subscriptions, withdrawals, and MoMo account.
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
