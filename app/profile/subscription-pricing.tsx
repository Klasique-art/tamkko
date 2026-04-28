import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, TextInput, View } from 'react-native';

import AppText from '@/components/ui/AppText';
import Screen from '@/components/ui/Screen';
import { useColors } from '@/config/colors';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { subscriptionPricingService } from '@/lib/services/subscriptionPricingService';

const QUICK_PRICES = [10, 15, 20, 25, 30, 40];

const clampPrice = (value: number) => Math.max(5, Math.min(500, Number(value.toFixed(2))));

export default function SubscriptionPricingScreen() {
    const colors = useColors();
    const { user } = useAuth();
    const { showToast } = useToast();
    const [loading, setLoading] = React.useState(true);
    const [priceInput, setPriceInput] = React.useState('');
    const [saving, setSaving] = React.useState(false);
    const username = user?.username?.trim().toLowerCase() || '';

    React.useEffect(() => {
        let mounted = true;
        const load = async () => {
            if (!username) {
                if (mounted) setLoading(false);
                return;
            }
            try {
                const price = await subscriptionPricingService.getPrice();
                if (!mounted) return;
                setPriceInput(price.toFixed(2));
            } catch (error: any) {
                if (!mounted) return;
                showToast(
                    error?.message || 'Could not load subscription price from backend.',
                    { variant: 'error' }
                );
            } finally {
                if (mounted) setLoading(false);
            }
        };
        void load();
        return () => {
            mounted = false;
        };
    }, [showToast, username]);

    const parsedPrice = Number(priceInput);
    const hasValidPrice = Boolean(username) && Number.isFinite(parsedPrice) && parsedPrice >= 5 && parsedPrice <= 500;

    const handleSave = async () => {
        if (!hasValidPrice || saving) return;
        setSaving(true);
        try {
            const saved = await subscriptionPricingService.setPrice(clampPrice(parsedPrice));
            setPriceInput(saved.toFixed(2));
            showToast(`Subscription price saved: GHS ${saved.toFixed(2)}/month`, {
                variant: 'success',
                duration: 2600,
            });
        } catch (error: any) {
            showToast(
                error?.message || 'Could not save subscription price to backend.',
                { variant: 'error' }
            );
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <Screen title="Subscription Pricing">
                <View className="flex-1 items-center justify-center">
                    <AppText className="text-sm" color={colors.textSecondary}>
                        Loading pricing settings...
                    </AppText>
                </View>
            </Screen>
        );
    }

    return (
        <Screen title="Subscription Pricing" className="pt-2">
            <View className="rounded-2xl border p-4" style={{ borderColor: colors.border, backgroundColor: colors.backgroundAlt }}>
                <AppText className="text-base font-bold" color={colors.textPrimary}>
                    Monthly Subscription Price
                </AppText>
                <AppText className="mt-1 text-sm" color={colors.textSecondary}>
                    This price is used when viewers subscribe to unlock all your premium videos.
                </AppText>
                {!username ? (
                    <AppText className="mt-2 text-xs" color={colors.error}>
                        Could not detect your username from account profile.
                    </AppText>
                ) : null}

                <View className="mt-4 rounded-2xl border px-3 py-2" style={{ borderColor: colors.border, backgroundColor: colors.background }}>
                    <AppText className="text-xs font-semibold" color={colors.textSecondary}>
                        Price (GHS / month)
                    </AppText>
                    <View className="mt-1 flex-row items-center">
                        <AppText className="mr-2 text-xl font-bold" color={colors.textPrimary}>
                            GH₵
                        </AppText>
                        <TextInput
                            value={priceInput}
                            onChangeText={setPriceInput}
                            keyboardType="decimal-pad"
                            placeholder="20.00"
                            placeholderTextColor={colors.textSecondary}
                            style={{
                                flex: 1,
                                fontSize: 24,
                                fontWeight: '800',
                                color: colors.textPrimary,
                                paddingVertical: 2,
                            }}
                            accessibilityLabel="Subscription monthly price"
                        />
                    </View>
                    <AppText className="mt-1 text-xs" color={hasValidPrice ? colors.textSecondary : colors.error}>
                        {hasValidPrice ? 'Allowed range: GHS 5.00 - GHS 500.00' : 'Enter a value between GHS 5.00 and GHS 500.00'}
                    </AppText>
                </View>

                <View className="mt-3 flex-row flex-wrap">
                    {QUICK_PRICES.map((price) => {
                        const active = Number(priceInput) === price;
                        return (
                            <Pressable
                                key={price}
                                onPress={() => setPriceInput(price.toFixed(2))}
                                className="mb-2 mr-2 rounded-full border px-3 py-1.5"
                                style={{
                                    borderColor: active ? colors.accent : colors.border,
                                    backgroundColor: active ? 'rgba(243,130,24,0.2)' : colors.background,
                                }}
                                accessibilityRole="button"
                                accessibilityLabel={`Set price to ${price} Ghana cedis`}
                            >
                                <AppText className="text-xs font-semibold" color={colors.textPrimary}>
                                    GHS {price}
                                </AppText>
                            </Pressable>
                        );
                    })}
                </View>

                <Pressable
                    onPress={handleSave}
                    disabled={!hasValidPrice || saving}
                    className="mt-4 flex-row items-center justify-center rounded-xl px-4 py-3"
                    style={{ backgroundColor: hasValidPrice ? colors.textPrimary : colors.border }}
                    accessibilityRole="button"
                    accessibilityLabel="Save subscription pricing"
                    accessibilityState={{ disabled: !hasValidPrice || saving }}
                >
                    <Ionicons name="save-outline" size={16} color={colors.background} />
                    <AppText className="ml-2 text-sm font-semibold" color={colors.background}>
                        {saving ? 'Saving...' : 'Save Price'}
                    </AppText>
                </Pressable>
            </View>
        </Screen>
    );
}
