import * as Clipboard from 'expo-clipboard';
import React from 'react';
import { Pressable, ScrollView, TextInput, View } from 'react-native';

import AppSwitch from '@/components/ui/AppSwitch';
import AppText from '@/components/ui/AppText';
import ConfirmModal from '@/components/ui/ConfirmModal';
import Screen from '@/components/ui/Screen';
import { useColors } from '@/config/colors';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { mockProfileSecurityService, TwoFactorState } from '@/lib/services/mockProfileSecurityService';

const SIMULATED_SECRET = 'TAMKKO-SECURE-2FA-KEY';

export default function TwoFactorSetupScreen() {
    const colors = useColors();
    const { user } = useAuth();
    const { showToast } = useToast();
    const [state, setState] = React.useState<TwoFactorState | null>(null);
    const [method, setMethod] = React.useState<'authenticator' | 'sms'>('authenticator');
    const [setupCode, setSetupCode] = React.useState('');
    const [disableCode, setDisableCode] = React.useState('');
    const [showDisableConfirm, setShowDisableConfirm] = React.useState(false);

    const load = React.useCallback(async () => {
        const next = await mockProfileSecurityService.load(user);
        setState(next.twoFactor);
        setMethod(next.twoFactor.method);
    }, [user]);

    React.useEffect(() => {
        void load();
    }, [load]);

    const enable = async () => {
        if (setupCode.trim().length < 4) {
            showToast('Enter a valid verification code.', { variant: 'warning' });
            return;
        }
        const next = await mockProfileSecurityService.setupTwoFactor(user, method, setupCode.trim());
        setState(next);
        setSetupCode('');
        showToast('Two-factor authentication enabled.', { variant: 'success', duration: 1400 });
    };

    const disable = async () => {
        const next = await mockProfileSecurityService.disableTwoFactor(user, disableCode.trim());
        setState(next);
        setDisableCode('');
        setShowDisableConfirm(false);
        showToast('Two-factor authentication disabled.', { variant: 'warning' });
    };

    const regenerateBackupCodes = async () => {
        const codes = await mockProfileSecurityService.regenerateBackupCodes(user);
        setState((current) => (current ? { ...current, backupCodes: codes } : current));
        showToast('Backup codes regenerated.', { variant: 'success', duration: 1400 });
    };

    const copyCodes = async () => {
        if (!state?.backupCodes?.length) return;
        await Clipboard.setStringAsync(state.backupCodes.join('\n'));
        showToast('Backup codes copied.', { variant: 'success', duration: 1200 });
    };

    return (
        <Screen title="Two-Factor Authentication" className="pt-3">
            <ScrollView contentContainerStyle={{ paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
                <View className="rounded-3xl border p-4" style={{ borderColor: colors.border, backgroundColor: colors.backgroundAlt }}>
                    <View className="flex-row items-center justify-between">
                        <View className="flex-1 pr-2">
                            <AppText className="text-lg font-black" color={colors.textPrimary}>2FA Protection</AppText>
                            <AppText className="mt-1 text-sm" color={colors.textSecondary}>
                                Add a second layer when logging in.
                            </AppText>
                        </View>
                        <AppSwitch
                            value={Boolean(state?.enabled)}
                            onValueChange={(next) => {
                                if (!next) setShowDisableConfirm(true);
                            }}
                            accessibilityRole="switch"
                            accessibilityLabel="Two factor enabled status"
                            accessibilityState={{ checked: Boolean(state?.enabled) }}
                        />
                    </View>
                </View>

                {!state?.enabled ? (
                    <View className="mt-4 rounded-3xl border p-4" style={{ borderColor: colors.border, backgroundColor: colors.backgroundAlt }}>
                        <AppText className="text-base font-bold" color={colors.textPrimary}>Set Up 2FA</AppText>

                        <View className="mt-3 flex-row">
                            {(['authenticator', 'sms'] as const).map((option) => {
                                const selected = method === option;
                                return (
                                    <Pressable
                                        key={option}
                                        onPress={() => setMethod(option)}
                                        className="mr-2 rounded-full border px-3 py-2"
                                        style={{
                                            borderColor: selected ? colors.primary : colors.border,
                                            backgroundColor: selected ? colors.primary : colors.background,
                                        }}
                                        accessibilityRole="button"
                                        accessibilityState={{ selected }}
                                        accessibilityLabel={`Use ${option} for two-factor`}
                                    >
                                        <AppText className="text-xs font-semibold" color={selected ? colors.white : colors.textPrimary}>
                                            {option === 'authenticator' ? 'Authenticator App' : 'SMS'}
                                        </AppText>
                                    </Pressable>
                                );
                            })}
                        </View>

                        <View className="mt-3 rounded-xl border p-3" style={{ borderColor: colors.border, backgroundColor: colors.background }}>
                            <AppText className="text-xs font-semibold" color={colors.textSecondary}>Secret Key (Simulated)</AppText>
                            <AppText className="mt-1 text-sm font-bold" color={colors.textPrimary}>{SIMULATED_SECRET}</AppText>
                        </View>

                        <AppText className="mt-3 text-sm font-semibold" color={colors.textPrimary}>Verification code</AppText>
                        <View className="mt-2 rounded-xl border px-3" style={{ borderColor: colors.border, backgroundColor: colors.background }}>
                            <TextInput
                                value={setupCode}
                                onChangeText={setSetupCode}
                                style={{ color: colors.textPrimary, paddingVertical: 12 }}
                                keyboardType="number-pad"
                                accessibilityLabel="Two factor verification code"
                            />
                        </View>

                        <Pressable
                            onPress={() => void enable()}
                            className="mt-3 rounded-xl border py-3"
                            style={{ borderColor: colors.border, backgroundColor: colors.background }}
                            accessibilityRole="button"
                            accessibilityLabel="Enable two factor authentication"
                        >
                            <AppText className="text-center text-sm font-semibold" color={colors.textPrimary}>Enable 2FA</AppText>
                        </Pressable>
                    </View>
                ) : (
                    <View className="mt-4 rounded-3xl border p-4" style={{ borderColor: colors.border, backgroundColor: colors.backgroundAlt }}>
                        <AppText className="text-base font-bold" color={colors.textPrimary}>Backup Codes</AppText>
                        <AppText className="mt-1 text-sm" color={colors.textSecondary}>
                            Save these one-time codes in a secure place.
                        </AppText>
                        <View className="mt-3 rounded-xl border p-3" style={{ borderColor: colors.border, backgroundColor: colors.background }}>
                            {state.backupCodes.map((code) => (
                                <AppText key={code} className="text-sm font-semibold" color={colors.textPrimary}>{code}</AppText>
                            ))}
                        </View>

                        <View className="mt-3 flex-row">
                            <Pressable
                                onPress={() => void copyCodes()}
                                className="mr-2 flex-1 rounded-xl border py-3"
                                style={{ borderColor: colors.border, backgroundColor: colors.background }}
                                accessibilityRole="button"
                                accessibilityLabel="Copy backup codes"
                            >
                                <AppText className="text-center text-sm font-semibold" color={colors.textPrimary}>Copy Codes</AppText>
                            </Pressable>
                            <Pressable
                                onPress={() => void regenerateBackupCodes()}
                                className="flex-1 rounded-xl border py-3"
                                style={{ borderColor: colors.border, backgroundColor: colors.background }}
                                accessibilityRole="button"
                                accessibilityLabel="Regenerate backup codes"
                            >
                                <AppText className="text-center text-sm font-semibold" color={colors.textPrimary}>Regenerate</AppText>
                            </Pressable>
                        </View>

                        <AppText className="mt-3 text-sm font-semibold" color={colors.textPrimary}>Disable 2FA</AppText>
                        <View className="mt-2 rounded-xl border px-3" style={{ borderColor: colors.border, backgroundColor: colors.background }}>
                            <TextInput
                                value={disableCode}
                                onChangeText={setDisableCode}
                                style={{ color: colors.textPrimary, paddingVertical: 12 }}
                                keyboardType="number-pad"
                                accessibilityLabel="Enter code to disable two factor authentication"
                            />
                        </View>
                        <Pressable
                            onPress={() => setShowDisableConfirm(true)}
                            className="mt-3 rounded-xl border py-3"
                            style={{ borderColor: `${colors.error}66`, backgroundColor: `${colors.error}12` }}
                            accessibilityRole="button"
                            accessibilityLabel="Disable two factor authentication"
                        >
                            <AppText className="text-center text-sm font-semibold" color={colors.error}>Disable 2FA</AppText>
                        </Pressable>
                    </View>
                )}
            </ScrollView>

            <ConfirmModal
                visible={showDisableConfirm}
                onClose={() => setShowDisableConfirm(false)}
                onConfirm={() => void disable()}
                title="Disable Two-Factor Authentication"
                description="Are you sure? Your account will be less secure."
                confirmText="Disable"
                isDestructive
            />
        </Screen>
    );
}
