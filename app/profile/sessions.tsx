import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, ScrollView, View } from 'react-native';

import AppText from '@/components/ui/AppText';
import ConfirmModal from '@/components/ui/ConfirmModal';
import Screen from '@/components/ui/Screen';
import { useColors } from '@/config/colors';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { mockProfileSecurityService, SessionState } from '@/lib/services/mockProfileSecurityService';

const formatLastSeen = (isoDate: string) => new Date(isoDate).toLocaleString();

export default function SessionsScreen() {
    const colors = useColors();
    const { user } = useAuth();
    const { showToast } = useToast();
    const [sessions, setSessions] = React.useState<SessionState[]>([]);
    const [revokeTarget, setRevokeTarget] = React.useState<SessionState | null>(null);
    const [confirmRevokeAll, setConfirmRevokeAll] = React.useState(false);

    const load = React.useCallback(async () => {
        const state = await mockProfileSecurityService.load(user);
        setSessions(state.sessions);
    }, [user]);

    React.useEffect(() => {
        void load();
    }, [load]);

    const revokeOne = async () => {
        if (!revokeTarget) return;
        const next = await mockProfileSecurityService.revokeSession(user, revokeTarget.id);
        setSessions(next);
        setRevokeTarget(null);
        showToast('Session revoked.', { variant: 'success', duration: 1300 });
    };

    const revokeAllOthers = async () => {
        const next = await mockProfileSecurityService.revokeAllOtherSessions(user);
        setSessions(next);
        setConfirmRevokeAll(false);
        showToast('All other sessions revoked.', { variant: 'success', duration: 1400 });
    };

    return (
        <Screen title="Active Sessions" className="pt-3">
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
                <View className="rounded-3xl border p-4" style={{ borderColor: colors.border, backgroundColor: colors.backgroundAlt }}>
                    <View className="flex-row items-center justify-between">
                        <View className="flex-1 pr-2">
                            <AppText className="text-lg font-black" color={colors.textPrimary}>Device Sessions</AppText>
                            <AppText className="mt-1 text-sm" color={colors.textSecondary}>
                                Monitor where your account is signed in.
                            </AppText>
                        </View>
                        <Pressable
                            onPress={() => setConfirmRevokeAll(true)}
                            className="rounded-xl border px-3 py-2"
                            style={{ borderColor: `${colors.error}55`, backgroundColor: `${colors.error}12` }}
                            accessibilityRole="button"
                            accessibilityLabel="Revoke all other sessions"
                        >
                            <AppText className="text-xs font-semibold" color={colors.error}>Revoke Others</AppText>
                        </Pressable>
                    </View>
                </View>

                <View className="mt-4 gap-3">
                    {sessions.map((session) => (
                        <View
                            key={session.id}
                            className="rounded-2xl border p-4"
                            style={{ borderColor: colors.border, backgroundColor: colors.backgroundAlt }}
                        >
                            <View className="flex-row items-start justify-between">
                                <View className="flex-1 pr-2">
                                    <AppText className="text-sm font-bold" color={colors.textPrimary}>
                                        {session.deviceName}
                                    </AppText>
                                    <AppText className="mt-1 text-xs" color={colors.textSecondary}>
                                        {session.location}
                                    </AppText>
                                    <AppText className="mt-1 text-xs" color={colors.textSecondary}>
                                        Last seen: {formatLastSeen(session.lastSeenAt)}
                                    </AppText>
                                </View>
                                {session.isCurrent ? (
                                    <View className="rounded-full px-2 py-1" style={{ backgroundColor: `${colors.success}1A` }}>
                                        <AppText className="text-[10px] font-semibold" color={colors.success}>
                                            CURRENT
                                        </AppText>
                                    </View>
                                ) : (
                                    <Pressable
                                        onPress={() => setRevokeTarget(session)}
                                        className="h-8 w-8 items-center justify-center rounded-full"
                                        style={{ backgroundColor: `${colors.error}12` }}
                                        accessibilityRole="button"
                                        accessibilityLabel={`Revoke ${session.deviceName}`}
                                    >
                                        <Ionicons name="close" size={16} color={colors.error} />
                                    </Pressable>
                                )}
                            </View>
                        </View>
                    ))}
                </View>
            </ScrollView>

            <ConfirmModal
                visible={Boolean(revokeTarget)}
                onClose={() => setRevokeTarget(null)}
                onConfirm={revokeOne}
                title="Revoke Session"
                description={`Sign out "${revokeTarget?.deviceName ?? 'this device'}"?`}
                confirmText="Revoke"
                isDestructive
            />

            <ConfirmModal
                visible={confirmRevokeAll}
                onClose={() => setConfirmRevokeAll(false)}
                onConfirm={revokeAllOthers}
                title="Revoke All Other Sessions"
                description="This will sign you out from every other device except this one."
                confirmText="Revoke All"
                isDestructive
            />
        </Screen>
    );
}
