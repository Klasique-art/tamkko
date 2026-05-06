import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import { useVideoPlayer, VideoView } from 'expo-video';
import React, { memo } from 'react';
import { AccessibilityInfo, Animated, Pressable, View } from 'react-native';

import VideoActionRail from '@/components/feed/VideoActionRail';
import VideoMetaOverlay from '@/components/feed/VideoMetaOverlay';
import { MOCK_TEST_VIDEO_SOURCE } from '@/data/mock/videos';
import { VideoItem } from '@/types/video.types';

type VideoFeedSlideProps = {
    item: VideoItem;
    height: number;
    index: number;
    isActive: boolean;
    onCreatorPress?: (creatorHandle: string) => void;
    onTipPress?: (video: VideoItem) => void;
    onCommentPress?: (video: VideoItem) => void;
    onSharePress?: (video: VideoItem) => void;
    onMorePress?: (video: VideoItem) => void;
    isFollowingCreator?: boolean;
    onFollowCreator?: (creatorHandle: string) => void;
    onToggleLike?: () => void;
    showMoreButton?: boolean;
    showCreatorInfo?: boolean;
    showFollowButton?: boolean;
    showTipButton?: boolean;
};

function ActiveVideoSurface({
    source,
    isPlaying,
}: {
    source: NonNullable<VideoItem['videoSource']>;
    isPlaying: boolean;
}) {
    const safelyPause = React.useCallback((target: ReturnType<typeof useVideoPlayer>) => {
        try {
            target.pause();
        } catch {}
    }, []);

    const safelyPlay = React.useCallback((target: ReturnType<typeof useVideoPlayer>) => {
        try {
            target.play();
        } catch {}
    }, []);

    const player = useVideoPlayer(source, (videoPlayer) => {
        videoPlayer.loop = true;
        videoPlayer.muted = false;
        videoPlayer.volume = 1;
        videoPlayer.pause();
    });

    React.useEffect(() => {
        if (isPlaying) {
            safelyPlay(player);
        } else {
            safelyPause(player);
        }
    }, [isPlaying, player, safelyPause, safelyPlay]);

    React.useEffect(
        () => () => {
            safelyPause(player);
        },
        [player, safelyPause]
    );

    return (
        <VideoView
            player={player}
            style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 }}
            contentFit="cover"
            nativeControls={false}
            fullscreenOptions={{ enable: false }}
        />
    );
}

