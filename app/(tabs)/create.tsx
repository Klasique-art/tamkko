import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { CameraView, useCameraPermissions, useMicrophonePermissions } from 'expo-camera';
import * as Haptics from 'expo-haptics';
import * as FileSystem from 'expo-file-system/legacy';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { trim } from 'react-native-video-trim';
import { useVideoPlayer, VideoView } from 'expo-video';
import * as VideoThumbnails from 'expo-video-thumbnails';
import React from 'react';
import { AccessibilityInfo, Alert, PanResponder, Pressable, ScrollView, TextInput, View } from 'react-native';
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

const inferVideoMimeType = (fileName?: string | null, uri?: string) => {
    const source = `${fileName ?? ''}${uri ?? ''}`.toLowerCase();
    if (source.endsWith('.mov')) return 'video/quicktime';
    if (source.endsWith('.webm')) return 'video/webm';
    if (source.endsWith('.m4v')) return 'video/x-m4v';
    return 'video/mp4';
};

const ensureVideoFileName = (fileName?: string | null, uri?: string) => {
    if (fileName && fileName.trim().length > 0) return fileName.trim();
    const fromUri = uri?.split('/').pop()?.split('?')[0];
    if (fromUri && fromUri.trim().length > 0) return fromUri.trim();
    return `tamkko_${Date.now()}.mp4`;
};

