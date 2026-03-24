import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { useColors } from '@/config';
import { ParticipationStats } from '@/data/participationStats.dummy';

import AppText from '@/components/ui/AppText';
interface ContributionStatusCardProps {
    stats: ParticipationStats;
}

const ContributionStatusCard = ({ stats }: ContributionStatusCardProps) => {
    const colors = useColors();
    const { t, i18n } = useTranslation();
    const isPaid = stats.current_month_status === 'paid';
    const currentMonth = new Date().toLocaleString(i18n.language || 'en', { month: 'long' });

    return (
        <LinearGradient
            colors={isPaid ? [colors.success, '#145A0A'] : [colors.warning, '#C4902C']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="p-5 mb-6"
            style={{ borderRadius: 16 }}
        >
            <View className="flex-row items-center justify-between mb-4">
                <AppText className="text-lg font-bold">
                    {t('{{month}} Contribution', { month: currentMonth })}
                </AppText>
                <View className="bg-white/20 px-3 py-1 rounded-full">
                    <AppText className="text-xs font-bold uppercase">
                        {isPaid ? t('Active') : t('Pending')}
                    </AppText>
                </View>
            </View>

            <View className="flex-row items-center mb-4">
                <View className={`w-12 h-12 rounded-full items-center justify-center mr-4 ${isPaid ? 'bg-white/20' : 'bg-black/10'}`}>
                    <Ionicons
                        name={isPaid ? "checkmark-circle" : "time"}
                        size={28}
                        color="#FFFFFF"
                    />
                </View>
                <View>
                    <AppText className="text-3xl font-bold">
                        {isPaid ? t("You're In!") : t('Due Soon')}
                    </AppText>
                    <AppText className="text-sm">
                        {isPaid
                            ? t('Contribution received. Good luck!')
                            : t('Payment due by {{date}}', {
                                date: new Date(stats.next_payment_due_date).toLocaleDateString()
                            })}
                    </AppText>
                </View>
            </View>

            {isPaid && (
                <View className="bg-black/10 rounded-xl p-3 flex-row items-center">
                    <Ionicons name="ticket-outline" size={20} color="#FFFFFF" />
                    <AppText className="ml-2 flex-1">
                        {t('Entry ID:')} <AppText className="font-bold" disableTranslation>{stats.current_draw_entry_id}</AppText>
                    </AppText>
                </View>
            )}
        </LinearGradient>
    );
};

export default ContributionStatusCard;

