import { Ionicons } from '@expo/vector-icons';
import { FlashList } from '@shopify/flash-list';
import { LinearGradient } from 'expo-linear-gradient';
import { Href, router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { ActivityIndicator, Pressable, View, useWindowDimensions } from 'react-native';

import AppText from '@/components/ui/AppText';
import Screen from '@/components/ui/Screen';
import { useColors } from '@/config/colors';
import { searchService } from '@/lib/services/searchService';
import { SearchHashtagResult, SearchVideoResult } from '@/types/search.types';

export default function HashtagScreen() {
    const colors = useColors();
    const { width } = useWindowDimensions();
    const { tag } = useLocalSearchParams<{ tag: string }>();
    const normalizedTag = (tag ?? 'hashtag').replace(/^#/, '').trim();

    const [loading, setLoading] = React.useState(true);
    const [videos, setVideos] = React.useState<SearchVideoResult[]>([]);
    const [relatedTags, setRelatedTags] = React.useState<SearchHashtagResult[]>([]);

    React.useEffect(() => {
        let isMounted = true;
        setLoading(true);
        Promise.all([
            searchService.searchVideos(normalizedTag),
            searchService.searchHashtags(normalizedTag),
        ]).then(([videoResults, hashtagResults]) => {
            if (!isMounted) return;
            setVideos(videoResults);
            setRelatedTags(hashtagResults.filter((item) => item.tag !== normalizedTag).slice(0, 5));
            setLoading(false);
        });

        return () => {
            isMounted = false;
        };
    }, [normalizedTag]);

    const tileGap = 10;
    const tileWidth = Math.floor((width - 32 - tileGap) / 2);

    return (
        <Screen title={`#${normalizedTag}`}>
            <View className="rounded-2xl border p-3" style={{ borderColor: colors.border, backgroundColor: colors.backgroundAlt }}>
                <AppText className="text-base font-bold" color={colors.textPrimary}>#{normalizedTag}</AppText>
                <AppText className="mt-1 text-sm" color={colors.textSecondary}>
                    Community posts and creator videos related to this topic.
                </AppText>
                <View className="mt-2 flex-row flex-wrap">
                    {relatedTags.map((item) => (
                        <Pressable
                            key={item.id}
                            onPress={() => router.replace(`/search/hashtag/${encodeURIComponent(item.tag)}` as Href)}
                            className="mb-2 mr-2 rounded-full border px-3 py-1.5"
                            style={{ borderColor: colors.border, backgroundColor: colors.background }}
                            accessibilityRole="button"
                            accessibilityLabel={`Open related hashtag ${item.tag}`}
                        >
                            <AppText className="text-xs" color={colors.textPrimary}>#{item.tag}</AppText>
                        </Pressable>
                    ))}
                </View>
            </View>

            {loading ? (
                <View className="mt-3 flex-row items-center">
                    <ActivityIndicator color={colors.primary} />
                    <AppText className="ml-2 text-sm" color={colors.textSecondary}>Loading hashtag feed...</AppText>
                </View>
            ) : null}

            <FlashList
                data={videos}
                keyExtractor={(item) => item.id}
                numColumns={2}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingTop: 12, paddingBottom: 110 }}
                renderItem={({ item, index }) => (
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
                        accessibilityLabel={`Open video ${item.title}`}
                    >
                        <View style={{ aspectRatio: 3 / 4, backgroundColor: '#111111' }}>
                            <LinearGradient
                                colors={['rgba(243,130,24,0.24)', 'rgba(87,18,23,0.42)', 'rgba(0,0,0,0.58)']}
                                style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 }}
                            />
                            <View className="absolute left-2 top-2 rounded-full px-2 py-1" style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}>
                                <AppText className="text-[10px] font-semibold" color="#FFFFFF">{item.creatorUsername}</AppText>
                            </View>
                            <View className="absolute bottom-2 left-2 right-2 rounded-xl px-2 py-1.5" style={{ backgroundColor: 'rgba(0,0,0,0.45)' }}>
                                <View className="flex-row items-center justify-between">
                                    <View className="flex-row items-center">
                                        <Ionicons name="play" size={11} color="#FFFFFF" />
                                        <AppText className="ml-1 text-[10px] font-semibold" color="#FFFFFF">
                                            {searchService.compactCount(item.viewsCount)}
                                        </AppText>
                                    </View>
                                    <View className="flex-row items-center">
                                        <Ionicons name="heart" size={10} color="#FFFFFF" />
                                        <AppText className="ml-1 text-[10px] font-semibold" color="#FFFFFF">
                                            {searchService.compactCount(item.likesCount)}
                                        </AppText>
                                    </View>
                                </View>
                            </View>
                        </View>
                        <View className="px-3 pb-3 pt-2">
                            <AppText className="text-xs font-bold" color={colors.textPrimary} numberOfLines={1}>{item.title}</AppText>
                        </View>
                    </Pressable>
                )}
            />
        </Screen>
    );
}

