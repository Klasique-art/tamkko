import * as Haptics from 'expo-haptics';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, Switch, TextInput, View } from 'react-native';

import AppButton from '@/components/ui/AppButton';
import AppModal from '@/components/ui/AppModal';
import AppText from '@/components/ui/AppText';
import Screen from '@/components/ui/Screen';
import { useColors } from '@/config/colors';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { roomService } from '@/lib/services/roomService';
import { RoomCreatorCode, VipRoom } from '@/types/room.types';

const CODE_TYPES: { label: string; value: RoomCreatorCode['discountType'] }[] = [
    { label: 'Free', value: 'free' },
    { label: 'Fixed (GHS)', value: 'fixed' },
    { label: 'Percent (%)', value: 'percent' },
];

const formatDate = (dateIso: string | null) => {
    if (!dateIso) return 'No expiry';
    const date = new Date(dateIso);
    return date.toLocaleDateString();
};

const sanitizeMoneyInput = (raw: string) => {
    const cleaned = raw.replace(/[^0-9.]/g, '');
    const [whole = '', ...rest] = cleaned.split('.');
    const wholeCapped = whole.slice(0, 2);
    if (rest.length === 0) return wholeCapped;
    const decimal = rest.join('').slice(0, 2);
    return `${wholeCapped}.${decimal}`;
};

const mapAccessPassToCode = (raw: any): RoomCreatorCode => ({
    id: String(raw?.id ?? raw?._id ?? ''),
    roomId: String(raw?.room_id ?? raw?.roomId ?? ''),
    label: String(raw?.label ?? 'Promo Code'),
    code: String(raw?.code ?? raw?.code_string ?? ''),
    discountType: (raw?.discount_type ?? raw?.discountType ?? 'free') as RoomCreatorCode['discountType'],
    discountAmount: Number(raw?.discount_amount_ghs ?? raw?.discountAmount ?? 0) || 0,
    maxUses: raw?.max_uses == null ? null : Number(raw.max_uses),
    usedCount: Number(raw?.used_count ?? raw?.usedCount ?? 0) || 0,
    expiresAt: raw?.expires_at ?? raw?.expiresAt ?? null,
    campus: raw?.campus ?? null,
    isActive: Boolean(raw?.is_active ?? raw?.isActive ?? true),
    createdAt: String(raw?.created_at ?? raw?.createdAt ?? new Date().toISOString()),
});

