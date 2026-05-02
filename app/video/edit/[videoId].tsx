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
import { myVideosService } from '@/lib/services/myVideosService';
import { CreateVisibility } from '@/types/create.types';
import { VideoItem } from '@/types/video.types';

const toCreateVisibility = (value?: VideoItem['postVisibility']): CreateVisibility => {
    if (value === 'followers_only') return 'followers_only';
    if (value === 'premium') return 'premium';
    if (value === 'private') return 'private';
    return 'public';
};

const toBackendVisibility = (value: CreateVisibility): 'public' | 'paid' | 'followers_only' | 'private' => {
    if (value === 'premium') return 'paid';
    return value;
};

export default function EditVideoScreen() {
    const colors = useColors();
    const { showToast } = useToast();
    const { videoId } = useLocalSearchParams<{ videoId: string }>();
    const safeVideoId = videoId ?? '';

    const [video, setVideo] = React.useState<VideoItem | null>(null);
    const [caption, setCaption] = React.useState('');
    const [visibility, setVisibility] = React.useState<CreateVisibility>('public');
    const [allowComments, setAllowComments] = React.useState(true);
    const [saving, setSaving] = React.useState(false);
    const screenTitle = video?.mediaType === 'image' ? 'Edit Image' : 'Edit Video';

    React.useEffect(() => {
        const load = async () => {
            if (!safeVideoId) return;
            try {
                const item = await myVideosService.getMineVideo(safeVideoId);
                setVideo(item);
                if (!item) return;
                setCaption(item.caption ?? '');
                setVisibility(toCreateVisibility(item.postVisibility));
                setAllowComments(item.allowComments !== false);
            } catch {
                setVideo(null);
            }
        };
        void load();
    }, [safeVideoId]);

    const saveChanges = React.useCallback(async () => {
        if (!video) return;
        setSaving(true);
        let updated: VideoItem | null = null;
        try {
            updated = await myVideosService.updateMineVideo(video.id, {
                caption: caption.trim(),
                allow_comments: allowComments,
                visibility: toBackendVisibility(visibility),
            });
        } catch {
            updated = null;
        } finally {
            setSaving(false);
        }

        if (!updated) {
            showToast('Could not save changes.', { variant: 'error' });
            return;
        }
        setVideo(updated);
        showToast('Video updated successfully.', { variant: 'success', duration: 1500 });
    }, [allowComments, caption, showToast, video, visibility]);

    if (!video) {
        return (
            <Screen title="Edit Post">
                <View className="rounded-xl border p-4" style={{ borderColor: colors.border, backgroundColor: colors.backgroundAlt }}>
                    <AppText className="text-base font-bold" color={colors.textPrimary}>Post not found</AppText>
                    <AppText className="mt-1 text-sm" color={colors.textSecondary}>This post does not exist or you do not have access to edit it.</AppText>
                    <Pressable
                        onPress={() => router.push('/profile/content' as Href)}
                        className="mt-3 rounded-xl border py-3"
                        style={{ borderColor: colors.border, backgroundColor: colors.background }}
                    >
                        <AppText className="text-center text-sm font-semibold" color={colors.textPrimary}>Go To My Videos</AppText>
                    </Pressable>
                </View>
            </Screen>
        );
    }

    return (
        <Screen title={screenTitle} className="pt-3">
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
                <View className="mt-4 rounded-2xl border p-4" style={{ borderColor: colors.border, backgroundColor: colors.backgroundAlt }}>
                    <AppText className="text-sm font-semibold" color={colors.textPrimary}>Caption</AppText>
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

                <View className="mt-4">
                    <Pressable
                        onPress={() => void saveChanges()}
                        disabled={saving}
                        className="rounded-xl border py-3"
                        style={{ borderColor: colors.border, backgroundColor: colors.backgroundAlt, opacity: saving ? 0.7 : 1 }}
                    >
                        <AppText className="text-center text-sm font-semibold" color={colors.textPrimary}>{saving ? 'Saving...' : 'Save Changes'}</AppText>
                    </Pressable>
                </View>
            </ScrollView>
        </Screen>
    );
}
