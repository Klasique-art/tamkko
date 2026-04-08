import React from 'react';
import { Pressable, ScrollView, TextInput, View } from 'react-native';

import AppModal from '@/components/ui/AppModal';
import AppText from '@/components/ui/AppText';
import Screen from '@/components/ui/Screen';
import { useColors } from '@/config/colors';
import { useToast } from '@/context/ToastContext';
import { mockWalletService } from '@/lib/services/mockWalletService';
import { MomoAccount } from '@/types/wallet.types';

export default function MomoAccountScreen() {
    const colors = useColors();
    const { showToast } = useToast();

    const [account, setAccount] = React.useState<MomoAccount | null>(null);
    const [accountName, setAccountName] = React.useState('');
    const [phoneNumber, setPhoneNumber] = React.useState('');
    const [network, setNetwork] = React.useState<'mtn' | 'vodafone' | 'airteltigo'>('mtn');

    const [otpModalVisible, setOtpModalVisible] = React.useState(false);
    const [otp, setOtp] = React.useState('');
    const [challengeId, setChallengeId] = React.useState<string | null>(null);

    const load = React.useCallback(async () => {
        const next = await mockWalletService.getMomoAccount();
        setAccount(next);
        setAccountName(next.accountName);
        setPhoneNumber(next.phoneNumber);
        setNetwork(next.network);
    }, []);

    React.useEffect(() => {
        void load();
    }, [load]);

    const handleStartUpdate = React.useCallback(async () => {
        if (!accountName.trim() || phoneNumber.trim().length < 10) {
            showToast('Provide account name and valid number.', { variant: 'warning' });
            return;
        }
        const result = await mockWalletService.beginMomoAccountUpdate({
            accountName: accountName.trim(),
            phoneNumber: phoneNumber.trim(),
            network,
        });
        setChallengeId(result.challengeId);
        setOtp('');
        setOtpModalVisible(true);
        showToast(`OTP sent to ${result.maskedPhone}. Use 123456.`, { variant: 'info' });
    }, [accountName, network, phoneNumber, showToast]);

    const handleConfirmOtp = React.useCallback(async () => {
        if (!challengeId) return;
        const result = await mockWalletService.confirmMomoAccountUpdate(challengeId, otp, {
            accountName: accountName.trim(),
            phoneNumber: phoneNumber.trim(),
            network,
        });
        if (!result.ok) {
            showToast(result.message, { variant: 'error' });
            return;
        }
        setOtpModalVisible(false);
        setAccount(result.account);
        showToast('MoMo account updated successfully.', { variant: 'success' });
    }, [accountName, challengeId, network, otp, phoneNumber, showToast]);

    return (
        <Screen title="Mobile Money Account" className="pt-3">
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
                <View className="rounded-2xl border p-4" style={{ borderColor: colors.border, backgroundColor: colors.backgroundAlt }}>
                    <AppText className="text-sm font-semibold" color={colors.textPrimary}>Current Payout Account</AppText>
                    <AppText className="mt-2 text-sm" color={colors.textPrimary}>{account?.accountName ?? '-'}</AppText>
                    <AppText className="mt-1 text-xs" color={colors.textSecondary}>{account?.network.toUpperCase()} {account?.phoneNumber}</AppText>
                    <AppText className="mt-1 text-[11px]" color={account?.isVerified ? colors.success : colors.warning}>
                        {account?.isVerified ? 'VERIFIED' : 'UNVERIFIED'}
                    </AppText>
                </View>

                <View className="mt-4 rounded-2xl border p-4" style={{ borderColor: colors.border, backgroundColor: colors.backgroundAlt }}>
                    <AppText className="text-sm font-semibold" color={colors.textPrimary}>Update Details</AppText>

                    <View className="mt-3 rounded-xl border px-3" style={{ borderColor: colors.border, backgroundColor: colors.background }}>
                        <TextInput
                            value={accountName}
                            onChangeText={setAccountName}
                            placeholder="Account name"
                            placeholderTextColor={colors.textSecondary}
                            style={{ color: colors.textPrimary, paddingVertical: 12 }}
                            accessibilityLabel="Account name"
                        />
                    </View>

                    <View className="mt-2 rounded-xl border px-3" style={{ borderColor: colors.border, backgroundColor: colors.background }}>
                        <TextInput
                            value={phoneNumber}
                            onChangeText={setPhoneNumber}
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
                                    onPress={() => setNetwork(item.id)}
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
                        className="mt-3 rounded-xl border py-3"
                        style={{ borderColor: colors.border, backgroundColor: colors.background }}
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
