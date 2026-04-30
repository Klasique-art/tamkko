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
import { walletService } from '@/lib/services/walletService';
import { formatCurrency } from '@/lib/utils';
import { MomoAccount, WalletWithdrawalItem } from '@/types/wallet.types';

export default function WalletWithdrawalsScreen() {
    const colors = useColors();
    const { showToast } = useToast();
    const [withdrawals, setWithdrawals] = React.useState<WalletWithdrawalItem[]>([]);
    const [amount, setAmount] = React.useState('120');
    const [payoutAccount, setPayoutAccount] = React.useState<MomoAccount | null>(null);

    const [otpModalVisible, setOtpModalVisible] = React.useState(false);
    const [pendingWithdrawalId, setPendingWithdrawalId] = React.useState<string | null>(null);
    const [otpChallengeId, setOtpChallengeId] = React.useState<string | null>(null);
    const [otp, setOtp] = React.useState('');

    const load = React.useCallback(async () => {
        const [nextWithdrawals, nextAccount] = await Promise.all([
            mockWalletService.getWithdrawals(),
            walletService.getMomoAccount().catch(() => null),
        ]);
        setWithdrawals(nextWithdrawals);
        setPayoutAccount(nextAccount);
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

        if (!payoutAccount?.phoneNumber || payoutAccount.phoneNumber.trim().length < 10) {
            showToast('Set your payout account in Mobile Money Account first.', { variant: 'warning' });
            return;
        }

        const initiated = await mockWalletService.initiateWithdrawal({
            amount: parsed,
            network: payoutAccount.network,
            phoneNumber: payoutAccount.phoneNumber.trim(),
        });

        setPendingWithdrawalId(initiated.withdrawal.id);
        setOtpChallengeId(initiated.otpChallengeId);
        setOtp('');
        setOtpModalVisible(true);
        await load();
        showToast('OTP sent. Use 123456 for simulated verification.', { variant: 'info', duration: 2200 });
    }, [amount, load, payoutAccount, showToast]);

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

                            {payoutAccount?.phoneNumber ? (
                                <View className="mt-3 rounded-xl border p-3" style={{ borderColor: colors.border, backgroundColor: colors.background }}>
                                    <AppText className="text-[11px]" color={colors.textSecondary}>Payout Account</AppText>
                                    <AppText className="mt-1 text-sm font-semibold" color={colors.textPrimary}>
                                        {payoutAccount.network.toUpperCase()} {payoutAccount.phoneNumber}
                                    </AppText>
                                    <AppText className="mt-1 text-[11px]" color={payoutAccount.isVerified ? colors.success : colors.warning}>
                                        {payoutAccount.isVerified ? 'VERIFIED' : 'UNVERIFIED'}
                                    </AppText>
                                </View>
                            ) : (
                                <View className="mt-3 rounded-xl border p-3" style={{ borderColor: colors.border, backgroundColor: colors.background }}>
                                    <AppText className="text-sm font-semibold" color={colors.textPrimary}>
                                        Set your payout account first
                                    </AppText>
                                    <AppText className="mt-1 text-xs" color={colors.textSecondary}>
                                        Go to Mobile Money Account and save the number you want to withdraw to.
                                    </AppText>
                                    <Pressable
                                        onPress={() => router.push('/wallet/momo-account')}
                                        className="mt-3 rounded-lg border py-2"
                                        style={{ borderColor: colors.border, backgroundColor: colors.backgroundAlt }}
                                        accessibilityRole="button"
                                        accessibilityLabel="Open mobile money account settings"
                                    >
                                        <AppText className="text-center text-xs font-semibold" color={colors.textPrimary}>
                                            Open Mobile Money Account
                                        </AppText>
                                    </Pressable>
                                </View>
                            )}

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

                            <Pressable
                                onPress={() => void handleInitiate()}
                                disabled={!payoutAccount?.phoneNumber}
                                className="mt-3 rounded-xl border py-3"
                                style={{
                                    borderColor: colors.border,
                                    backgroundColor: payoutAccount?.phoneNumber ? colors.background : colors.backgroundAlt,
                                    opacity: payoutAccount?.phoneNumber ? 1 : 0.6,
                                }}
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
