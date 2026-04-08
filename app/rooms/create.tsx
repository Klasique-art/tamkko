import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Switch, TextInput, View } from 'react-native';

import AppButton from '@/components/ui/AppButton';
import AppText from '@/components/ui/AppText';
import Screen from '@/components/ui/Screen';
import { useColors } from '@/config/colors';
import { useToast } from '@/context/ToastContext';
import { mockRoomCommunityService } from '@/lib/services/mockRoomCommunityService';

const MAX_CAPACITY = 2000;

const toNumber = (value: string) => {
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) return 0;
    return parsed;
};

export default function CreateRoomScreen() {
    const colors = useColors();
    const { showToast } = useToast();

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [entryFee, setEntryFee] = useState('0');
    const [capacity, setCapacity] = useState('500');
    const [welcomeMessage, setWelcomeMessage] = useState('Welcome to the room. Keep it respectful.');
    const [isPublic, setIsPublic] = useState(true);
    const [allowTips, setAllowTips] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const validation = useMemo(() => {
        const nextEntryFee = toNumber(entryFee);
        const nextCapacity = Math.floor(toNumber(capacity));

        if (name.trim().length < 3) return 'Room name must be at least 3 characters.';
        if (description.trim().length < 10) return 'Description must be at least 10 characters.';
        if (nextEntryFee < 0) return 'Entry fee cannot be negative.';
        if (nextEntryFee > 200) return 'Entry fee should be 200 GHS or less for MVP simulation.';
        if (nextCapacity < 10 || nextCapacity > MAX_CAPACITY) return `Capacity must be between 10 and ${MAX_CAPACITY}.`;
        return null;
    }, [capacity, description, entryFee, name]);

    const handleCreate = async () => {
        if (validation || isSubmitting) return;

        setIsSubmitting(true);
        const room = await mockRoomCommunityService.createRoom({
            name,
            description,
            entryFee: Number(toNumber(entryFee).toFixed(2)),
            capacity: Math.floor(toNumber(capacity)),
            isPublic,
            allowTips,
            welcomeMessage,
        });
        setIsSubmitting(false);

        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        showToast('Room created successfully.', { variant: 'success', duration: 2400 });
        router.replace(`/rooms/${room.id}`);
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
                            placeholderTextColor={colors.textSecondary}
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

                    <View className="mt-3 flex-row">
                        <View className="mr-2 flex-1">
                            <AppText className="mb-1 text-sm font-semibold" color={colors.textPrimary}>
                                Entry Fee (GHS)
                            </AppText>
                            <TextInput
                                value={entryFee}
                                onChangeText={setEntryFee}
                                keyboardType="decimal-pad"
                                placeholder="0.00"
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
                                accessibilityLabel="Entry fee"
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
                                placeholder="500"
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
                                accessibilityLabel="Room capacity"
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
                            placeholder="Optional message shown when members join"
                            placeholderTextColor={colors.textSecondary}
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
        </Screen>
    );
}
