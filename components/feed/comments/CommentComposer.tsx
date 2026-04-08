import { BottomSheetTextInput } from '@gorhom/bottom-sheet';
import React from 'react';
import { Pressable, StyleProp, TextInput, View, ViewStyle } from 'react-native';

import AppText from '@/components/ui/AppText';
import { VideoComment } from '@/types/comment.types';

type CommentComposerProps = {
    value: string;
    onChangeText: (value: string) => void;
    onSubmit: () => void;
    replyTarget?: VideoComment | null;
    onCancelReply?: () => void;
    isSubmitting?: boolean;
    useBottomSheetInput?: boolean;
    containerStyle?: StyleProp<ViewStyle>;
    focusTrigger?: string;
};

export default function CommentComposer({
    value,
    onChangeText,
    onSubmit,
    replyTarget,
    onCancelReply,
    isSubmitting = false,
    useBottomSheetInput = true,
    containerStyle,
    focusTrigger,
}: CommentComposerProps) {
    const isDisabled = isSubmitting || value.trim().length === 0;
    const InputComponent = useBottomSheetInput ? BottomSheetTextInput : TextInput;
    const inputRef = React.useRef<any>(null);

    React.useEffect(() => {
        if (!focusTrigger) return;
        requestAnimationFrame(() => {
            inputRef.current?.focus();
        });
    }, [focusTrigger]);

    return (
        <View
            className="border-t px-4 pb-4 pt-3"
            style={[{ borderTopColor: '#E4E4E7', backgroundColor: '#FFFFFF' }, containerStyle]}
        >
            {replyTarget ? (
                <View className="mb-2 flex-row items-center justify-between rounded-lg bg-black/5 px-3 py-2">
                    <AppText className="text-xs font-semibold" color="#111111">
                        Replying to {replyTarget.authorHandle}
                    </AppText>
                    <Pressable
                        onPress={onCancelReply}
                        accessibilityRole="button"
                        accessibilityLabel="Cancel reply"
                        accessibilityHint="Return to normal comment mode"
                    >
                        <AppText className="text-xs font-semibold" color="#111111">
                            Cancel
                        </AppText>
                    </Pressable>
                </View>
            ) : null}

            <View className="flex-row items-end">
                <InputComponent
                    ref={inputRef}
                    value={value}
                    onChangeText={onChangeText}
                    placeholder="Write a comment"
                    multiline
                    maxLength={280}
                    style={{
                        flex: 1,
                        borderWidth: 1,
                        borderColor: '#D4D4D8',
                        borderRadius: 16,
                        paddingHorizontal: 12,
                        paddingVertical: 10,
                        color: '#111111',
                        fontSize: 15,
                        maxHeight: 110,
                    }}
                    accessibilityLabel="Comment input"
                    accessibilityHint="Type your comment and tap send"
                />

                <Pressable
                    onPress={onSubmit}
                    disabled={isDisabled}
                    className="ml-2 rounded-full px-4 py-3"
                    style={{ backgroundColor: isDisabled ? '#A1A1AA' : '#111111' }}
                    accessibilityRole="button"
                    accessibilityLabel={replyTarget ? 'Send reply' : 'Send comment'}
                    accessibilityState={{ disabled: isDisabled, busy: isSubmitting }}
                >
                    <AppText className="text-xs font-semibold" color="#FFFFFF">
                        Send
                    </AppText>
                </Pressable>
            </View>
        </View>
    );
}
