import { Ionicons } from '@expo/vector-icons';
import { FlashList } from '@shopify/flash-list';
import { LinearGradient } from 'expo-linear-gradient';
import { Href, router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { ActivityIndicator, Pressable, TextInput, View, useWindowDimensions } from 'react-native';

import AppText from '@/components/ui/AppText';
import Screen from '@/components/ui/Screen';
import { useColors } from '@/config/colors';
import { searchService } from '@/lib/services/searchService';
import { SearchVideoResult } from '@/types/search.types';

export default function SearchVideosScreen() {
    const colors = useColors();
    const { width } = useWindowDimensions();
    const params = useLocalSearchParams<{ q?: string }>();
    const initialQuery = typeof params.q === 'string' ? decodeURIComponent(params.q) : '';
    const [query, setQuery] = React.useState(initialQuery);
    const [results, setResults] = React.useState<SearchVideoResult[]>([]);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        const timer = setTimeout(() => {
            setLoading(true);
            searchService.searchVideos(query.trim()).then((next) => {
                setResults(next);
                setLoading(false);
            });
        }, 150);
        return () => clearTimeout(timer);
    }, [query]);

    const tileGap = 10;
    const tileWidth = Math.floor((width - 32 - tileGap) / 2);

    return (
        <Screen title="Search Videos">
            <View className="rounded-2xl border px-3 py-2" style={{ borderColor: colors.border, backgroundColor: colors.backgroundAlt }}>
                <View className="flex-row items-center">
                    <Ionicons name="search" size={16} color={colors.textSecondary} />
                    <TextInput
                        value={query}
                        onChangeText={setQuery}
                        placeholder="Search videos"
                        placeholderTextColor={colors.textSecondary}
                        style={{ flex: 1, marginLeft: 8, color: colors.textPrimary, fontSize: 15, fontWeight: '600', paddingVertical: 6 }}
                        accessibilityLabel="Search videos"
                    />
                </View>
            </View>

            {loading ? (
                <View className="mt-4 flex-row items-center">
                    <ActivityIndicator color={colors.primary} />
                    <AppText className="ml-2 text-sm" color={colors.textSecondary}>Loading videos...</AppText>
                </View>
            ) : null}

            <FlashList
                data={results}
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
                    >
                        <View style={{ aspectRatio: 3 / 4, backgroundColor: '#111111' }}>
                            <LinearGradient
                                colors={['rgba(243,130,24,0.24)', 'rgba(87,18,23,0.42)', 'rgba(0,0,0,0.58)']}
                                style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 }}
                            />
                            <View className="absolute left-2 top-2 rounded-full px-2 py-1" style={{ backgroundColor: 'rgba(255,255,255,0.18)' }}>
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
                ListEmptyComponent={
                    !loading ? (
                        <View className="rounded-2xl border p-4" style={{ borderColor: colors.border, backgroundColor: colors.backgroundAlt }}>
                            <AppText className="text-sm" color={colors.textSecondary}>No matching videos found.</AppText>
                        </View>
                    ) : null
                }
            />
        </Screen>
    );
}

