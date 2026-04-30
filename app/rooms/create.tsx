import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Switch, TextInput, View } from 'react-native';

import AppButton from '@/components/ui/AppButton';
import AppModal from '@/components/ui/AppModal';
import AppText from '@/components/ui/AppText';
import Screen from '@/components/ui/Screen';
import { useColors } from '@/config/colors';
import { useToast } from '@/context/ToastContext';
import { roomService } from '@/lib/services/roomService';

type AccessPassDraft = {
    id: string;
    label: string;
    campus: string;
    discountType: 'free' | 'fixed' | 'percent';
    discountAmount: string;
    maxUses: string;
    expiresAt: string;
    isActive: boolean;
};

const PASS_TYPES: { label: string; value: AccessPassDraft['discountType'] }[] = [
    { label: 'Free', value: 'free' },
    { label: 'Fixed (GHS)', value: 'fixed' },
    { label: 'Percent (%)', value: 'percent' },
];

const toNumber = (value: string) => {
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) return 0;
    return parsed;
};

const sanitizeMoneyInput = (raw: string) => {
    const cleaned = raw.replace(/[^0-9.]/g, '');
    const [whole = '', ...rest] = cleaned.split('.');
    const wholeCapped = whole.slice(0, 2);
    if (rest.length === 0) return wholeCapped;
    const decimal = rest.join('').slice(0, 2);
    return `${wholeCapped}.${decimal}`;
};

