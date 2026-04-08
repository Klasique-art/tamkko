import { Ionicons } from '@expo/vector-icons';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import React from 'react';
import { FlatList, ListRenderItemInfo, Pressable, Share, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import CommentsBottomSheet from '@/components/feed/comments/CommentsBottomSheet';
import TipBottomSheet from '@/components/feed/TipBottomSheet';
import VideoFeedSlide from '@/components/feed/VideoFeedSlide';
import { AppBottomSheetRef } from '@/components/ui/AppBottomSheet';
import AppText from '@/components/ui/AppText';
import Nav from '@/components/ui/Nav';
import { getFollowedCreators, normalizeCreatorHandle, toggleFollowedCreator } from '@/data/mock/following';
import { SimulatedTipPayload } from '@/types/tip.types';
import { VideoItem } from '@/types/video.types';

type VideoSnapFeedProps = {
    videos: VideoItem[];
    onCreatorPress?: (creatorHandle: string) => void;
    onTipSuccess?: (payload: SimulatedTipPayload) => void;
    showTopNav?: boolean;
    showFeedSwitcher?: boolean;
    navTitle?: string;
};

export default function VideoSnapFeed({
    videos,
    onCreatorPress,
    onTipSuccess,
    showTopNav = false,
    showFeedSwitcher = false,
    navTitle = 'Feed',
}: VideoSnapFeedProps) {
    const [pageHeight, setPageHeight] = React.useState(0);
    const [feedData, setFeedData] = React.useState<VideoItem[]>(videos);
    const [tipVideo, setTipVideo] = React.useState<VideoItem | null>(null);
    const [commentVideo, setCommentVideo] = React.useState<VideoItem | null>(null);
    const navigation = useNavigation();
    const isScreenFocused = useIsFocused();
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const tipSheetRef = React.useRef<AppBottomSheetRef>(null);
    const commentSheetRef = React.useRef<AppBottomSheetRef>(null);
    const listRef = React.useRef<FlatList<VideoItem>>(null);
    const currentIndexRef = React.useRef(0);
    const [activeIndex, setActiveIndex] = React.useState(0);
    const [followedCreators, setFollowedCreators] = React.useState<Set<string>>(getFollowedCreators());

    React.useEffect(() => {
        setFeedData(videos);
    }, [videos]);

    const toggleLike = React.useCallback((videoId: string) => {
        setFeedData((current) =>
            current.map((video) => {
                if (video.id !== videoId) return video;
                const isLiked = Boolean(video.isLiked);
                return {
                    ...video,
                    isLiked: !isLiked,
                    likesCount: Math.max(0, video.likesCount + (isLiked ? -1 : 1)),
                };
            })
        );
    }, []);

    const openTipSheet = React.useCallback((video: VideoItem) => {
        setTipVideo(video);
        requestAnimationFrame(() => {
            tipSheetRef.current?.open();
        });
    }, []);

    const openCommentSheet = React.useCallback((video: VideoItem) => {
        setCommentVideo(video);
        requestAnimationFrame(() => {
            commentSheetRef.current?.open();
        });
    }, []);

    const toggleFollowCreator = React.useCallback((creatorHandle: string) => {
        setFollowedCreators((current) => {
            const next = new Set(current);
            const normalized = normalizeCreatorHandle(creatorHandle);
            const isNowFollowed = toggleFollowedCreator(creatorHandle);
            if (isNowFollowed) next.add(normalized);
            else next.delete(normalized);
            return next;
        });
    }, []);

    const handleShare = React.useCallback(async (video: VideoItem) => {
        try {
            await Share.share({
                title: video.title,
                message: `Watch ${video.title} by ${video.creatorUsername} on Tamkko`,
                url: `tamkko://video/${video.id}`,
            });
        } catch {}
    }, []);

    const incrementCommentCount = React.useCallback((videoId: string) => {
        setFeedData((current) =>
            current.map((video) =>
                video.id === videoId
                    ? { ...video, commentsCount: video.commentsCount + 1 }
                    : video
            )
        );
    }, []);

    const renderItem = React.useCallback(
        ({ item, index }: ListRenderItemInfo<VideoItem>) => (
            <VideoFeedSlide
                item={item}
                height={pageHeight}
                index={index}
                isActive={isScreenFocused && index === activeIndex}
                onCreatorPress={onCreatorPress}
                onTipPress={() => openTipSheet(item)}
                onCommentPress={() => openCommentSheet(item)}
                onSharePress={() => handleShare(item)}
                isFollowingCreator={followedCreators.has(normalizeCreatorHandle(item.creatorUsername))}
                onFollowCreator={toggleFollowCreator}
                onToggleLike={() => toggleLike(item.id)}
            />
        ),
        [
            activeIndex,
            followedCreators,
            handleShare,
            isScreenFocused,
            onCreatorPress,
            openCommentSheet,
            openTipSheet,
            pageHeight,
            toggleFollowCreator,
            toggleLike,
        ]
    );

    const keyExtractor = React.useCallback((item: VideoItem) => item.id, []);

    const handleMomentumScrollEnd = React.useCallback(
        (event: { nativeEvent: { contentOffset: { y: number } } }) => {
            if (!pageHeight || feedData.length === 0) return;

            const rawIndex = Math.round(event.nativeEvent.contentOffset.y / pageHeight);
            const boundedIndex = Math.max(0, Math.min(feedData.length - 1, rawIndex));
            const previousIndex = currentIndexRef.current;
            const jump = boundedIndex - previousIndex;

            if (Math.abs(jump) <= 1) {
                currentIndexRef.current = boundedIndex;
                setActiveIndex(boundedIndex);
                return;
            }

            const clampedIndex = previousIndex + (jump > 0 ? 1 : -1);
            currentIndexRef.current = clampedIndex;
            setActiveIndex(clampedIndex);
            requestAnimationFrame(() => {
                listRef.current?.scrollToOffset({
                    offset: clampedIndex * pageHeight,
                    animated: true,
                });
            });
        },
        [feedData.length, pageHeight]
    );

    return (
        <View
            style={{ flex: 1, backgroundColor: '#000000' }}
            onLayout={(event) => setPageHeight(event.nativeEvent.layout.height)}
        >
            {showTopNav ? (
                <View style={{ position: 'absolute', top: insets.top, left: 12, right: 12, zIndex: 20 }}>
                    <Nav title={navTitle} canGoBack={navigation.canGoBack()} onPress={() => router.back()} />
                </View>
            ) : null}

            {showFeedSwitcher ? (
                <View
                    className="absolute left-4 right-4 z-20 flex-row items-center rounded-full px-3 py-2"
                    style={{
                        top: insets.top + 8,
                        backgroundColor: 'rgba(0,0,0,0.28)',
                        zIndex: 40,
                        elevation: 40,
                    }}
                >
                    <View className="flex-row items-center">
                        <Pressable
                            onPress={() => router.push('/video/explore')}
                            className="h-8 items-center justify-center rounded-full px-5"
                            style={{ backgroundColor: 'rgba(255,255,255,0.22)' }}
                            accessibilityRole="button"
                            accessibilityLabel="Open Explore"
                        >
                            <AppText className="text-xs font-bold" color="#FFFFFF">Explore</AppText>
                        </Pressable>
                        <Pressable
                            onPress={() => router.push('/video/following')}
                            className="ml-2 h-8 items-center justify-center rounded-full px-5"
                            style={{ backgroundColor: 'rgba(255,255,255,0.22)' }}
                            accessibilityRole="button"
                            accessibilityLabel="Open Following"
                        >
                            <AppText className="text-xs font-bold" color="#FFFFFF">Following</AppText>
                        </Pressable>
                    </View>

                    <Pressable
                        onPress={() => router.push('/search')}
                        className="ml-2 h-9 w-9 items-center justify-center rounded-full"
                        style={{ backgroundColor: 'rgba(255,255,255,0.22)' }}
                        accessibilityRole="button"
                        accessibilityLabel="Open search"
                    >
                        <Ionicons name="search" size={16} color="#FFFFFF" />
                    </Pressable>
                </View>
            ) : null}

            {pageHeight > 0 ? (
                <FlatList
                    ref={listRef}
                    data={feedData}
                    keyExtractor={keyExtractor}
                    renderItem={renderItem}
                    pagingEnabled
                    disableIntervalMomentum
                    showsVerticalScrollIndicator={false}
                    bounces={false}
                    removeClippedSubviews
                    initialNumToRender={3}
                    maxToRenderPerBatch={3}
                    windowSize={3}
                    snapToInterval={pageHeight}
                    snapToAlignment="start"
                    decelerationRate="fast"
                    onMomentumScrollEnd={handleMomentumScrollEnd}
                    getItemLayout={(_, index) => ({
                        length: pageHeight,
                        offset: pageHeight * index,
                        index,
                    })}
                />
            ) : null}

            <TipBottomSheet
                ref={tipSheetRef}
                video={tipVideo}
                onClosed={() => setTipVideo(null)}
                onTipSuccess={onTipSuccess}
            />

            <CommentsBottomSheet
                ref={commentSheetRef}
                video={commentVideo}
                onClosed={() => setCommentVideo(null)}
                onCommentCreated={incrementCommentCount}
            />
        </View>
    );
}
