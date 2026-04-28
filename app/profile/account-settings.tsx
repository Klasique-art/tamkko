import React from 'react';
import { Pressable, ScrollView, TextInput, View } from 'react-native';

import AppSwitch from '@/components/ui/AppSwitch';
import AppText from '@/components/ui/AppText';
import ConfirmModal from '@/components/ui/ConfirmModal';
import Screen from '@/components/ui/Screen';
import { useColors } from '@/config/colors';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { AccountSettingsState, mockProfileSecurityService } from '@/lib/services/mockProfileSecurityService';

export default function AccountSettingsScreen() {
    const colors = useColors();
    const { user } = useAuth();
    const { showToast } = useToast();
    const [state, setState] = React.useState<AccountSettingsState | null>(null);
    const [deactivateVisible, setDeactivateVisible] = React.useState(false);
    const [deleteVisible, setDeleteVisible] = React.useState(false);
    const [deleteText, setDeleteText] = React.useState('');

    const load = React.useCallback(async () => {
        const next = await mockProfileSecurityService.load(user);
        setState(next.account);
    }, [user]);

    React.useEffect(() => {
        void load();
    }, [load]);

    const deactivate = async () => {
        const next = await mockProfileSecurityService.deactivateAccount(user, 'user_action');
        setState(next);
        setDeactivateVisible(false);
        showToast('Account deactivated (simulated).', { variant: 'warning' });
    };

    const requestDelete = async () => {
        const result = await mockProfileSecurityService.requestDeleteAccount(user, deleteText);
        if (!result.ok) {
            showToast('Type DELETE to confirm.', { variant: 'warning' });
            return;
        }
        setDeleteVisible(false);
        setDeleteText('');
        if (result.account) setState(result.account);
        showToast('Account deletion requested (simulated).', { variant: 'warning' });
    };

    return (
        <Screen title="Account Settings" className="pt-3">
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
                <View className="rounded-3xl border p-4" style={{ borderColor: colors.border, backgroundColor: colors.backgroundAlt }}>
                    <AppText className="text-base font-bold" color={colors.textPrimary}>Privacy & Discovery</AppText>

                    <View className="mt-3 rounded-xl border px-3 py-3" style={{ borderColor: colors.border, backgroundColor: colors.background }}>
                        <View className="flex-row items-center justify-between">
                            <View className="pr-3">
                                <AppText className="text-sm font-semibold" color={colors.textPrimary}>Private account</AppText>
                                <AppText className="mt-1 text-xs" color={colors.textSecondary}>
                                    Only approved followers can see your profile.
                                </AppText>
                            </View>
                            <AppSwitch
                                value={Boolean(state?.privateAccount)}
                                onValueChange={(next) => setState((current) => (current ? { ...current, privateAccount: next } : current))}
                                accessibilityRole="switch"
                                accessibilityLabel="Private account"
                                accessibilityState={{ checked: Boolean(state?.privateAccount) }}
                            />
                        </View>
                    </View>

                    <View className="mt-3 rounded-xl border px-3 py-3" style={{ borderColor: colors.border, backgroundColor: colors.background }}>
                        <View className="flex-row items-center justify-between">
                            <View className="pr-3">
                                <AppText className="text-sm font-semibold" color={colors.textPrimary}>Discoverable by phone</AppText>
                                <AppText className="mt-1 text-xs" color={colors.textSecondary}>
                                    Allow contacts to find your account.
                                </AppText>
                            </View>
                            <AppSwitch
                                value={Boolean(state?.discoverableByPhone)}
                                onValueChange={(next) => setState((current) => (current ? { ...current, discoverableByPhone: next } : current))}
                                accessibilityRole="switch"
                                accessibilityLabel="Discoverable by phone"
                                accessibilityState={{ checked: Boolean(state?.discoverableByPhone) }}
                            />
                        </View>
                    </View>
                </View>

                <View className="mt-4 rounded-3xl border p-4" style={{ borderColor: `${colors.error}55`, backgroundColor: `${colors.error}10` }}>
                    <AppText className="text-base font-bold" color={colors.error}>Danger Zone</AppText>
                    <Pressable
                        onPress={() => setDeactivateVisible(true)}
                        className="mt-3 rounded-xl border py-3"
                        style={{ borderColor: `${colors.error}66`, backgroundColor: colors.background }}
                        accessibilityRole="button"
                        accessibilityLabel="Deactivate account"
                    >
                        <AppText className="text-center text-sm font-semibold" color={colors.error}>Deactivate Account</AppText>
                    </Pressable>
                    <Pressable
                        onPress={() => setDeleteVisible(true)}
                        className="mt-3 rounded-xl border py-3"
                        style={{ borderColor: `${colors.error}66`, backgroundColor: colors.background }}
                        accessibilityRole="button"
                        accessibilityLabel="Delete account"
                    >
                        <AppText className="text-center text-sm font-semibold" color={colors.error}>Delete Account</AppText>
                    </Pressable>
                </View>
            </ScrollView>

            <ConfirmModal
                visible={deactivateVisible}
                onClose={() => setDeactivateVisible(false)}
                onConfirm={() => void deactivate()}
                title="Deactivate Account"
                description="Your account will be hidden until you log in again."
                confirmText="Deactivate"
                isDestructive
            />

            <ConfirmModal
                visible={deleteVisible}
                onClose={() => setDeleteVisible(false)}
                onConfirm={() => void requestDelete()}
                title="Delete Account"
                description="Type DELETE in the field below, then confirm."
                confirmText="Request Deletion"
                isDestructive
            />

            {deleteVisible ? (
                <View className="absolute bottom-6 left-4 right-4 rounded-2xl border p-3" style={{ borderColor: colors.border, backgroundColor: colors.background }}>
                    <AppText className="text-xs font-semibold" color={colors.textSecondary}>Type DELETE to confirm</AppText>
                    <TextInput
                        value={deleteText}
                        onChangeText={setDeleteText}
                        autoCapitalize="characters"
                        style={{ color: colors.textPrimary, paddingVertical: 10 }}
                        accessibilityLabel="Delete confirmation text input"
                    />
                </View>
            ) : null}
        </Screen>
    );
}
