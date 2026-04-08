import { FlashList } from '@shopify/flash-list';
import { router } from 'expo-router';
import React from 'react';
import { Pressable, TextInput, View } from 'react-native';

import AppModal from '@/components/ui/AppModal';
import AppText from '@/components/ui/AppText';
import Screen from '@/components/ui/Screen';
import { useColors } from '@/config/colors';
import { useToast } from '@/context/ToastContext';
import { mockWalletService } from '@/lib/services/mockWalletService';
import { formatCurrency } from '@/lib/utils';
import { WalletWithdrawalItem } from '@/types/wallet.types';

export default function WalletWithdrawalsScreen() {
    const colors = useColors();
    const { showToast } = useToast();
    const [withdrawals, setWithdrawals] = React.useState<WalletWithdrawalItem[]>([]);
    const [amount, setAmount] = React.useState('120');
    const [network, setNetwork] = React.useState<'mtn' | 'vodafone' | 'airteltigo'>('mtn');
    const [phoneNumber, setPhoneNumber] = React.useState('0240001122');

    const [otpModalVisible, setOtpModalVisible] = React.useState(false);
    const [pendingWithdrawalId, setPendingWithdrawalId] = React.useState<string | null>(null);
    const [otpChallengeId, setOtpChallengeId] = React.useState<string | null>(null);
    const [otp, setOtp] = React.useState('');

    const load = React.useCallback(async () => {
        const next = await mockWalletService.getWithdrawals();
        setWithdrawals(next);
    }, []);

    React.useEffect(() => {
        void load();
    }, [load]);

    const handleInitiate = React.useCallback(async () => {
        const parsed = Number(amount);
        if (!Number.isFinite(parsed) || parsed <= 0) {
            showToast('Enter a valid withdrawal amount.', { variant: 'warning' });
            return;
        }
        if (phoneNumber.trim().length < 10) {
            showToast('Enter a valid MoMo phone number.', { variant: 'warning' });
            return;
        }

        const initiated = await mockWalletService.initiateWithdrawal({
            amount: parsed,
            network,
            phoneNumber: phoneNumber.trim(),
        });

        setPendingWithdrawalId(initiated.withdrawal.id);
        setOtpChallengeId(initiated.otpChallengeId);
        setOtp('');
        setOtpModalVisible(true);
        await load();
        showToast('OTP sent. Use 123456 for simulated verification.', { variant: 'info', duration: 2200 });
    }, [amount, load, network, phoneNumber, showToast]);

    const verifyOtp = React.useCallback(async () => {
        if (!pendingWithdrawalId || !otpChallengeId) return;

        const result = await mockWalletService.verifyWithdrawalOtp(pendingWithdrawalId, otpChallengeId, otp);
        if (!result.ok) {
            showToast(result.message, { variant: 'error' });
            return;
        }

        setOtpModalVisible(false);
        await load();
        showToast('Withdrawal submitted. Tracking status now.', { variant: 'success' });
        router.push(`/wallet/withdrawal/${encodeURIComponent(pendingWithdrawalId)}`);
    }, [load, otp, otpChallengeId, pendingWithdrawalId, showToast]);

    return (
        <Screen title="Withdrawals" className="pt-3">
            <FlashList
                data={withdrawals}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{ paddingBottom: 120 }}
                ListHeaderComponent={
                    <View>
                        <View className="rounded-2xl border p-4" style={{ borderColor: colors.border, backgroundColor: colors.backgroundAlt }}>
                            <AppText className="text-sm font-semibold" color={colors.textPrimary}>Request Withdrawal</AppText>

                            <View className="mt-3 rounded-xl border px-3" style={{ borderColor: colors.border, backgroundColor: colors.background }}>
                                <TextInput
                                    value={amount}
                                    onChangeText={setAmount}
                                    keyboardType="decimal-pad"
                                    placeholder="Amount in GHS"
                                    placeholderTextColor={colors.textSecondary}
                                    style={{ color: colors.textPrimary, paddingVertical: 12 }}
                                    accessibilityLabel="Withdrawal amount"
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
                                onPress={() => void handleInitiate()}
                                className="mt-3 rounded-xl border py-3"
                                style={{ borderColor: colors.border, backgroundColor: colors.background }}
                                accessibilityRole="button"
                                accessibilityLabel="Initiate withdrawal"
                            >
                                <AppText className="text-center text-sm font-semibold" color={colors.textPrimary}>Initiate Withdrawal + OTP</AppText>
                            </Pressable>
                        </View>

                        <View className="mb-2 mt-4 flex-row items-center justify-between">
                            <AppText className="text-sm font-semibold" color={colors.textPrimary}>Withdrawal History</AppText>
                            <Pressable onPress={() => void load()} accessibilityRole="button" accessibilityLabel="Refresh withdrawals">
                                <AppText className="text-xs font-semibold" color={colors.accent}>Refresh</AppText>
                            </Pressable>
                        </View>
                    </View>
                }
                renderItem={({ item }) => (
                    <Pressable
                        onPress={() => router.push(`/wallet/withdrawal/${encodeURIComponent(item.id)}`)}
                        className="mb-2 rounded-xl border p-3"
                        style={{ borderColor: colors.border, backgroundColor: colors.backgroundAlt }}
                        accessibilityRole="button"
                        accessibilityLabel={`Open withdrawal ${item.id}`}
                    >
                        <View className="flex-row items-center justify-between">
                            <View>
                                <AppText className="text-sm font-semibold" color={colors.textPrimary}>{item.network.toUpperCase()} {item.phoneNumber}</AppText>
                                <AppText className="mt-1 text-xs" color={colors.textSecondary}>{new Date(item.createdAt).toLocaleString()}</AppText>
                            </View>
                            <View className="items-end">
                                <AppText className="text-sm font-bold" color={colors.textPrimary}>{formatCurrency(item.amount, item.currency)}</AppText>
                                <AppText className="mt-1 text-[11px]" color={item.status === 'completed' ? colors.success : item.status === 'failed' || item.status === 'rejected' ? colors.error : colors.warning}>
                                    {item.status.toUpperCase()}
                                </AppText>
                            </View>
                        </View>
                    </Pressable>
                )}
                ListEmptyComponent={
                    <View className="rounded-xl border p-3" style={{ borderColor: colors.border, backgroundColor: colors.backgroundAlt }}>
                        <AppText className="text-sm" color={colors.textSecondary}>No withdrawals yet.</AppText>
                    </View>
                }
            />

            <AppModal visible={otpModalVisible} onClose={() => setOtpModalVisible(false)} title="Verify Withdrawal OTP">
                <AppText className="text-sm" color={colors.textSecondary}>
                    Enter the OTP sent to your phone. Use 123456 for this simulation.
                </AppText>
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
                    onPress={() => void verifyOtp()}
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
