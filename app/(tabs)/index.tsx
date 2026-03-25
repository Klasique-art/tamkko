import React from 'react';
import { FlatList, ImageBackground, ListRenderItemInfo, View } from 'react-native';

import AppText from '@/components/ui/AppText';
import { mockVideos } from '@/data/mock';

type FeedItem = {
    id: string;
    title: string;
    creatorUsername: string;
    thumbnailUrl?: string;
};

const feedItems: FeedItem[] = mockVideos.map((video) => ({
    id: video.id,
    title: video.title,
    creatorUsername: video.creatorUsername,
    thumbnailUrl: video.thumbnailUrl,
}));

export default function HomeFeedTab() {
    const [pageHeight, setPageHeight] = React.useState(0);

    const renderItem = ({ item, index }: ListRenderItemInfo<FeedItem>) => (
        <ImageBackground
            source={{ uri: item.thumbnailUrl }}
            style={{ height: pageHeight, justifyContent: 'flex-end' }}
            resizeMode="cover"
        >
            <View
                style={{
                    backgroundColor: 'rgba(0,0,0,0.35)',
                    paddingHorizontal: 24,
                    paddingBottom: 48,
                    paddingTop: 16,
                }}
            >
                <AppText className="text-3xl font-bold" color="#FFFFFF">
                    Video Scaffold {index + 1}
                </AppText>
                <AppText className="mt-2 text-base" color="#FFFFFF">
                    {item.title}
                </AppText>
                <AppText className="mt-1 text-sm" color="#FFFFFF">
                    {item.creatorUsername}
                </AppText>
                <AppText className="mt-3 text-xs" color="#FFFFFF">
                    Swipe up to snap to next video
                </AppText>
            </View>
        </ImageBackground>
    );

    return (
        <View
            style={{ flex: 1, backgroundColor: '#000000' }}
            onLayout={(event) => setPageHeight(event.nativeEvent.layout.height)}
        >
            {pageHeight > 0 ? (
                <FlatList
                    data={feedItems}
                    keyExtractor={(item) => item.id}
                    renderItem={renderItem}
                    pagingEnabled
                    showsVerticalScrollIndicator={false}
                    bounces={false}
                    snapToInterval={pageHeight}
                    decelerationRate="fast"
                    getItemLayout={(_, index) => ({
                        length: pageHeight,
                        offset: pageHeight * index,
                        index,
                    })}
                />
            ) : null}
        </View>
    );
}
