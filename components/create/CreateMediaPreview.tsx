import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import React from 'react';
import { Pressable, View } from 'react-native';

import AppText from '@/components/ui/AppText';
import { useColors } from '@/config/colors';
import { CreateImageFilter, SelectedCreateMedia } from '@/types/create.types';

type CreateMediaPreviewProps = {
    media: SelectedCreateMedia | null;
    imageFilter: CreateImageFilter;
    onClear: () => void;
    onPickFromGallery: () => void;
    onOpenCamera: () => void;
};

const filterOverlayColor: Record<CreateImageFilter, string> = {
    original: 'transparent',
    mono: 'rgba(17,17,17,0.22)',
    warm: 'rgba(255,136,0,0.18)',
};

export default function CreateMediaPreview({
    media,
    imageFilter,
    onClear,
    onPickFromGallery,
    onOpenCamera,
}: CreateMediaPreviewProps) {
    const colors = useColors();

    return (
        <View
            className="rounded-3xl border p-4"
            style={{ borderColor: colors.border, backgroundColor: colors.backgroundAlt }}
        >
            {media ? (
                <View>
                    <View
                        className="relative overflow-hidden rounded-2xl"
                        style={{ backgroundColor: '#111111', aspectRatio: 9 / 14 }}
                    >
                        {media.type === 'image' ? (
                            <Image
                                source={{ uri: media.uri }}
                                contentFit="cover"
                                style={{ width: '100%', height: '100%' }}
                                accessibilityLabel="Selected image preview"
                            />
                        ) : media.thumbnailUri ? (
                            <Image
                                source={{ uri: media.thumbnailUri }}
                                contentFit="cover"
                                style={{ width: '100%', height: '100%' }}
                                accessibilityLabel="Selected video preview thumbnail"
                            />
                        ) : (
                            <View className="h-full w-full items-center justify-center">
                                <Ionicons name="videocam" size={40} color="#FFFFFF" />
                                <AppText className="mt-2 text-sm" color="#FFFFFF">
                                    Video ready to upload
                                </AppText>
                            </View>
                        )}

                        {media.type === 'image' && imageFilter !== 'original' ? (
                            <View
                                pointerEvents="none"
                                className="absolute inset-0"
                                style={{ backgroundColor: filterOverlayColor[imageFilter] }}
                            />
                        ) : null}

                        {media.type === 'video' ? (
                            <View className="absolute left-3 top-3 rounded-full bg-black/60 px-3 py-1">
                                <AppText className="text-xs font-semibold" color="#FFFFFF">
                                    VIDEO
                                </AppText>
                            </View>
                        ) : null}

                        <Pressable
                            onPress={onClear}
                            className="absolute right-3 top-3 h-8 w-8 items-center justify-center rounded-full bg-black/60"
                            accessibilityRole="button"
                            accessibilityLabel="Remove selected media"
                        >
                            <Ionicons name="close" size={18} color="#FFFFFF" />
                        </Pressable>
                    </View>
                </View>
            ) : (
                <View
                    className="items-center justify-center rounded-2xl border border-dashed px-4 py-10"
                    style={{ borderColor: colors.border, backgroundColor: colors.background }}
                >
                    <Ionicons name="images-outline" size={32} color={colors.textSecondary} />
                    <AppText className="mt-3 text-base font-semibold" color={colors.textPrimary}>
                        Start A New Post
                    </AppText>
                    <AppText className="mt-1 text-center text-sm" color={colors.textSecondary}>
                        Select one image or video from your gallery, or record up to 60 seconds.
                    </AppText>
                </View>
            )}

            <View className="mt-4 flex-row gap-3">
                <Pressable
                    className="flex-1 flex-row items-center justify-center rounded-xl border px-4 py-3"
                    style={{ borderColor: colors.border, backgroundColor: colors.background }}
                    onPress={onPickFromGallery}
                    accessibilityRole="button"
                    accessibilityLabel="Pick media from gallery"
                >
                    <Ionicons name="images-outline" size={18} color={colors.textPrimary} />
                    <AppText className="ml-2 text-sm font-semibold" color={colors.textPrimary}>
                        Gallery
                    </AppText>
                </Pressable>
                <Pressable
                    className="flex-1 flex-row items-center justify-center rounded-xl border px-4 py-3"
                    style={{ borderColor: colors.border, backgroundColor: colors.background }}
                    onPress={onOpenCamera}
                    accessibilityRole="button"
                    accessibilityLabel="Open camera to record"
                >
                    <Ionicons name="camera-outline" size={18} color={colors.textPrimary} />
                    <AppText className="ml-2 text-sm font-semibold" color={colors.textPrimary}>
                        Record
                    </AppText>
                </Pressable>
            </View>
        </View>
    );
}
