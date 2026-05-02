import { BottomSheetFlatList } from '@gorhom/bottom-sheet';
import { FlashList } from '@shopify/flash-list';
import React, { useEffect, useMemo, useState } from 'react';
import { AccessibilityInfo, ActivityIndicator, Keyboard, Platform, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import CommentComposer from '@/components/feed/comments/CommentComposer';
import CommentListItem from '@/components/feed/comments/CommentListItem';
import AppText from '@/components/ui/AppText';
import { commentService } from '@/lib/services/commentService';
import { VideoComment } from '@/types/comment.types';

const PAGE_SIZE = 30;

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
    const [nextCursor, setNextCursor] = useState<string | null>(null);
    const [hasMoreComments, setHasMoreComments] = useState(false);
    const [commentText, setCommentText] = useState('');
    const [replyTarget, setReplyTarget] = useState<VideoComment | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isPaginating, setIsPaginating] = useState(false);
    const [busyLikeId, setBusyLikeId] = useState<string | null>(null);
    const [keyboardInset, setKeyboardInset] = useState(0);

    const commentDepthById = useMemo(() => {
        const byId = new Map(comments.map((comment) => [comment.id, comment]));
        const depthCache = new Map<string, number>();
        const MAX_DEPTH = 8;

        const resolveDepth = (commentId: string): number => {
            if (depthCache.has(commentId)) return depthCache.get(commentId)!;
            const node = byId.get(commentId);
            if (!node?.parentCommentId) {
                depthCache.set(commentId, 0);
                return 0;
            }

            let depth = 0;
            let cursor = node.parentCommentId;
            while (cursor && depth < MAX_DEPTH) {
                const parent = byId.get(cursor);
                if (!parent) break;
                depth += 1;
                cursor = parent.parentCommentId;
            }

            depthCache.set(commentId, depth);
            return depth;
        };

        for (const comment of comments) resolveDepth(comment.id);
        return depthCache;
    }, [comments]);

    useEffect(() => {
        if (commentsDisabled) {
            setComments([]);
            setNextCursor(null);
            setHasMoreComments(false);
            setCommentText('');
            setReplyTarget(null);
            setIsLoading(false);
            return;
        }

        let isMounted = true;
        const load = async () => {
            setIsLoading(true);
            try {
                const data = await commentService.getCommentsPage(videoId, { limit: PAGE_SIZE, sort: 'oldest' });
                if (isMounted) {
                    setComments(data.items);
                    setNextCursor(data.nextCursor);
                    setHasMoreComments(data.hasMore);
                    setCommentText('');
                    setReplyTarget(null);
                }
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
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
        try {
            const posted = await commentService.createComment(videoId, {
                body: rawText,
                ...(replyTarget?.id ? { parent_comment_id: replyTarget.id } : {}),
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
            Keyboard.dismiss();
            onCommentCreated?.(videoId);
            AccessibilityInfo.announceForAccessibility(replyTarget ? 'Reply posted' : 'Comment posted');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleLikeToggle = async (comment: VideoComment) => {
        if (busyLikeId || comment.isDeleted) return;
        setBusyLikeId(comment.id);
        try {
            const updated = await commentService.toggleCommentLike(comment.id);
            setComments((current) =>
                current.map((item) =>
                    item.id === updated.commentId ? { ...item, likesCount: updated.likesCount, isLiked: updated.likedByMe } : item
                )
            );
            AccessibilityInfo.announceForAccessibility(updated.likedByMe ? 'Comment liked' : 'Comment unliked');
        } finally {
            setBusyLikeId(null);
        }
    };

    const handleReply = (comment: VideoComment) => {
        if (comment.isDeleted) return;
        setReplyTarget(comment);
        setCommentText(`${comment.authorHandle} `);
        AccessibilityInfo.announceForAccessibility(`Replying to ${comment.authorHandle}`);
    };

    const loadMoreComments = async () => {
        if (!hasMoreComments || isPaginating || !nextCursor) return;
        setIsPaginating(true);
        try {
            const data = await commentService.getCommentsPage(videoId, {
                cursor: nextCursor,
                limit: PAGE_SIZE,
                sort: 'oldest',
            });
            setComments((current) => [...current, ...data.items]);
            setNextCursor(data.nextCursor);
            setHasMoreComments(data.hasMore);
        } finally {
            setIsPaginating(false);
        }
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
            data={comments}
            keyExtractor={(item: VideoComment) => item.id}
            renderItem={({ item }: { item: VideoComment }) => (
                <CommentListItem
                    comment={item}
                    depth={commentDepthById.get(item.id) ?? 0}
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
            data={comments}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
                <CommentListItem
                    comment={item}
                    depth={commentDepthById.get(item.id) ?? 0}
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
