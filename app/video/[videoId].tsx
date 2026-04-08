import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Href, router, useLocalSearchParams } from 'expo-router';
import { useVideoPlayer, VideoView } from 'expo-video';
import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';

import AppText from '@/components/ui/AppText';
import Screen from '@/components/ui/Screen';
import { useColors } from '@/config/colors';
import { useToast } from '@/context/ToastContext';
import { mockCreatorVideos, mockVideos } from '@/data/mock';
import { MOCK_TEST_VIDEO_SOURCE } from '@/data/mock/videos';

type SimulatedVideoDetail = {
    id: string;
    title: string;
    caption: string;
    creatorUsername: string;
    likesCount: number;
    commentsCount: number;
    viewsCount: number;
};

const defaultVideoDetail = (videoId: string): SimulatedVideoDetail => ({
    id: videoId,
    title: 'Creator Exclusive',
    caption: 'Simulated playback using local test video asset.',
    creatorUsername: '@creator',
    likesCount: 1200,
    commentsCount: 81,
    viewsCount: 54000,
});

export default function VideoDetailScreen() {
    const colors = useColors();
    const { showToast } = useToast();
    const { videoId } = useLocalSearchParams<{ videoId: string }>();
    const safeVideoId = videoId ?? 'video-sample';

    const detail = useMemo(() => {
        const feedMatch = mockVideos.find((item) => item.id === safeVideoId);
        if (feedMatch) {
            return {
                id: feedMatch.id,
                title: feedMatch.title,
                caption: feedMatch.caption ?? 'No caption',
                creatorUsername: feedMatch.creatorUsername,
                likesCount: feedMatch.likesCount,
                commentsCount: feedMatch.commentsCount,
                viewsCount: Math.max(22000, feedMatch.likesCount * 18),
            };
        }

        const creatorMatch = mockCreatorVideos.find((item) => item.id === safeVideoId);
        if (creatorMatch) {
            return {
                id: creatorMatch.id,
                title: creatorMatch.title,
                caption: `From creator profile • ${creatorMatch.visibility === 'locked' ? 'Subscriber video' : 'Public video'}`,
                creatorUsername: '@creator',
                likesCount: creatorMatch.likesCount,
                commentsCount: Math.floor(creatorMatch.likesCount * 0.08),
                viewsCount: creatorMatch.viewsCount,
            };
        }

        return defaultVideoDetail(safeVideoId);
    }, [safeVideoId]);

    const [isLiked, setIsLiked] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    const [likesCount, setLikesCount] = useState(detail.likesCount);

    const player = useVideoPlayer(MOCK_TEST_VIDEO_SOURCE, (videoPlayer) => {
        videoPlayer.loop = true;
        videoPlayer.muted = false;
        videoPlayer.volume = 1;
        videoPlayer.play();
    });

    const toggleLike = () => {
        const next = !isLiked;
        setIsLiked(next);
        setLikesCount((current) => Math.max(0, current + (next ? 1 : -1)));
        void Haptics.selectionAsync();
    };

    const toggleSave = () => {
        const next = !isSaved;
        setIsSaved(next);
        void Haptics.selectionAsync();
        showToast(next ? 'Saved to your collection' : 'Removed from saved', {
            variant: 'info',
            duration: 2200,
        });
    };

    return (
        <Screen title="Video">
            <ScrollView contentContainerStyle={{ paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
                <View className="overflow-hidden rounded-2xl" style={{ backgroundColor: '#000000' }}>
                    <VideoView
                        player={player}
                        style={{ width: '100%', aspectRatio: 9 / 16 }}
                        contentFit="cover"
                        nativeControls
                        fullscreenOptions={{ enable: true }}
                        allowsPictureInPicture
                    />
                </View>

                <View className="mt-4">
                    <AppText className="text-xl font-bold" color={colors.textPrimary}>
                        {detail.title}
                    </AppText>
                    <Pressable
                        className="mt-1 self-start"
                        onPress={() => router.push(`/video/creator/${encodeURIComponent(detail.creatorUsername.replace(/^@/, ''))}` as Href)}
                    >
                        <AppText className="text-sm font-semibold" color={colors.accent}>
                            {detail.creatorUsername}
                        </AppText>
                    </Pressable>
                    <AppText className="mt-2 text-sm leading-5" color={colors.textSecondary}>
                        {detail.caption}
                    </AppText>
                </View>

                <View
                    className="mt-4 flex-row rounded-xl border p-3"
                    style={{ borderColor: colors.border, backgroundColor: colors.backgroundAlt }}
                >
                    <Pressable
                        onPress={toggleLike}
                        className="mr-2 flex-1 flex-row items-center justify-center rounded-lg py-2"
                        style={{ backgroundColor: isLiked ? 'rgba(220,38,38,0.1)' : colors.background }}
                        accessibilityRole="button"
                        accessibilityLabel={isLiked ? 'Unlike video' : 'Like video'}
                    >
                        <Ionicons name={isLiked ? 'heart' : 'heart-outline'} size={18} color={isLiked ? colors.error : colors.textPrimary} />
                        <AppText className="ml-2 text-sm font-semibold" color={colors.textPrimary}>
                            {likesCount.toLocaleString()}
                        </AppText>
                    </Pressable>

                    <Pressable
                        onPress={() => router.push(`/video/comments/${encodeURIComponent(safeVideoId)}` as Href)}
                        className="mr-2 flex-1 flex-row items-center justify-center rounded-lg py-2"
                        style={{ backgroundColor: colors.background }}
                        accessibilityRole="button"
                        accessibilityLabel="Open comments"
                    >
                        <Ionicons name="chatbubble-outline" size={18} color={colors.textPrimary} />
                        <AppText className="ml-2 text-sm font-semibold" color={colors.textPrimary}>
                            {detail.commentsCount.toLocaleString()}
                        </AppText>
                    </Pressable>

                    <Pressable
                        onPress={toggleSave}
                        className="flex-1 flex-row items-center justify-center rounded-lg py-2"
                        style={{ backgroundColor: isSaved ? 'rgba(243,130,24,0.18)' : colors.background }}
                        accessibilityRole="button"
                        accessibilityLabel={isSaved ? 'Unsave video' : 'Save video'}
                    >
                        <Ionicons name={isSaved ? 'bookmark' : 'bookmark-outline'} size={18} color={colors.textPrimary} />
                        <AppText className="ml-2 text-sm font-semibold" color={colors.textPrimary}>
                            Save
                        </AppText>
                    </Pressable>
                </View>

                <View className="mt-3 rounded-xl border p-3" style={{ borderColor: colors.border }}>
                    <AppText className="text-xs uppercase tracking-[1px]" color={colors.textSecondary}>
                        Simulated Metrics
                    </AppText>
                    <AppText className="mt-2 text-sm" color={colors.textPrimary}>
                        Views: {detail.viewsCount.toLocaleString()}
                    </AppText>
                </View>
            </ScrollView>
        </Screen>
    );
}
