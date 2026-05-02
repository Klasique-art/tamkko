import { Ionicons } from '@expo/vector-icons';
import { Href, router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import * as VideoThumbnails from 'expo-video-thumbnails';
import React from 'react';
import { Pressable, ScrollView, TextInput, View } from 'react-native';

import { CreateMediaPreview, CreateVisibilitySelector } from '@/components/create';
import AppSwitch from '@/components/ui/AppSwitch';
import AppText from '@/components/ui/AppText';
import Screen from '@/components/ui/Screen';
import { useColors } from '@/config/colors';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { CREATE_MAX_CAPTION_LENGTH, CREATE_MAX_RECORDING_SECONDS } from '@/data/mock';
import { mockVideoManagementService } from '@/lib/services/mockVideoManagementService';
import { CreateDraft } from '@/types/create.types';

const initialDraft: CreateDraft = {
    media: null,
    caption: '',
    visibility: 'public',
    allowComments: true,
    trimDurationSeconds: CREATE_MAX_RECORDING_SECONDS,
    imageFilter: 'original',
};

export default function UploadScreen() {
    const colors = useColors();
    const { showToast } = useToast();
    const { user } = useAuth();
    const [draft, setDraft] = React.useState<CreateDraft>(initialDraft);
    const [title, setTitle] = React.useState('');
    const [isSubmitting, setIsSubmitting] = React.useState(false);

    const pickMedia = React.useCallback(async (fromCamera: boolean) => {
        const permission = fromCamera
            ? await ImagePicker.requestCameraPermissionsAsync()
            : await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (!permission.granted) {
            showToast(fromCamera ? 'Camera permission is required.' : 'Gallery permission is required.', { variant: 'warning' });
            return;
        }

        const result = fromCamera
            ? await ImagePicker.launchCameraAsync({
                mediaTypes: ['images', 'videos'],
                quality: 0.85,
                videoMaxDuration: CREATE_MAX_RECORDING_SECONDS,
            })
            : await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images', 'videos'],
                quality: 0.85,
                videoMaxDuration: CREATE_MAX_RECORDING_SECONDS,
            });

        if (result.canceled || !result.assets?.length) return;
        const asset = result.assets[0];
        if (!asset) return;

        if (asset.type === 'video' && (asset.duration ?? 0) > CREATE_MAX_RECORDING_SECONDS * 1000) {
            showToast(`Please use a video up to ${CREATE_MAX_RECORDING_SECONDS} seconds.`, { variant: 'warning' });
            return;
        }

        let thumbnailUri: string | undefined;
        if (asset.type === 'video') {
            try {
                const thumb = await VideoThumbnails.getThumbnailAsync(asset.uri, { time: 400 });
                thumbnailUri = thumb.uri;
            } catch {
                thumbnailUri = undefined;
            }
        }

        setDraft((current) => ({
            ...current,
            media: {
                uri: asset.uri,
                type: asset.type === 'video' ? 'video' : 'image',
                fileName: asset.fileName,
                fileSize: asset.fileSize,
                width: asset.width,
                height: asset.height,
                durationMs: asset.duration ?? undefined,
                thumbnailUri,
            },
        }));
    }, [showToast]);

    const creatorHandle = React.useMemo(() => {
        const base = user?.first_name?.trim() || user?.email?.split('@')[0] || 'creator';
        return `@${base.toLowerCase().replace(/\s+/g, '.')}`;
    }, [user?.email, user?.first_name]);

    const startUpload = React.useCallback(async () => {
        if (!draft.media) {
            showToast('Select media before upload.', { variant: 'warning' });
            return;
        }
        if (!title.trim()) {
            showToast('Add a title before upload.', { variant: 'warning' });
            return;
        }

        setIsSubmitting(true);
        const job = await mockVideoManagementService.createUploadJob({
            creatorUsername: creatorHandle,
            draft: {
                ...draft,
                caption: title.trim() + (draft.caption.trim() ? `\n${draft.caption.trim()}` : ''),
            },
        });
        setIsSubmitting(false);

        router.push(`/video/upload-progress?jobId=${encodeURIComponent(job.id)}` as Href);
    }, [creatorHandle, draft, showToast, title]);

    return (
        <Screen title="Upload Video" className="pt-3">
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
                <View className="rounded-3xl border p-4" style={{ borderColor: colors.border, backgroundColor: colors.backgroundAlt }}>
                    <AppText className="text-lg font-bold" color={colors.textPrimary}>Upload Manager</AppText>
                    <AppText className="mt-1 text-sm" color={colors.textSecondary}>
                        Upload media, set visibility, and track progress until the post goes live.
                    </AppText>
                </View>

                <View className="mt-4">
                    <CreateMediaPreview
                        media={draft.media}
                        imageFilter={draft.imageFilter}
                        onClear={() => setDraft((current) => ({ ...current, media: null }))}
                        onPickFromGallery={() => void pickMedia(false)}
                        onOpenCamera={() => void pickMedia(true)}
                    />
                </View>

                <View className="mt-4 rounded-2xl border p-4" style={{ borderColor: colors.border, backgroundColor: colors.backgroundAlt }}>
                    <AppText className="text-sm font-semibold" color={colors.textPrimary}>Title</AppText>
                    <View className="mt-2 rounded-xl border px-3" style={{ borderColor: colors.border, backgroundColor: colors.background }}>
                        <TextInput
                            value={title}
                            onChangeText={setTitle}
                            placeholder="Post title"
                            placeholderTextColor={colors.textSecondary}
                            maxLength={70}
                            style={{ color: colors.textPrimary, paddingVertical: 12 }}
                            accessibilityLabel="Post title"
                        />
                    </View>

                    <AppText className="mt-3 text-sm font-semibold" color={colors.textPrimary}>Caption</AppText>
                    <View className="mt-2 rounded-xl border px-3" style={{ borderColor: colors.border, backgroundColor: colors.background }}>
                        <TextInput
                            value={draft.caption}
                            onChangeText={(next) => setDraft((current) => ({ ...current, caption: next.slice(0, CREATE_MAX_CAPTION_LENGTH) }))}
                            placeholder="Write a caption"
                            placeholderTextColor={colors.textSecondary}
                            multiline
                            maxLength={CREATE_MAX_CAPTION_LENGTH}
                            style={{ color: colors.textPrimary, minHeight: 88, textAlignVertical: 'top', paddingVertical: 10 }}
                            accessibilityLabel="Post caption"
                        />
                    </View>
                    <AppText className="mt-1 text-[11px]" color={colors.textSecondary}>
                        {draft.caption.length}/{CREATE_MAX_CAPTION_LENGTH}
                    </AppText>
                </View>

                <View className="mt-4 rounded-2xl border p-4" style={{ borderColor: colors.border, backgroundColor: colors.backgroundAlt }}>
                    <CreateVisibilitySelector
                        value={draft.visibility}
                        onChange={(value) => setDraft((current) => ({ ...current, visibility: value }))}
                    />

                    <View className="mt-4 flex-row items-center justify-between rounded-xl border px-3 py-3" style={{ borderColor: colors.border, backgroundColor: colors.background }}>
                        <View className="pr-2">
                            <AppText className="text-sm font-semibold" color={colors.textPrimary}>Allow comments</AppText>
                            <AppText className="mt-1 text-xs" color={colors.textSecondary}>Enable discussion on this post.</AppText>
                        </View>
                        <AppSwitch
                            value={draft.allowComments}
                            onValueChange={(next) => setDraft((current) => ({ ...current, allowComments: next }))}
                            accessibilityRole="switch"
                            accessibilityLabel="Allow comments"
                            accessibilityState={{ checked: draft.allowComments }}
                        />
                    </View>
                </View>

                <View className="mt-4 flex-row">
                    <Pressable
                        onPress={() => router.push('/video/upload-progress' as Href)}
                        className="mr-2 flex-1 rounded-xl border py-3"
                        style={{ borderColor: colors.border, backgroundColor: colors.backgroundAlt }}
                        accessibilityRole="button"
                        accessibilityLabel="Open upload progress history"
                    >
                        <View className="flex-row items-center justify-center">
                            <Ionicons name="time-outline" size={16} color={colors.textPrimary} />
                            <AppText className="ml-1 text-sm font-semibold" color={colors.textPrimary}>Upload History</AppText>
                        </View>
                    </Pressable>
                    <Pressable
                        onPress={() => void startUpload()}
                        disabled={isSubmitting}
                        className="flex-1 rounded-xl border py-3"
                        style={{ borderColor: colors.border, backgroundColor: colors.backgroundAlt, opacity: isSubmitting ? 0.7 : 1 }}
                        accessibilityRole="button"
                        accessibilityLabel="Start upload"
                    >
                        <AppText className="text-center text-sm font-semibold" color={colors.textPrimary}>
                            {isSubmitting ? 'Starting...' : 'Start Upload'}
                        </AppText>
                    </Pressable>
                </View>
            </ScrollView>
        </Screen>
    );
}
