import { Ionicons } from '@expo/vector-icons';
import { FlashList } from '@shopify/flash-list';
import { Href, router } from 'expo-router';
import React, { useMemo } from 'react';
import { Pressable, View } from 'react-native';

import AppText from '@/components/ui/AppText';
import Screen from '@/components/ui/Screen';
import { useColors } from '@/config/colors';
import { getFollowedCreators } from '@/data/mock/following';
import { mockVideos } from '@/data/mock';
import { VideoItem } from '@/types/video.types';

export default function ExploreFeedScreen() {
    const colors = useColors();
    const followingCreators = useMemo(() => getFollowedCreators(), []);

    const videos = useMemo(
        () => mockVideos.filter((video) => !followingCreators.has(video.creatorUsername)),
        [followingCreators]
    );

    const creators = useMemo(
        () => Array.from(new Set(videos.map((video) => video.creatorUsername))),
        [videos]
    );

    const renderTile = ({ item }: { item: VideoItem }) => (
        <Pressable
            onPress={() => router.push(`/video/${encodeURIComponent(item.id)}` as Href)}
            className="mb-2 overflow-hidden rounded-xl"
            style={{ backgroundColor: colors.backgroundAlt, width: '32%' }}
            accessibilityRole="button"
            accessibilityLabel={`Open ${item.title}`}
        >
            <View className="items-center justify-center" style={{ aspectRatio: 9 / 14, backgroundColor: '#111111' }}>
                <Ionicons name="play" size={20} color="#FFFFFF" />
            </View>
            <View className="px-2 py-2">
                <AppText className="text-xs font-semibold" color={colors.textPrimary} numberOfLines={1}>
                    {item.title}
                </AppText>
                <AppText className="text-[10px]" color={colors.textSecondary} numberOfLines={1}>
                    {item.creatorUsername}
                </AppText>
            </View>
        </Pressable>
    );

    return (
        <Screen title="Explore" className="pt-2">
            <FlashList
                data={videos}
                keyExtractor={(item) => item.id}
                numColumns={3}
                renderItem={renderTile}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 120 }}
                ItemSeparatorComponent={() => <View style={{ height: 0 }} />}
                ListHeaderComponent={
                    <View>
                        <View className="rounded-2xl border p-4" style={{ borderColor: colors.border, backgroundColor: colors.backgroundAlt }}>
                            <AppText className="text-base font-bold" color={colors.textPrimary}>
                                Discover Outside Your Algorithm
                            </AppText>
                            <AppText className="mt-1 text-sm" color={colors.textSecondary}>
                                Videos and creators beyond your current following feed.
                            </AppText>
                        </View>

                        <View className="mt-3 flex-row flex-wrap">
                            {creators.map((creator) => (
                                <Pressable
                                    key={creator}
                                    onPress={() => router.push(`/video/creator/${encodeURIComponent(creator.replace(/^@/, ''))}` as Href)}
                                    className="mb-2 mr-2 rounded-full border px-3 py-1.5"
                                    style={{ borderColor: colors.border, backgroundColor: colors.backgroundAlt }}
                                    accessibilityRole="button"
                                    accessibilityLabel={`Open ${creator}`}
                                >
                                    <AppText className="text-xs font-semibold" color={colors.textPrimary}>{creator}</AppText>
                                </Pressable>
                            ))}
                        </View>

                        <AppText className="mb-2 mt-1 text-xs uppercase" color={colors.textSecondary}>
                            Explore Videos
                        </AppText>
                    </View>
                }
                ListEmptyComponent={
                    <View className="rounded-xl border p-4" style={{ borderColor: colors.border, backgroundColor: colors.backgroundAlt }}>
                        <AppText className="text-sm" color={colors.textSecondary}>
                            No explore videos available right now.
                        </AppText>
                    </View>
                }
            />
        </Screen>
    );
}
