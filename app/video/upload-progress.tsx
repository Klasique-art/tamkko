import { Ionicons } from '@expo/vector-icons';
import { Href, router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, View } from 'react-native';

import { CreateUploadProgress } from '@/components/create';
import AppText from '@/components/ui/AppText';
import Screen from '@/components/ui/Screen';
import { useColors } from '@/config/colors';
import { mockVideoManagementService, VideoUploadJob } from '@/lib/services/mockVideoManagementService';
import { MockUploadStage } from '@/lib/services/mockCreateUploadService';

const safeStage = (stage: VideoUploadJob['stage']): MockUploadStage => {
    if (stage === 'failed') return 'processing';
    return stage;
};

export default function UploadProgressScreen() {
    const colors = useColors();
    const { jobId } = useLocalSearchParams<{ jobId?: string }>();

    const [activeJob, setActiveJob] = React.useState<VideoUploadJob | null>(null);
    const [jobs, setJobs] = React.useState<VideoUploadJob[]>([]);

    const load = React.useCallback(async () => {
        const [all, current] = await Promise.all([
            mockVideoManagementService.listUploadJobs(),
            jobId ? mockVideoManagementService.getUploadJob(jobId) : Promise.resolve(null),
        ]);
        setJobs(all);
        setActiveJob(current ?? all[0] ?? null);
    }, [jobId]);

    React.useEffect(() => {
        void load();
    }, [load]);

    React.useEffect(() => {
        if (!activeJob) return;
        if (activeJob.stage === 'done' || activeJob.stage === 'failed') return;
        const timer = setInterval(() => {
            void load();
        }, 1100);
        return () => clearInterval(timer);
    }, [activeJob, load]);

    return (
        <Screen title="Upload Progress" className="pt-3">
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
                <View className="rounded-3xl border p-4" style={{ borderColor: colors.border, backgroundColor: colors.backgroundAlt }}>
                    <AppText className="text-lg font-bold" color={colors.textPrimary}>Upload Pipeline</AppText>
                    <AppText className="mt-1 text-sm" color={colors.textSecondary}>
                        Monitor secure upload, processing, and publish readiness.
                    </AppText>
                </View>

                {activeJob ? (
                    <View className="mt-4">
                        <CreateUploadProgress progress={activeJob.progress} stage={safeStage(activeJob.stage)} />
                        <View className="mt-2 rounded-xl border p-3" style={{ borderColor: colors.border, backgroundColor: colors.backgroundAlt }}>
                            <AppText className="text-xs" color={colors.textSecondary}>Job ID: {activeJob.id}</AppText>
                            <AppText className="mt-1 text-xs" color={colors.textSecondary}>Updated: {new Date(activeJob.updatedAt).toLocaleTimeString()}</AppText>

                            {activeJob.stage === 'done' && activeJob.postId ? (
                                <Pressable
                                    onPress={() => router.push(`/video/${encodeURIComponent(activeJob.postId!)}` as Href)}
                                    className="mt-3 rounded-xl border py-3"
                                    style={{ borderColor: colors.border, backgroundColor: colors.background }}
                                    accessibilityRole="button"
                                    accessibilityLabel="Open uploaded video"
                                >
                                    <AppText className="text-center text-sm font-semibold" color={colors.textPrimary}>Open Published Video</AppText>
                                </Pressable>
                            ) : null}

                            <View className="mt-2 flex-row">
                                <Pressable
                                    onPress={() => void load()}
                                    className="mr-2 flex-1 rounded-xl border py-3"
                                    style={{ borderColor: colors.border, backgroundColor: colors.background }}
                                    accessibilityRole="button"
                                    accessibilityLabel="Refresh upload status"
                                >
                                    <AppText className="text-center text-xs font-semibold" color={colors.textPrimary}>Refresh</AppText>
                                </Pressable>
                                <Pressable
                                    onPress={() => router.push('/video/upload' as Href)}
                                    className="flex-1 rounded-xl border py-3"
                                    style={{ borderColor: colors.border, backgroundColor: colors.background }}
                                    accessibilityRole="button"
                                    accessibilityLabel="Start new upload"
                                >
                                    <AppText className="text-center text-xs font-semibold" color={colors.textPrimary}>New Upload</AppText>
                                </Pressable>
                            </View>
                        </View>
                    </View>
                ) : (
                    <View className="mt-4 rounded-xl border p-4" style={{ borderColor: colors.border, backgroundColor: colors.backgroundAlt }}>
                        <AppText className="text-sm" color={colors.textSecondary}>No upload jobs yet. Start one from Upload screen.</AppText>
                        <Pressable
                            onPress={() => router.push('/video/upload' as Href)}
                            className="mt-3 rounded-xl border py-3"
                            style={{ borderColor: colors.border, backgroundColor: colors.background }}
                            accessibilityRole="button"
                            accessibilityLabel="Open upload screen"
                        >
                            <AppText className="text-center text-sm font-semibold" color={colors.textPrimary}>Open Upload</AppText>
                        </Pressable>
                    </View>
                )}

                <View className="mt-4">
                    <AppText className="mb-2 text-sm font-semibold" color={colors.textPrimary}>Recent Jobs</AppText>
                    <View className="gap-2">
                        {jobs.map((job) => (
                            <Pressable
                                key={job.id}
                                onPress={() => setActiveJob(job)}
                                className="rounded-xl border p-3"
                                style={{ borderColor: colors.border, backgroundColor: colors.backgroundAlt }}
                                accessibilityRole="button"
                                accessibilityLabel={`Open upload job ${job.id}`}
                            >
                                <View className="flex-row items-center justify-between">
                                    <View className="flex-1 pr-2">
                                        <AppText className="text-sm font-semibold" color={colors.textPrimary}>{job.id}</AppText>
                                        <AppText className="mt-1 text-xs" color={colors.textSecondary}>{new Date(job.createdAt).toLocaleString()}</AppText>
                                    </View>
                                    <View className="items-end">
                                        <View className="flex-row items-center">
                                            <Ionicons name={job.stage === 'done' ? 'checkmark-circle' : 'time-outline'} size={14} color={job.stage === 'done' ? colors.success : colors.warning} />
                                            <AppText className="ml-1 text-xs font-semibold" color={job.stage === 'done' ? colors.success : colors.warning}>{job.stage.toUpperCase()}</AppText>
                                        </View>
                                        <AppText className="mt-1 text-[11px]" color={colors.textSecondary}>{Math.round(job.progress * 100)}%</AppText>
                                    </View>
                                </View>
                            </Pressable>
                        ))}
                    </View>
                </View>
            </ScrollView>
        </Screen>
    );
}
