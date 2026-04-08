import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
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
    isFollowingCreator?: boolean;
    onFollowCreator?: (creatorHandle: string) => void;
    onToggleLike?: () => void;
};

function VideoFeedSlide({
    item,
    height,
    index,
    isActive,
    onCreatorPress,
    onTipPress,
    onCommentPress,
    onSharePress,
    isFollowingCreator = false,
    onFollowCreator,
    onToggleLike,
}: VideoFeedSlideProps) {
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

    const lastTapRef = React.useRef(0);
    const singleTapTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
    const burstScale = React.useRef(new Animated.Value(0.3)).current;
    const burstOpacity = React.useRef(new Animated.Value(0)).current;
    const playbackScale = React.useRef(new Animated.Value(0.7)).current;
    const playbackOpacity = React.useRef(new Animated.Value(0)).current;
    const [playbackIcon, setPlaybackIcon] = React.useState<'play' | 'pause'>('pause');
    const [isPlaying, setIsPlaying] = React.useState(true);
    const player = useVideoPlayer(MOCK_TEST_VIDEO_SOURCE, (videoPlayer) => {
        videoPlayer.loop = true;
        videoPlayer.muted = false;
        videoPlayer.volume = 1;
        if (isActive) {
            videoPlayer.play();
        } else {
            videoPlayer.pause();
        }
    });

    React.useEffect(() => {
        if (!isActive) {
            player.muted = true;
            safelyPause(player);
            return;
        }

        player.muted = false;
        if (isPlaying) {
            safelyPlay(player);
        } else {
            safelyPause(player);
        }
    }, [isActive, isPlaying, player, safelyPause, safelyPlay]);

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
        if (!isActive) return;
        const nextIsPlaying = !isPlaying;
        if (nextIsPlaying) {
            safelyPlay(player);
            AccessibilityInfo.announceForAccessibility('Video playing');
            playPlaybackFeedback('play');
        } else {
            safelyPause(player);
            AccessibilityInfo.announceForAccessibility('Video paused');
            playPlaybackFeedback('pause');
        }
        setIsPlaying(nextIsPlaying);
    }, [isActive, isPlaying, playPlaybackFeedback, player, safelyPause, safelyPlay]);

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
            accessibilityLabel={`Video by ${item.creatorUsername}`}
            accessibilityHint="Single tap to play or pause. Double tap quickly to like."
        >
            <View style={{ height, backgroundColor: index % 2 === 0 ? '#0a0a0a' : '#111111' }}>
                <VideoView
                    player={player}
                    style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 }}
                    contentFit="cover"
                    nativeControls={false}
                    fullscreenOptions={{ enable: false }}
                />

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
                    </Animated.View>
                </View>

                <VideoActionRail
                    likesCount={item.likesCount}
                    commentsCount={item.commentsCount}
                    sharesCount={Math.max(12, Math.floor(item.likesCount * 0.04))}
                    isLiked={item.isLiked}
                    onLike={triggerLike}
                    onComment={() => onCommentPress?.(item)}
                    onShare={() => onSharePress?.(item)}
                />

                <VideoMetaOverlay
                    creatorHandle={item.creatorUsername}
                    caption={item.caption}
                    isFollowing={isFollowingCreator}
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
    prev.item.caption === next.item.caption &&
    prev.item.creatorUsername === next.item.creatorUsername
);
