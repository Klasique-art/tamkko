import { Ionicons } from '@expo/vector-icons';
import { Asset } from 'expo-asset';
import { Image } from 'expo-image';
import * as VideoThumbnails from 'expo-video-thumbnails';
import React from 'react';
import { Animated, Pressable, View } from 'react-native';

import AppText from '@/components/ui/AppText';
import { VideoItem } from '@/types/video.types';

type VideoGridTileProps = {
    item: VideoItem;
    width: number;
    height: number;
    onPress: () => void;
    accessibilityLabel: string;
    statLabel?: string;
};

const formatCompact = (value: number) =>
    new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 }).format(value);

const sourceThumbnailCache = new Map<string, string | null>();
const inFlightBySourceKey = new Map<string, Promise<string | null>>();
const thumbnailQueue: (() => void)[] = [];
let activeThumbnailTasks = 0;
const MAX_CONCURRENT_THUMBNAIL_TASKS = 1;

const hasRenderableThumbnail = (value?: string) => Boolean(value && /^file:|^content:|^https?:|^data:/.test(value));

const getSourceKey = (item: VideoItem) => {
    if (hasRenderableThumbnail(item.thumbnailUrl)) return `thumb:${item.thumbnailUrl}`;
    if (item.videoSource && typeof item.videoSource === 'object' && 'uri' in item.videoSource && item.videoSource.uri) {
        return `uri:${item.videoSource.uri}`;
    }
    if (typeof item.videoSource === 'number') return `module:${item.videoSource}`;
    return `item:${item.id}`;
};

const resolveVideoUri = async (item: VideoItem): Promise<string | null> => {
    if (hasRenderableThumbnail(item.thumbnailUrl)) return item.thumbnailUrl ?? null;
    if (item.videoSource && typeof item.videoSource === 'object' && 'uri' in item.videoSource && item.videoSource.uri) {
        return item.videoSource.uri;
    }
    if (typeof item.videoSource === 'number') {
        const asset = Asset.fromModule(item.videoSource);
        if (!asset.localUri) await asset.downloadAsync();
        return asset.localUri ?? asset.uri ?? null;
    }
    return null;
};

const runQueuedThumbnailTask = () => {
    if (activeThumbnailTasks >= MAX_CONCURRENT_THUMBNAIL_TASKS) return;
    const next = thumbnailQueue.shift();
    if (!next) return;
    activeThumbnailTasks += 1;
    next();
};

const getThumbnailForItem = async (item: VideoItem): Promise<string | null> => {
    const sourceKey = getSourceKey(item);
    if (sourceThumbnailCache.has(sourceKey)) return sourceThumbnailCache.get(sourceKey) ?? null;
    if (inFlightBySourceKey.has(sourceKey)) return inFlightBySourceKey.get(sourceKey) ?? null;

    const task = new Promise<string | null>((resolve) => {
        thumbnailQueue.push(() => {
            const finish = (value: string | null) => {
                sourceThumbnailCache.set(sourceKey, value);
                inFlightBySourceKey.delete(sourceKey);
                activeThumbnailTasks = Math.max(0, activeThumbnailTasks - 1);
                runQueuedThumbnailTask();
                resolve(value);
            };

            const execute = async () => {
                try {
                    const videoUri = await resolveVideoUri(item);
                    if (!videoUri) {
                        finish(null);
                        return;
                    }
                    const frame = await VideoThumbnails.getThumbnailAsync(videoUri, { time: 1200 });
                    finish(frame.uri ?? null);
                } catch {
                    finish(null);
                }
            };

            void execute();
        });
        runQueuedThumbnailTask();
    });

    inFlightBySourceKey.set(sourceKey, task);
    return task;
};

