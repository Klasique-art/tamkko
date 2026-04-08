import { Href, router } from 'expo-router';
import React from 'react';
import { ActivityIndicator, Pressable, View } from 'react-native';

import AppText from '@/components/ui/AppText';
import Screen from '@/components/ui/Screen';
import { useColors } from '@/config/colors';
import { searchService } from '@/lib/services/searchService';
import { SearchHashtagResult } from '@/types/search.types';

export default function TrendingHashtagsScreen() {
    const colors = useColors();
    const [hashtags, setHashtags] = React.useState<SearchHashtagResult[]>([]);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        searchService.getTrendingHashtags().then((next) => {
            setHashtags(next);
            setLoading(false);
        });
    }, []);

    return (
        <Screen title="Trending Hashtags">
            {loading ? (
                <View className="flex-row items-center">
                    <ActivityIndicator color={colors.primary} />
                    <AppText className="ml-2 text-sm" color={colors.textSecondary}>Loading trends...</AppText>
                </View>
            ) : null}

            <View className="mt-2">
                {hashtags.map((item, index) => (
                    <Pressable
                        key={item.id}
                        onPress={() => router.push(`/search/hashtag/${encodeURIComponent(item.tag)}` as Href)}
                        className="mb-2 rounded-2xl border px-3 py-3"
                        style={{ borderColor: colors.border, backgroundColor: colors.backgroundAlt }}
                        accessibilityRole="button"
                        accessibilityLabel={`Open hashtag ${item.tag}`}
                    >
                        <View className="flex-row items-center justify-between">
                            <View>
                                <AppText className="text-sm font-bold" color={colors.textPrimary}>
                                    #{item.tag}
                                </AppText>
                                <AppText className="mt-1 text-xs" color={colors.textSecondary}>
                                    {searchService.compactCount(item.postsCount)} posts
                                </AppText>
                            </View>
                            <View className="items-end">
                                <AppText className="text-xs font-bold" color={colors.success}>{item.growthLabel}</AppText>
                                <AppText className="mt-1 text-[11px]" color={colors.textSecondary}>#{index + 1} today</AppText>
                            </View>
                        </View>
                    </Pressable>
                ))}
            </View>
        </Screen>
    );
}

