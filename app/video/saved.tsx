import { FlashList } from '@shopify/flash-list';
import { Href, router } from 'expo-router';
import React from 'react';
import { Pressable, View, useWindowDimensions } from 'react-native';

import AppText from '@/components/ui/AppText';
import Screen from '@/components/ui/Screen';
import { useColors } from '@/config/colors';
import { useToast } from '@/context/ToastContext';
import { mockVideoManagementService } from '@/lib/services/mockVideoManagementService';
import { VideoItem } from '@/types/video.types';

const compact = (value: number) =>
    new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 }).format(value);

export default function SavedVideosScreen() {
    const colors = useColors();
    const { width } = useWindowDimensions();
    const { showToast } = useToast();

    const [items, setItems] = React.useState<VideoItem[]>([]);

    const load = React.useCallback(async () => {
        const next = await mockVideoManagementService.listSavedVideos();
        setItems(next);
    }, []);

    React.useEffect(() => {
        void load();
    }, [load]);

    const tileGap = 10;
    const tileWidth = Math.floor((width - 32 - tileGap) / 2);

    return (
        <Screen title="Saved Videos" className="pt-2">
            <FlashList
                data={items}
                keyExtractor={(item) => item.id}
                numColumns={2}
                contentContainerStyle={{ paddingBottom: 120 }}
                ListHeaderComponent={
                    <View className="mb-3 rounded-3xl border p-4" style={{ borderColor: colors.border, backgroundColor: colors.backgroundAlt }}>
                        <AppText className="text-lg font-bold" color={colors.textPrimary}>Saved Collection</AppText>
                        <AppText className="mt-1 text-sm" color={colors.textSecondary}>
                            Bookmarked posts for quick replay. Tap any card to open, or unsave directly.
                        </AppText>
                    </View>
                }
                renderItem={({ item, index }) => (
                    <View
                        className="mb-3 overflow-hidden rounded-2xl border"
                        style={{
                            width: tileWidth,
                            marginRight: index % 2 === 0 ? tileGap : 0,
                            borderColor: colors.border,
                            backgroundColor: colors.backgroundAlt,
                        }}
                    >
                        <Pressable
                            onPress={() => router.push(`/video/${encodeURIComponent(item.id)}` as Href)}
                            accessibilityRole="button"
                            accessibilityLabel={`Open ${item.title}`}
                        >
                            <View style={{ aspectRatio: 3 / 4, backgroundColor: '#111111', justifyContent: 'space-between' }}>
                                <View className="absolute inset-0" style={{ backgroundColor: 'rgba(255,255,255,0.02)' }} />
                                <View className="absolute bottom-0 left-0 right-0 p-2" style={{ backgroundColor: 'rgba(0,0,0,0.38)' }}>
                                    <View className="flex-row items-center justify-between">
                                        <AppText className="text-[11px] font-semibold" color="#FFFFFF">{compact(item.likesCount)} likes</AppText>
                                        <AppText className="text-[11px] font-semibold" color="#FFFFFF">{compact(item.commentsCount)} comments</AppText>
                                    </View>
                                </View>
                            </View>
                        </Pressable>

                        <View className="px-3 pb-3 pt-2">
                            <AppText className="text-sm font-bold" color={colors.textPrimary} numberOfLines={1}>{item.title}</AppText>
                            <AppText className="mt-1 text-xs" color={colors.textSecondary} numberOfLines={1}>{item.creatorUsername}</AppText>

                            <View className="mt-2 flex-row">
                                <Pressable
                                    onPress={async () => {
                                        await mockVideoManagementService.toggleSaved(item.id);
                                        await load();
                                        showToast('Removed from saved.', { variant: 'info', duration: 1400 });
                                    }}
                                    className="mr-2 flex-1 rounded-lg border py-2"
                                    style={{ borderColor: colors.border, backgroundColor: colors.background }}
                                    accessibilityRole="button"
                                    accessibilityLabel={`Unsave ${item.title}`}
                                >
                                    <AppText className="text-center text-[11px] font-semibold" color={colors.textPrimary}>Unsave</AppText>
                                </Pressable>
                                <Pressable
                                    onPress={() => router.push(`/video/edit/${encodeURIComponent(item.id)}` as Href)}
                                    className="flex-1 rounded-lg border py-2"
                                    style={{ borderColor: colors.border, backgroundColor: colors.background }}
                                    accessibilityRole="button"
                                    accessibilityLabel={`Edit ${item.title}`}
                                >
                                    <AppText className="text-center text-[11px] font-semibold" color={colors.textPrimary}>Edit</AppText>
                                </Pressable>
                            </View>
                        </View>
                    </View>
                )}
                ListEmptyComponent={
                    <View className="rounded-xl border p-4" style={{ borderColor: colors.border, backgroundColor: colors.backgroundAlt }}>
                        <AppText className="text-base font-bold" color={colors.textPrimary}>No saved videos yet</AppText>
                        <AppText className="mt-1 text-sm" color={colors.textSecondary}>
                            Save posts from feed or details and they will appear here.
                        </AppText>
                        <Pressable
                            onPress={() => router.push('/(tabs)' as Href)}
                            className="mt-3 rounded-xl border py-3"
                            style={{ borderColor: colors.border, backgroundColor: colors.background }}
                            accessibilityRole="button"
                            accessibilityLabel="Go to home feed"
                        >
                            <AppText className="text-center text-sm font-semibold" color={colors.textPrimary}>Go to Feed</AppText>
                        </Pressable>
                    </View>
                }
            />
        </Screen>
    );
}