export default function VideoGridTile({
    item,
    width,
    height,
    onPress,
    accessibilityLabel,
    statLabel,
}: VideoGridTileProps) {
    const pulseOpacity = React.useRef(new Animated.Value(0.5)).current;
    const isVideoPost = Boolean(item.playbackUrl || item.videoSource);
    const viewCount = Number.isFinite(Number(item.viewsCount))
        ? Math.max(0, Number(item.viewsCount))
        : Math.max(item.likesCount * 12, 1000);
    const staticThumbnailUri = hasRenderableThumbnail(item.thumbnailUrl) ? item.thumbnailUrl : null;
    const [thumbnailUri, setThumbnailUri] = React.useState<string | null>(staticThumbnailUri ?? null);

    React.useEffect(() => {
        let mounted = true;
        if (staticThumbnailUri) {
            setThumbnailUri(staticThumbnailUri);
            return () => {
                mounted = false;
            };
        }

        const load = async () => {
            const uri = await getThumbnailForItem(item);
            if (!mounted) return;
            setThumbnailUri(uri);
        };
        void load();
        return () => {
            mounted = false;
        };
    }, [item, staticThumbnailUri]);

    React.useEffect(() => {
        if (thumbnailUri) return;
        const loop = Animated.loop(
            Animated.sequence([
                Animated.timing(pulseOpacity, { toValue: 0.74, duration: 760, useNativeDriver: true }),
                Animated.timing(pulseOpacity, { toValue: 0.44, duration: 760, useNativeDriver: true }),
            ])
        );
        loop.start();
        return () => loop.stop();
    }, [pulseOpacity, thumbnailUri]);

    return (
        <Pressable
            onPress={onPress}
            style={{ width, height }}
            className="overflow-hidden rounded-2xl"
            accessibilityRole="button"
            accessibilityLabel={`${accessibilityLabel}. ${isVideoPost ? 'Video post' : 'Image post'}. ${formatCompact(viewCount)} views.`}
            accessibilityHint={isVideoPost ? 'Opens video playback with management controls.' : 'Opens image post with management controls.'}
        >
            {thumbnailUri ? (
                <Image
                    source={{ uri: thumbnailUri }}
                    style={{ width: '100%', height: '100%' }}
                    contentFit="cover"
                    transition={100}
                />
            ) : (
                <View style={{ width: '100%', height: '100%', backgroundColor: '#111111' }}>
                    <Animated.View
                        style={{
                            position: 'absolute',
                            top: 0,
                            right: 0,
                            bottom: 0,
                            left: 0,
                            backgroundColor: '#1A1A1A',
                            opacity: pulseOpacity,
                        }}
                    />
                    <View className="absolute inset-0 items-center justify-center">
                        <View
                            className="items-center justify-center rounded-full"
                            style={{ width: 40, height: 40, backgroundColor: 'rgba(255,255,255,0.16)' }}
                        >
                            <Ionicons name={isVideoPost ? 'play' : 'image-outline'} size={18} color="#FFFFFF" />
                        </View>
                    </View>
                </View>
            )}

            <View className="absolute inset-0" style={{ backgroundColor: 'rgba(0,0,0,0.18)' }} />
            <View className="absolute left-2 top-2 rounded-full px-2 py-1" style={{ backgroundColor: 'rgba(0,0,0,0.42)' }}>
                <View className="flex-row items-center">
                    <Ionicons name="eye-outline" size={11} color="#FFFFFF" />
                    <AppText className="ml-1 text-[10px] font-semibold" color="#FFFFFF">
                        {formatCompact(viewCount)}
                    </AppText>
                </View>
            </View>
            <View className="absolute bottom-2 right-2 rounded-full px-2 py-1" style={{ backgroundColor: 'rgba(0,0,0,0.52)' }}>
                <View className="flex-row items-center">
                    <Ionicons name={isVideoPost ? 'play' : 'image-outline'} size={11} color="#FFFFFF" />
                    <AppText className="ml-1 text-[10px] font-semibold" color="#FFFFFF">
                        {isVideoPost ? (statLabel ?? formatCompact(Math.max(item.likesCount * 12, 1000))) : 'Image'}
                    </AppText>
                </View>
            </View>
        </Pressable>
    );
}
