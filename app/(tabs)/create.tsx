import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { CameraView, useCameraPermissions, useMicrophonePermissions } from 'expo-camera';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useVideoPlayer, VideoView } from 'expo-video';
import * as VideoThumbnails from 'expo-video-thumbnails';
import React from 'react';
import { Alert, PanResponder, Pressable, ScrollView, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
    CreateMediaPreview,
    CreateUploadProgress,
    CreateVisibilitySelector,
} from '@/components/create';
import AppSwitch from '@/components/ui/AppSwitch';
import AppText from '@/components/ui/AppText';
import Screen from '@/components/ui/Screen';
import { useColors } from '@/config/colors';
import { useToast } from '@/context/ToastContext';
import { useAuth } from '@/context/AuthContext';
import {
    CREATE_MAX_CAPTION_LENGTH,
    CREATE_MAX_RECORDING_SECONDS,
    imageFilterOptions,
} from '@/data/mock';
import { postPublishingService, UploadStatusError } from '@/lib/services/postPublishingService';
import { subscriptionPricingService } from '@/lib/services/subscriptionPricingService';
import { useVideoFeedStore } from '@/lib/stores/videoFeedStore';
import { CreateDraft } from '@/types/create.types';

const initialDraft: CreateDraft = {
    media: null,
    caption: '',
    visibility: 'public',
    allowComments: true,
    trimDurationSeconds: CREATE_MAX_RECORDING_SECONDS,
    imageFilter: 'original',
};
const MIN_TRIM_WINDOW_SECONDS = 0.1;
const toBackendVisibility = (value: CreateDraft['visibility']): 'public' | 'paid' | 'followers_only' | 'private' => {
    if (value === 'premium') return 'paid';
    return value;
};

