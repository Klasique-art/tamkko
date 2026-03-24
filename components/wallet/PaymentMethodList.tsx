import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { TouchableOpacity, View } from 'react-native';

import { useColors } from '@/config';
import { PaymentMethod } from '@/data/contributions.dummy';


import AppText from '@/components/ui/AppText';
interface PaymentMethodListProps {
    methods: PaymentMethod[];
    onSelectMethod: (id: string) => void;
}

const PaymentMethodList = ({ methods, onSelectMethod }: PaymentMethodListProps) => {
    const colors = useColors();

    const getBrandIcon = (brand: string) => {
        switch (brand) {
            case 'visa': return "card"; // Simplified, ideally utilize different assets or specific icons
            case 'mastercard': return "card-outline";
            default: return "card";
        }
    };

    return (
        <View className="mb-6">
            <View className="flex-row justify-between items-center mb-4 px-1">
                <AppText
                    className="text-lg font-bold"
                    style={{ color: colors.textPrimary }}
                >
                    Payment Methods
                </AppText>
            </View>

            {methods.map((method) => (
                <TouchableOpacity
                    key={method.id}
                    onPress={() => onSelectMethod(method.id)}
                    className="flex-row items-center p-4 mb-3 rounded-xl border"
                    style={{
                        backgroundColor: colors.backgroundAlt,
                        borderColor: method.is_default ? colors.accent : colors.border
                    }}
                >
                    <View
                        className="w-10 h-10 rounded-lg items-center justify-center mr-4"
                        style={{ backgroundColor: '#F0F2F5' }}
                    >
                        <Ionicons name={getBrandIcon(method.brand) as any} size={24} color="#333" />
                    </View>
                    <View className="flex-1">
                        <AppText
                            className="font-bold text-base capitalize"
                            style={{ color: colors.textPrimary }}
                        >
                            {method.brand} **** {method.last4}
                        </AppText>
                        <AppText style={{ color: colors.textSecondary, fontSize: 12 }}>
                            Expires {method.expiry_month}/{method.expiry_year}
                        </AppText>
                    </View>

                    {method.is_default && (
                        <View className="px-2 py-1 border border-accent rounded-sm" style={{ backgroundColor: `${colors.accent}15` }}>
                            <AppText style={{ color: colors.accent, fontSize: 10, fontWeight: 'bold' }}>
                                Default
                            </AppText>
                        </View>
                    )}
                </TouchableOpacity>
            ))}
        </View>
    );
};

export default PaymentMethodList;
