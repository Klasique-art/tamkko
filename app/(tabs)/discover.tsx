import React from 'react';
import { Pressable, ScrollView, View } from 'react-native';

import Screen from '@/components/ui/Screen';
import AppText from '@/components/ui/AppText';
import { useColors } from '@/config/colors';
import { mockTrendingHashtags, mockUsers, mockVideos } from '@/data/mock';

export default function DiscoverTab() {
    const colors = useColors();

    return (
        <Screen className="pt-4">
            <ScrollView contentContainerStyle={{ paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
                <AppText className="text-2xl font-bold" color={colors.textPrimary}>Discover</AppText>
                <AppText className="mt-1 text-sm" color={colors.textSecondary}>Find trending creators, videos, and hashtags.</AppText>

                <View className="mt-5">
                    <AppText className="text-sm font-semibold" color={colors.textPrimary}>Trending Hashtags</AppText>
                    <View className="mt-2 flex-row flex-wrap gap-2">
                        {mockTrendingHashtags.map((tag) => (
                            <View key={tag} className="rounded-full border px-3 py-1" style={{ borderColor: colors.border }}>
                                <AppText className="text-xs" color={colors.textPrimary}>{tag}</AppText>
                            </View>
                        ))}
                    </View>
                </View>

                <View className="mt-6">
                    <AppText className="text-sm font-semibold" color={colors.textPrimary}>Top Creators</AppText>
                    <View className="mt-2 gap-2">
                        {mockUsers.map((creator) => (
                            <Pressable
                                key={creator.user_id}
                                className="rounded-xl border p-3"
                                style={{ borderColor: colors.border, backgroundColor: colors.backgroundAlt }}
                            >
                                <AppText className="font-semibold" color={colors.textPrimary}>
                                    {creator.first_name} {creator.last_name}
                                </AppText>
                                <AppText className="text-xs" color={colors.textSecondary}>@{creator.email.split('@')[0]}</AppText>
                            </Pressable>
                        ))}
                    </View>
                </View>

                <View className="mt-6">
                    <AppText className="text-sm font-semibold" color={colors.textPrimary}>Trending Videos</AppText>
                    <View className="mt-2 gap-2">
                        {mockVideos.map((video) => (
                            <View key={video.id} className="rounded-xl border p-3" style={{ borderColor: colors.border }}>
                                <AppText className="font-semibold" color={colors.textPrimary}>{video.title}</AppText>
                                <AppText className="text-xs" color={colors.textSecondary}>{video.creatorUsername}</AppText>
                            </View>
                        ))}
                    </View>
                </View>
            </ScrollView>
        </Screen>
    );
}
