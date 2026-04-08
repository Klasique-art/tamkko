import { Ionicons } from '@expo/vector-icons';
import { FlashList } from '@shopify/flash-list';
import { Href, router } from 'expo-router';
import { useVideoPlayer, VideoView } from 'expo-video';
import React, { useMemo, useState } from 'react';
import { Animated, Pressable, View, useWindowDimensions } from 'react-native';

import AppText from '@/components/ui/AppText';
import Screen from '@/components/ui/Screen';
import { useColors } from '@/config/colors';
import { getFollowedCreators } from '@/data/mock/following';
import { mockVideos } from '@/data/mock';
import { MOCK_TEST_VIDEO_SOURCE } from '@/data/mock/videos';
import { VideoItem } from '@/types/video.types';

const compact = (value: number) =>
    new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 }).format(value);

const sections = ['Fresh Creators', 'Campus Trends', 'Music Drops'];

const ExploreVideoPreview = React.memo(function ExploreVideoPreview({ aspectRatio }: { aspectRatio: number }) {
    const [isReady, setIsReady] = useState(false);
    const pulseOpacity = React.useRef(new Animated.Value(0.45)).current;
    const player = useVideoPlayer(MOCK_TEST_VIDEO_SOURCE, (videoPlayer) => {
        videoPlayer.pause();
        videoPlayer.muted = true;
        videoPlayer.currentTime = 0;
    });

    React.useEffect(() => {
        const pulseLoop = Animated.loop(
            Animated.sequence([
                Animated.timing(pulseOpacity, {
                    toValue: 0.78,
                    duration: 850,
                    useNativeDriver: true,
                }),
                Animated.timing(pulseOpacity, {
                    toValue: 0.45,
                    duration: 850,
                    useNativeDriver: true,
                }),
            ])
        );
        pulseLoop.start();
        return () => {
            pulseLoop.stop();
        };
    }, [pulseOpacity]);

    React.useEffect(() => {
        const sourceSubscription = player.addListener('sourceLoad', () => {
            setIsReady(true);
        });
        return () => {
            sourceSubscription.remove();
        };
    }, [player]);

    return (
        <View style={{ aspectRatio }}>
            <VideoView
                player={player}
                style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 }}
                contentFit="cover"
                nativeControls={false}
                fullscreenOptions={{ enable: false }}
            />
            {!isReady ? (
                <Animated.View
                    pointerEvents="none"
                    style={{
                        position: 'absolute',
                        top: 0,
                        right: 0,
                        bottom: 0,
                        left: 0,
                        backgroundColor: '#171717',
                        opacity: pulseOpacity,
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <View
                        style={{
                            height: 44,
                            width: 44,
                            borderRadius: 22,
                            backgroundColor: 'rgba(255,255,255,0.2)',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <Ionicons name="play" size={20} color="#FFFFFF" />
                    </View>
                </Animated.View>
            ) : null}
        </View>
    );
});

export default function ExploreFeedScreen() {
    const colors = useColors();
    const { width } = useWindowDimensions();
    const followingCreators = useMemo(() => getFollowedCreators(), []);
    const [activeSection, setActiveSection] = useState(sections[0]);

    const videos = useMemo(
        () => mockVideos.filter((video) => !followingCreators.has(video.creatorUsername)),
        [followingCreators]
    );

    const tileGap = 10;
    const tileWidth = Math.floor((width - 32 - tileGap) / 2);

    const renderTile = ({ item, index }: { item: VideoItem; index: number }) => (
        <Pressable
            onPress={() => router.push(`/video/${encodeURIComponent(item.id)}` as Href)}
            className="mb-3 overflow-hidden rounded-3xl border"
            style={{
                width: tileWidth,
                marginRight: index % 2 === 0 ? tileGap : 0,
                borderColor: colors.border,
                backgroundColor: colors.backgroundAlt,
            }}
            accessibilityRole="button"
            accessibilityLabel={`Open ${item.title}`}
            accessibilityHint={`By ${item.creatorUsername}. ${compact(item.likesCount)} likes.`}
        >
            <View
                style={{
                    aspectRatio: 3 / 4,
                    justifyContent: 'space-between',
                }}
            >
                <ExploreVideoPreview aspectRatio={3 / 4} />
                <View style={{ position: 'absolute', top: 10, left: 10, right: 10, bottom: 10, justifyContent: 'space-between' }}>
                    <View className="self-start rounded-full px-2 py-1" style={{ backgroundColor: 'rgba(255,255,255,0.16)' }}>
                        <AppText className="text-[10px] font-semibold" color="#FFFFFF">
                            {item.creatorUsername}
                        </AppText>
                    </View>

                    <View className="rounded-2xl p-2" style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}>
                        <View className="flex-row items-center justify-between">
                            <View className="flex-row items-center">
                                <Ionicons name="play" size={12} color="#FFFFFF" />
                                <AppText className="ml-1 text-[11px] font-semibold" color="#FFFFFF">
                                    {compact(Math.max(item.likesCount * 12, 1000))}
                                </AppText>
                            </View>
                            <View className="flex-row items-center">
                                <Ionicons name="heart" size={11} color="#FFFFFF" />
                                <AppText className="ml-1 text-[11px] font-semibold" color="#FFFFFF">
                                    {compact(item.likesCount)}
                                </AppText>
                            </View>
                        </View>
                    </View>
                </View>
            </View>

            <View className="px-3 pb-3 pt-2">
                <AppText className="text-sm font-bold" color={colors.textPrimary} numberOfLines={1}>
                    {item.title}
                </AppText>
                <AppText className="mt-1 text-xs" color={colors.textSecondary} numberOfLines={2}>
                    {item.caption || 'Discover this creator video'}
                </AppText>
            </View>
        </Pressable>
    );

    return (
        <Screen title="Explore" className="pt-2">
            <FlashList
                data={videos}
                keyExtractor={(item) => item.id}
                numColumns={2}
                renderItem={renderTile}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 120 }}
                ListHeaderComponent={
                    <View>
                        <View
                            className="rounded-3xl border p-4"
                            style={{
                                borderColor: colors.border,
                                backgroundColor: colors.primary,
                            }}
                        >
                            <AppText className="text-lg font-extrabold" color={colors.white}>
                                Discover Beyond Your Feed
                            </AppText>
                            <AppText className="mt-1 text-sm" color="rgba(255,255,255,0.92)">
                                Find creators and videos outside your current algorithm in a curated visual grid.
                            </AppText>

                            <View className="mt-3 flex-row flex-wrap">
                                {sections.map((section) => {
                                    const active = section === activeSection;
                                    return (
                                        <Pressable
                                            key={section}
                                            onPress={() => setActiveSection(section)}
                                            className="mb-2 mr-2 rounded-full px-3 py-1.5"
                                            style={{
                                                backgroundColor: active ? 'rgba(255,255,255,0.24)' : 'rgba(255,255,255,0.12)',
                                                borderWidth: 1,
                                                borderColor: active ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.2)',
                                            }}
                                            accessibilityRole="button"
                                            accessibilityLabel={`Filter ${section}`}
                                            accessibilityState={{ selected: active }}
                                        >
                                            <AppText className="text-xs font-semibold" color="#FFFFFF">
                                                {section}
                                            </AppText>
                                        </Pressable>
                                    );
                                })}
                            </View>
                        </View>

                        <View className="mb-2 mt-4 flex-row items-center justify-between">
                            <AppText className="text-base font-bold" color={colors.textPrimary}>
                                {activeSection}
                            </AppText>
                            <Pressable
                                onPress={() => router.push('/search' as Href)}
                                className="rounded-full border px-3 py-1.5"
                                style={{ borderColor: colors.border, backgroundColor: colors.backgroundAlt }}
                                accessibilityRole="button"
                                accessibilityLabel="Open search"
                            >
                                <View className="flex-row items-center">
                                    <Ionicons name="search" size={13} color={colors.textPrimary} />
                                    <AppText className="ml-1 text-xs font-semibold" color={colors.textPrimary}>
                                        Search
                                    </AppText>
                                </View>
                            </Pressable>
                        </View>
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