const resolveFileSizeBytes = async (uri: string, knownSize?: number | null) => {
    if (Number.isFinite(knownSize) && Number(knownSize) > 0) return Number(knownSize);
    try {
        const info = await FileSystem.getInfoAsync(uri, { size: true });
        if (info.exists && typeof (info as { size?: number }).size === 'number' && (info as { size?: number }).size! > 0) {
            return (info as { size?: number }).size as number;
        }
    } catch {}
    return 0;
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
    const [isTrimmingForUpload, setIsTrimmingForUpload] = React.useState(false);
    const [isProcessingPending, setIsProcessingPending] = React.useState(false);
    const [isCheckingProcessing, setIsCheckingProcessing] = React.useState(false);
    const [isCancellingUpload, setIsCancellingUpload] = React.useState(false);
    const pendingVideoUploadRef = React.useRef<{
        postId: string;
        uploadId: string;
        caption?: string;
        visibility: 'public' | 'paid' | 'followers_only' | 'private';
        allowComments: boolean;
        price: number | null;
    } | null>(null);
    const activeTusUploadRef = React.useRef<any>(null);
    const didCancelUploadRef = React.useRef(false);

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
    const [activeTrimHandle, setActiveTrimHandle] = React.useState<'start' | 'end' | null>(null);
    const activeTrimHandleRef = React.useRef<'start' | 'end' | null>(null);

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
        if (draft.media.durationMs) return Math.max(1, Math.round(draft.media.durationMs / 1000));
        const fromPlayer = Math.round(videoPlayer.duration || 0);
        if (fromPlayer > 0) return Math.max(1, fromPlayer);
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
            allowsEditing: true,
            quality: 0.85,
            videoMaxDuration: CREATE_MAX_RECORDING_SECONDS,
        });

        if (result.canceled || !result.assets?.length) return;

        const asset = result.assets[0];
        if (!asset) return;

        const isLongVideo = asset.type === 'video' && (asset.duration ?? 0) > CREATE_MAX_RECORDING_SECONDS * 1000;

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
        if (isLongVideo) {
            showToast(`Selected video is still over ${CREATE_MAX_RECORDING_SECONDS}s. Re-pick and trim in the editor before continuing.`, { variant: 'warning' });
            AccessibilityInfo.announceForAccessibility(
                `Video is still longer than ${CREATE_MAX_RECORDING_SECONDS} seconds. Re-pick and trim before publishing.`
            );
        }

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

    const trimDragPanResponder = React.useMemo(
        () =>
            PanResponder.create({
                onStartShouldSetPanResponder: () => activeTrimHandleRef.current !== null,
                onMoveShouldSetPanResponder: () => activeTrimHandleRef.current !== null,
                onPanResponderGrant: () => {
                    startDragOriginRef.current = trimStartRef.current;
                    endDragOriginRef.current = trimEndRef.current;
                },
                onPanResponderMove: (_, gestureState) => {
                    const deltaSeconds = (gestureState.dx / trimTrackWidth) * maxTrimSeconds;
                    if (activeTrimHandleRef.current === 'start') {
                        const nextStart = clampTrim(
                            startDragOriginRef.current + deltaSeconds,
                            0,
                            trimEndRef.current - MIN_TRIM_WINDOW_SECONDS
                        );
                        applyTrim(nextStart, trimEndRef.current);
                    } else if (activeTrimHandleRef.current === 'end') {
                        const nextEnd = clampTrim(
                            endDragOriginRef.current + deltaSeconds,
                            trimStartRef.current + MIN_TRIM_WINDOW_SECONDS,
                            maxTrimSeconds
                        );
                        applyTrim(trimStartRef.current, nextEnd);
                    } else {
                        return;
                    }
                },
                onPanResponderRelease: () => {
                    commitTrimDurationToDraft(trimStartRef.current, trimEndRef.current);
                    activeTrimHandleRef.current = null;
                    setActiveTrimHandle(null);
                },
                onPanResponderTerminate: () => {
                    commitTrimDurationToDraft(trimStartRef.current, trimEndRef.current);
                    activeTrimHandleRef.current = null;
                    setActiveTrimHandle(null);
                },
            }),
        [applyTrim, clampTrim, commitTrimDurationToDraft, maxTrimSeconds, trimTrackWidth]
    );

    const armTrimHandle = React.useCallback(async (handle: 'start' | 'end') => {
        activeTrimHandleRef.current = handle;
        setActiveTrimHandle(handle);
        try {
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        } catch {}
        AccessibilityInfo.announceForAccessibility(
            handle === 'start'
                ? 'Start trim handle selected. Drag left or right to trim.'
                : 'End trim handle selected. Drag left or right to trim.'
        );
    }, [trimTrackWidth]);

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
        if (isUploading || isProcessingPending) return;

        if (!draft.media) {
            showToast('Select media before publishing.', { variant: 'warning' });
            return;
        }
        let mediaForUpload = draft.media;
        if (draft.media.type === 'video') {
            const originalDurationSeconds = Math.ceil((draft.media.durationMs ?? 0) / 1000);
            const trimWindowSeconds = Math.max(MIN_TRIM_WINDOW_SECONDS, trimEndRef.current - trimStartRef.current);
            const shouldExportTrimmedFile =
                originalDurationSeconds > CREATE_MAX_RECORDING_SECONDS ||
                trimStartRef.current > 0.05 ||
                Math.abs(trimWindowSeconds - originalDurationSeconds) > 0.25;

            if (shouldExportTrimmedFile) {
                try {
                    setIsTrimmingForUpload(true);
                    console.log('[video-trim] export-start', {
                        source_uri: draft.media.uri,
                        start_seconds: Number(trimStartRef.current.toFixed(2)),
                        end_seconds: Number(trimEndRef.current.toFixed(2)),
                        duration_seconds: Number(trimWindowSeconds.toFixed(2)),
                    });
                    const trimResult = await trim(draft.media.uri, {
                        startTime: Math.max(0, Math.floor(trimStartRef.current * 1000)),
                        endTime: Math.max(1, Math.floor(trimEndRef.current * 1000)),
                    });
                    const outputUri = trimResult.outputPath.startsWith('file://')
                        ? trimResult.outputPath
                        : `file://${trimResult.outputPath}`;
                    mediaForUpload = {
                        ...draft.media,
                        uri: outputUri,
                        durationMs: Number(trimResult.duration ?? Math.round(trimWindowSeconds * 1000)),
                    };
                    console.log('[video-trim] export-success', {
                        output_uri: outputUri,
                        duration_ms: trimResult.duration,
                    });
                } catch (trimError: any) {
                    console.log('[video-trim] export-error', {
                        message: typeof trimError?.message === 'string' ? trimError.message : 'Trim export failed',
                    });
                    showToast('Could not prepare trimmed video. Please try trimming again.', { variant: 'error' });
                    return;
                } finally {
                    setIsTrimmingForUpload(false);
                }
            }
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

        if (mediaForUpload?.type === 'video') {
            commitTrimDurationToDraft(trimStartRef.current, trimEndRef.current);
        }

        setIsUploading(true);
        setUploadProgress(0);
        setUploadStage('preparing');
        const uploadStartedAt = new Date().toISOString();
        const uploadTraceId = `upl_${Date.now()}`;
        console.log('[video-upload] start', {
            trace_id: uploadTraceId,
            started_at: uploadStartedAt,
            media_type: draft.media.type,
            media_uri: draft.media.uri,
            file_name: draft.media.fileName ?? null,
            file_size: draft.media.fileSize ?? null,
            duration_ms: draft.media.durationMs ?? null,
        });

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

            if (mediaForUpload.type === 'video') {
                const fileName = ensureVideoFileName(mediaForUpload.fileName, mediaForUpload.uri);
                const mimeType = inferVideoMimeType(fileName, mediaForUpload.uri);
                const fileSizeBytes = await resolveFileSizeBytes(mediaForUpload.uri, mediaForUpload.fileSize);
                const durationSeconds = Math.max(1, Math.ceil(draft.trimDurationSeconds || 0));
                if (!fileSizeBytes) {
                    throw new Error('Unable to determine video file size.');
                }
                const maxUploadAttempts = 2;
                const stallTimeoutMs = 60000;
                let attemptIndex = 0;

                while (attemptIndex < maxUploadAttempts) {
                    attemptIndex += 1;
                    setUploadProgress(0.12);
                    const initStartedAtMs = Date.now();
                    const init = await postPublishingService.initVideoUpload({
                        title: draft.caption.trim() || 'Creator Upload Draft',
                        description: draft.caption.trim() || undefined,
                        tags: [],
                        category: 'general',
                        mime_type: mimeType,
                        file_name: fileName,
                        file_size_bytes: fileSizeBytes,
                        duration_seconds: durationSeconds,
                    });
                pendingVideoUploadRef.current = {
                    postId: init.post_id,
                    uploadId: init.upload_id,
                    caption: draft.caption.trim() || undefined,
                    visibility: toBackendVisibility(draft.visibility),
                    allowComments: draft.allowComments,
                    price: isPaid ? paidPriceFromProfile : null,
                };
                    console.log('[video-upload] init-success', {
                        trace_id: uploadTraceId,
                        attempt: attemptIndex,
                        init_elapsed_ms: Date.now() - initStartedAtMs,
                        post_id: init.post_id,
                        upload_id: init.upload_id,
                        upload_url: init.upload_url,
                        init_status: init.status,
                    });

                    try {
                        setUploadStage('uploading');
                        setUploadProgress(0.38);
                        let lastProgressAtMs = Date.now();
                        let firstByteLogged = false;
                        let uploadStalled = false;
                        const loggedMilestones = new Set<number>();
                        const logMilestone = (milestone: number) => {
                            if (loggedMilestones.has(milestone)) return;
                            loggedMilestones.add(milestone);
                            console.log('[video-upload] progress-milestone', {
                                trace_id: uploadTraceId,
                                attempt: attemptIndex,
                                post_id: init.post_id,
                                upload_id: init.upload_id,
                                milestone_percent: milestone,
                                at: new Date().toISOString(),
                            });
                        };

                        const stallTimer = setInterval(() => {
                            if (Date.now() - lastProgressAtMs <= stallTimeoutMs) return;
                            uploadStalled = true;
                            console.log('[video-upload] stalled', {
                                trace_id: uploadTraceId,
                                attempt: attemptIndex,
                                post_id: init.post_id,
                                upload_id: init.upload_id,
                                stall_timeout_ms: stallTimeoutMs,
                            });
                            try {
                                activeTusUploadRef.current?.abort?.(true);
                            } catch {}
                            clearInterval(stallTimer);
                        }, 3000);

                        try {
                        await postPublishingService.uploadVideoToMux({
                            uploadUrl: init.upload_url,
                            fileUri: mediaForUpload.uri,
                            fileName,
                            mimeType,
                            fileSize: fileSizeBytes,
                                onTusUploadCreated: (upload) => {
                                    activeTusUploadRef.current = upload;
                                },
                                onProgress: (progress) => {
                                    lastProgressAtMs = Date.now();
                                    setUploadProgress(0.2 + progress * 0.55);
                                    const pct = Math.floor(progress * 100);

                                    if (!firstByteLogged && pct > 0) {
                                        firstByteLogged = true;
                                        console.log('[video-upload] first-progress-byte', {
                                            trace_id: uploadTraceId,
                                            attempt: attemptIndex,
                                            post_id: init.post_id,
                                            upload_id: init.upload_id,
                                            at: new Date().toISOString(),
                                        });
                                    }
                                    if (pct >= 25) logMilestone(25);
                                    if (pct >= 50) logMilestone(50);
                                    if (pct >= 75) logMilestone(75);
                                    if (pct >= 100) logMilestone(100);
                                },
                            });
                        } finally {
                            clearInterval(stallTimer);
                        }
                        if (uploadStalled) throw new Error('UPLOAD_STALLED_NO_PROGRESS');

                        console.log('[video-upload] tus-success', {
                            trace_id: uploadTraceId,
                            attempt: attemptIndex,
                            post_id: init.post_id,
                            upload_id: init.upload_id,
                            at: new Date().toISOString(),
                        });
                        uploadedVideo = { post_id: init.post_id, upload_id: init.upload_id };
                        activeTusUploadRef.current = null;

                        setUploadStage('processing');
                        setUploadProgress(0.72);
                        let firstAssetCreatedLogged = false;
                        await postPublishingService.waitForVideoReady(init.post_id, {
                            intervalMs: 1500,
                            maxAttempts: 60,
                            onStatus: ({ attempt, status }) => {
                                console.log('[video-upload] status-poll', {
                                    trace_id: uploadTraceId,
                                    attempt,
                                    post_id: status.post_id,
                                    upload_id: status.upload_id,
                                    status: status.status,
                                    ready_to_stream: status.ready_to_stream,
                                    error_code: status.error_code ?? null,
                                });
                                const anyStatus = status as any;
                                const processingMetrics = anyStatus.processingMetrics ?? anyStatus.processing_metrics;
                                const firstAssetCreatedAt =
                                    processingMetrics?.firstAssetCreatedAt ??
                                    processingMetrics?.first_asset_created_at ??
                                    anyStatus.first_asset_created_at ??
                                    null;
                                if (!firstAssetCreatedLogged && firstAssetCreatedAt) {
                                    firstAssetCreatedLogged = true;
                                    console.log('[video-upload] first-asset-created', {
                                        trace_id: uploadTraceId,
                                        post_id: status.post_id,
                                        upload_id: status.upload_id,
                                        asset_created_at: firstAssetCreatedAt,
                                    });
                                }
                            },
                        });
                        console.log('[video-upload] ready-for-publish', {
                            trace_id: uploadTraceId,
                            attempt: attemptIndex,
                            post_id: init.post_id,
                            upload_id: init.upload_id,
                        });
                        break;
                    } catch (attemptError: any) {
                        activeTusUploadRef.current = null;
                        const codeOrMessage = String(attemptError?.code ?? attemptError?.message ?? '');
                        const isStall = /UPLOAD_STALLED_NO_PROGRESS/i.test(codeOrMessage);
                        if (isStall && attemptIndex < maxUploadAttempts) {
                            console.log('[video-upload] auto-restart-after-stall', {
                                trace_id: uploadTraceId,
                                attempt: attemptIndex,
                                post_id: init.post_id,
                                upload_id: init.upload_id,
                            });
                            try {
                                await postPublishingService.cancelVideoUpload(init.post_id);
                            } catch {}
                            continue;
                        }
                        throw attemptError;
                    }
                }
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
                    imageUri: mediaForUpload.uri,
                    uploadUrl: imageConfig.upload_url,
                    uploadPreset: imageConfig.upload_preset,
                    folder: imageConfig.folder,
                    fileName: mediaForUpload.fileName,
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
                console.log('[video-upload] publish-success', {
                    trace_id: uploadTraceId,
                    post_id: uploadedVideo.post_id,
                    upload_id: uploadedVideo.upload_id,
                });
                pendingVideoUploadRef.current = null;
                activeTusUploadRef.current = null;
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
            setIsProcessingPending(false);

            const creatorHandle = user?.first_name?.trim()
                ? `@${user.first_name.trim().toLowerCase().replace(/\s+/g, '.')}`
                : '@creator';
            addCreatedPost({ draft, creatorUsername: creatorHandle });
            showToast('Post published successfully.', { variant: 'success' });
            console.log('[video-upload] done', {
                trace_id: uploadTraceId,
                completed_at: new Date().toISOString(),
            });
            setDraft(initialDraft);
            router.replace('/(tabs)');
        } catch (error: any) {
            if (didCancelUploadRef.current) {
                didCancelUploadRef.current = false;
                return;
            }
            console.log('[video-upload] error', {
                trace_id: uploadTraceId,
                message: typeof error?.message === 'string' ? error.message : 'Unknown upload error',
                code: error?.code ?? null,
            });
            const backendErrorCode = error?.response?.data?.error?.code as string | undefined;
            if (backendErrorCode === 'VIDEO_DURATION_EXCEEDED') {
                showToast(
                    `This upload is still over ${CREATE_MAX_RECORDING_SECONDS} seconds at publish time. Save trimming on device first, then upload the trimmed video.`,
                    { variant: 'error' }
                );
                return;
            }
            if (/still processing/i.test(String(error?.message ?? '')) && pendingVideoUploadRef.current) {
                setUploadStage('processing');
                setUploadProgress((current) => Math.max(0.72, current));
                setIsProcessingPending(true);
                showToast('Video is still processing. We will keep checking.', { variant: 'warning' });
                return;
            }
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
            setIsCancellingUpload(false);
            setIsTrimmingForUpload(false);
        }
    };

    const handleCancelVideoUpload = React.useCallback(async () => {
        const pending = pendingVideoUploadRef.current;
        if (!pending || isCancellingUpload) return;
        setIsCancellingUpload(true);
        didCancelUploadRef.current = true;
        console.log('[video-upload] cancel-requested', {
            post_id: pending.postId,
            upload_id: pending.uploadId,
        });

        // Immediately reset local UI state so cancel cannot appear stuck.
        pendingVideoUploadRef.current = null;
        const uploadToAbort = activeTusUploadRef.current;
        activeTusUploadRef.current = null;
        setIsProcessingPending(false);
        setIsUploading(false);
        setUploadStage('preparing');
        setUploadProgress(0);
        setIsCancellingUpload(false);
        showToast('Cancelling upload...', { variant: 'info' });

        // Abort local TUS upload and notify backend in background.
        void (async () => {
            try {
                if (uploadToAbort?.abort) {
                    await Promise.race([
                        uploadToAbort.abort(true),
                        new Promise((resolve) => setTimeout(resolve, 2500)),
                    ]);
                }
            } catch {}

            let cancelConfirmed = false;
            try {
                const response = await postPublishingService.cancelVideoUpload(pending.postId);
                cancelConfirmed = response?.cancelled === true;
                console.log('[video-upload] cancel-response', {
                    post_id: response?.post_id ?? pending.postId,
                    upload_id: response?.upload_id ?? pending.uploadId,
                    status: response?.status ?? null,
                    cancelled: response?.cancelled ?? null,
                });
            } catch (error: any) {
                console.log('[video-upload] cancel-error', {
                    post_id: pending.postId,
                    upload_id: pending.uploadId,
                    message: typeof error?.message === 'string' ? error.message : 'Cancel request failed',
                });
            }

            showToast(
                cancelConfirmed ? 'Upload cancelled.' : 'Cancel request sent. Please confirm upload status.',
                { variant: cancelConfirmed ? 'warning' : 'info' }
            );
        })();
    }, [isCancellingUpload, showToast]);

    const checkPendingVideoProcessing = React.useCallback(async () => {
        const pending = pendingVideoUploadRef.current;
        if (!pending || isCheckingProcessing) return;
        setIsCheckingProcessing(true);
        try {
            const status = await postPublishingService.getVideoUploadStatus(pending.postId);
            if (!(status.ready_to_stream || status.status === 'ready')) return;

            await postPublishingService.publishPost({
                media_type: 'video',
                upload_id: pending.uploadId,
                caption: pending.caption,
                visibility: pending.visibility,
                allow_comments: pending.allowComments,
                price_ghs: pending.price,
            });

            pendingVideoUploadRef.current = null;
            setIsProcessingPending(false);
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
            const message = typeof error?.message === 'string' ? error.message : '';
            if (!/still processing/i.test(message)) {
                showToast(message || 'Could not confirm processing status.', { variant: 'error' });
            }
        } finally {
            setIsCheckingProcessing(false);
        }
    }, [addCreatedPost, draft, isCheckingProcessing, showToast, user?.first_name]);

    React.useEffect(() => {
        if (!isProcessingPending) return;
        const timer = setInterval(() => {
            void checkPendingVideoProcessing();
        }, 2000);
        return () => clearInterval(timer);
    }, [checkPendingVideoProcessing, isProcessingPending]);

    const hasMediaSelected = Boolean(draft.media?.uri);
    const isVideoDraft = draft.media?.type === 'video';
    const isTrimDurationValid =
        !isVideoDraft ||
        (Number.isFinite(draft.trimDurationSeconds) &&
            draft.trimDurationSeconds > 0 &&
            draft.trimDurationSeconds <= CREATE_MAX_RECORDING_SECONDS);
    const canPublishPost =
        hasMediaSelected &&
        isTrimDurationValid &&
        !isUploading &&
        !isTrimmingForUpload &&
        !isProcessingPending &&
        !isCancellingUpload;

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
                                {...trimDragPanResponder.panHandlers}
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
                                        <Pressable
                                            className="absolute bottom-0 top-0 items-center justify-center"
                                            style={{
                                                left: `${(trimStartSeconds / maxTrimSeconds) * 100}%`,
                                                marginLeft: -13,
                                                width: 26,
                                            }}
                                            onLongPress={() => void armTrimHandle('start')}
                                            delayLongPress={220}
                                            accessible
                                            accessibilityRole="adjustable"
                                            accessibilityLabel="Trim start handle"
                                            accessibilityHint="Long press to pick up, then drag left or right."
                                            accessibilityState={{ selected: activeTrimHandle === 'start' }}
                                            hitSlop={{ top: 10, bottom: 10, left: 12, right: 12 }}
                                        >
                                            <View
                                                className="h-full rounded-full"
                                                style={{
                                                    width: activeTrimHandle === 'start' ? 4 : 2,
                                                    backgroundColor: colors.accent,
                                                }}
                                            />
                                        </Pressable>
                                        <Pressable
                                            className="absolute bottom-0 top-0 items-center justify-center"
                                            style={{
                                                left: `${(trimEndSeconds / maxTrimSeconds) * 100}%`,
                                                marginLeft: -13,
                                                width: 26,
                                            }}
                                            onLongPress={() => void armTrimHandle('end')}
                                            delayLongPress={220}
                                            accessible
                                            accessibilityRole="adjustable"
                                            accessibilityLabel="Trim end handle"
                                            accessibilityHint="Long press to pick up, then drag left or right."
                                            accessibilityState={{ selected: activeTrimHandle === 'end' }}
                                            hitSlop={{ top: 10, bottom: 10, left: 12, right: 12 }}
                                        >
                                            <View
                                                className="h-full rounded-full"
                                                style={{
                                                    width: activeTrimHandle === 'end' ? 4 : 2,
                                                    backgroundColor: colors.accent,
                                                }}
                                            />
                                        </Pressable>
                                    </>
                                ) : null}
                            </View>

                            <View className="mt-1 flex-row justify-end">
                                <AppText className="text-xs font-semibold" color={colors.textPrimary}>
                                    Video Length {formatTrimTime(maxTrimSeconds)}  Selected Window {formatTrimTime(trimEndSeconds - trimStartSeconds)}
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

                {isUploading || isProcessingPending ? (
                    <View className="mt-4">
                        <CreateUploadProgress progress={uploadProgress} stage={uploadStage} />
                        {pendingVideoUploadRef.current ? (
                            <Pressable
                                className="mt-3 rounded-xl border px-4 py-3"
                                style={{ borderColor: colors.error, backgroundColor: colors.backgroundAlt, opacity: isCancellingUpload ? 0.7 : 1 }}
                                onPress={() => void handleCancelVideoUpload()}
                                disabled={isCancellingUpload}
                                accessibilityRole="button"
                                accessibilityLabel="Cancel video upload"
                            >
                                <AppText className="text-center text-sm font-semibold" color={colors.error}>
                                    {isCancellingUpload ? 'Cancelling...' : 'Cancel Upload'}
                                </AppText>
                            </Pressable>
                        ) : null}
                    </View>
                ) : null}

                <Pressable
                    className="mt-5 rounded-xl px-4 py-4"
                    style={{
                        backgroundColor: canPublishPost ? colors.textPrimary : `${colors.textSecondary}77`,
                    }}
                    onPress={() => void handlePublish()}
                    disabled={!canPublishPost}
                    accessibilityRole="button"
                    accessibilityLabel="Publish post"
                    accessibilityHint={
                        !isTrimDurationValid
                            ? `Trim video to ${CREATE_MAX_RECORDING_SECONDS} seconds or less to publish.`
                            : undefined
                    }
                    accessibilityState={{ disabled: !canPublishPost, busy: isUploading || isTrimmingForUpload || isProcessingPending || isCancellingUpload }}
                >
                    <AppText className="text-center text-sm font-semibold" color={colors.background}>
                        {isTrimmingForUpload ? 'Preparing Trim...' : isUploading ? 'Publishing...' : isProcessingPending ? 'Processing Video...' : 'Publish Post'}
                    </AppText>
                </Pressable>
            </ScrollView>
        </Screen>
    );
}
