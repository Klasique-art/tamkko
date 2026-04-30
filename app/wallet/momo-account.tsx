import React from 'react';
import { Pressable, ScrollView, TextInput, View } from 'react-native';

import AppModal from '@/components/ui/AppModal';
import AppText from '@/components/ui/AppText';
import Screen from '@/components/ui/Screen';
import { useColors } from '@/config/colors';
import { useToast } from '@/context/ToastContext';
import { walletService } from '@/lib/services/walletService';
import { MomoAccount } from '@/types/wallet.types';

export default function MomoAccountScreen() {
    const colors = useColors();
    const { showToast } = useToast();

    const [account, setAccount] = React.useState<MomoAccount | null>(null);
    const [resolvedAccountName, setResolvedAccountName] = React.useState('');
    const [phoneNumber, setPhoneNumber] = React.useState('');
    const [network, setNetwork] = React.useState<'mtn' | 'vodafone' | 'airteltigo'>('mtn');

    const [otpModalVisible, setOtpModalVisible] = React.useState(false);
    const [otp, setOtp] = React.useState('');
    const [challengeId, setChallengeId] = React.useState<string | null>(null);
    const [isEditing, setIsEditing] = React.useState(false);
    const displayNetwork = (account?.network ?? network ?? '').toUpperCase() || 'N/A';
    const displayPhone = account?.phoneNumber?.trim() ? account.phoneNumber : '-';
    const displayAccountName = account?.accountName?.trim() ? account.accountName : '-';

    const load = React.useCallback(async () => {
        try {
            const next = await walletService.getMomoAccount();
            setAccount(next);
            setResolvedAccountName(next.accountName ?? '');
            setPhoneNumber(next.phoneNumber ?? '');
            setNetwork(next.network ?? 'mtn');
        } catch {
            showToast('Could not load mobile money account right now.', { variant: 'error' });
        }
    }, [showToast]);

    React.useEffect(() => {
        void load();
    }, [load]);

    const handleStartUpdate = React.useCallback(async () => {
        if (phoneNumber.trim().length < 10) {
            showToast('Provide a valid mobile money number.', { variant: 'warning' });
            return;
        }
        const result = await walletService.beginMomoAccountUpdate({
            phoneNumber: phoneNumber.trim(),
            network,
        });
        const maybeAccountName = result.accountName;
        if (maybeAccountName) {
            setResolvedAccountName(maybeAccountName);
        }
        setChallengeId(result.challengeId);
        setOtp('');
        setOtpModalVisible(true);
        const devOtp = result.otp;
        if (devOtp) {
            console.log(`[wallet/momo] dev otp: ${devOtp}`);
        }
        showToast(`OTP sent to ${result.maskedPhone}.`, { variant: 'info' });
    }, [network, phoneNumber, showToast]);

    const handleConfirmOtp = React.useCallback(async () => {
        if (!challengeId) return;
        const result = await walletService.confirmMomoAccountUpdate(challengeId, otp, {
            phoneNumber: phoneNumber.trim(),
            network,
        });
        if (!result.ok) {
            showToast(result.message, { variant: 'error' });
            return;
        }
        setOtpModalVisible(false);
        setAccount(result.account);
        setResolvedAccountName(result.account.accountName);
        setIsEditing(false);
        showToast('MoMo account updated successfully.', { variant: 'success' });
    }, [challengeId, network, otp, phoneNumber, showToast]);

    return (
        <Screen title="Mobile Money Account" className="pt-3">
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
                <View className="rounded-2xl border p-4" style={{ borderColor: colors.border, backgroundColor: colors.backgroundAlt }}>
                    <AppText className="text-sm font-semibold" color={colors.textPrimary}>Current Payout Account</AppText>
                    <AppText className="mt-2 text-sm" color={colors.textPrimary}>{displayAccountName}</AppText>
                    <AppText className="mt-1 text-xs" color={colors.textSecondary}>{displayNetwork} {displayPhone}</AppText>
                    <AppText className="mt-1 text-[11px]" color={account?.isVerified ? colors.success : colors.warning}>
                        {account?.isVerified ? 'VERIFIED' : 'UNVERIFIED'}
                    </AppText>
                </View>

                <View className="mt-4 rounded-2xl border p-4" style={{ borderColor: colors.border, backgroundColor: colors.backgroundAlt }}>
                    <View className="flex-row items-center justify-between">
                        <AppText className="text-sm font-semibold" color={colors.textPrimary}>Update Details</AppText>
                        <Pressable
                            onPress={() => {
                                if (isEditing && account) {
                                    setResolvedAccountName(account.accountName);
                                    setPhoneNumber(account.phoneNumber);
                                    setNetwork(account.network);
                                }
                                setIsEditing((prev) => !prev);
                            }}
                            className="rounded-lg border px-3 py-2"
                            style={{ borderColor: colors.border, backgroundColor: colors.background }}
                            accessibilityRole="button"
                            accessibilityLabel={isEditing ? 'Cancel editing mobile money account' : 'Edit mobile money account'}
                        >
                            <AppText className="text-xs font-semibold" color={colors.textPrimary}>
                                {isEditing ? 'Cancel' : 'Edit'}
                            </AppText>
                        </Pressable>
                    </View>

                    <View className="mt-3 rounded-xl border px-3 py-3" style={{ borderColor: colors.border, backgroundColor: colors.background }}>
                        <AppText className="text-[11px]" color={colors.textSecondary}>Account Name (from provider verification)</AppText>
                        <AppText className="mt-1 text-sm font-semibold" color={colors.textPrimary}>
                            {resolvedAccountName || 'Will be filled after number verification'}
                        </AppText>
                    </View>

                    <View className="mt-2 rounded-xl border px-3" style={{ borderColor: colors.border, backgroundColor: colors.background }}>
                        <TextInput
                            value={phoneNumber}
                            onChangeText={setPhoneNumber}
                            editable={isEditing}
                            keyboardType="phone-pad"
                            placeholder="MoMo number"
                            placeholderTextColor={colors.textSecondary}
                            style={{ color: colors.textPrimary, paddingVertical: 12 }}
                            accessibilityLabel="MoMo number"
                        />
                    </View>

                    <View className="mt-2 flex-row rounded-xl border p-1" style={{ borderColor: colors.border, backgroundColor: colors.background }}>
                        {([
                            { id: 'mtn', label: 'MTN' },
                            { id: 'vodafone', label: 'Vodafone' },
                            { id: 'airteltigo', label: 'AirtelTigo' },
                        ] as const).map((item) => {
                            const selected = network === item.id;
                            return (
                                <Pressable
                                    key={item.id}
                                    onPress={() => {
                                        if (!isEditing) return;
                                        setNetwork(item.id);
                                    }}
                                    className="flex-1 rounded-lg py-2"
                                    style={{ backgroundColor: selected ? colors.backgroundAlt : 'transparent' }}
                                    accessibilityRole="button"
                                    accessibilityState={{ selected }}
                                    accessibilityLabel={`${item.label} network`}
                                >
                                    <AppText className="text-center text-xs font-semibold" color={colors.textPrimary}>{item.label}</AppText>
                                </Pressable>
                            );
                        })}
                    </View>

                    <Pressable
                        onPress={() => void handleStartUpdate()}
                        disabled={!isEditing}
                        className="mt-3 rounded-xl border py-3"
                        style={{
                            borderColor: colors.border,
                            backgroundColor: isEditing ? colors.background : colors.backgroundAlt,
                            opacity: isEditing ? 1 : 0.6,
                        }}
                        accessibilityRole="button"
                        accessibilityLabel="Update momo account"
                    >
                        <AppText className="text-center text-sm font-semibold" color={colors.textPrimary}>Update with OTP Verification</AppText>
                    </Pressable>
                </View>
            </ScrollView>

            <AppModal visible={otpModalVisible} onClose={() => setOtpModalVisible(false)} title="Verify Account Update">
                <AppText className="text-sm" color={colors.textSecondary}>Enter the OTP sent to your number. Use 123456 for simulation.</AppText>
                <View className="mt-3 rounded-xl border px-3" style={{ borderColor: colors.border, backgroundColor: colors.backgroundAlt }}>
                    <TextInput
                        value={otp}
                        onChangeText={setOtp}
                        keyboardType="number-pad"
                        maxLength={6}
                        placeholder="123456"
                        placeholderTextColor={colors.textSecondary}
                        style={{ color: colors.textPrimary, paddingVertical: 12 }}
                        accessibilityLabel="OTP code"
                    />
                </View>
                <Pressable
                    onPress={() => void handleConfirmOtp()}
                    className="mt-3 rounded-xl border py-3"
                    style={{ borderColor: colors.border, backgroundColor: colors.backgroundAlt }}
                    accessibilityRole="button"
                    accessibilityLabel="Confirm OTP"
                >
                    <AppText className="text-center text-sm font-semibold" color={colors.textPrimary}>Confirm OTP</AppText>
                </Pressable>
            </AppModal>
        </Screen>
    );
}
