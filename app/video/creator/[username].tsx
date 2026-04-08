import { Ionicons } from '@expo/vector-icons';
import { FlashList } from '@shopify/flash-list';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { Href, router, useLocalSearchParams } from 'expo-router';
import { useVideoPlayer, VideoView } from 'expo-video';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AccessibilityInfo, Animated, Image, Pressable, Share, View, useWindowDimensions } from 'react-native';

import AppButton from '@/components/ui/AppButton';
import AppModal from '@/components/ui/AppModal';
import AppText from '@/components/ui/AppText';
import Screen from '@/components/ui/Screen';
import { useColors } from '@/config/colors';
import { useToast } from '@/context/ToastContext';
import { isCreatorFollowed, normalizeCreatorHandle, toggleFollowedCreator } from '@/data/mock/following';
import { MOCK_TEST_VIDEO_SOURCE } from '@/data/mock/videos';
import { creatorProfileService } from '@/lib/services/creatorProfileService';
import { useInboxStore } from '@/lib/stores/inboxStore';
import { delay } from '@/lib/utils/delay';
import { CreatorProfileScreenData, CreatorProfileVideo } from '@/types/creator.types';

type CreatorTab = 'free' | 'locked';

const formatCompactNumber = (value: number) => {
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
    return String(value);
};

const formatDuration = (durationSeconds: number) => {
    const minutes = Math.floor(durationSeconds / 60);
    const seconds = durationSeconds % 60;
    return `${minutes}:${String(seconds).padStart(2, '0')}`;
};

const buildShareText = (username: string) =>
    `Check out @${username} on Tamkko. Subscribe to unlock all premium drops.`;

const CreatorGridVideo = React.memo(function CreatorGridVideo({ height }: { height: number }) {
    const player = useVideoPlayer(MOCK_TEST_VIDEO_SOURCE, (videoPlayer) => {
        videoPlayer.muted = true;
        videoPlayer.pause();
        videoPlayer.currentTime = 0;
    });

    return (
        <VideoView
            player={player}
            style={{ width: '100%', height }}
            contentFit="cover"
            nativeControls={false}
            fullscreenOptions={{ enable: false }}
        />
    );
});

