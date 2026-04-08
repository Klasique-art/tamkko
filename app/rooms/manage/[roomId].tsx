import * as Haptics from 'expo-haptics';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import { Pressable, ScrollView, Switch, TextInput, View } from 'react-native';

import AppButton from '@/components/ui/AppButton';
import AppModal from '@/components/ui/AppModal';
import AppText from '@/components/ui/AppText';
import Screen from '@/components/ui/Screen';
import { useColors } from '@/config/colors';
import { useToast } from '@/context/ToastContext';
import { mockRoomCommunityService } from '@/lib/services/mockRoomCommunityService';
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

export default function RoomManageScreen() {
    const colors = useColors();
    const { showToast } = useToast();
    const { roomId } = useLocalSearchParams<{ roomId: string }>();

    const [room, setRoom] = useState<VipRoom | null>(null);
    const [codes, setCodes] = useState<RoomCreatorCode[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [entryFee, setEntryFee] = useState('0');
    const [capacity, setCapacity] = useState('500');
    const [welcomeMessage, setWelcomeMessage] = useState('');
    const [isPublic, setIsPublic] = useState(true);
    const [allowTips, setAllowTips] = useState(true);

    const [showCodeModal, setShowCodeModal] = useState(false);
    const [selectedCode, setSelectedCode] = useState<RoomCreatorCode | null>(null);
    const [codeLabel, setCodeLabel] = useState('Campus Promo');
    const [codeCampus, setCodeCampus] = useState('');
    const [codeType, setCodeType] = useState<RoomCreatorCode['discountType']>('free');
    const [codeAmount, setCodeAmount] = useState('0');
    const [codeMaxUses, setCodeMaxUses] = useState('200');
    const [codeExpiresAt, setCodeExpiresAt] = useState('');

    const load = useCallback(async () => {
        if (!roomId) return;
        setLoading(true);
        const [nextRoom, nextCodes] = await Promise.all([
            mockRoomCommunityService.getRoomById(roomId),
            mockRoomCommunityService.listCreatorCodes(roomId),
        ]);

        setRoom(nextRoom);
        setCodes(nextCodes);

        if (nextRoom) {
            setName(nextRoom.name);
            setDescription(nextRoom.description);
            setEntryFee(nextRoom.entryFee.toFixed(2));
            setCapacity(String(nextRoom.capacity));
            setWelcomeMessage(nextRoom.welcomeMessage || '');
            setIsPublic(nextRoom.isPublic);
            setAllowTips(nextRoom.allowTips);
        }
        setLoading(false);
    }, [roomId]);

    React.useEffect(() => {
        void load();
    }, [load]);

    const validation = useMemo(() => {
        if (!room) return 'Room not available.';
        const fee = Number(entryFee);
        const cap = Number(capacity);
        if (name.trim().length < 3) return 'Name must be at least 3 characters.';
        if (description.trim().length < 10) return 'Description must be at least 10 characters.';
        if (!Number.isFinite(fee) || fee < 0) return 'Entry fee must be a valid number.';
        if (!Number.isFinite(cap) || cap < room.memberCount) return `Capacity cannot be below current members (${room.memberCount}).`;
        if (cap > 2000) return 'Capacity should be 2000 or less in MVP.';
        return null;
    }, [capacity, description, entryFee, name, room]);

    const handleSave = async () => {
        if (!room || validation || saving) return;
        setSaving(true);
        const updated = await mockRoomCommunityService.updateRoomSettings(room.id, {
            name,
            description,
            entryFee: Number(Number(entryFee).toFixed(2)),
            capacity: Math.floor(Number(capacity)),
            welcomeMessage,
            isPublic,
            allowTips,
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

    const handleCloseRoom = async () => {
        if (!room) return;
        const updated = await mockRoomCommunityService.closeRoom(room.id, 'Session closed by creator.');
        if (!updated) return;
        setRoom(updated);
        showToast('Room closed for now.', { variant: 'warning', duration: 2200 });
    };

    const handleDeleteRoom = async () => {
        if (!room) return;
        const deleted = await mockRoomCommunityService.deleteRoom(room.id);
        if (!deleted) {
            showToast('Unable to delete room.', { variant: 'error', duration: 2200 });
            return;
        }
        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        showToast('Room deleted permanently.', { variant: 'warning', duration: 2200 });
        router.replace('/rooms');
    };

    const handleGenerateCode = async () => {
        if (!roomId) return;

        const discountAmount = Number(codeAmount);
        const maxUses = Number(codeMaxUses);

        const created = await mockRoomCommunityService.generateCreatorCode(roomId, {
            label: codeLabel,
            campus: codeCampus.trim() || null,
            discountType: codeType,
            discountAmount: Number.isFinite(discountAmount) ? discountAmount : 0,
            maxUses: Number.isFinite(maxUses) ? Math.floor(maxUses) : null,
            expiresAt: codeExpiresAt.trim() || null,
        });

        setCodes((prev) => [created, ...prev]);
        setShowCodeModal(false);
        showToast(`Code ${created.code} created.`, { variant: 'success', duration: 2200 });
    };

    const handleToggleCode = async (code: RoomCreatorCode) => {
        if (!roomId) return;
        const next = await mockRoomCommunityService.setCreatorCodeActive(roomId, code.id, !code.isActive);
        if (!next) return;
        setCodes((prev) => prev.map((item) => (item.id === code.id ? next : item)));
    };

    const handleViewCodeStats = async (code: RoomCreatorCode) => {
        if (!roomId) return;
        const stats = await mockRoomCommunityService.getCreatorCodeStats(roomId, code.id);
        if (!stats) return;
        setSelectedCode(code);
        showToast(
            `${code.code}: ${stats.usesCount} uses, waived GHS ${stats.revenueWaivedGhs.toFixed(2)}`,
            { variant: 'info', duration: 3200 }
        );
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

    if (room.role !== 'creator') {
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
                        placeholderTextColor={colors.textSecondary}
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
                        placeholderTextColor={colors.textSecondary}
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

                <View className="mt-3 flex-row">
                    <View className="mr-2 flex-1">
                        <AppText className="mb-1 text-sm font-semibold" color={colors.textPrimary}>
                            Entry Fee
                        </AppText>
                        <TextInput
                            value={entryFee}
                            onChangeText={setEntryFee}
                            keyboardType="decimal-pad"
                            placeholderTextColor={colors.textSecondary}
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
                    <View className="flex-1">
                        <AppText className="mb-1 text-sm font-semibold" color={colors.textPrimary}>
                            Capacity
                        </AppText>
                        <TextInput
                            value={capacity}
                            onChangeText={setCapacity}
                            keyboardType="number-pad"
                            placeholderTextColor={colors.textSecondary}
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
                        placeholderTextColor={colors.textSecondary}
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
                            Creator Codes
                        </AppText>
                        <Pressable
                            onPress={() => setShowCodeModal(true)}
                            className="rounded-full border px-3 py-1"
                            style={{ borderColor: colors.border, backgroundColor: colors.background }}
                            accessibilityRole="button"
                            accessibilityLabel="Generate creator code"
                        >
                            <AppText className="text-xs font-semibold" color={colors.textPrimary}>
                                New Code
                            </AppText>
                        </Pressable>
                    </View>

                    <View className="mt-3">
                        {codes.length === 0 ? (
                            <AppText className="text-sm" color={colors.textSecondary}>
                                No creator codes yet.
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
                        Close or permanently delete this room.
                    </AppText>

                    <View className="mt-3 flex-row">
                        <Pressable
                            onPress={() => {
                                void Haptics.selectionAsync();
                                void handleCloseRoom();
                            }}
                            className="mr-2 flex-1 rounded-xl border py-3"
                            style={{ borderColor: `${colors.warning}60`, backgroundColor: `${colors.warning}12` }}
                            accessibilityRole="button"
                            accessibilityLabel="Close room"
                        >
                            <AppText className="text-center text-sm font-semibold" color={colors.warning}>
                                Close Room
                            </AppText>
                        </Pressable>

                        <Pressable
                            onPress={() => {
                                void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
                                void handleDeleteRoom();
                            }}
                            className="flex-1 rounded-xl border py-3"
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

            <AppModal visible={showCodeModal} onClose={() => setShowCodeModal(false)} title="Generate Creator Code">
                <View>
                    <View className="rounded-xl border px-3" style={{ borderColor: colors.border, backgroundColor: colors.backgroundAlt }}>
                        <TextInput
                            value={codeLabel}
                            onChangeText={setCodeLabel}
                            placeholder="Code label"
                            placeholderTextColor={colors.textSecondary}
                            style={{ color: colors.textPrimary, paddingVertical: 12 }}
                            accessibilityLabel="Code label"
                        />
                    </View>

                    <View className="mt-2 rounded-xl border px-3" style={{ borderColor: colors.border, backgroundColor: colors.backgroundAlt }}>
                        <TextInput
                            value={codeCampus}
                            onChangeText={setCodeCampus}
                            placeholder="Campus (optional)"
                            placeholderTextColor={colors.textSecondary}
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
                                placeholderTextColor={colors.textSecondary}
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
                            placeholderTextColor={colors.textSecondary}
                            style={{ color: colors.textPrimary, paddingVertical: 12 }}
                            accessibilityLabel="Maximum uses"
                        />
                    </View>

                    <View className="mt-2 rounded-xl border px-3" style={{ borderColor: colors.border, backgroundColor: colors.backgroundAlt }}>
                        <TextInput
                            value={codeExpiresAt}
                            onChangeText={setCodeExpiresAt}
                            placeholder="Expiry date ISO (optional)"
                            placeholderTextColor={colors.textSecondary}
                            style={{ color: colors.textPrimary, paddingVertical: 12 }}
                            accessibilityLabel="Expiry date"
                        />
                    </View>

                    <AppButton title="Generate Code" onClick={() => void handleGenerateCode()} style={{ marginTop: 12 }} />
                </View>
            </AppModal>
        </Screen>
    );
}
