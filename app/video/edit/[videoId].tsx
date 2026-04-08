import { Href, router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, TextInput, View } from 'react-native';

import { CreateVisibilitySelector } from '@/components/create';
import AppSwitch from '@/components/ui/AppSwitch';
import AppText from '@/components/ui/AppText';
import Screen from '@/components/ui/Screen';
import { useColors } from '@/config/colors';
import { useToast } from '@/context/ToastContext';
import { CREATE_MAX_CAPTION_LENGTH } from '@/data/mock';
import { mockVideoManagementService } from '@/lib/services/mockVideoManagementService';
import { CreateVisibility } from '@/types/create.types';
import { VideoItem } from '@/types/video.types';

const toCreateVisibility = (value?: VideoItem['postVisibility']): CreateVisibility => {
    if (value === 'followers_only') return 'followers_only';
    if (value === 'premium') return 'premium';
    if (value === 'private') return 'private';
    return 'public';
};

const toPostVisibility = (value: CreateVisibility): NonNullable<VideoItem['postVisibility']> => {
    if (value === 'followers_only') return 'followers_only';
    if (value === 'premium') return 'premium';
    if (value === 'private') return 'private';
    return 'public';
};

export default function EditVideoScreen() {
    const colors = useColors();
    const { showToast } = useToast();
    const { videoId } = useLocalSearchParams<{ videoId: string }>();
    const safeVideoId = videoId ?? '';

    const [video, setVideo] = React.useState<VideoItem | null>(null);
    const [title, setTitle] = React.useState('');
    const [caption, setCaption] = React.useState('');
    const [visibility, setVisibility] = React.useState<CreateVisibility>('public');
    const [allowComments, setAllowComments] = React.useState(true);
    const [saving, setSaving] = React.useState(false);

    React.useEffect(() => {
        const load = async () => {
            if (!safeVideoId) return;
            const item = await mockVideoManagementService.getVideoById(safeVideoId);
            setVideo(item);
            if (!item) return;
            setTitle(item.title);
            setCaption(item.caption ?? '');
            setVisibility(toCreateVisibility(item.postVisibility));
            setAllowComments(item.allowComments !== false);
        };
        void load();
    }, [safeVideoId]);

    const saveChanges = React.useCallback(async () => {
        if (!video) return;
        if (!title.trim()) {
            showToast('Title cannot be empty.', { variant: 'warning' });
            return;
        }
        setSaving(true);
        const updated = await mockVideoManagementService.updateVideoMetadata(video.id, {
            title: title.trim(),
            caption: caption.trim(),
            allowComments,
            postVisibility: toPostVisibility(visibility),
        });
        setSaving(false);

        if (!updated) {
            showToast('Could not save changes.', { variant: 'error' });
            return;
        }
        setVideo(updated);
        showToast('Video updated successfully.', { variant: 'success', duration: 1500 });
    }, [allowComments, caption, showToast, title, video, visibility]);

    if (!video) {
        return (
            <Screen title="Edit Video">
                <View className="rounded-xl border p-4" style={{ borderColor: colors.border, backgroundColor: colors.backgroundAlt }}>
                    <AppText className="text-base font-bold" color={colors.textPrimary}>Video not found</AppText>
                    <AppText className="mt-1 text-sm" color={colors.textSecondary}>This video may not exist in the current local feed store.</AppText>
                    <Pressable
                        onPress={() => router.push('/video/saved' as Href)}
                        className="mt-3 rounded-xl border py-3"
                        style={{ borderColor: colors.border, backgroundColor: colors.background }}
                    >
                        <AppText className="text-center text-sm font-semibold" color={colors.textPrimary}>Go to Saved Videos</AppText>
                    </Pressable>
                </View>
            </Screen>
        );
    }

    return (
        <Screen title="Edit Video" className="pt-3">
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
                <View className="rounded-2xl border p-4" style={{ borderColor: colors.border, backgroundColor: colors.backgroundAlt }}>
                    <AppText className="text-sm font-semibold" color={colors.textPrimary}>Editing</AppText>
                    <AppText className="mt-1 text-base font-bold" color={colors.textPrimary}>{video.title}</AppText>
                    <AppText className="mt-1 text-xs" color={colors.textSecondary}>{video.creatorUsername} - {video.id}</AppText>
                </View>

                <View className="mt-4 rounded-2xl border p-4" style={{ borderColor: colors.border, backgroundColor: colors.backgroundAlt }}>
                    <AppText className="text-sm font-semibold" color={colors.textPrimary}>Title</AppText>
                    <View className="mt-2 rounded-xl border px-3" style={{ borderColor: colors.border, backgroundColor: colors.background }}>
                        <TextInput
                            value={title}
                            onChangeText={setTitle}
                            maxLength={80}
                            placeholder="Video title"
                            placeholderTextColor={colors.textSecondary}
                            style={{ color: colors.textPrimary, paddingVertical: 12 }}
                            accessibilityLabel="Video title"
                        />
                    </View>

                    <AppText className="mt-3 text-sm font-semibold" color={colors.textPrimary}>Caption</AppText>
                    <View className="mt-2 rounded-xl border px-3" style={{ borderColor: colors.border, backgroundColor: colors.background }}>
                        <TextInput
                            value={caption}
                            onChangeText={(next) => setCaption(next.slice(0, CREATE_MAX_CAPTION_LENGTH))}
                            placeholder="Video caption"
                            placeholderTextColor={colors.textSecondary}
                            multiline
                            maxLength={CREATE_MAX_CAPTION_LENGTH}
                            style={{ color: colors.textPrimary, minHeight: 96, textAlignVertical: 'top', paddingVertical: 10 }}
                            accessibilityLabel="Video caption"
                        />
                    </View>
                    <AppText className="mt-1 text-[11px]" color={colors.textSecondary}>{caption.length}/{CREATE_MAX_CAPTION_LENGTH}</AppText>
                </View>

                <View className="mt-4 rounded-2xl border p-4" style={{ borderColor: colors.border, backgroundColor: colors.backgroundAlt }}>
                    <CreateVisibilitySelector value={visibility} onChange={setVisibility} />
                    <View className="mt-4 flex-row items-center justify-between rounded-xl border px-3 py-3" style={{ borderColor: colors.border, backgroundColor: colors.background }}>
                        <View className="pr-2">
                            <AppText className="text-sm font-semibold" color={colors.textPrimary}>Allow comments</AppText>
                            <AppText className="mt-1 text-xs" color={colors.textSecondary}>Turn discussion on or off.</AppText>
                        </View>
                        <AppSwitch
                            value={allowComments}
                            onValueChange={setAllowComments}
                            accessibilityRole="switch"
                            accessibilityLabel="Allow comments"
                            accessibilityState={{ checked: allowComments }}
                        />
                    </View>
                </View>

                <View className="mt-4 flex-row">
                    <Pressable
                        onPress={() => router.push(`/video/${encodeURIComponent(video.id)}` as Href)}
                        className="mr-2 flex-1 rounded-xl border py-3"
                        style={{ borderColor: colors.border, backgroundColor: colors.backgroundAlt }}
                    >
                        <AppText className="text-center text-sm font-semibold" color={colors.textPrimary}>Open Video</AppText>
                    </Pressable>
                    <Pressable
                        onPress={() => void saveChanges()}
                        disabled={saving}
                        className="flex-1 rounded-xl border py-3"
                        style={{ borderColor: colors.border, backgroundColor: colors.backgroundAlt, opacity: saving ? 0.7 : 1 }}
                    >
                        <AppText className="text-center text-sm font-semibold" color={colors.textPrimary}>{saving ? 'Saving...' : 'Save Changes'}</AppText>
                    </Pressable>
                </View>
            </ScrollView>
        </Screen>
    );
}
