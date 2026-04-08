import { Ionicons } from '@expo/vector-icons';
import { Href, router } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, View } from 'react-native';

import AppText from '@/components/ui/AppText';
import Screen from '@/components/ui/Screen';
import { useColors } from '@/config/colors';
import { useAuth } from '@/context/AuthContext';
import { mockProfileSecurityService } from '@/lib/services/mockProfileSecurityService';

type SecurityRow = {
    label: string;
    subtitle: string;
    href: Href;
    value?: string;
};

export default function SecurityScreen() {
    const colors = useColors();
    const { user } = useAuth();
    const [rows, setRows] = React.useState<SecurityRow[]>([]);

    React.useEffect(() => {
        const load = async () => {
            const state = await mockProfileSecurityService.load(user);
            const nextRows: SecurityRow[] = [
                {
                    label: 'Two-Factor Authentication',
                    subtitle: 'Enable app or SMS verification for login.',
                    href: '/profile/two-factor' as Href,
                    value: state.twoFactor.enabled ? 'Enabled' : 'Disabled',
                },
                {
                    label: 'Active Sessions',
                    subtitle: 'Review devices and revoke suspicious sessions.',
                    href: '/profile/sessions' as Href,
                    value: `${state.sessions.length} devices`,
                },
                {
                    label: 'Account Settings',
                    subtitle: 'Deactivation and deletion controls.',
                    href: '/profile/account-settings' as Href,
                    value: state.account.accountState,
                },
            ];
            setRows(nextRows);
        };
        void load();
    }, [user]);

    return (
        <Screen title="Security" className="pt-3">
            <ScrollView contentContainerStyle={{ paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
                <View className="rounded-3xl border p-4" style={{ borderColor: colors.border, backgroundColor: colors.backgroundAlt }}>
                    <AppText className="text-lg font-black" color={colors.textPrimary}>Account Protection</AppText>
                    <AppText className="mt-1 text-sm" color={colors.textSecondary}>
                        Keep your account safe with stronger authentication and session controls.
                    </AppText>
                </View>

                <View className="mt-4 gap-3">
                    {rows.map((item) => (
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
                            <AppText className="mt-1 text-xs" color={colors.textSecondary}>{item.subtitle}</AppText>
                            {item.value ? (
                                <View className="mt-2 self-start rounded-full px-2 py-1" style={{ backgroundColor: colors.background }}>
                                    <AppText className="text-[10px] font-semibold" color={colors.textPrimary}>
                                        {item.value}
                                    </AppText>
                                </View>
                            ) : null}
                        </Pressable>
                    ))}
                </View>
            </ScrollView>
        </Screen>
    );
}
