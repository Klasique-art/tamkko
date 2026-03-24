import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import { useColors } from '@/config';

import AppText from '@/components/ui/AppText';
interface ProfileHeaderProps {
    name: string;
    email: string;
    joinDate: string;
    isVerified?: boolean;
    onVerifyPress?: () => void;
}

const ProfileHeader = ({ name, email, joinDate, isVerified, onVerifyPress }: ProfileHeaderProps) => {
    const colors = useColors();
    const { t } = useTranslation();

    const joinedDate = new Date(joinDate);
    const joinedLabel = joinedDate.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });

    return (
        <View className="items-center my-8">
            <View className="relative mx-auto p-3">
                {isVerified && (
                    <View
                        className="absolute bottom-0 right-0 bg-white rounded-full p-1 border-2"
                        style={{ borderColor: colors.background }}
                        accessible={true}
                        accessibilityLabel={t('Verified account')}
                    >
                        <Ionicons name="checkmark-circle" size={20} color={colors.success} />
                    </View>
                )}
            </View>

            <AppText
                className="text-2xl font-bold mb-1"
                style={{ color: colors.textPrimary }}
            >
                {name}
            </AppText>
            <AppText
                className="text-base mb-2"
                style={{ color: colors.textSecondary }}
            >
                {email}
            </AppText>
            {!isVerified && (
                <Pressable
                    onPress={onVerifyPress}
                    className="mb-3 rounded-full px-4 py-2"
                    style={{ backgroundColor: `${colors.accent}20` }}
                    accessibilityRole="button"
                    accessibilityLabel={t('Verify your account')}
                >
                    <View className="flex-row items-center">
                        <Ionicons name="shield-checkmark-outline" size={16} color={colors.accent} />
                        <AppText
                            className="ml-2 text-sm font-semibold"
                            style={{ color: colors.accent }}
                        >
                            Verify Now
                        </AppText>
                    </View>
                </Pressable>
            )}
            <View
                className="px-3 py-1 rounded-full border"
                style={{
                    borderColor: colors.border,
                    backgroundColor: colors.backgroundAlt
                }}
            >
                <AppText style={{ color: colors.textSecondary, fontSize: 12 }}>
                    Joined {joinedLabel}
                </AppText>
            </View>
        </View>
    );
};

export default ProfileHeader;