export default function CreatorProfileScreen() {
    const colors = useColors();
    const { showToast } = useToast();
    const { width } = useWindowDimensions();
    const { username } = useLocalSearchParams<{ username: string }>();
    const normalizedUsername = useMemo(
        () => decodeURIComponent(username ?? '').replace(/^@/, '').trim(),
        [username]
    );

    const [loading, setLoading] = useState(true);
    const [screenData, setScreenData] = useState<CreatorProfileScreenData | null>(null);
    const [activeTab, setActiveTab] = useState<CreatorTab>('free');
    const [showSubscribePrompt, setShowSubscribePrompt] = useState(false);
    const [isFollowing, setIsFollowing] = useState(false);
    const [viewerHasAccess, setViewerHasAccess] = useState(false);
    const [isSubscribing, setIsSubscribing] = useState(false);
    const [subscriptionStage, setSubscriptionStage] = useState<'idle' | 'initiating' | 'awaiting_approval'>('idle');
    const [reduceMotionEnabled, setReduceMotionEnabled] = useState(false);
    const [realDurationSeconds, setRealDurationSeconds] = useState<number | null>(null);
    const followScale = useRef(new Animated.Value(1)).current;
    const shareScale = useRef(new Animated.Value(1)).current;
    const messageScale = useRef(new Animated.Value(1)).current;
    const ensureConversation = useInboxStore((state) => state.ensureConversation);
    const durationProbePlayer = useVideoPlayer(MOCK_TEST_VIDEO_SOURCE, (videoPlayer) => {
        videoPlayer.muted = true;
        videoPlayer.pause();
    });

    useEffect(() => {
        let isMounted = true;

        const load = async () => {
            setLoading(true);
            const data = await creatorProfileService.getCreatorProfileScreenData(normalizedUsername);
            if (isMounted) {
                setScreenData(data);
                setActiveTab('free');
                setViewerHasAccess(Boolean(data?.profile.viewerHasActiveSubscription));
                if (data?.profile.username) {
                    const handle = normalizeCreatorHandle(data.profile.username);
                    setIsFollowing(isCreatorFollowed(handle));
                }
                setLoading(false);
            }
        };

        void load();
        return () => {
            isMounted = false;
        };
    }, [normalizedUsername]);

    const profile = screenData?.profile;
    const freeVideos = screenData?.freeVideos ?? [];
    const lockedVideos = screenData?.lockedVideos ?? [];

    const videosForActiveTab = activeTab === 'free' ? freeVideos : lockedVideos;
    const columns = 3;
    const screenHorizontalPadding = 32; // Screen uses px-4
    const gridGap = 8;
    const tileWidth = Math.floor((width - screenHorizontalPadding - gridGap * (columns - 1)) / columns);

    const announce = useCallback((message: string) => {
        AccessibilityInfo.announceForAccessibility(message);
    }, []);

    useEffect(() => {
        let isMounted = true;
        const setupReducedMotion = async () => {
            const enabled = await AccessibilityInfo.isReduceMotionEnabled();
            if (isMounted) setReduceMotionEnabled(enabled);
        };

        void setupReducedMotion();
        const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', (enabled) => {
            setReduceMotionEnabled(enabled);
        });

        return () => {
            isMounted = false;
            subscription.remove();
        };
    }, []);

    useEffect(() => {
        if (showSubscribePrompt) {
            announce('Subscription required dialog opened');
        }
    }, [showSubscribePrompt, announce]);

    useEffect(() => {
        const subscription = durationProbePlayer.addListener('sourceLoad', (payload) => {
            if (payload.duration > 0) {
                setRealDurationSeconds(Math.round(payload.duration));
            }
        });

        return () => {
            subscription.remove();
        };
    }, [durationProbePlayer]);

    const handleTabPress = (tab: CreatorTab) => {
        if (tab === 'locked' && !viewerHasAccess) {
            void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            setShowSubscribePrompt(true);
            announce('Subscription required to view locked videos');
            return;
        }
        void Haptics.selectionAsync();
        setActiveTab(tab);
        announce(tab === 'free' ? 'Free videos tab selected' : 'Locked videos tab selected');
    };

    const openVideo = useCallback((videoId: string) => {
        void Haptics.selectionAsync();
        router.push(`/video/${encodeURIComponent(videoId)}` as Href);
    }, []);

    const animateButton = (value: Animated.Value, to: number) => {
        if (reduceMotionEnabled) {
            value.setValue(to);
            return;
        }
        Animated.spring(value, {
            toValue: to,
            useNativeDriver: true,
            speed: 28,
            bounciness: 8,
        }).start();
    };

    const handleFollowPress = () => {
        const creatorHandle = normalizeCreatorHandle(profile?.username ?? '');
        const next = creatorHandle.trim().length > 1 ? toggleFollowedCreator(creatorHandle) : !isFollowing;
        setIsFollowing(next);
        void Haptics.notificationAsync(
            next ? Haptics.NotificationFeedbackType.Success : Haptics.NotificationFeedbackType.Warning
        );
        showToast(next ? `You are now following @${profile?.username}` : `Unfollowed @${profile?.username}`, {
            variant: next ? 'success' : 'info',
            duration: 2600,
        });
        announce(next ? `Following ${profile?.displayName}` : `Unfollowed ${profile?.displayName}`);
    };

    const handleSharePress = async () => {
        if (!profile) return;
        void Haptics.selectionAsync();
        const message = buildShareText(profile.username);
        try {
            await Share.share({
                title: `${profile.displayName} on Tamkko`,
                message,
                url: `tamkko://creator/${profile.username}`,
            });
            showToast('Share sheet opened', { variant: 'success', duration: 2200 });
            announce('Share options opened');
        } catch {
            showToast('Unable to open share options right now', { variant: 'error', duration: 2600 });
            announce('Unable to open share options');
        }
    };

    const handleMessagePress = () => {
        if (!profile) return;
        void Haptics.selectionAsync();
        const conversationId = ensureConversation({
            creatorUsername: profile.username,
            creatorDisplayName: profile.displayName,
            creatorAvatarUrl: profile.avatarUrl,
            isVerified: ['klasique', 'ama.creator'].includes(profile.username),
        });
        router.push(`/inbox/chat/${encodeURIComponent(conversationId)}` as Href);
    };

    const simulateSubscriptionPayment = async () => {
        if (!profile || viewerHasAccess || isSubscribing) return;

        setIsSubscribing(true);
        setSubscriptionStage('initiating');
        void Haptics.selectionAsync();
        announce('Starting subscription payment');
        showToast('Initiating MoMo payment...', { variant: 'info', duration: 1800 });

        await delay(900);
        setSubscriptionStage('awaiting_approval');
        announce('Waiting for mobile money approval');
        showToast('Approve the fake MTN MoMo prompt to continue', { variant: 'info', duration: 2200 });

        await delay(1400);
        setViewerHasAccess(true);
        setIsSubscribing(false);
        setSubscriptionStage('idle');
        setShowSubscribePrompt(false);
        setActiveTab('locked');
        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        showToast(`Subscription active! Locked videos unlocked for @${profile.username}`, {
            variant: 'success',
            duration: 3000,
        });
        announce('Subscription approved. Locked videos unlocked');
    };

    if (loading) {
        return (
            <Screen title="Creator Profile">
                <View className="flex-1 items-center justify-center">
                    <AppText className="text-base font-semibold" color={colors.textPrimary}>
                        Loading creator profile...
                    </AppText>
                </View>
            </Screen>
        );
    }

    if (!profile) {
        return (
            <Screen title="Creator Profile">
                <View
                    className="mt-2 rounded-2xl border p-5"
                    style={{ borderColor: colors.border, backgroundColor: colors.backgroundAlt }}
                >
                    <AppText className="text-lg font-bold" color={colors.textPrimary}>
                        Creator Not Found
                    </AppText>
                    <AppText className="mt-2 text-sm leading-5" color={colors.textSecondary}>
                        We could not find that creator profile. Try opening another username from the feed.
                    </AppText>
                </View>
            </Screen>
        );
    }

    const renderVideoCard = ({ item, index }: { item: CreatorProfileVideo; index: number }) => (
        <Pressable
            onPress={() => openVideo(item.id)}
            className="mb-2 overflow-hidden rounded-xl"
            style={{
                width: tileWidth,
                marginRight: index % columns === columns - 1 ? 0 : gridGap,
                backgroundColor: colors.backgroundAlt,
            }}
            accessibilityRole="button"
            accessibilityLabel={`Open video ${item.title}`}
            accessibilityHint={`Video duration ${formatDuration(item.durationSeconds)} and ${formatCompactNumber(item.viewsCount)} views`}
        >
            <View className="relative">
                <CreatorGridVideo height={tileWidth / 0.72} />
                <View
                    className="absolute inset-x-0 bottom-0 flex-row items-center justify-between px-2 py-1"
                    style={{ backgroundColor: 'rgba(0,0,0,0.45)' }}
                >
                    <View className="flex-row items-center">
                        <Ionicons name="play" size={11} color="#FFFFFF" />
                        <AppText className="ml-1 text-[10px] font-semibold" color="#FFFFFF">
                            {formatCompactNumber(item.viewsCount)}
                        </AppText>
                    </View>
                    <AppText className="text-[10px] font-semibold" color="#FFFFFF">
                        {formatDuration(realDurationSeconds ?? item.durationSeconds)}
                    </AppText>
                </View>
            </View>
        </Pressable>
    );

    const displayedFollowers = profile.followersCount + (isFollowing ? 1 : 0);

    return (
        <Screen title={`@${profile.username}`}>
            <FlashList
                data={videosForActiveTab}
                keyExtractor={(item) => item.id}
                renderItem={renderVideoCard}
                numColumns={columns}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 120 }}
                ListHeaderComponent={
                    <View>
                        <LinearGradient
                            colors={[colors.primary, colors.primary50, colors.accent]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={{ borderRadius: 20, padding: 16 }}
                        >
                            <View
                                pointerEvents="none"
                                style={{
                                    position: 'absolute',
                                    top: 0,
                                    right: 0,
                                    bottom: 0,
                                    left: 0,
                                    borderRadius: 20,
                                    backgroundColor: 'rgba(0,0,0,0.16)',
                                }}
                            />
                            <View className="flex-row items-center">
                                <Image
                                    source={{ uri: profile.avatarUrl }}
                                    resizeMode="cover"
                                    style={{
                                        width: 74,
                                        height: 74,
                                        borderRadius: 37,
                                        borderWidth: 2,
                                        borderColor: 'rgba(255,255,255,0.8)',
                                    }}
                                />
                                <View className="ml-3 flex-1">
                                    <AppText className="text-lg font-extrabold" color="#FFFFFF">
                                        {profile.displayName}
                                    </AppText>
                                    <AppText className="text-sm font-medium" color="rgba(255,255,255,0.92)">
                                        @{profile.username}
                                    </AppText>
                                    <View className="mt-1 flex-row items-center">
                                        <Ionicons name="location-outline" size={12} color="#FFFFFF" />
                                        <AppText className="ml-1 text-xs" color="rgba(255,255,255,0.92)">
                                            {profile.location}
                                        </AppText>
                                    </View>
                                </View>
                            </View>

                            <AppText className="mt-3 text-sm leading-5" color="rgba(255,255,255,0.95)">
                                {profile.bio}
                            </AppText>

                            <View className="mt-4 flex-row">
                                {[
                                    { label: 'Followers', value: formatCompactNumber(displayedFollowers) },
                                    { label: 'Likes', value: formatCompactNumber(profile.likesCount) },
                                    { label: 'Videos', value: formatCompactNumber(profile.videosCount) },
                                ].map((stat) => (
                                    <View key={stat.label} className="flex-1">
                                        <AppText className="text-base font-bold" color="#FFFFFF">
                                            {stat.value}
                                        </AppText>
                                        <AppText className="text-xs" color="rgba(255,255,255,0.86)">
                                            {stat.label}
                                        </AppText>
                                    </View>
                                ))}
                            </View>
                        </LinearGradient>

                        <View className="mt-3 flex-row">
                            <Animated.View className="flex-1" style={{ transform: [{ scale: followScale }] }}>
                                <Pressable
                                    onPress={handleFollowPress}
                                    onPressIn={() => animateButton(followScale, 0.97)}
                                    onPressOut={() => animateButton(followScale, 1)}
                                    className="rounded-xl py-3"
                                    style={{
                                        backgroundColor: isFollowing ? colors.success : colors.textPrimary,
                                    }}
                                    accessibilityRole="button"
                                    accessibilityLabel={isFollowing ? 'Following creator' : 'Follow creator'}
                                    accessibilityHint={isFollowing ? 'Double tap to unfollow' : 'Double tap to follow this creator'}
                                >
                                    <AppText className="text-center text-sm font-semibold" color={colors.background}>
                                        {isFollowing ? 'Following' : 'Follow'}
                                    </AppText>
                                </Pressable>
                            </Animated.View>

                            <Animated.View className="ml-2 flex-1" style={{ transform: [{ scale: messageScale }] }}>
                                <Pressable
                                    onPress={handleMessagePress}
                                    onPressIn={() => animateButton(messageScale, 0.97)}
                                    onPressOut={() => animateButton(messageScale, 1)}
                                    className="rounded-xl border py-3"
                                    style={{ borderColor: colors.border, backgroundColor: colors.backgroundAlt }}
                                    accessibilityRole="button"
                                    accessibilityLabel="Message creator"
                                    accessibilityHint="Open direct chat with this creator"
                                >
                                    <AppText className="text-center text-sm font-semibold" color={colors.textPrimary}>
                                        Message
                                    </AppText>
                                </Pressable>
                            </Animated.View>

                            <Animated.View className="ml-2 flex-1" style={{ transform: [{ scale: shareScale }] }}>
                                <Pressable
                                    onPress={handleSharePress}
                                    onPressIn={() => animateButton(shareScale, 0.97)}
                                    onPressOut={() => animateButton(shareScale, 1)}
                                    className="rounded-xl border py-3"
                                    style={{ borderColor: colors.border, backgroundColor: colors.backgroundAlt }}
                                    accessibilityRole="button"
                                    accessibilityLabel="Share creator profile"
                                    accessibilityHint="Opens share options"
                                >
                                    <AppText className="text-center text-sm font-semibold" color={colors.textPrimary}>
                                        Share
                                    </AppText>
                                </Pressable>
                            </Animated.View>
                        </View>

                        <View
                            className="mt-4 rounded-2xl border p-3"
                            style={{ borderColor: colors.border, backgroundColor: colors.backgroundAlt }}
                        >
                            <View className="flex-row items-center justify-between">
                                <AppText className="text-sm font-semibold" color={colors.textPrimary}>
                                    Premium Access
                                </AppText>
                                <View
                                    className="rounded-full px-2 py-1"
                                    style={{
                                        backgroundColor: viewerHasAccess ? 'rgba(26,118,13,0.15)' : 'rgba(248,183,53,0.2)',
                                    }}
                                >
                                    <AppText
                                        className="text-xs font-semibold"
                                        color={viewerHasAccess ? colors.success : colors.warning}
                                    >
                                        {viewerHasAccess ? 'Subscribed' : 'Subscription Required'}
                                    </AppText>
                                </View>
                            </View>
                            <AppText className="mt-1 text-sm" color={colors.textSecondary}>
                                GHS {profile.monthlySubscriptionPriceGhs.toFixed(2)} / month
                            </AppText>
                        </View>

                        <View
                            className="mt-4 flex-row rounded-xl border p-1"
                            style={{ borderColor: colors.border, backgroundColor: colors.backgroundAlt }}
                        >
                            <Pressable
                                onPress={() => handleTabPress('free')}
                                className="flex-1 rounded-lg py-2"
                                style={{
                                    backgroundColor: activeTab === 'free' ? colors.background : 'transparent',
                                }}
                                accessibilityRole="tab"
                                accessibilityState={{ selected: activeTab === 'free' }}
                                accessibilityLabel="Free videos tab"
                            >
                                <AppText className="text-center text-sm font-semibold" color={colors.textPrimary}>
                                    Free Videos
                                </AppText>
                            </Pressable>
                            <Pressable
                                onPress={() => handleTabPress('locked')}
                                className="ml-1 flex-1 rounded-lg py-2"
                                style={{
                                    backgroundColor: activeTab === 'locked' ? colors.background : 'transparent',
                                }}
                                accessibilityRole="tab"
                                accessibilityState={{ selected: activeTab === 'locked' }}
                                accessibilityLabel="Locked videos tab"
                                accessibilityHint={
                                    viewerHasAccess
                                        ? 'Shows subscriber videos'
                                        : 'Subscription required. Double tap for subscription prompt'
                                }
                            >
                                <View className="flex-row items-center justify-center">
                                    <Ionicons name="lock-closed" size={12} color={colors.textPrimary} />
                                    <AppText className="ml-1 text-center text-sm font-semibold" color={colors.textPrimary}>
                                        Locked Videos
                                    </AppText>
                                </View>
                            </Pressable>
                        </View>

                        <AppText className="mb-2 mt-3 text-xs uppercase tracking-[1px]" color={colors.textSecondary}>
                            {activeTab === 'free' ? 'Public Videos' : 'Subscriber Videos'}
                        </AppText>
                    </View>
                }
                ListEmptyComponent={
                    <View
                        className="mt-1 rounded-xl border px-4 py-6"
                        style={{ borderColor: colors.border, backgroundColor: colors.backgroundAlt }}
                    >
                        <AppText className="text-sm font-semibold" color={colors.textPrimary}>
                            No videos yet
                        </AppText>
                        <AppText className="mt-1 text-sm" color={colors.textSecondary}>
                            This creator has not posted in this section yet.
                        </AppText>
                    </View>
                }
            />

            <AppModal
                visible={showSubscribePrompt}
                onClose={() => {
                    setShowSubscribePrompt(false);
                    announce('Subscription dialog closed');
                }}
                title="Subscription Required"
            >
                <AppText className="text-sm leading-5" color={colors.textSecondary}>
                    You must subscribe to @{profile.username} to view locked videos. Premium access is
                    subscription-based and unlocks all subscriber videos for the billing period.
                </AppText>
                <View className="mt-4">
                    <AppButton
                        title={`Subscribe - GHS ${profile.monthlySubscriptionPriceGhs.toFixed(2)}/month`}
                        loading={isSubscribing}
                        disabled={viewerHasAccess}
                        onClick={() => {
                            if (viewerHasAccess) {
                                setShowSubscribePrompt(false);
                                announce('Already subscribed');
                                return;
                            }
                            void simulateSubscriptionPayment();
                        }}
                    />
                </View>
                {isSubscribing ? (
                    <AppText className="mt-3 text-xs" color={colors.textSecondary}>
                        {subscriptionStage === 'initiating'
                            ? 'Creating payment request...'
                            : 'Waiting for approval on your fake MoMo prompt...'}
                    </AppText>
                ) : null}
                <Pressable
                    className="mt-3 items-center"
                    onPress={() => {
                        void Haptics.selectionAsync();
                        setShowSubscribePrompt(false);
                        announce('Opening subscriptions screen');
                        router.push('/wallet/subscriptions' as Href);
                    }}
                    accessibilityRole="button"
                    accessibilityLabel="Manage subscriptions"
                    accessibilityHint="Opens subscriptions management screen"
                >
                    <AppText className="text-sm font-semibold" color={colors.accent}>
                        Manage my subscriptions
                    </AppText>
                </Pressable>
                <AppText className="mt-3 text-xs" color={colors.textSecondary}>
                    {buildShareText(profile.username)}
                </AppText>
            </AppModal>
        </Screen>
    );
}
