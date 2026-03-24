import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { TouchableOpacity, View } from 'react-native';

import { useColors } from '@/config';

import AppText from '@/components/ui/AppText';
export interface SettingItem {
    id: string;
    label: string;
    icon: keyof typeof Ionicons.glyphMap;
    route?: string;
    action?: () => void;
    value?: string | boolean;
    isDestructive?: boolean;
}

interface SettingsGroupProps {
    title?: string;
    items: SettingItem[];
}

const SettingsList = ({ title, items }: SettingsGroupProps) => {
    const colors = useColors();
    const router = useRouter();

    const handlePress = (item: SettingItem) => {
        if (item.action) {
            item.action();
        } else if (item.route) {
            router.push(item.route as any);
        }
    };

    return (
        <View className="mb-6">
            {title && (
                <AppText
                    className="text-sm font-bold uppercase tracking-wider mb-2 px-1"
                    style={{ color: colors.textSecondary }}
                >
                    {title}
                </AppText>
            )}

            <View
                className="rounded-xl overflow-hidden border"
                style={{
                    backgroundColor: colors.backgroundAlt,
                    borderColor: colors.border
                }}
            >
                {items.map((item, index) => (
                    <TouchableOpacity
                        key={item.id}
                        onPress={() => handlePress(item)}
                        className={`flex-row items-center p-4 ${index !== items.length - 1 ? 'border-b' : ''}`}
                        style={{ borderColor: colors.border }}
                        activeOpacity={0.7}
                    >
                        <View
                            className="w-8 h-8 rounded-lg items-center justify-center mr-3"
                            style={{
                                backgroundColor: item.isDestructive ? '#FDE8E8' : `${colors.accent}15`
                            }}
                        >
                            <Ionicons
                                name={item.icon}
                                size={18}
                                color={item.isDestructive ? colors.error : colors.accent}
                            />
                        </View>

                        <AppText
                            className="flex-1 font-medium text-base"
                            style={{
                                color: item.isDestructive ? colors.error : colors.accent
                            }}
                        >
                            {item.label}
                        </AppText>

                        <View className="flex-row items-center">
                            {item.value && (
                                <AppText
                                    className="mr-2 text-sm"
                                    style={{ color: colors.textSecondary }}
                                >
                                    {String(item.value)}
                                </AppText>
                            )}
                            <Ionicons
                                name="chevron-forward"
                                size={18}
                                color={colors.textSecondary}
                            />
                        </View>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );
};

export default SettingsList;