export default function RoomManageScreen() {
    const colors = useColors();
    const placeholderColor = colors.background === '#121212' ? '#8A8A8A' : colors.textSecondary;
    const { showToast } = useToast();
    const { user } = useAuth();
    const { roomId } = useLocalSearchParams<{ roomId: string }>();

    const [room, setRoom] = useState<VipRoom | null>(null);
    const [codes, setCodes] = useState<RoomCreatorCode[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [entryFee, setEntryFee] = useState('0');
    const [welcomeMessage, setWelcomeMessage] = useState('');
    const [isPublic, setIsPublic] = useState(true);
    const [allowTips, setAllowTips] = useState(true);

    const [showCodeModal, setShowCodeModal] = useState(false);
    const [selectedCode, setSelectedCode] = useState<RoomCreatorCode | null>(null);
    const [editingCodeId, setEditingCodeId] = useState<string | null>(null);
    const [codeLabel, setCodeLabel] = useState('Campus Promo');
    const [codeCampus, setCodeCampus] = useState('');
    const [codeType, setCodeType] = useState<RoomCreatorCode['discountType']>('free');
    const [codeAmount, setCodeAmount] = useState('0');
    const [codeMaxUses, setCodeMaxUses] = useState('200');
    const [codeExpiresAt, setCodeExpiresAt] = useState('');

    const load = useCallback(async () => {
        if (!roomId) return;
        setLoading(true);
        const [nextRoom, nextCodesRaw] = await Promise.all([roomService.getRoom(roomId), roomService.listAccessPasses(roomId)]);

        setRoom(nextRoom);
        setCodes(nextCodesRaw.map(mapAccessPassToCode));

        if (nextRoom) {
            setName(nextRoom.name);
            setDescription(nextRoom.description);
            setEntryFee(nextRoom.entryFee.toFixed(2));
            setWelcomeMessage(nextRoom.welcomeMessage || '');
            setIsPublic(nextRoom.isPublic);
            setAllowTips(nextRoom.allowTips);
        }
        setLoading(false);
    }, [roomId]);

    React.useEffect(() => {
        void load();
    }, [load]);

    const currentUserId = String(user?._id ?? user?.user_id ?? '');
    const isCreator = useMemo(() => {
        if (!room) return false;
        return Boolean(
            room.role === 'creator' ||
            (currentUserId && room.creatorId === currentUserId) ||
            (user?.username && room.creatorUsername === user.username)
        );
    }, [room, currentUserId, user?.username]);

    const validation = useMemo(() => {
        if (!room) return 'Room not available.';
        const normalizedEntryFee = entryFee.trim();
        const fee = Number(normalizedEntryFee);
        const validMoneyFormat = /^(\d{1,2})(\.\d{1,2})?$/.test(normalizedEntryFee);
        if (name.trim().length < 3) return 'Name must be at least 3 characters.';
        if (description.trim().length < 10) return 'Description must be at least 10 characters.';
        if (!validMoneyFormat) return 'Entry fee must be a valid amount with max 2 digits and up to 2 decimals.';
        if (!Number.isFinite(fee) || fee < 0) return 'Entry fee must be a valid number.';
        return null;
    }, [description, entryFee, name, room]);

    const handleSave = async () => {
        if (!room || validation || saving) return;
        setSaving(true);
        const updated = await roomService.updateRoom(room.id, {
            name,
            description,
            entry_fee_ghs: Number(Number(entryFee).toFixed(2)).toFixed(2),
            welcome_message: welcomeMessage,
            is_public: isPublic,
            allow_tips: allowTips,
        });
        setSaving(false);
        if (!updated) {
            showToast('Failed to save room settings.', { variant: 'error', duration: 2200 });
            return;
        }
        setRoom(updated);
        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        showToast('Room settings updated.', { variant: 'success', duration: 2200 });
    };

    const handleDeleteRoom = async () => {
        if (!room) return;
        const deleted = await roomService.deleteRoom(room.id);
        if (!deleted) {
            showToast('Unable to delete room.', { variant: 'error', duration: 2200 });
            return;
        }
        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        showToast('Room deleted permanently.', { variant: 'warning', duration: 2200 });
        router.replace('/rooms');
    };

    const resetCodeForm = () => {
        setEditingCodeId(null);
        setCodeLabel('Campus Promo');
        setCodeCampus('');
        setCodeType('free');
        setCodeAmount('0');
        setCodeMaxUses('200');
        setCodeExpiresAt('');
    };

    const openCreateCodeModal = () => {
        resetCodeForm();
        setShowCodeModal(true);
    };

    const openEditCodeModal = (code: RoomCreatorCode) => {
        setEditingCodeId(code.id);
        setCodeLabel(code.label);
        setCodeCampus(code.campus ?? '');
        setCodeType(code.discountType);
        setCodeAmount(String(code.discountAmount));
        setCodeMaxUses(code.maxUses === null ? '' : String(code.maxUses));
        setCodeExpiresAt(code.expiresAt ?? '');
        setShowCodeModal(true);
    };

    const handleSaveCode = async () => {
        if (!roomId) return;

        const discountAmount = Number(codeAmount);
        const maxUses = Number(codeMaxUses);
        if (editingCodeId) {
            const updatedRaw = await roomService.updateAccessPass(editingCodeId, {
                label: codeLabel,
                campus: codeCampus.trim() || null,
                discount_type: codeType,
                discount_amount_ghs: Number.isFinite(discountAmount) ? discountAmount : 0,
                max_uses: Number.isFinite(maxUses) ? Math.floor(maxUses) : null,
                expires_at: codeExpiresAt.trim() || null,
            });
            const updated = mapAccessPassToCode((updatedRaw as any)?.access_pass ?? updatedRaw);
            if (updated) {
                setCodes((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
                showToast(`Access pass ${updated.code} updated.`, { variant: 'success', duration: 2200 });
            }
            setShowCodeModal(false);
            resetCodeForm();
            return;
        }

        const createdRaw = await roomService.createAccessPass({
            room_id: roomId,
            label: codeLabel,
            campus: codeCampus.trim() || null,
            discount_type: codeType,
            discount_amount_ghs: Number.isFinite(discountAmount) ? discountAmount : 0,
            max_uses: Number.isFinite(maxUses) ? Math.floor(maxUses) : null,
            expires_at: codeExpiresAt.trim() || null,
            is_active: true,
        });
        const created = mapAccessPassToCode((createdRaw as any)?.access_pass ?? createdRaw);

        setCodes((prev) => [created, ...prev]);
        setShowCodeModal(false);
        resetCodeForm();
        showToast(`Access pass ${created.code} created.`, { variant: 'success', duration: 2200 });
    };

    const handleToggleCode = async (code: RoomCreatorCode) => {
        if (!roomId) return;
        const nextRaw = await roomService.updateAccessPass(code.id, { is_active: !code.isActive });
        const next = mapAccessPassToCode((nextRaw as any)?.access_pass ?? nextRaw);
        setCodes((prev) => prev.map((item) => (item.id === code.id ? next : item)));
    };

    const handleViewCodeStats = async (code: RoomCreatorCode) => {
        if (!roomId) return;
        setSelectedCode(code);
        showToast(
            `${code.code}: ${code.usedCount} uses so far.`,
            { variant: 'info', duration: 3200 }
        );
    };

    const handleDeleteCode = async (code: RoomCreatorCode) => {
        if (!roomId) return;
        const ok = await roomService.deleteAccessPass(code.id);
        if (!ok) return;
        setCodes((prev) => prev.filter((item) => item.id !== code.id));
        showToast(`Access pass ${code.code} deleted.`, { variant: 'warning', duration: 2200 });
    };

    if (loading) {
        return (
            <Screen title="Manage Room">
                <View className="flex-1 items-center justify-center">
                    <AppText className="text-sm" color={colors.textSecondary}>
                        Loading room settings...
                    </AppText>
                </View>
            </Screen>
        );
    }

    if (!room) {
        return (
            <Screen title="Manage Room">
                <View className="rounded-xl border px-4 py-4" style={{ borderColor: colors.border, backgroundColor: colors.backgroundAlt }}>
                    <AppText className="text-base font-bold" color={colors.textPrimary}>
                        Room not found
                    </AppText>
                </View>
            </Screen>
        );
    }

    if (!isCreator) {
        return (
            <Screen title="Manage Room">
                <View className="rounded-xl border px-4 py-4" style={{ borderColor: `${colors.warning}55`, backgroundColor: `${colors.warning}14` }}>
                    <AppText className="text-base font-bold" color={colors.warning}>
                        Creator access required
                    </AppText>
                    <AppText className="mt-1 text-sm" color={colors.textSecondary}>
                        Only room creators can manage settings and moderation controls.
                    </AppText>
                </View>
            </Screen>
        );
    }

    return (
        <Screen title="Manage Room" className="pt-2">
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
                <View className="rounded-2xl border px-4 py-4" style={{ borderColor: colors.border, backgroundColor: colors.backgroundAlt }}>
                    <AppText className="text-lg font-bold" color={colors.textPrimary}>
                        Room Settings
                    </AppText>
                    <AppText className="mt-1 text-sm" color={colors.textSecondary}>
                        Update metadata, visibility, pricing, and moderation controls.
                    </AppText>
                </View>

                <View className="mt-4">
                    <AppText className="mb-1 text-sm font-semibold" color={colors.textPrimary}>
                        Name
                    </AppText>
                    <TextInput
                        value={name}
                        onChangeText={setName}
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
                        placeholderTextColor={placeholderColor}
                        style={{
                            borderColor: colors.border,
                            backgroundColor: colors.background,
                            borderWidth: 1,
                            borderRadius: 12,
                            color: colors.textPrimary,
                            paddingHorizontal: 12,
                            paddingVertical: 12,
                            minHeight: 90,
                            textAlignVertical: 'top',
                        }}
                    />
                </View>

                <View className="mt-3">
                    <AppText className="mb-1 text-sm font-semibold" color={colors.textPrimary}>
                        Entry Fee
                    </AppText>
                    <TextInput
                        value={entryFee}
                        onChangeText={(value) => setEntryFee(sanitizeMoneyInput(value))}
                        keyboardType="decimal-pad"
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
                        placeholderTextColor={placeholderColor}
                        style={{
                            borderColor: colors.border,
                            backgroundColor: colors.background,
                            borderWidth: 1,
                            borderRadius: 12,
                            color: colors.textPrimary,
                            paddingHorizontal: 12,
                            paddingVertical: 12,
                            minHeight: 75,
                            textAlignVertical: 'top',
                        }}
                    />
                </View>

                <View className="mt-3 rounded-xl border px-4 py-3" style={{ borderColor: colors.border, backgroundColor: colors.backgroundAlt }}>
                    <View className="mb-3 flex-row items-center justify-between">
                        <AppText className="text-sm font-semibold" color={colors.textPrimary}>
                            Public Listing
                        </AppText>
                        <Switch
                            value={isPublic}
                            onValueChange={setIsPublic}
                            trackColor={{ false: colors.border, true: `${colors.accent}60` }}
                            thumbColor={isPublic ? colors.accent : colors.background}
                        />
                    </View>

                    <View className="flex-row items-center justify-between">
                        <AppText className="text-sm font-semibold" color={colors.textPrimary}>
                            Allow Tips
                        </AppText>
                        <Switch
                            value={allowTips}
                            onValueChange={setAllowTips}
                            trackColor={{ false: colors.border, true: `${colors.accent}60` }}
                            thumbColor={allowTips ? colors.accent : colors.background}
                        />
                    </View>
                </View>

                {validation ? (
                    <View className="mt-3 rounded-xl border px-3 py-3" style={{ borderColor: `${colors.error}50`, backgroundColor: `${colors.error}15` }}>
                        <AppText className="text-sm" color={colors.error}>
                            {validation}
                        </AppText>
                    </View>
                ) : null}

                <AppButton
                    title="Save Settings"
                    loading={saving}
                    disabled={Boolean(validation) || saving}
                    onClick={() => {
                        void handleSave();
                    }}
                    style={{ marginTop: 12 }}
                />

                <View className="mt-5 rounded-2xl border px-4 py-4" style={{ borderColor: colors.border, backgroundColor: colors.backgroundAlt }}>
                    <View className="flex-row items-center justify-between">
                        <AppText className="text-base font-bold" color={colors.textPrimary}>
                            Promo Codes
                        </AppText>
                        <Pressable
                            onPress={openCreateCodeModal}
                            className="rounded-full border px-3 py-1"
                            style={{ borderColor: colors.border, backgroundColor: colors.background }}
                            accessibilityRole="button"
                            accessibilityLabel="Create promo code"
                        >
                            <AppText className="text-xs font-semibold" color={colors.textPrimary}>
                                New Code
                            </AppText>
                        </Pressable>
                    </View>

                    <View className="mt-3">
                        {codes.length === 0 ? (
                            <AppText className="text-sm" color={colors.textSecondary}>
                                No promo codes yet.
                            </AppText>
                        ) : (
                            codes.map((code) => (
                                <View
                                    key={code.id}
                                    className="mb-2 rounded-xl border px-3 py-3"
                                    style={{ borderColor: colors.border, backgroundColor: colors.background }}
                                >
                                    <View className="flex-row items-center justify-between">
                                        <View className="flex-1 pr-2">
                                                <AppText className="text-sm font-semibold" color={colors.textPrimary}>
                                                    {code.label}
                                                </AppText>
                                            <AppText className="text-xs" color={colors.textSecondary}>
                                                {code.code} • {code.discountType}
                                                {code.discountType !== 'free' ? ` (${code.discountAmount})` : ''}
                                            </AppText>
                                            <AppText className="text-xs" color={colors.textSecondary}>
                                                Uses: {code.usedCount}/{code.maxUses ?? 'Unlimited'} • {formatDate(code.expiresAt)}
                                            </AppText>
                                        </View>
                                        <View className="flex-row">
                                            <Pressable
                                                onPress={() => openEditCodeModal(code)}
                                                className="mr-2 rounded-lg border px-2 py-2"
                                                style={{ borderColor: colors.border, backgroundColor: colors.backgroundAlt }}
                                                accessibilityRole="button"
                                                accessibilityLabel={`Edit promo code ${code.code}`}
                                            >
                                                <AppText className="text-xs font-semibold" color={colors.textPrimary}>
                                                    Edit
                                                </AppText>
                                            </Pressable>
                                            <Pressable
                                                onPress={() => {
                                                    void handleToggleCode(code);
                                                }}
                                                className="mr-2 rounded-lg border px-2 py-2"
                                                style={{ borderColor: colors.border, backgroundColor: colors.backgroundAlt }}
                                                accessibilityRole="button"
                                                accessibilityLabel={`${code.isActive ? 'Disable' : 'Enable'} code ${code.code}`}
                                            >
                                                <AppText className="text-xs font-semibold" color={colors.textPrimary}>
                                                    {code.isActive ? 'Disable' : 'Enable'}
                                                </AppText>
                                            </Pressable>
                                            <Pressable
                                                onPress={() => {
                                                    void handleViewCodeStats(code);
                                                }}
                                                className="rounded-lg border px-2 py-2"
                                                style={{ borderColor: colors.border, backgroundColor: colors.backgroundAlt }}
                                                accessibilityRole="button"
                                                accessibilityLabel={`View stats for ${code.code}`}
                                            >
                                                <AppText className="text-xs font-semibold" color={colors.textPrimary}>
                                                    Stats
                                                </AppText>
                                            </Pressable>
                                            <Pressable
                                                onPress={() => {
                                                    void handleDeleteCode(code);
                                                }}
                                                className="ml-2 rounded-lg border px-2 py-2"
                                                style={{ borderColor: `${colors.error}66`, backgroundColor: `${colors.error}14` }}
                                                accessibilityRole="button"
                                                accessibilityLabel={`Delete promo code ${code.code}`}
                                            >
                                                <AppText className="text-xs font-semibold" color={colors.error}>
                                                    Delete
                                                </AppText>
                                            </Pressable>
                                        </View>
                                    </View>
                                </View>
                            ))
                        )}
                    </View>
                </View>

                <View className="mt-5 rounded-2xl border px-4 py-4" style={{ borderColor: `${colors.warning}60`, backgroundColor: `${colors.warning}12` }}>
                    <AppText className="text-base font-bold" color={colors.warning}>
                        Danger Zone
                    </AppText>
                    <AppText className="mt-1 text-sm" color={colors.textSecondary}>
                        Permanently delete this room.
                    </AppText>

                    <View className="mt-3">
                        <Pressable
                            onPress={() => {
                                Alert.alert(
                                    'Delete room?',
                                    'This action is permanent and cannot be undone.',
                                    [
                                        {
                                            text: 'Cancel',
                                            style: 'cancel',
                                        },
                                        {
                                            text: 'Delete',
                                            style: 'destructive',
                                            onPress: () => {
                                                void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
                                                void handleDeleteRoom();
                                            },
                                        },
                                    ]
                                );
                            }}
                            className="rounded-xl border py-3"
                            style={{ borderColor: `${colors.error}60`, backgroundColor: `${colors.error}12` }}
                            accessibilityRole="button"
                            accessibilityLabel="Delete room permanently"
                        >
                            <AppText className="text-center text-sm font-semibold" color={colors.error}>
                                Delete Room
                            </AppText>
                        </Pressable>
                    </View>
                </View>

                {selectedCode ? (
                    <View className="mt-4 rounded-xl border px-3 py-3" style={{ borderColor: colors.border, backgroundColor: colors.backgroundAlt }}>
                        <AppText className="text-sm font-semibold" color={colors.textPrimary}>
                            Last Viewed Code
                        </AppText>
                        <AppText className="mt-1 text-xs" color={colors.textSecondary}>
                            {selectedCode.code} • {selectedCode.label}
                        </AppText>
                    </View>
                ) : null}
            </ScrollView>

            <AppModal visible={showCodeModal} onClose={() => setShowCodeModal(false)} title={editingCodeId ? 'Edit Promo Code' : 'Create Promo Code'}>
                <View>
                    <View className="rounded-xl border px-3" style={{ borderColor: colors.border, backgroundColor: colors.backgroundAlt }}>
                        <TextInput
                            value={codeLabel}
                            onChangeText={setCodeLabel}
                            placeholder="Code label"
                            placeholderTextColor={placeholderColor}
                            style={{ color: colors.textPrimary, paddingVertical: 12 }}
                            accessibilityLabel="Code label"
                        />
                    </View>

                    <View className="mt-2 rounded-xl border px-3" style={{ borderColor: colors.border, backgroundColor: colors.backgroundAlt }}>
                        <TextInput
                            value={codeCampus}
                            onChangeText={setCodeCampus}
                            placeholder="Campus (optional)"
                            placeholderTextColor={placeholderColor}
                            style={{ color: colors.textPrimary, paddingVertical: 12 }}
                            accessibilityLabel="Campus"
                        />
                    </View>

                    <View className="mt-2 flex-row flex-wrap">
                        {CODE_TYPES.map((option) => {
                            const active = codeType === option.value;
                            return (
                                <Pressable
                                    key={option.value}
                                    onPress={() => setCodeType(option.value)}
                                    className="mb-2 mr-2 rounded-full border px-3 py-2"
                                    style={{ borderColor: active ? colors.accent : colors.border, backgroundColor: active ? `${colors.accent}20` : colors.background }}
                                    accessibilityRole="button"
                                    accessibilityLabel={`Select ${option.label} discount`}
                                >
                                    <AppText className="text-xs font-semibold" color={active ? colors.accent : colors.textPrimary}>
                                        {option.label}
                                    </AppText>
                                </Pressable>
                            );
                        })}
                    </View>

                    {codeType !== 'free' ? (
                        <View className="mt-1 rounded-xl border px-3" style={{ borderColor: colors.border, backgroundColor: colors.backgroundAlt }}>
                            <TextInput
                                value={codeAmount}
                                onChangeText={setCodeAmount}
                                keyboardType="decimal-pad"
                                placeholder={codeType === 'percent' ? 'Discount percent' : 'Discount amount GHS'}
                                placeholderTextColor={placeholderColor}
                                style={{ color: colors.textPrimary, paddingVertical: 12 }}
                                accessibilityLabel="Discount amount"
                            />
                        </View>
                    ) : null}

                    <View className="mt-2 rounded-xl border px-3" style={{ borderColor: colors.border, backgroundColor: colors.backgroundAlt }}>
                        <TextInput
                            value={codeMaxUses}
                            onChangeText={setCodeMaxUses}
                            keyboardType="number-pad"
                            placeholder="Max uses"
                            placeholderTextColor={placeholderColor}
                            style={{ color: colors.textPrimary, paddingVertical: 12 }}
                            accessibilityLabel="Maximum uses"
                        />
                    </View>

                    <View className="mt-2 rounded-xl border px-3" style={{ borderColor: colors.border, backgroundColor: colors.backgroundAlt }}>
                        <TextInput
                            value={codeExpiresAt}
                            onChangeText={setCodeExpiresAt}
                            placeholder="Expiry date ISO (optional)"
                            placeholderTextColor={placeholderColor}
                            style={{ color: colors.textPrimary, paddingVertical: 12 }}
                            accessibilityLabel="Expiry date"
                        />
                    </View>

                    <AppButton title={editingCodeId ? 'Save Promo Code' : 'Create Promo Code'} onClick={() => void handleSaveCode()} style={{ marginTop: 12 }} />
                </View>
            </AppModal>
        </Screen>
    );
}
