import { BottomSheetFlatList } from '@gorhom/bottom-sheet';
import { FlashList } from '@shopify/flash-list';
import React, { useEffect, useMemo, useState } from 'react';
import { AccessibilityInfo, ActivityIndicator, Keyboard, Platform, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import CommentComposer from '@/components/feed/comments/CommentComposer';
import CommentListItem from '@/components/feed/comments/CommentListItem';
import AppText from '@/components/ui/AppText';
import { mockCommentThreadService } from '@/lib/services/mockCommentThreadService';
import { VideoComment } from '@/types/comment.types';

const PAGE_SIZE = 14;

type CommentsThreadProps = {
    videoId: string;
    videoTitle?: string;
    onCommentCreated?: (videoId: string) => void;
    compact?: boolean;
    commentsDisabled?: boolean;
};

export default function CommentsThread({
    videoId,
    videoTitle,
    onCommentCreated,
    compact = false,
    commentsDisabled = false,
}: CommentsThreadProps) {
    const insets = useSafeAreaInsets();
    const [comments, setComments] = useState<VideoComment[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [commentText, setCommentText] = useState('');
    const [replyTarget, setReplyTarget] = useState<VideoComment | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isPaginating, setIsPaginating] = useState(false);
    const [busyLikeId, setBusyLikeId] = useState<string | null>(null);
    const [keyboardInset, setKeyboardInset] = useState(0);

    const visibleComments = useMemo(() => comments.slice(0, page * PAGE_SIZE), [comments, page]);
    const hasMoreComments = visibleComments.length < comments.length;

    useEffect(() => {
        if (commentsDisabled) {
            setComments([]);
            setPage(1);
            setCommentText('');
            setReplyTarget(null);
            setIsLoading(false);
            return;
        }

        let isMounted = true;
        const load = async () => {
            setIsLoading(true);
            const data = await mockCommentThreadService.getComments(videoId);
            if (isMounted) {
                setComments(data);
                setPage(1);
                setCommentText('');
                setReplyTarget(null);
                setIsLoading(false);
            }
        };

        void load();
        return () => {
            isMounted = false;
        };
    }, [commentsDisabled, videoId]);

    useEffect(() => {
        if (compact) return;

        const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
        const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

        const onShow = Keyboard.addListener(showEvent, (event) => {
            const nextInset = Math.max(0, event.endCoordinates.height - insets.bottom);
            setKeyboardInset(nextInset);
        });
        const onHide = Keyboard.addListener(hideEvent, () => {
            setKeyboardInset(0);
        });

        return () => {
            onShow.remove();
            onHide.remove();
        };
    }, [compact, insets.bottom]);

    const handleSubmitComment = async () => {
        const rawText = commentText.trim();
        if (!rawText || isSubmitting) return;

        setIsSubmitting(true);
        const posted = await mockCommentThreadService.postComment({
            videoId,
            text: rawText,
            parentCommentId: replyTarget?.id,
            replyToHandle: replyTarget?.authorHandle,
        });

        setComments((current) => {
            if (replyTarget?.id) {
                const parentIndex = current.findIndex((comment) => comment.id === replyTarget.id);
                if (parentIndex < 0) return [posted, ...current];
                let insertIndex = parentIndex + 1;
                while (insertIndex < current.length && current[insertIndex]?.parentCommentId === replyTarget.id) {
                    insertIndex += 1;
                }
                return [...current.slice(0, insertIndex), posted, ...current.slice(insertIndex)];
            }
            return [posted, ...current];
        });

        setCommentText('');
        setReplyTarget(null);
        setPage(1);
        setIsSubmitting(false);
        Keyboard.dismiss();
        onCommentCreated?.(videoId);
        AccessibilityInfo.announceForAccessibility(replyTarget ? 'Reply posted' : 'Comment posted');
    };

    const handleLikeToggle = async (comment: VideoComment) => {
        if (busyLikeId) return;
        setBusyLikeId(comment.id);
        const updated = await mockCommentThreadService.toggleLike(videoId, comment.id);
        if (updated) {
            setComments((current) =>
                current.map((item) => (item.id === updated.id ? { ...item, likesCount: updated.likesCount, isLiked: updated.isLiked } : item))
            );
            AccessibilityInfo.announceForAccessibility(updated.isLiked ? 'Comment liked' : 'Comment unliked');
        }
        setBusyLikeId(null);
    };

    const handleReply = (comment: VideoComment) => {
        setReplyTarget(comment);
        setCommentText(`${comment.authorHandle} `);
        AccessibilityInfo.announceForAccessibility(`Replying to ${comment.authorHandle}`);
    };

    const loadMoreComments = () => {
        if (!hasMoreComments || isPaginating) return;
        setIsPaginating(true);
        setTimeout(() => {
            setPage((current) => current + 1);
            setIsPaginating(false);
        }, 180);
    };

    const listFooter = hasMoreComments ? (
        <View className="items-center py-3">
            {isPaginating ? <ActivityIndicator size="small" color="#111111" /> : null}
            <AppText className="mt-2 text-xs" color="#52525B">
                {isPaginating ? 'Loading more comments...' : 'Scroll to load more'}
            </AppText>
        </View>
    ) : (
        <View className="items-center py-2">
            <AppText className="text-xs" color="#71717A">
                You reached the end
            </AppText>
        </View>
    );

    const listHeader = compact ? null : (
        <View className="px-4 pb-3 pt-2">
            <AppText className="text-lg font-bold" color="#111111">
                Comments
            </AppText>
            <AppText className="mt-1 text-sm" color="#52525B">
                {videoTitle ? `Join the conversation on ${videoTitle}` : 'Join the conversation'}
            </AppText>
        </View>
    );

    const compactList = (
        <BottomSheetFlatList<VideoComment>
            data={visibleComments}
            keyExtractor={(item: VideoComment) => item.id}
            renderItem={({ item }: { item: VideoComment }) => (
                <CommentListItem
                    comment={item}
                    onReply={handleReply}
                    onToggleLike={handleLikeToggle}
                    likeBusy={busyLikeId === item.id}
                />
            )}
            onEndReached={loadMoreComments}
            onEndReachedThreshold={0.5}
            contentContainerStyle={{ paddingHorizontal: 12, paddingBottom: 16 }}
            keyboardShouldPersistTaps="handled"
            ListEmptyComponent={
                <View className="items-center py-8">
                    <AppText className="text-sm font-semibold" color="#111111">
                        Be the first to comment
                    </AppText>
                </View>
            }
            ListFooterComponent={listFooter}
            accessibilityRole="list"
            accessibilityLabel="Video comments list"
        />
    );

    const fullPageList = (
        <FlashList<VideoComment>
            data={visibleComments}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
                <CommentListItem
                    comment={item}
                    onReply={handleReply}
                    onToggleLike={handleLikeToggle}
                    likeBusy={busyLikeId === item.id}
                />
            )}
            onEndReached={loadMoreComments}
            onEndReachedThreshold={0.5}
            contentContainerStyle={{ paddingHorizontal: 12, paddingBottom: 16 }}
            keyboardShouldPersistTaps="handled"
            ListEmptyComponent={
                <View className="items-center py-8">
                    <AppText className="text-sm font-semibold" color="#111111">
                        Be the first to comment
                    </AppText>
                </View>
            }
            ListFooterComponent={listFooter}
            accessibilityRole="list"
            accessibilityLabel="Video comments list"
        />
    );

    const threadBody = (
        <View className="flex-1" style={{ backgroundColor: '#FFFFFF' }}>
            {listHeader}

            {isLoading ? (
                <View className="flex-1 items-center justify-center py-8">
                    <ActivityIndicator size="small" color="#111111" />
                    <AppText className="mt-2 text-sm" color="#52525B">
                        Loading comments...
                    </AppText>
                </View>
            ) : commentsDisabled ? (
                <View className="flex-1 items-center justify-center px-6">
                    <AppText className="text-center text-base font-bold" color="#111111">
                        Comments for this post are turned off.
                    </AppText>
                    <AppText className="mt-2 text-center text-sm" color="#52525B">
                        The creator disabled commenting on this post.
                    </AppText>
                </View>
            ) : (
                compact ? compactList : fullPageList
            )}

            {commentsDisabled ? null : (
                <CommentComposer
                    value={commentText}
                    onChangeText={setCommentText}
                    onSubmit={handleSubmitComment}
                    replyTarget={replyTarget}
                    onCancelReply={() => {
                        setReplyTarget(null);
                        setCommentText('');
                        AccessibilityInfo.announceForAccessibility('Reply cancelled');
                    }}
                    isSubmitting={isSubmitting}
                    useBottomSheetInput={compact}
                    containerStyle={compact ? undefined : { paddingBottom: 16 + keyboardInset + insets.bottom }}
                    focusTrigger={replyTarget?.id}
                />
            )}
        </View>
    );

    return threadBody;
}
