import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import React from 'react';
import { Pressable, ScrollView, View } from 'react-native';

import AppText from '@/components/ui/AppText';
import Screen from '@/components/ui/Screen';
import { useColors } from '@/config/colors';
import { useToast } from '@/context/ToastContext';
import { verificationService } from '@/lib/services/verificationService';
import { VerificationDocumentType, VerificationMediaAsset } from '@/types/verification.types';

type StepState = 'idle' | 'uploading' | 'done';

const toFileName = (uri: string) => uri.split('/').pop() || `upload_${Date.now()}.jpg`;

export default function VerificationScreen() {
    const colors = useColors();
    const { showToast } = useToast();
    const [documentType, setDocumentType] = React.useState<VerificationDocumentType>('national_id');
    const [idFrontAsset, setIdFrontAsset] = React.useState<VerificationMediaAsset | null>(null);
    const [selfieAsset, setSelfieAsset] = React.useState<VerificationMediaAsset | null>(null);
    const [verificationId, setVerificationId] = React.useState<string | null>(null);
    const [status, setStatus] = React.useState<'unverified' | 'pending' | 'verified' | 'rejected'>('unverified');
    const [startStep, setStartStep] = React.useState<StepState>('idle');
    const [frontStep, setFrontStep] = React.useState<StepState>('idle');
    const [selfieStep, setSelfieStep] = React.useState<StepState>('idle');
    const [submitting, setSubmitting] = React.useState(false);

    const pickImage = async (kind: 'front' | 'selfie') => {
        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permission.granted) {
            showToast('Gallery permission is required.', { variant: 'warning' });
            return;
        }
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsMultipleSelection: false,
            quality: 0.8,
        });
        if (result.canceled || !result.assets.length) return;
        const asset = result.assets[0];
        if (!asset) return;

        const nextAsset: VerificationMediaAsset = {
            uri: asset.uri,
            fileName: asset.fileName || toFileName(asset.uri),
            mimeType: asset.mimeType || 'image/jpeg',
        };
        if (kind === 'front') setIdFrontAsset(nextAsset);
        else setSelfieAsset(nextAsset);
    };

    const submit = async () => {
        if (!idFrontAsset || !selfieAsset) {
            showToast('Please upload both ID front and selfie.', { variant: 'warning' });
            return;
        }

        setSubmitting(true);
        try {
            setStartStep('uploading');
            const started = await verificationService.startVerification({ document_type: documentType });
            setVerificationId(started.verification_id);
            setStatus(started.kyc_status);
            setStartStep('done');

            setFrontStep('uploading');
            const front = await verificationService.uploadIdFront({
                verification_id: started.verification_id,
                document_type: documentType,
                id_front_image: idFrontAsset,
            });
            setStatus(front.kyc_status);
            setFrontStep('done');

            setSelfieStep('uploading');
            const selfie = await verificationService.uploadSelfie({
                verification_id: started.verification_id,
                selfie_image: selfieAsset,
            });
            setStatus(selfie.kyc_status);
            setSelfieStep('done');
            showToast('Verification submitted successfully.', { variant: 'success', duration: 1700 });
        } catch {
            showToast('Verification failed. Try again.', { variant: 'error' });
        } finally {
            setSubmitting(false);
        }
    };

    const stepIcon = (state: StepState) => {
        if (state === 'done') return <Ionicons name="checkmark-circle" size={16} color={colors.success} />;
        if (state === 'uploading') return <Ionicons name="time" size={16} color={colors.warning} />;
        return <Ionicons name="ellipse-outline" size={16} color={colors.textSecondary} />;
    };

    return (
        <Screen title="Verification" className="pt-3">
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
                <View className="rounded-3xl border p-4" style={{ borderColor: colors.border, backgroundColor: colors.backgroundAlt }}>
                    <AppText className="text-lg font-black" color={colors.textPrimary}>Identity Verification</AppText>
                    <AppText className="mt-1 text-sm" color={colors.textSecondary}>
                        Submit your ID front and selfie for KYC compliance.
                    </AppText>
                    <View className="mt-2 self-start rounded-full px-2 py-1" style={{ backgroundColor: colors.background }}>
                        <AppText className="text-[11px] font-semibold" color={colors.textPrimary}>
                            Status: {status.toUpperCase()}
                        </AppText>
                    </View>
                    {verificationId ? (
                        <AppText className="mt-2 text-[11px]" color={colors.textSecondary}>
                            Verification ID: {verificationId}
                        </AppText>
                    ) : null}
                </View>

                <View className="mt-4 rounded-3xl border p-4" style={{ borderColor: colors.border, backgroundColor: colors.backgroundAlt }}>
                    <AppText className="text-sm font-semibold" color={colors.textPrimary}>Document type</AppText>
                    <View className="mt-3 flex-row">
                        {(['national_id', 'passport'] as VerificationDocumentType[]).map((type) => {
                            const active = type === documentType;
                            return (
                                <Pressable
                                    key={type}
                                    onPress={() => setDocumentType(type)}
                                    className="mr-2 rounded-full border px-3 py-2"
                                    style={{
                                        borderColor: active ? colors.primary : colors.border,
                                        backgroundColor: active ? colors.primary : colors.background,
                                    }}
                                    accessibilityRole="button"
                                    accessibilityState={{ selected: active }}
                                    accessibilityLabel={`Select ${type}`}
                                >
                                    <AppText className="text-xs font-semibold" color={active ? colors.white : colors.textPrimary}>
                                        {type === 'national_id' ? 'National ID' : 'Passport'}
                                    </AppText>
                                </Pressable>
                            );
                        })}
                    </View>

                    <Pressable
                        onPress={() => void pickImage('front')}
                        className="mt-3 rounded-xl border py-3"
                        style={{ borderColor: colors.border, backgroundColor: colors.background }}
                        accessibilityRole="button"
                        accessibilityLabel="Upload ID front image"
                    >
                        <AppText className="text-center text-sm font-semibold" color={colors.textPrimary}>
                            {idFrontAsset ? 'Replace ID Front' : 'Upload ID Front'}
                        </AppText>
                    </Pressable>
                    {idFrontAsset ? (
                        <AppText className="mt-1 text-[11px]" color={colors.textSecondary}>
                            {idFrontAsset.fileName}
                        </AppText>
                    ) : null}

                    <Pressable
                        onPress={() => void pickImage('selfie')}
                        className="mt-3 rounded-xl border py-3"
                        style={{ borderColor: colors.border, backgroundColor: colors.background }}
                        accessibilityRole="button"
                        accessibilityLabel="Upload selfie image"
                    >
                        <AppText className="text-center text-sm font-semibold" color={colors.textPrimary}>
                            {selfieAsset ? 'Replace Selfie' : 'Upload Selfie'}
                        </AppText>
                    </Pressable>
                    {selfieAsset ? (
                        <AppText className="mt-1 text-[11px]" color={colors.textSecondary}>
                            {selfieAsset.fileName}
                        </AppText>
                    ) : null}

                    <Pressable
                        onPress={() => void submit()}
                        disabled={submitting}
                        className="mt-4 rounded-xl border py-3"
                        style={{ borderColor: colors.border, backgroundColor: colors.background, opacity: submitting ? 0.7 : 1 }}
                        accessibilityRole="button"
                        accessibilityLabel="Submit verification"
                    >
                        <AppText className="text-center text-sm font-semibold" color={colors.textPrimary}>
                            {submitting ? 'Submitting...' : 'Submit Verification'}
                        </AppText>
                    </Pressable>
                </View>

                <View className="mt-4 rounded-3xl border p-4" style={{ borderColor: colors.border, backgroundColor: colors.backgroundAlt }}>
                    <AppText className="text-sm font-semibold" color={colors.textPrimary}>Progress</AppText>
                    <View className="mt-3">
                        <View className="mb-2 flex-row items-center">
                            {stepIcon(startStep)}
                            <AppText className="ml-2 text-xs" color={colors.textSecondary}>Create verification session</AppText>
                        </View>
                        <View className="mb-2 flex-row items-center">
                            {stepIcon(frontStep)}
                            <AppText className="ml-2 text-xs" color={colors.textSecondary}>Upload ID front</AppText>
                        </View>
                        <View className="flex-row items-center">
                            {stepIcon(selfieStep)}
                            <AppText className="ml-2 text-xs" color={colors.textSecondary}>Upload selfie</AppText>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </Screen>
    );
}
