import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { View } from 'react-native';

import { useColors } from '@/config';
import { Contribution } from '@/data/contributions.dummy';


import AppText from '@/components/ui/AppText';
interface TransactionHistoryListProps {
    transactions: Contribution[];
}

const TransactionHistoryList = ({ transactions }: TransactionHistoryListProps) => {
    const colors = useColors();
    const formatMoney = (amount: number, currency?: string) => {
        const normalized = (currency || 'USD').toUpperCase();
        try {
            return new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: normalized,
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            }).format(amount);
        } catch {
            return `${normalized} ${amount.toFixed(2)}`;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed': return colors.success;
            case 'pending': return colors.warning;
            case 'failed': return colors.error;
            case 'refunded': return colors.textSecondary;
            default: return colors.textSecondary;
        }
    };

    const getTypeIcon = (type: string): keyof typeof Ionicons.glyphMap => {
        switch (type) {
            case 'contribution': return 'wallet';
            case 'fee': return 'receipt';
            case 'adjustment': return 'swap-horizontal';
            default: return 'cash';
        }
    };

    return (
        <View className="mb-8">
            <AppText
                className="text-lg font-bold mb-4 px-1"
                style={{ color: colors.textPrimary }}
            >
                Recent Transactions
            </AppText>

            {transactions.length === 0 ? (
                <View className="items-center py-6 opactity-50">
                    <AppText style={{ color: colors.textSecondary }}>No transactions yet</AppText>
                </View>
            ) : (
                transactions.map((txn) => (
                    <View
                        key={txn.contribution_id}
                        className="flex-row items-center justify-between py-3 border-b"
                        style={{ borderColor: colors.border }}
                    >
                        <View className="flex-row items-center flex-1">
                            <View
                                className="w-10 h-10 rounded-full items-center justify-center mr-3"
                                style={{ backgroundColor: `${colors.accent}15` }}
                            >
                                <Ionicons
                                    name={getTypeIcon(txn.type)}
                                    size={18}
                                    color={colors.accent}
                                />
                            </View>
                            <View>
                                <AppText
                                    className="font-bold text-base capitalize"
                                    style={{ color: colors.textPrimary }}
                                >
                                    {txn.draw_month || 'Transaction'}
                                </AppText>
                                <AppText style={{ color: colors.textSecondary, fontSize: 12 }}>
                                    {new Date(txn.created_at).toLocaleString(undefined, {
                                        year: 'numeric',
                                        month: 'short',
                                        day: 'numeric',
                                        hour: 'numeric',
                                        minute: '2-digit',
                                    })}
                                </AppText>
                            </View>
                        </View>

                        <View className="items-end">
                            <AppText
                                className="font-bold text-base"
                                style={{ color: txn.type === 'adjustment' || txn.status === 'failed' ? colors.textSecondary : colors.textPrimary }}
                            >
                                {txn.status === 'refunded' ? '+' : '-'}{formatMoney(txn.amount, txn.currency)}
                            </AppText>
                            <AppText
                                style={{ color: getStatusColor(txn.status), fontSize: 11, fontWeight: '600', textTransform: 'capitalize' }}
                            >
                                {txn.status}
                            </AppText>
                        </View>
                    </View>
                ))
            )}
        </View>
    );
};

export default TransactionHistoryList;