export default function CreateRoomScreen() {
    const colors = useColors();
    const placeholderColor = colors.background === '#121212' ? '#8A8A8A' : colors.textSecondary;
    const { showToast } = useToast();

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [entryFee, setEntryFee] = useState('0.00');
    const [welcomeMessage, setWelcomeMessage] = useState('Welcome to the room. Keep it respectful.');
    const [isPublic, setIsPublic] = useState(true);
    const [allowTips, setAllowTips] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [accessPasses, setAccessPasses] = useState<AccessPassDraft[]>([]);
    const [showPassModal, setShowPassModal] = useState(false);
    const [editingPassId, setEditingPassId] = useState<string | null>(null);
    const [passLabel, setPassLabel] = useState('Campus Promo');
    const [passCampus, setPassCampus] = useState('');
    const [passType, setPassType] = useState<AccessPassDraft['discountType']>('free');
    const [passAmount, setPassAmount] = useState('0');
    const [passMaxUses, setPassMaxUses] = useState('200');
    const [passExpiresAt, setPassExpiresAt] = useState('');

    const validation = useMemo(() => {
        const normalizedEntryFee = entryFee.trim();
        const nextEntryFee = toNumber(normalizedEntryFee);
        const validMoneyFormat = /^(\d{1,2})(\.\d{1,2})?$/.test(normalizedEntryFee);

        if (name.trim().length < 3) return 'Room name must be at least 3 characters.';
        if (description.trim().length < 10) return 'Description must be at least 10 characters.';
        if (!validMoneyFormat) return 'Entry fee must be a valid amount with max 2 digits and up to 2 decimals.';
        if (nextEntryFee < 0) return 'Entry fee cannot be negative.';
        if (nextEntryFee > 200) return 'Entry fee should be 200 GHS or less for MVP simulation.';
        return null;
    }, [description, entryFee, name]);

    const handleCreate = async () => {
        if (validation || isSubmitting) return;

        setIsSubmitting(true);
        try {
            const room = await roomService.createRoom({
                name: name.trim(),
                description: description.trim(),
                entry_fee_ghs: Number(toNumber(entryFee).toFixed(2)).toFixed(2),
                is_public: isPublic,
                allow_tips: allowTips,
                welcome_message: welcomeMessage.trim() || undefined,
            });
            for (const pass of accessPasses) {
                const numericAmount = Number(pass.discountAmount);
                const numericMaxUses = Number(pass.maxUses);
                try {
                    await roomService.createAccessPass({
                        room_id: room.id,
                        label: pass.label.trim(),
                        campus: pass.campus.trim() || null,
                        discount_type: pass.discountType,
                        discount_amount_ghs: pass.discountType === 'free'
                            ? null
                            : (Number.isFinite(numericAmount) ? Number(numericAmount.toFixed(2)) : 0),
                        max_uses: Number.isFinite(numericMaxUses) ? Math.floor(numericMaxUses) : null,
                        expires_at: pass.expiresAt.trim() || null,
                        is_active: pass.isActive,
                    });
                } catch {
                    showToast(`Room created, but an access pass failed to save: ${pass.label}.`, {
                        variant: 'warning',
                        duration: 2600,
                    });
                }
            }

            void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            showToast('Room created successfully.', { variant: 'success', duration: 2400 });
            router.replace(`/rooms/${room.id}`);
        } catch (error) {
            const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message
                ?? 'Could not create room right now.';
            showToast(message, { variant: 'error' });
        } finally {
            setIsSubmitting(false);
        }
    };

    const resetPassForm = () => {
        setEditingPassId(null);
        setPassLabel('Campus Promo');
        setPassCampus('');
        setPassType('free');
        setPassAmount('0');
        setPassMaxUses('200');
        setPassExpiresAt('');
    };

    const openNewPass = () => {
        resetPassForm();
        setShowPassModal(true);
    };

    const openEditPass = (pass: AccessPassDraft) => {
        setEditingPassId(pass.id);
        setPassLabel(pass.label);
        setPassCampus(pass.campus);
        setPassType(pass.discountType);
        setPassAmount(pass.discountAmount);
        setPassMaxUses(pass.maxUses);
        setPassExpiresAt(pass.expiresAt);
        setShowPassModal(true);
    };

    const savePass = () => {
        if (!passLabel.trim()) {
            showToast('Access pass label is required.', { variant: 'warning' });
            return;
        }
        const pass: AccessPassDraft = {
            id: editingPassId ?? `pass_${Date.now()}`,
            label: passLabel.trim(),
            campus: passCampus.trim(),
            discountType: passType,
            discountAmount: passAmount,
            maxUses: passMaxUses,
            expiresAt: passExpiresAt,
            isActive: true,
        };

        setAccessPasses((prev) =>
            editingPassId ? prev.map((item) => (item.id === editingPassId ? pass : item)) : [pass, ...prev]
        );
        setShowPassModal(false);
        resetPassForm();
    };

    const removePass = (passId: string) => {
        setAccessPasses((prev) => prev.filter((item) => item.id !== passId));
    };

    return (
        <Screen title="Create Room" className="pt-2">
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }} keyboardShouldPersistTaps="handled">
                    <View className="rounded-2xl border px-4 py-4" style={{ borderColor: colors.border, backgroundColor: colors.backgroundAlt }}>
                        <AppText className="text-lg font-bold" color={colors.textPrimary}>
                            Launch a VIP Room
                        </AppText>
                        <AppText className="mt-1 text-sm" color={colors.textSecondary}>
                            Configure pricing, privacy, and experience settings for your community room.
                        </AppText>
                    </View>

                    <View className="mt-4">
                        <AppText className="mb-1 text-sm font-semibold" color={colors.textPrimary}>
                            Room Name
                        </AppText>
                        <TextInput
                            value={name}
                            onChangeText={setName}
                            placeholder="Late Night Strategy Session"
                            placeholderTextColor={placeholderColor}
                            style={{
                                borderColor: colors.border,
                                backgroundColor: colors.background,
                                borderWidth: 1,
                                borderRadius: 12,
                                color: colors.textPrimary,
                                paddingHorizontal: 12,
                                paddingVertical: 12,
                            }}
                            accessibilityLabel="Room name"
                        />
                    </View>

                    <View className="mt-3">
                        <AppText className="mb-1 text-sm font-semibold" color={colors.textPrimary}>
                            Description
                        </AppText>
                        <TextInput
                            value={description}
                            onChangeText={setDescription}
                            multiline
                            numberOfLines={4}
                            placeholder="Describe what members should expect in this room"
                            placeholderTextColor={placeholderColor}
                            style={{
                                borderColor: colors.border,
                                backgroundColor: colors.background,
                                borderWidth: 1,
                                borderRadius: 12,
                                color: colors.textPrimary,
                                paddingHorizontal: 12,
                                paddingVertical: 12,
                                minHeight: 100,
                                textAlignVertical: 'top',
                            }}
                            accessibilityLabel="Room description"
                        />
                    </View>

                    <View className="mt-3">
                        <AppText className="mb-1 text-sm font-semibold" color={colors.textPrimary}>
                            Entry Fee (GHS)
                        </AppText>
                        <TextInput
                            value={entryFee}
                            onChangeText={(value) => setEntryFee(sanitizeMoneyInput(value))}
                            keyboardType="decimal-pad"
                            placeholder="0.00"
                            placeholderTextColor={placeholderColor}
                            style={{
                                borderColor: colors.border,
                                backgroundColor: colors.background,
                                borderWidth: 1,
                                borderRadius: 12,
                                color: colors.textPrimary,
                                paddingHorizontal: 12,
                                paddingVertical: 12,
                            }}
                            accessibilityLabel="Entry fee"
                        />
                    </View>

                    <View className="mt-3">
                        <AppText className="mb-1 text-sm font-semibold" color={colors.textPrimary}>
                            Welcome Message
                        </AppText>
                        <TextInput
                            value={welcomeMessage}
                            onChangeText={setWelcomeMessage}
                            multiline
                            numberOfLines={3}
                            placeholder="Optional message shown when members join"
                            placeholderTextColor={placeholderColor}
                            style={{
                                borderColor: colors.border,
                                backgroundColor: colors.background,
                                borderWidth: 1,
                                borderRadius: 12,
                                color: colors.textPrimary,
                                paddingHorizontal: 12,
                                paddingVertical: 12,
                                minHeight: 80,
                                textAlignVertical: 'top',
                            }}
                            accessibilityLabel="Welcome message"
                        />
                    </View>

                    <View className="mt-4 rounded-xl border px-4 py-3" style={{ borderColor: colors.border, backgroundColor: colors.backgroundAlt }}>
                        <View className="mb-3 flex-row items-center justify-between">
                            <View className="flex-1 pr-4">
                                <AppText className="text-sm font-semibold" color={colors.textPrimary}>
                                    Public Room Listing
                                </AppText>
                                <AppText className="text-xs" color={colors.textSecondary}>
                                    Public rooms appear in discovery and creator profile listings.
                                </AppText>
                            </View>
                            <Switch
                                value={isPublic}
                                onValueChange={setIsPublic}
                                trackColor={{ false: colors.border, true: `${colors.accent}70` }}
                                thumbColor={isPublic ? colors.accent : colors.background}
                                accessibilityLabel="Public room listing"
                            />
                        </View>

                        <View className="flex-row items-center justify-between">
                            <View className="flex-1 pr-4">
                                <AppText className="text-sm font-semibold" color={colors.textPrimary}>
                                    Allow In-Room Tips
                                </AppText>
                                <AppText className="text-xs" color={colors.textSecondary}>
                                    Enables tipping simulation in chat.
                                </AppText>
                            </View>
                            <Switch
                                value={allowTips}
                                onValueChange={setAllowTips}
                                trackColor={{ false: colors.border, true: `${colors.accent}70` }}
                                thumbColor={allowTips ? colors.accent : colors.background}
                                accessibilityLabel="Allow in-room tips"
                            />
                        </View>
                    </View>

                    {validation ? (
                        <View className="mt-3 rounded-xl border px-3 py-3" style={{ borderColor: `${colors.error}55`, backgroundColor: `${colors.error}15` }}>
                            <AppText className="text-sm" color={colors.error}>
                                {validation}
                            </AppText>
                        </View>
                    ) : null}

                    <View className="mt-5 rounded-2xl border px-4 py-4" style={{ borderColor: colors.border, backgroundColor: colors.backgroundAlt }}>
                        <View className="flex-row items-center justify-between">
                            <AppText className="text-base font-bold" color={colors.textPrimary}>
                                Promo Codes
                            </AppText>
                            <Pressable
                                onPress={openNewPass}
                                className="rounded-full border px-3 py-1"
                                style={{ borderColor: colors.border, backgroundColor: colors.background }}
                                accessibilityRole="button"
                                accessibilityLabel="Add promo code"
                            >
                                <AppText className="text-xs font-semibold" color={colors.textPrimary}>
                                    Add Code
                                </AppText>
                            </Pressable>
                        </View>

                        <View className="mt-3">
                            {accessPasses.length === 0 ? (
                                <AppText className="text-sm" color={colors.textSecondary}>
                                    No promo codes yet.
                                </AppText>
                            ) : (
                                accessPasses.map((pass) => (
                                    <View
                                        key={pass.id}
                                        className="mb-2 rounded-xl border px-3 py-3"
                                        style={{ borderColor: colors.border, backgroundColor: colors.background }}
                                    >
                                        <View className="flex-row items-center justify-between">
                                            <View className="flex-1 pr-2">
                                                <AppText className="text-sm font-semibold" color={colors.textPrimary}>
                                                    {pass.label}
                                                </AppText>
                                                <AppText className="text-xs" color={colors.textSecondary}>
                                                    {pass.discountType}
                                                    {pass.discountType !== 'free' ? ` (${pass.discountAmount})` : ''}
                                                </AppText>
                                            </View>
                                            <View className="flex-row">
                                                <Pressable
                                                    onPress={() => openEditPass(pass)}
                                                    className="mr-2 rounded-lg border px-2 py-2"
                                                    style={{ borderColor: colors.border, backgroundColor: colors.backgroundAlt }}
                                                >
                                                    <AppText className="text-xs font-semibold" color={colors.textPrimary}>Edit</AppText>
                                                </Pressable>
                                                <Pressable
                                                    onPress={() => removePass(pass.id)}
                                                    className="rounded-lg border px-2 py-2"
                                                    style={{ borderColor: `${colors.error}66`, backgroundColor: `${colors.error}14` }}
                                                >
                                                    <AppText className="text-xs font-semibold" color={colors.error}>Delete</AppText>
                                                </Pressable>
                                            </View>
                                        </View>
                                    </View>
                                ))
                            )}
                        </View>
                    </View>

                    <AppButton
                        title="Create VIP Room"
                        loading={isSubmitting}
                        disabled={Boolean(validation) || isSubmitting}
                        onClick={() => {
                            void handleCreate();
                        }}
                        style={{ marginTop: 16 }}
                    />

                    <Pressable
                        onPress={() => router.back()}
                        className="mt-3 rounded-xl border py-3"
                        style={{ borderColor: colors.border, backgroundColor: colors.background }}
                        accessibilityRole="button"
                        accessibilityLabel="Cancel room creation"
                    >
                        <AppText className="text-center text-sm font-semibold" color={colors.textPrimary}>
                            Cancel
                        </AppText>
                    </Pressable>
                </ScrollView>
            </KeyboardAvoidingView>

            <AppModal visible={showPassModal} onClose={() => setShowPassModal(false)} title={editingPassId ? 'Edit Promo Code' : 'Create Promo Code'}>
                <View>
                    <View className="rounded-xl border px-3" style={{ borderColor: colors.border, backgroundColor: colors.backgroundAlt }}>
                        <TextInput
                            value={passLabel}
                            onChangeText={setPassLabel}
                            placeholder="Pass label"
                            placeholderTextColor={placeholderColor}
                            style={{ color: colors.textPrimary, paddingVertical: 12 }}
                        />
                    </View>
                    <View className="mt-2 rounded-xl border px-3" style={{ borderColor: colors.border, backgroundColor: colors.backgroundAlt }}>
                        <TextInput
                            value={passCampus}
                            onChangeText={setPassCampus}
                            placeholder="Campus (optional)"
                            placeholderTextColor={placeholderColor}
                            style={{ color: colors.textPrimary, paddingVertical: 12 }}
                        />
                    </View>
                    <View className="mt-2 flex-row flex-wrap">
                        {PASS_TYPES.map((option) => {
                            const active = passType === option.value;
                            return (
                                <Pressable
                                    key={option.value}
                                    onPress={() => setPassType(option.value)}
                                    className="mb-2 mr-2 rounded-full border px-3 py-2"
                                    style={{ borderColor: active ? colors.accent : colors.border, backgroundColor: active ? `${colors.accent}20` : colors.background }}
                                >
                                    <AppText className="text-xs font-semibold" color={active ? colors.accent : colors.textPrimary}>{option.label}</AppText>
                                </Pressable>
                            );
                        })}
                    </View>
                    {passType !== 'free' ? (
                        <View className="mt-1 rounded-xl border px-3" style={{ borderColor: colors.border, backgroundColor: colors.backgroundAlt }}>
                            <TextInput
                                value={passAmount}
                                onChangeText={setPassAmount}
                                keyboardType="decimal-pad"
                                placeholder={passType === 'percent' ? 'Discount percent' : 'Discount amount GHS'}
                                placeholderTextColor={placeholderColor}
                                style={{ color: colors.textPrimary, paddingVertical: 12 }}
                            />
                        </View>
                    ) : null}
                    <View className="mt-2 rounded-xl border px-3" style={{ borderColor: colors.border, backgroundColor: colors.backgroundAlt }}>
                        <TextInput
                            value={passMaxUses}
                            onChangeText={setPassMaxUses}
                            keyboardType="number-pad"
                            placeholder="Max uses"
                            placeholderTextColor={placeholderColor}
                            style={{ color: colors.textPrimary, paddingVertical: 12 }}
                        />
                    </View>
                    <View className="mt-2 rounded-xl border px-3" style={{ borderColor: colors.border, backgroundColor: colors.backgroundAlt }}>
                        <TextInput
                            value={passExpiresAt}
                            onChangeText={setPassExpiresAt}
                            placeholder="Expiry ISO date (optional)"
                            placeholderTextColor={placeholderColor}
                            style={{ color: colors.textPrimary, paddingVertical: 12 }}
                        />
                    </View>
                    <AppButton title={editingPassId ? 'Save Promo Code' : 'Create Promo Code'} onClick={savePass} style={{ marginTop: 12 }} />
                </View>
            </AppModal>
        </Screen>
    );
}