export default function CreateTab() {
    const colors = useColors();
    const insets = useSafeAreaInsets();
    const { showToast } = useToast();
    const { user } = useAuth();
    const addCreatedPost = useVideoFeedStore((state) => state.addCreatedPost);

    const [draft, setDraft] = React.useState<CreateDraft>(initialDraft);
    const [uploadProgress, setUploadProgress] = React.useState(0);
    const [uploadStage, setUploadStage] = React.useState<'preparing' | 'uploading' | 'processing' | 'done'>('preparing');
    const [isUploading, setIsUploading] = React.useState(false);

    const [isCameraOpen, setIsCameraOpen] = React.useState(false);
    const [isRecording, setIsRecording] = React.useState(false);
    const [cameraFacing, setCameraFacing] = React.useState<'front' | 'back'>('front');
    const [recordingElapsedSeconds, setRecordingElapsedSeconds] = React.useState(0);
    const [isVideoMuted, setIsVideoMuted] = React.useState(false);
    const [isVideoPlaying, setIsVideoPlaying] = React.useState(true);
    const [trimStartSeconds, setTrimStartSeconds] = React.useState(0);
    const [trimEndSeconds, setTrimEndSeconds] = React.useState(CREATE_MAX_RECORDING_SECONDS);
    const [trimFrameUris, setTrimFrameUris] = React.useState<string[]>([]);
    const [trimTrackWidth, setTrimTrackWidth] = React.useState(1);

    const cameraRef = React.useRef<CameraView | null>(null);
    const recordingStartedAtRef = React.useRef<number | null>(null);
    const startDragOriginRef = React.useRef(0);
    const endDragOriginRef = React.useRef(0);
    const trimStartRef = React.useRef(0);
    const trimEndRef = React.useRef(CREATE_MAX_RECORDING_SECONDS);
    const trimCommitRafRef = React.useRef<number | null>(null);
    const pendingTrimRef = React.useRef<{ start: number; end: number } | null>(null);

    const [cameraPermission, requestCameraPermission] = useCameraPermissions();
    const [micPermission, requestMicPermission] = useMicrophonePermissions();
    const previewVideoUri = draft.media?.type === 'video' ? draft.media.uri : '';
    const videoPlayer = useVideoPlayer(previewVideoUri ? { uri: previewVideoUri } : null, (player) => {
        player.loop = false;
        player.muted = isVideoMuted;
        player.timeUpdateEventInterval = 0.1;
        player.play();
    });

    const formatTime = React.useCallback((seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }, []);

    const resolveVideoTrimSeconds = React.useCallback((durationMs?: number) => {
        if (!durationMs || durationMs <= 0) return CREATE_MAX_RECORDING_SECONDS;
        return Math.max(1, Math.min(CREATE_MAX_RECORDING_SECONDS, Math.round(durationMs / 1000)));
    }, []);

    const maxTrimSeconds = React.useMemo(() => {
        if (draft.media?.type !== 'video') return CREATE_MAX_RECORDING_SECONDS;
        if (draft.media.durationMs) return resolveVideoTrimSeconds(draft.media.durationMs);
        const fromPlayer = Math.round(videoPlayer.duration || 0);
        if (fromPlayer > 0) return Math.max(1, Math.min(CREATE_MAX_RECORDING_SECONDS, fromPlayer));
        return CREATE_MAX_RECORDING_SECONDS;
    }, [draft.media, resolveVideoTrimSeconds, videoPlayer.duration]);

    const formatTrimTime = React.useCallback((seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        const tenths = Math.floor((seconds - Math.floor(seconds)) * 10);
        return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}.${tenths}`;
    }, []);

    const clampTrim = React.useCallback((value: number, min: number, max: number) => {
        return Math.min(max, Math.max(min, value));
    }, []);

    const applyTrim = React.useCallback((start: number, end: number) => {
        const safeStart = Math.max(0, Math.min(start, end - MIN_TRIM_WINDOW_SECONDS));
        const safeEnd = Math.min(maxTrimSeconds, Math.max(end, safeStart + MIN_TRIM_WINDOW_SECONDS));
        pendingTrimRef.current = { start: safeStart, end: safeEnd };
        if (trimCommitRafRef.current !== null) return;

        trimCommitRafRef.current = requestAnimationFrame(() => {
            const nextTrim = pendingTrimRef.current;
            trimCommitRafRef.current = null;
            if (!nextTrim) return;
            setTrimStartSeconds(nextTrim.start);
            setTrimEndSeconds(nextTrim.end);
            pendingTrimRef.current = null;
        });
    }, [maxTrimSeconds]);

    const commitTrimDurationToDraft = React.useCallback((start: number, end: number) => {
        setDraft((current) => ({
            ...current,
            trimDurationSeconds: Math.max(MIN_TRIM_WINDOW_SECONDS, Number((end - start).toFixed(1))),
        }));
    }, []);

    const pickFromGallery = async () => {
        if (isUploading) return;

        const mediaPermission = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!mediaPermission.granted) {
            showToast('Gallery permission is required to select media.', { variant: 'error' });
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images', 'videos'],
            allowsMultipleSelection: false,
            quality: 0.85,
            videoMaxDuration: CREATE_MAX_RECORDING_SECONDS,
        });

        if (result.canceled || !result.assets?.length) return;

        const asset = result.assets[0];
        if (!asset) return;

        if (asset.type === 'video' && (asset.duration ?? 0) > CREATE_MAX_RECORDING_SECONDS * 1000) {
            showToast(`Please select a video up to ${CREATE_MAX_RECORDING_SECONDS} seconds.`, { variant: 'warning' });
            return;
        }

        let thumbnailUri: string | undefined;
        if (asset.type === 'video') {
            try {
                const thumb = await VideoThumbnails.getThumbnailAsync(asset.uri, { time: 500 });
                thumbnailUri = thumb.uri;
            } catch {
                thumbnailUri = undefined;
            }
        }

        setDraft((current) => ({
            ...current,
            media: {
                uri: asset.uri,
                type: asset.type === 'video' ? 'video' : 'image',
                fileName: asset.fileName,
                fileSize: asset.fileSize,
                width: asset.width,
                height: asset.height,
                durationMs: asset.duration ?? undefined,
                thumbnailUri,
            },
            trimDurationSeconds:
                asset.type === 'video'
                    ? resolveVideoTrimSeconds(asset.duration ?? undefined)
                    : CREATE_MAX_RECORDING_SECONDS,
        }));

    };

    const openCamera = async () => {
        if (isUploading) return;

        const cam = cameraPermission?.granted ? cameraPermission : await requestCameraPermission();
        const mic = micPermission?.granted ? micPermission : await requestMicPermission();

        if (!cam.granted || !mic.granted) {
            showToast('Camera and microphone permissions are required for recording.', { variant: 'error' });
            return;
        }

        setCameraFacing('front');
        setIsCameraOpen(true);
    };

    const handleStartRecording = async () => {
        if (!cameraRef.current || isRecording) return;

        try {
            setRecordingElapsedSeconds(0);
            recordingStartedAtRef.current = Date.now();
            setIsRecording(true);
            const recorded = await cameraRef.current.recordAsync({
                maxDuration: CREATE_MAX_RECORDING_SECONDS,
            });

            if (!recorded?.uri) return;

            let thumbnailUri: string | undefined;
            try {
                const thumb = await VideoThumbnails.getThumbnailAsync(recorded.uri, { time: 500 });
                thumbnailUri = thumb.uri;
            } catch {
                thumbnailUri = undefined;
            }

            setDraft((current) => ({
                ...current,
                media: {
                    uri: recorded.uri,
                    type: 'video',
                    durationMs: (recorded as { duration?: number }).duration ?? undefined,
                    thumbnailUri,
                },
                trimDurationSeconds: resolveVideoTrimSeconds((recorded as { duration?: number }).duration ?? undefined),
            }));
            setIsCameraOpen(false);
        } catch {
            showToast('Unable to start recording. Please try again.', { variant: 'error' });
        } finally {
            setIsRecording(false);
            recordingStartedAtRef.current = null;
        }
    };

    const handleStopRecording = React.useCallback(async () => {
        if (!cameraRef.current || !isRecording) return;
        await cameraRef.current.stopRecording();
    }, [isRecording]);

    React.useEffect(() => {
        if (!isRecording) return;

        const timer = setInterval(() => {
            const startedAt = recordingStartedAtRef.current;
            if (!startedAt) return;

            const elapsed = Math.min(
                CREATE_MAX_RECORDING_SECONDS,
                Math.floor((Date.now() - startedAt) / 1000)
            );
            setRecordingElapsedSeconds(elapsed);

            if (elapsed >= CREATE_MAX_RECORDING_SECONDS) {
                void handleStopRecording();
            }
        }, 250);

        return () => clearInterval(timer);
    }, [handleStopRecording, isRecording]);

    React.useEffect(() => {
        if (draft.media?.type !== 'video' || !previewVideoUri) return;

        const secondsFromPlayer = Math.round(videoPlayer.duration || 0);
        if (secondsFromPlayer <= 0) return;

        setDraft((current) => {
            if (current.media?.type !== 'video' || current.media.uri !== previewVideoUri) return current;
            const nextTrim = Math.max(1, Math.min(CREATE_MAX_RECORDING_SECONDS, secondsFromPlayer));
            if (current.trimDurationSeconds === nextTrim) return current;
            return { ...current, trimDurationSeconds: nextTrim };
        });
    }, [draft.media?.type, previewVideoUri, videoPlayer.duration]);

    React.useEffect(() => {
        if (draft.media?.type !== 'video') return;
        setTrimStartSeconds(0);
        setTrimEndSeconds(maxTrimSeconds);
        setDraft((current) => ({ ...current, trimDurationSeconds: maxTrimSeconds }));
    }, [draft.media?.type, maxTrimSeconds]);

    React.useEffect(() => {
        trimStartRef.current = trimStartSeconds;
        trimEndRef.current = trimEndSeconds;
    }, [trimEndSeconds, trimStartSeconds]);

    React.useEffect(() => {
        return () => {
            if (trimCommitRafRef.current !== null) {
                cancelAnimationFrame(trimCommitRafRef.current);
                trimCommitRafRef.current = null;
            }
        };
    }, []);

    const startHandlePanResponder = React.useMemo(
        () =>
            PanResponder.create({
                onStartShouldSetPanResponder: () => true,
                onMoveShouldSetPanResponder: () => true,
                onPanResponderGrant: () => {
                    startDragOriginRef.current = trimStartSeconds;
                },
                onPanResponderMove: (_, gestureState) => {
                    const deltaSeconds = (gestureState.dx / trimTrackWidth) * maxTrimSeconds;
                    const nextStart = clampTrim(
                        startDragOriginRef.current + deltaSeconds,
                        0,
                        trimEndRef.current - MIN_TRIM_WINDOW_SECONDS
                    );
                    applyTrim(nextStart, trimEndRef.current);
                },
                onPanResponderRelease: () => {
                    commitTrimDurationToDraft(trimStartRef.current, trimEndRef.current);
                },
                onPanResponderTerminate: () => {
                    commitTrimDurationToDraft(trimStartRef.current, trimEndRef.current);
                },
            }),
        [applyTrim, clampTrim, commitTrimDurationToDraft, maxTrimSeconds, trimStartSeconds, trimTrackWidth]
    );

    const endHandlePanResponder = React.useMemo(
        () =>
            PanResponder.create({
                onStartShouldSetPanResponder: () => true,
                onMoveShouldSetPanResponder: () => true,
                onPanResponderGrant: () => {
                    endDragOriginRef.current = trimEndSeconds;
                },
                onPanResponderMove: (_, gestureState) => {
                    const deltaSeconds = (gestureState.dx / trimTrackWidth) * maxTrimSeconds;
                    const nextEnd = clampTrim(
                        endDragOriginRef.current + deltaSeconds,
                        trimStartRef.current + MIN_TRIM_WINDOW_SECONDS,
                        maxTrimSeconds
                    );
                    applyTrim(trimStartRef.current, nextEnd);
                },
                onPanResponderRelease: () => {
                    commitTrimDurationToDraft(trimStartRef.current, trimEndRef.current);
                },
                onPanResponderTerminate: () => {
                    commitTrimDurationToDraft(trimStartRef.current, trimEndRef.current);
                },
            }),
        [applyTrim, clampTrim, commitTrimDurationToDraft, maxTrimSeconds, trimEndSeconds, trimTrackWidth]
    );

    React.useEffect(() => {
        if (draft.media?.type !== 'video' || !previewVideoUri) return;

        const withinRange = videoPlayer.currentTime >= trimStartSeconds && videoPlayer.currentTime <= trimEndSeconds;
        if (!withinRange) {
            videoPlayer.currentTime = trimStartSeconds;
        }
    }, [draft.media?.type, previewVideoUri, trimEndSeconds, trimStartSeconds, videoPlayer]);

    React.useEffect(() => {
        if (draft.media?.type !== 'video' || !previewVideoUri) return;

        const subscription = videoPlayer.addListener('timeUpdate', ({ currentTime }) => {
            if (currentTime > trimEndRef.current || currentTime < trimStartRef.current) {
                videoPlayer.currentTime = trimStartRef.current;
                if (videoPlayer.playing) videoPlayer.play();
            }
        });

        return () => {
            subscription.remove();
        };
    }, [draft.media?.type, previewVideoUri, videoPlayer]);

    React.useEffect(() => {
        if (draft.media?.type !== 'video' || !previewVideoUri || maxTrimSeconds <= 0) {
            setTrimFrameUris([]);
            return;
        }

        let cancelled = false;
        const frameCount = 8;
        const captureMs = Array.from({ length: frameCount }, (_, index) => {
            const ratio = index / (frameCount - 1);
            return Math.floor(ratio * maxTrimSeconds * 1000);
        });

        const buildFrames = async () => {
            const frames: string[] = [];
            for (const time of captureMs) {
                try {
                    const frame = await VideoThumbnails.getThumbnailAsync(previewVideoUri, { time });
                    frames.push(frame.uri);
                } catch {
                    frames.push(previewVideoUri);
                }
            }

            if (!cancelled) {
                setTrimFrameUris(frames);
            }
        };

        void buildFrames();
        return () => {
            cancelled = true;
        };
    }, [draft.media?.type, previewVideoUri, maxTrimSeconds]);

    const handlePublish = async () => {
        if (isUploading) return;

        if (!draft.media) {
            showToast('Select media before publishing.', { variant: 'warning' });
            return;
        }
        const isPaid = draft.visibility === 'premium';
        let paidPriceFromProfile: number | null = null;
        if (isPaid) {
            try {
                const currentPrice = await subscriptionPricingService.getPrice();
                if (!Number.isFinite(currentPrice) || currentPrice <= 0) {
                    throw new Error('INVALID_SUBSCRIPTION_PRICE');
                }
                paidPriceFromProfile = Number(currentPrice.toFixed(2));
            } catch {
                Alert.alert(
                    'Set subscription price first',
                    'Paid posts use your Subscription Pricing value. Set it before publishing paid posts.',
                    [
                        { text: 'Cancel', style: 'cancel' },
                        {
                            text: 'Open Subscription Pricing',
                            onPress: () => router.push('/profile/subscription-pricing'),
                        },
                    ]
                );
                return;
            }
        }

        if (draft.media?.type === 'video') {
            commitTrimDurationToDraft(trimStartRef.current, trimEndRef.current);
        }

        setIsUploading(true);
        setUploadProgress(0);
        setUploadStage('preparing');

        try {
            let uploadedVideo:
                | { post_id: string; upload_id: string }
                | null = null;
            let uploadedImage:
                | {
                    secure_url: string;
                    public_id: string;
                    width: number;
                    height: number;
                    format: string;
                    bytes: number;
                }
                | null = null;

            if (draft.media.type === 'video') {
                setUploadProgress(0.12);
                const init = await postPublishingService.initVideoUpload({
                    title: draft.caption.trim() || 'Creator Upload Draft',
                    description: draft.caption.trim() || undefined,
                    tags: [],
                    category: 'general',
                });

                setUploadStage('uploading');
                setUploadProgress(0.38);
                await postPublishingService.uploadVideoToMux({
                    uploadUrl: init.upload_url,
                    fileUri: draft.media.uri,
                    fileName: draft.media.fileName,
                    fileSize: draft.media.fileSize,
                    onProgress: (progress) => {
                        // Keep upload stage progress mapped into a visible mid-range.
                        setUploadProgress(0.2 + progress * 0.55);
                    },
                });
                uploadedVideo = { post_id: init.post_id, upload_id: init.upload_id };

                setUploadStage('processing');
                setUploadProgress(0.72);
                await postPublishingService.waitForVideoReady(init.post_id);
            } else {
                setUploadProgress(0.14);
                const imageConfig = await postPublishingService.getImageUploadConfig();

                if (
                    draft.media.fileSize &&
                    draft.media.fileSize > imageConfig.max_size_mb * 1024 * 1024
                ) {
                    throw new Error(`Image must be under ${imageConfig.max_size_mb}MB.`);
                }

                setUploadStage('uploading');
                setUploadProgress(0.52);
                uploadedImage = await postPublishingService.uploadImageToCloudinary({
                    imageUri: draft.media.uri,
                    uploadUrl: imageConfig.upload_url,
                    uploadPreset: imageConfig.upload_preset,
                    folder: imageConfig.folder,
                    fileName: draft.media.fileName,
                });
            }

            setUploadStage('processing');
            setUploadProgress(0.9);
            if (draft.media.type === 'video') {
                if (!uploadedVideo?.upload_id) throw new Error('Missing video upload reference.');
                await postPublishingService.publishPost({
                    media_type: 'video',
                    upload_id: uploadedVideo.upload_id,
                    caption: draft.caption.trim() || undefined,
                    visibility: toBackendVisibility(draft.visibility),
                    allow_comments: draft.allowComments,
                    price_ghs: isPaid ? paidPriceFromProfile : null,
                });
            } else {
                if (!uploadedImage) throw new Error('Missing image upload metadata.');
                await postPublishingService.publishPost({
                    media_type: 'image',
                    caption: draft.caption.trim() || undefined,
                    visibility: toBackendVisibility(draft.visibility),
                    allow_comments: draft.allowComments,
                    price_ghs: isPaid ? paidPriceFromProfile : null,
                    image_url: uploadedImage.secure_url,
                    image_public_id: uploadedImage.public_id,
                    width: uploadedImage.width,
                    height: uploadedImage.height,
                    format: uploadedImage.format,
                    bytes: uploadedImage.bytes,
                });
            }

            setUploadStage('done');
            setUploadProgress(1);

            const creatorHandle = user?.first_name?.trim()
                ? `@${user.first_name.trim().toLowerCase().replace(/\s+/g, '.')}`
                : '@creator';
            addCreatedPost({ draft, creatorUsername: creatorHandle });
            showToast('Post published successfully.', { variant: 'success' });
            setDraft(initialDraft);
            router.replace('/(tabs)');
        } catch (error: any) {
            if (
                error instanceof UploadStatusError &&
                (error.code === 'UNSUPPORTED_VIDEO_CODEC' || error.code === 'UNSUPPORTED_VIDEO_PROFILE')
            ) {
                Alert.alert(
                    'Unsupported video format',
                    error.message || 'This video format is not supported. Re-export and upload again.',
                    [
                        { text: 'Cancel', style: 'cancel' },
                        {
                            text: 'Choose Another Video',
                            onPress: () => {
                                void pickFromGallery();
                            },
                        },
                        {
                            text: 'Record New Video',
                            onPress: () => {
                                void openCamera();
                            },
                        },
                    ]
                );
                return;
            }
            const message = typeof error?.message === 'string' ? error.message : 'Upload failed. Please try again.';
            showToast(message, { variant: 'error' });
        } finally {
            setIsUploading(false);
        }
    };

    if (isCameraOpen) {
        const remainingSeconds = Math.max(0, CREATE_MAX_RECORDING_SECONDS - recordingElapsedSeconds);

        return (
            <Screen statusBarStyle="light-content" statusBarBg="#000000" className="px-0">
                <View className="flex-1 bg-black">
                    <CameraView
                        ref={cameraRef}
                        mode="video"
                        facing={cameraFacing}
                        style={{ flex: 1 }}
                    />

                    <View
                        className="absolute left-0 right-0 flex-row items-center justify-between px-4"
                        style={{ top: insets.top + 8 }}
                    >
                        <Pressable
                            className="h-10 w-10 items-center justify-center rounded-full bg-black/50"
                            onPress={() => {
                                if (isRecording) {
                                    void handleStopRecording();
                                }
                                setIsCameraOpen(false);
                            }}
                            accessibilityRole="button"
                            accessibilityLabel="Close camera"
                        >
                            <Ionicons name="close" size={20} color="#FFFFFF" />
                        </Pressable>
                        <Pressable
                            className="h-10 w-10 items-center justify-center rounded-full bg-black/50"
                            onPress={() => setCameraFacing((current) => (current === 'back' ? 'front' : 'back'))}
                            accessibilityRole="button"
                            accessibilityLabel="Flip camera"
                        >
                            <Ionicons name="camera-reverse-outline" size={20} color="#FFFFFF" />
                        </Pressable>
                    </View>

                    <View className="absolute left-0 right-0 items-center" style={{ top: insets.top + 56 }}>
                        <View className="flex-row items-center rounded-full bg-black/55 px-3 py-2">
                            <View className={`mr-2 h-2.5 w-2.5 rounded-full ${isRecording ? 'bg-red-500' : 'bg-white/70'}`} />
                            <AppText className="text-xs font-semibold" color="#FFFFFF">
                                {formatTime(recordingElapsedSeconds)} / {formatTime(CREATE_MAX_RECORDING_SECONDS)}
                            </AppText>
                            <AppText className="ml-2 text-xs" color="#FFFFFF">
                                -{formatTime(remainingSeconds)}
                            </AppText>
                        </View>
                    </View>

                    <View className="absolute bottom-0 left-0 right-0 items-center" style={{ paddingBottom: insets.bottom + 28 }}>
                        <Pressable
                            onPress={() => {
                                if (isRecording) {
                                    void handleStopRecording();
                                } else {
                                    void handleStartRecording();
                                }
                            }}
                            className="h-20 w-20 items-center justify-center rounded-full border-4 border-white"
                            style={{ backgroundColor: isRecording ? '#DC2626' : 'rgba(255,255,255,0.22)' }}
                            accessibilityRole="button"
                            accessibilityLabel={isRecording ? 'Stop recording' : 'Start recording'}
                        >
                            {isRecording ? <View className="h-6 w-6 rounded-sm bg-white" /> : <View className="h-12 w-12 rounded-full bg-white" />}
                        </Pressable>
                    </View>
                </View>
            </Screen>
        );
    }

    return (
        <Screen className="pt-4">
            <ScrollView contentContainerStyle={{ paddingBottom: 130 }} showsVerticalScrollIndicator={false}>
                <View className="rounded-3xl border p-5" style={{ borderColor: colors.border, backgroundColor: colors.backgroundAlt }}>
                    <AppText className="text-2xl font-bold" color={colors.textPrimary}>
                        Create Post
                    </AppText>
                    <AppText className="mt-2 text-sm leading-6" color={colors.textSecondary}>
                        Share one image or video at a time. Record directly in-app with a maximum of 60 seconds.
                    </AppText>
                </View>

                {draft.media?.type !== 'video' ? (
                    <View className="mt-4">
                        <CreateMediaPreview
                            media={draft.media}
                            imageFilter={draft.imageFilter}
                            onClear={() => setDraft((current) => ({ ...current, media: null }))}
                            onPickFromGallery={() => void pickFromGallery()}
                            onOpenCamera={() => void openCamera()}
                        />
                    </View>
                ) : (
                    <View className="mt-4 flex-row gap-3">
                        <Pressable
                            className="flex-1 flex-row items-center justify-center rounded-xl border px-4 py-3"
                            style={{ borderColor: colors.border, backgroundColor: colors.backgroundAlt }}
                            onPress={() => void pickFromGallery()}
                            accessibilityRole="button"
                            accessibilityLabel="Replace selected video from gallery"
                        >
                            <Ionicons name="images-outline" size={18} color={colors.textPrimary} />
                            <AppText className="ml-2 text-sm font-semibold" color={colors.textPrimary}>
                                Replace
                            </AppText>
                        </Pressable>
                        <Pressable
                            className="flex-1 flex-row items-center justify-center rounded-xl border px-4 py-3"
                            style={{ borderColor: colors.border, backgroundColor: colors.backgroundAlt }}
                            onPress={() => void openCamera()}
                            accessibilityRole="button"
                            accessibilityLabel="Record a new video"
                        >
                            <Ionicons name="camera-outline" size={18} color={colors.textPrimary} />
                            <AppText className="ml-2 text-sm font-semibold" color={colors.textPrimary}>
                                Record New
                            </AppText>
                        </Pressable>
                        <Pressable
                            className="h-12 w-12 items-center justify-center rounded-xl border"
                            style={{ borderColor: colors.border, backgroundColor: colors.backgroundAlt }}
                            onPress={() => setDraft((current) => ({ ...current, media: null }))}
                            accessibilityRole="button"
                            accessibilityLabel="Remove selected video"
                        >
                            <Ionicons name="trash-outline" size={18} color={colors.error} />
                        </Pressable>
                    </View>
                )}

                {draft.media?.type === 'image' ? (
                    <View className="mt-4 rounded-2xl border p-4" style={{ borderColor: colors.border, backgroundColor: colors.backgroundAlt }}>
                        <AppText className="text-sm font-semibold" color={colors.textPrimary}>
                            Minimal Edit
                        </AppText>
                        <View className="mt-3 flex-row gap-2">
                            {imageFilterOptions.map((option) => {
                                const active = draft.imageFilter === option.value;
                                return (
                                    <Pressable
                                        key={option.value}
                                        className="rounded-full border px-3 py-2"
                                        style={{
                                            borderColor: active ? colors.textPrimary : colors.border,
                                            backgroundColor: active ? colors.background : colors.backgroundAlt,
                                        }}
                                        onPress={() => setDraft((current) => ({ ...current, imageFilter: option.value }))}
                                        accessibilityRole="button"
                                        accessibilityState={{ selected: active }}
                                        accessibilityLabel={`${option.label} filter`}
                                    >
                                        <AppText className="text-xs font-semibold" color={colors.textPrimary}>
                                            {option.label}
                                        </AppText>
                                    </Pressable>
                                );
                            })}
                        </View>
                    </View>
                ) : null}

                {draft.media?.type === 'video' ? (
                    <View className="mt-4 rounded-2xl border p-4" style={{ borderColor: colors.border, backgroundColor: colors.backgroundAlt }}>
                        <AppText className="text-sm font-semibold" color={colors.textPrimary}>
                            Minimal Edit
                        </AppText>
                        <AppText className="mt-1 text-xs" color={colors.textSecondary}>
                            Drag start/end over video frames to trim to any length.
                        </AppText>

                        <View className="mt-3 overflow-hidden rounded-xl" style={{ backgroundColor: '#000000', aspectRatio: 9 / 14 }}>
                            <VideoView
                                player={videoPlayer}
                                style={{ width: '100%', height: '100%' }}
                                fullscreenOptions={{ enable: false }}
                                allowsPictureInPicture={false}
                                nativeControls={false}
                                contentFit="cover"
                            />
                            <View className="absolute bottom-3 left-3 right-3 flex-row justify-between">
                                <Pressable
                                    className="flex-row items-center rounded-full bg-black/65 px-3 py-2"
                                    onPress={() => {
                                        if (isVideoPlaying) {
                                            videoPlayer.pause();
                                        } else {
                                            videoPlayer.play();
                                        }
                                        setIsVideoPlaying((prev) => !prev);
                                    }}
                                    accessibilityRole="button"
                                    accessibilityLabel={isVideoPlaying ? 'Pause preview video' : 'Play preview video'}
                                >
                                    <Ionicons name={isVideoPlaying ? 'pause' : 'play'} size={16} color="#FFFFFF" />
                                    <AppText className="ml-1 text-xs font-semibold" color="#FFFFFF">
                                        {isVideoPlaying ? 'Pause' : 'Play'}
                                    </AppText>
                                </Pressable>

                                <Pressable
                                    className="flex-row items-center rounded-full bg-black/65 px-3 py-2"
                                    onPress={() => {
                                        const nextMuted = !isVideoMuted;
                                        videoPlayer.muted = nextMuted;
                                        setIsVideoMuted(nextMuted);
                                    }}
                                    accessibilityRole="button"
                                    accessibilityLabel={isVideoMuted ? 'Unmute preview video' : 'Mute preview video'}
                                >
                                    <Ionicons name={isVideoMuted ? 'volume-mute' : 'volume-high'} size={16} color="#FFFFFF" />
                                    <AppText className="ml-1 text-xs font-semibold" color="#FFFFFF">
                                        {isVideoMuted ? 'Unmute' : 'Mute'}
                                    </AppText>
                                </Pressable>
                            </View>
                        </View>

                        <View className="mt-3 rounded-xl border p-3" style={{ borderColor: colors.border, backgroundColor: colors.background }}>
                            <View className="mb-2 flex-row justify-between">
                                <AppText className="text-xs font-semibold" color={colors.textSecondary}>
                                    Start {formatTrimTime(trimStartSeconds)}
                                </AppText>
                                <AppText className="text-xs font-semibold" color={colors.textSecondary}>
                                    End {formatTrimTime(trimEndSeconds)}
                                </AppText>
                            </View>

                            <View
                                className="relative flex-row overflow-hidden rounded-lg"
                                onLayout={(event) => {
                                    const width = event.nativeEvent.layout.width;
                                    if (width > 0) setTrimTrackWidth(width);
                                }}
                            >
                                {trimFrameUris.length > 0 ? trimFrameUris.map((uri, index) => (
                                    <Image
                                        key={`${uri}-${index}`}
                                        source={{ uri }}
                                        contentFit="cover"
                                        style={{ width: `${100 / trimFrameUris.length}%`, height: 54 }}
                                    />
                                )) : (
                                    <View className="h-14 w-full items-center justify-center">
                                        <AppText className="text-xs" color={colors.textSecondary}>
                                            Loading frames...
                                        </AppText>
                                    </View>
                                )}

                                {maxTrimSeconds > 0 ? (
                                    <>
                                        <View
                                            className="absolute bottom-0 top-0"
                                            style={{
                                                left: 0,
                                                width: `${(trimStartSeconds / maxTrimSeconds) * 100}%`,
                                                backgroundColor: 'rgba(0,0,0,0.45)',
                                            }}
                                        />
                                        <View
                                            className="absolute bottom-0 top-0"
                                            style={{
                                                left: `${(trimEndSeconds / maxTrimSeconds) * 100}%`,
                                                right: 0,
                                                backgroundColor: 'rgba(0,0,0,0.45)',
                                            }}
                                        />
                                        <View
                                            className="absolute bottom-0 top-0 w-1.5 rounded-full"
                                            style={{
                                                left: `${(trimStartSeconds / maxTrimSeconds) * 100}%`,
                                                marginLeft: -1,
                                                backgroundColor: colors.accent,
                                            }}
                                            {...startHandlePanResponder.panHandlers}
                                            accessible
                                            accessibilityRole="adjustable"
                                            accessibilityLabel="Trim start handle"
                                        />
                                        <View
                                            className="absolute bottom-0 top-0 w-1.5 rounded-full"
                                            style={{
                                                left: `${(trimEndSeconds / maxTrimSeconds) * 100}%`,
                                                marginLeft: -1,
                                                backgroundColor: colors.accent,
                                            }}
                                            {...endHandlePanResponder.panHandlers}
                                            accessible
                                            accessibilityRole="adjustable"
                                            accessibilityLabel="Trim end handle"
                                        />
                                    </>
                                ) : null}
                            </View>

                            <View className="mt-1 flex-row justify-end">
                                <AppText className="text-xs font-semibold" color={colors.textPrimary}>
                                    Trimmed Length {formatTrimTime(trimEndSeconds - trimStartSeconds)}
                                </AppText>
                            </View>
                        </View>
                    </View>
                ) : null}

                <View className="mt-4 rounded-2xl border p-4" style={{ borderColor: colors.border, backgroundColor: colors.backgroundAlt }}>
                    <AppText className="text-sm font-semibold" color={colors.textPrimary}>
                        Caption
                    </AppText>
                    <TextInput
                        value={draft.caption}
                        onChangeText={(text) => setDraft((current) => ({ ...current, caption: text.slice(0, CREATE_MAX_CAPTION_LENGTH) }))}
                        placeholder="Write a caption..."
                        placeholderTextColor={colors.textSecondary}
                        multiline
                        maxLength={CREATE_MAX_CAPTION_LENGTH}
                        style={{
                            marginTop: 10,
                            minHeight: 108,
                            borderRadius: 12,
                            borderWidth: 1,
                            borderColor: colors.border,
                            backgroundColor: colors.background,
                            color: colors.textPrimary,
                            paddingHorizontal: 12,
                            paddingVertical: 10,
                            textAlignVertical: 'top',
                        }}
                        accessibilityLabel="Post caption"
                        accessibilityHint="Describe your post"
                    />
                    <View className="mt-2 flex-row justify-end">
                        <AppText className="text-xs" color={colors.textSecondary}>
                            {draft.caption.length}/{CREATE_MAX_CAPTION_LENGTH}
                        </AppText>
                    </View>
                </View>

                <View className="mt-4 rounded-2xl border p-4" style={{ borderColor: colors.border, backgroundColor: colors.backgroundAlt }}>
                    <CreateVisibilitySelector
                        value={draft.visibility}
                        onChange={(next) => setDraft((current) => ({ ...current, visibility: next }))}
                    />

                    <View className="mt-4 flex-row items-center justify-between rounded-xl border px-3 py-3" style={{ borderColor: colors.border, backgroundColor: colors.background }}>
                        <View className="pr-3">
                            <AppText className="text-sm font-semibold" color={colors.textPrimary}>
                                Allow comments
                            </AppText>
                            <AppText className="mt-1 text-xs" color={colors.textSecondary}>
                                Let viewers comment on this post.
                            </AppText>
                        </View>
                        <AppSwitch
                            value={draft.allowComments}
                            onValueChange={(next) => setDraft((current) => ({ ...current, allowComments: next }))}
                            accessibilityRole="switch"
                            accessibilityLabel="Allow comments"
                            accessibilityState={{ checked: draft.allowComments }}
                        />
                    </View>
                </View>

                {isUploading ? (
                    <View className="mt-4">
                        <CreateUploadProgress progress={uploadProgress} stage={uploadStage} />
                    </View>
                ) : null}

                <Pressable
                    className="mt-5 rounded-xl px-4 py-4"
                    style={{
                        backgroundColor: draft.media && !isUploading ? colors.textPrimary : `${colors.textSecondary}77`,
                    }}
                    onPress={() => void handlePublish()}
                    disabled={!draft.media || isUploading}
                    accessibilityRole="button"
                    accessibilityLabel="Publish post"
                    accessibilityState={{ disabled: !draft.media || isUploading, busy: isUploading }}
                >
                    <AppText className="text-center text-sm font-semibold" color={colors.background}>
                        {isUploading ? 'Publishing...' : 'Publish Post'}
                    </AppText>
                </Pressable>
            </ScrollView>
        </Screen>
    );
}
