import { useVideoPlayer, VideoView } from 'expo-video';
import React from 'react';
import { Pressable, ScrollView, View } from 'react-native';

import AppText from '@/components/ui/AppText';
import Screen from '@/components/ui/Screen';
import { useColors } from '@/config/colors';
import { mockTrendingHashtags, mockUsers, MOCK_TEST_VIDEO_SOURCE } from '@/data/mock';
import { useVideoFeedStore } from '@/lib/stores/videoFeedStore';

function DiscoverVideoCard({ title, creator }: { title: string; creator: string }) {
    const colors = useColors();
    const player = useVideoPlayer(MOCK_TEST_VIDEO_SOURCE, (videoPlayer) => {
        videoPlayer.muted = true;
        videoPlayer.pause();
        videoPlayer.currentTime = 0;
    });

    return (
        <View className="rounded-xl border p-2" style={{ borderColor: colors.border }}>
            <View className="overflow-hidden rounded-lg" style={{ backgroundColor: '#000000' }}>
                <VideoView
                    player={player}
                    style={{ width: '100%', aspectRatio: 1.3 }}
                    contentFit="cover"
                    nativeControls={false}
                    fullscreenOptions={{ enable: false }}
                />
            </View>
            <AppText className="mt-2 font-semibold" color={colors.textPrimary}>{title}</AppText>
            <AppText className="text-xs" color={colors.textSecondary}>{creator}</AppText>
        </View>
    );
}

export default function DiscoverTab() {
    const colors = useColors();
    const videos = useVideoFeedStore((state) => state.videos);

    return (
        <Screen className="pt-4">
            <ScrollView contentContainerStyle={{ paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
                <AppText className="text-2xl font-bold" color={colors.textPrimary}>Discover</AppText>
                <AppText className="mt-1 text-sm" color={colors.textSecondary}>Find trending creators, videos, and hashtags.</AppText>

                <View className="mt-5">
                    <AppText className="text-sm font-semibold" color={colors.textPrimary}>Trending Hashtags</AppText>
                    <View className="mt-2 flex-row flex-wrap gap-2">
                        {mockTrendingHashtags.map((tag) => (
                            <View key={tag} className="rounded-full border px-3 py-1" style={{ borderColor: colors.border }}>
                                <AppText className="text-xs" color={colors.textPrimary}>{tag}</AppText>
                            </View>
                        ))}
                    </View>
                </View>

                <View className="mt-6">
                    <AppText className="text-sm font-semibold" color={colors.textPrimary}>Top Creators</AppText>
                    <View className="mt-2 gap-2">
                        {mockUsers.map((creator) => (
                            <Pressable
                                key={creator.user_id}
                                className="rounded-xl border p-3"
                                style={{ borderColor: colors.border, backgroundColor: colors.backgroundAlt }}
                            >
                                <AppText className="font-semibold" color={colors.textPrimary}>
                                    {creator.first_name} {creator.last_name}
                                </AppText>
                                <AppText className="text-xs" color={colors.textSecondary}>@{creator.email.split('@')[0]}</AppText>
                            </Pressable>
                        ))}
                    </View>
                </View>

                <View className="mt-6">
                    <AppText className="text-sm font-semibold" color={colors.textPrimary}>Trending Videos</AppText>
                    <View className="mt-2 gap-2">
                        {videos.map((video) => (
                            <DiscoverVideoCard
                                key={video.id}
                                title={video.title}
                                creator={video.creatorUsername}
                            />
                        ))}
                    </View>
                </View>
            </ScrollView>
        </Screen>
    );
}
