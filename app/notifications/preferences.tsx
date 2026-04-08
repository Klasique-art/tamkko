import React from 'react';
import { Pressable, ScrollView, View } from 'react-native';

import AppSwitch from '@/components/ui/AppSwitch';
import AppText from '@/components/ui/AppText';
import Screen from '@/components/ui/Screen';
import { useColors } from '@/config/colors';
import { useNotificationCenter } from '@/context/NotificationCenterContext';

export default function NotificationPreferencesScreen() {
    const colors = useColors();
    const {
        preferences,
        pushPermissionLabel,
        updatePreferences,
        requestPushOnboardingPermission,
    } = useNotificationCenter();

    return (
        <Screen title="Notification Preferences" className="pt-3">
            <ScrollView contentContainerStyle={{ paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
                <View className="rounded-3xl border p-4" style={{ borderColor: colors.border, backgroundColor: colors.backgroundAlt }}>
                    <AppText className="text-lg font-black" color={colors.textPrimary}>Push Onboarding</AppText>
                    <AppText className="mt-1 text-sm" color={colors.textSecondary}>
                        Device permission status: {pushPermissionLabel}
                    </AppText>
                    <Pressable
                        onPress={() => void requestPushOnboardingPermission()}
                        className="mt-3 rounded-xl border py-3"
                        style={{ borderColor: colors.border, backgroundColor: colors.background }}
                        accessibilityRole="button"
                        accessibilityLabel="Enable push notifications"
                    >
                        <AppText className="text-center text-sm font-semibold" color={colors.textPrimary}>
                            Enable Push Notifications
                        </AppText>
                    </Pressable>
                </View>

                <View className="mt-4 rounded-3xl border p-4" style={{ borderColor: colors.border, backgroundColor: colors.backgroundAlt }}>
                    <AppText className="text-base font-bold" color={colors.textPrimary}>Delivery Channels</AppText>

                    <View className="mt-4 rounded-xl border px-3 py-3" style={{ borderColor: colors.border, backgroundColor: colors.background }}>
                        <View className="flex-row items-center justify-between">
                            <View className="pr-3">
                                <AppText className="text-sm font-semibold" color={colors.textPrimary}>Push notifications</AppText>
                                <AppText className="mt-1 text-xs" color={colors.textSecondary}>
                                    Device alerts for tips, followers, and room invites.
                                </AppText>
                            </View>
                            <AppSwitch
                                value={preferences.pushEnabled}
                                onValueChange={(next) => void updatePreferences({ pushEnabled: next })}
                                accessibilityRole="switch"
                                accessibilityLabel="Toggle push notifications"
                                accessibilityState={{ checked: preferences.pushEnabled }}
                            />
                        </View>
                    </View>

                    <View className="mt-3 rounded-xl border px-3 py-3" style={{ borderColor: colors.border, backgroundColor: colors.background }}>
                        <View className="flex-row items-center justify-between">
                            <View className="pr-3">
                                <AppText className="text-sm font-semibold" color={colors.textPrimary}>In-app notifications</AppText>
                                <AppText className="mt-1 text-xs" color={colors.textSecondary}>
                                    Notification center updates while using the app.
                                </AppText>
                            </View>
                            <AppSwitch
                                value={preferences.inAppEnabled}
                                onValueChange={(next) => void updatePreferences({ inAppEnabled: next })}
                                accessibilityRole="switch"
                                accessibilityLabel="Toggle in-app notifications"
                                accessibilityState={{ checked: preferences.inAppEnabled }}
                            />
                        </View>
                    </View>

                    <View className="mt-3 rounded-xl border px-3 py-3" style={{ borderColor: colors.border, backgroundColor: colors.background }}>
                        <View className="flex-row items-center justify-between">
                            <View className="pr-3">
                                <AppText className="text-sm font-semibold" color={colors.textPrimary}>Email updates</AppText>
                                <AppText className="mt-1 text-xs" color={colors.textSecondary}>
                                    Weekly summaries and critical account notices.
                                </AppText>
                            </View>
                            <AppSwitch
                                value={preferences.emailEnabled}
                                onValueChange={(next) => void updatePreferences({ emailEnabled: next })}
                                accessibilityRole="switch"
                                accessibilityLabel="Toggle email notifications"
                                accessibilityState={{ checked: preferences.emailEnabled }}
                            />
                        </View>
                    </View>
                </View>
            </ScrollView>
        </Screen>
    );
}