function VideoFeedSlide({
    item,
    height,
    index,
    isActive,
    onCreatorPress,
    onTipPress,
    onCommentPress,
    onSharePress,
    onMorePress,
    isFollowingCreator = false,
    onFollowCreator,
    onToggleLike,
    showMoreButton = false,
    showCreatorInfo = true,
    showFollowButton = true,
    showTipButton = true,
}: VideoFeedSlideProps) {
    const lastTapRef = React.useRef(0);
    const singleTapTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
    const burstScale = React.useRef(new Animated.Value(0.3)).current;
    const burstOpacity = React.useRef(new Animated.Value(0)).current;
    const playbackScale = React.useRef(new Animated.Value(0.7)).current;
    const playbackOpacity = React.useRef(new Animated.Value(0)).current;
    const [playbackIcon, setPlaybackIcon] = React.useState<'play' | 'pause'>('pause');
    const [isPlaying, setIsPlaying] = React.useState(true);
    const isImagePost = item.mediaType === 'image' || (!item.videoSource && !item.playbackUrl);
    const shouldMountVideo = isActive && !isImagePost;
    React.useEffect(() => {
        if (!isActive) setIsPlaying(false);
    }, [isActive]);

    const playLikeBurst = React.useCallback(() => {
        burstScale.setValue(0.35);
        burstOpacity.setValue(0);

        Animated.parallel([
            Animated.sequence([
                Animated.timing(burstOpacity, {
                    toValue: 1,
                    duration: 120,
                    useNativeDriver: true,
                }),
                Animated.timing(burstOpacity, {
                    toValue: 0,
                    duration: 260,
                    useNativeDriver: true,
                }),
            ]),
            Animated.spring(burstScale, {
                toValue: 1,
                useNativeDriver: true,
                speed: 18,
                bounciness: 10,
            }),
        ]).start();
    }, [burstOpacity, burstScale]);

    const triggerLike = React.useCallback(() => {
        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        playLikeBurst();
        onToggleLike?.();
    }, [onToggleLike, playLikeBurst]);

    const playPlaybackFeedback = React.useCallback(
        (icon: 'play' | 'pause') => {
            setPlaybackIcon(icon);
            playbackScale.setValue(0.72);
            playbackOpacity.setValue(0);
            Animated.parallel([
                Animated.sequence([
                    Animated.timing(playbackOpacity, {
                        toValue: 1,
                        duration: 100,
                        useNativeDriver: true,
                    }),
                    Animated.timing(playbackOpacity, {
                        toValue: 0,
                        duration: 220,
                        useNativeDriver: true,
                    }),
                ]),
                Animated.spring(playbackScale, {
                    toValue: 1,
                    useNativeDriver: true,
                    speed: 20,
                    bounciness: 7,
                }),
            ]).start();
        },
        [playbackOpacity, playbackScale]
    );

    const togglePlayback = React.useCallback(() => {
        if (isImagePost) return;
        if (!isActive) return;
        const nextIsPlaying = !isPlaying;
        AccessibilityInfo.announceForAccessibility(nextIsPlaying ? 'Video playing' : 'Video paused');
        playPlaybackFeedback(nextIsPlaying ? 'play' : 'pause');
        setIsPlaying(nextIsPlaying);
    }, [isActive, isImagePost, isPlaying, playPlaybackFeedback]);

    React.useEffect(() => {
        if (isActive) setIsPlaying(true);
    }, [isActive, item.id]);

    React.useEffect(() => {
        return () => {
            if (singleTapTimeoutRef.current) {
                clearTimeout(singleTapTimeoutRef.current);
                singleTapTimeoutRef.current = null;
            }
        };
    }, []);

    const handlePress = () => {
        const now = Date.now();
        if (now - lastTapRef.current < 280) {
            if (singleTapTimeoutRef.current) {
                clearTimeout(singleTapTimeoutRef.current);
                singleTapTimeoutRef.current = null;
            }
            triggerLike();
        } else {
            singleTapTimeoutRef.current = setTimeout(() => {
                togglePlayback();
                singleTapTimeoutRef.current = null;
            }, 280);
        }
        lastTapRef.current = now;
    };

    return (
        <Pressable
            onPress={handlePress}
            accessibilityRole="button"
            accessibilityLabel={`${isImagePost ? 'Image' : 'Video'} by ${item.creatorUsername}`}
            accessibilityHint={isImagePost ? 'Double tap quickly to like.' : 'Single tap to play or pause. Double tap quickly to like.'}
        >
            <View style={{ height, backgroundColor: index % 2 === 0 ? '#0a0a0a' : '#111111' }}>
                {isImagePost ? (
                    item.thumbnailUrl ? (
                        <Image
                            source={{ uri: item.thumbnailUrl }}
                            style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 }}
                            contentFit="cover"
                        />
                    ) : (
                        <View
                            style={{
                                position: 'absolute',
                                top: 0,
                                right: 0,
                                bottom: 0,
                                left: 0,
                                backgroundColor: '#0B0B0B',
                            }}
                        />
                    )
                ) : shouldMountVideo ? (
                    <ActiveVideoSurface
                        source={item.videoSource ?? MOCK_TEST_VIDEO_SOURCE}
                        isPlaying={isPlaying}
                    />
                ) : (
                    <View
                        style={{
                            position: 'absolute',
                            top: 0,
                            right: 0,
                            bottom: 0,
                            left: 0,
                            backgroundColor: '#0B0B0B',
                        }}
                    />
                )}

                <View className="absolute inset-0" style={{ backgroundColor: 'rgba(0,0,0,0.18)' }} />

                <View className="absolute inset-0 items-center justify-center" pointerEvents="none">
                    <Animated.View
                        style={{
                            opacity: burstOpacity,
                            transform: [{ scale: burstScale }],
                        }}
                    >
                        <Ionicons name="heart" size={92} color="#FFFFFF" />
                    </Animated.View>
                </View>
                <View className="absolute inset-0 items-center justify-center" pointerEvents="none">
                    <Animated.View
                        style={{
                            opacity: playbackOpacity,
                            transform: [{ scale: playbackScale }],
                        }}
                    >
                        {!isImagePost ? (
                            <View
                                className="items-center justify-center rounded-full"
                                style={{ width: 72, height: 72, backgroundColor: 'rgba(0,0,0,0.5)' }}
                            >
                                <Ionicons
                                    name={playbackIcon === 'play' ? 'play' : 'pause'}
                                    size={34}
                                    color="#FFFFFF"
                                />
                            </View>
                        ) : null}
                    </Animated.View>
                </View>

                <VideoActionRail
                    likesCount={item.likesCount}
                    commentsCount={item.commentsCount}
                    sharesCount={item.sharesCount ?? 0}
                    allowComments={item.allowComments !== false}
                    isLiked={item.isLiked}
                    onLike={triggerLike}
                    onComment={() => onCommentPress?.(item)}
                    onShare={() => onSharePress?.(item)}
                    onMore={() => onMorePress?.(item)}
                    showMoreButton={showMoreButton}
                />

                <VideoMetaOverlay
                    creatorHandle={item.creatorUsername}
                    caption={item.caption}
                    isFollowing={isFollowingCreator}
                    showCreatorInfo={showCreatorInfo}
                    showFollowButton={showFollowButton}
                    showTipButton={showTipButton}
                    onCreatorPress={() => onCreatorPress?.(item.creatorUsername)}
                    onFollowPress={() => onFollowCreator?.(item.creatorUsername)}
                    onTipPress={() => onTipPress?.(item)}
                />
            </View>
        </Pressable>
    );
}

export default memo(VideoFeedSlide, (prev, next) =>
    prev.height === next.height &&
    prev.index === next.index &&
    prev.isActive === next.isActive &&
    prev.isFollowingCreator === next.isFollowingCreator &&
    prev.item.id === next.item.id &&
    prev.item.isLiked === next.item.isLiked &&
    prev.item.likesCount === next.item.likesCount &&
    prev.item.commentsCount === next.item.commentsCount &&
    prev.item.sharesCount === next.item.sharesCount &&
    prev.item.caption === next.item.caption &&
    prev.item.creatorUsername === next.item.creatorUsername &&
    prev.item.videoSource === next.item.videoSource &&
    prev.showCreatorInfo === next.showCreatorInfo &&
    prev.showFollowButton === next.showFollowButton &&
    prev.showTipButton === next.showTipButton
);
