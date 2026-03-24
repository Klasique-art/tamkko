import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Pressable, View } from 'react-native';

import { AppButton, Screen } from '@/components';
import AppText from '@/components/ui/AppText';
import { useColors } from '@/config';
import { KYC_VERIFIED_KEY } from '@/data/verification';
import { verificationService } from '@/lib/services/verificationService';
import { VerificationDocumentType, VerificationMediaAsset } from '@/types/verification.types';

type VerificationStep = 1 | 2 | 3;

const VerificationScreen = () => {
    const colors = useColors();
    const [idType, setIdType] = useState<VerificationDocumentType>('national_id');
    const [step, setStep] = useState<VerificationStep>(1);
    const [isLoading, setIsLoading] = useState(false);
    const [verificationId, setVerificationId] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [idFrontFileName, setIdFrontFileName] = useState<string | null>(null);
    const [selfieFileName, setSelfieFileName] = useState<string | null>(null);

    const title = useMemo(() => {
        if (step === 1) return 'Verify Your Identity';
        if (step === 2) return 'Take Face Selfie';
        return 'Verification Complete';
    }, [step]);

    const description = useMemo(() => {
        if (step === 1) {
            return 'Step 1 of 2: Select your document and upload/take a clear front photo of your National ID or Passport.';
        }

        if (step === 2) {
            return 'Step 2 of 2: Take a clear selfie so we can match your face with your ID document.';
        }

        return 'Your identity check has been completed successfully. Your account is now verified.';
    }, [step]);

    const ensureCameraPermission = async () => {
        const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
        if (!cameraPermission.granted) {
            throw new Error('Camera permission is required.');
        }
    };

    const ensureLibraryPermission = async () => {
        const libraryPermission = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!libraryPermission.granted) {
            throw new Error('Media library permission is required.');
        }
    };

    const normalizeAsset = (asset: ImagePicker.ImagePickerAsset): VerificationMediaAsset => {
        const uriParts = asset.uri.split('/');
        const guessedName = uriParts[uriParts.length - 1] || `image-${Date.now()}.jpg`;
        const mimeType = asset.mimeType || 'image/jpeg';

        return {
            uri: asset.uri,
            fileName: asset.fileName || guessedName,
            mimeType,
        };
    };

    const handleIdFrontPicked = async (asset: VerificationMediaAsset) => {
        setIsLoading(true);
        setErrorMessage(null);

        try {
            let activeVerificationId = verificationId;

            if (!activeVerificationId) {
                const startResponse = await verificationService.startVerification({
                    document_type: idType,
                });
                activeVerificationId = startResponse.verification_id;
                setVerificationId(activeVerificationId);
            }

            await verificationService.uploadIdFront({
                verification_id: activeVerificationId,
                document_type: idType,
                id_front_image: asset,
            });

            setIdFrontFileName(asset.fileName);
            setStep(2);
        } catch (error) {
            setErrorMessage(error instanceof Error ? error.message : 'Could not upload ID image.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleTakeIdPhoto = async () => {
        try {
            await ensureCameraPermission();
            const result = await ImagePicker.launchCameraAsync({
                mediaTypes: ['images'],
                quality: 0.85,
                cameraType: ImagePicker.CameraType.back,
            });

            if (result.canceled) return;
            const asset = normalizeAsset(result.assets[0]);
            await handleIdFrontPicked(asset);
        } catch (error) {
            setErrorMessage(error instanceof Error ? error.message : 'Could not open camera.');
        }
    };

    const handleUploadIdFront = async () => {
        try {
            await ensureLibraryPermission();
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images'],
                quality: 0.85,
                allowsMultipleSelection: false,
            });

            if (result.canceled) return;
            const asset = normalizeAsset(result.assets[0]);
            await handleIdFrontPicked(asset);
        } catch (error) {
            setErrorMessage(error instanceof Error ? error.message : 'Could not open gallery.');
        }
    };

    const handleTakeSelfie = async () => {
        if (!verificationId) {
            setErrorMessage('Please complete ID upload first.');
            return;
        }

        try {
            await ensureCameraPermission();
            const result = await ImagePicker.launchCameraAsync({
                mediaTypes: ['images'],
                quality: 0.85,
                cameraType: ImagePicker.CameraType.front,
            });

            if (result.canceled) return;

            setIsLoading(true);
            setErrorMessage(null);

            const asset = normalizeAsset(result.assets[0]);
            const response = await verificationService.uploadSelfie({
                verification_id: verificationId,
                selfie_image: asset,
            });

            if (response.kyc_status === 'verified') {
                await AsyncStorage.setItem(KYC_VERIFIED_KEY, 'true');
            }

            setSelfieFileName(asset.fileName);
            setStep(3);
        } catch (error) {
            setErrorMessage(error instanceof Error ? error.message : 'Could not upload selfie image.');
        } finally {
            setIsLoading(false);
        }
    };

    const getStepIcon = () => {
        if (step === 1) return 'card-outline';
        if (step === 2) return 'camera-outline';
        return 'checkmark-circle-outline';
    };

    return (
        <Screen>
            <View className="pt-2">
                <Pressable
                    onPress={() => router.back()}
                    className="mb-5 h-10 w-10 items-center justify-center rounded-full"
                    style={{ backgroundColor: colors.backgroundAlt }}
                    accessibilityRole="button"
                    accessibilityLabel="Go back"
                >
                    <Ionicons name="arrow-back" size={20} color={colors.textPrimary} />
                </Pressable>

                <View
                    className="rounded-2xl border p-5"
                    style={{
                        borderColor: colors.border,
                        backgroundColor: colors.backgroundAlt,
                    }}
                >
                    <View className="mb-4 h-14 w-14 items-center justify-center rounded-full" style={{ backgroundColor: `${colors.accent}20` }}>
                        <Ionicons name={getStepIcon()} size={26} color={colors.accent} />
                    </View>

                    <AppText className="mb-2 text-2xl font-bold" style={{ color: colors.textPrimary }}>
                        {title}
                    </AppText>
                    <AppText className="mb-6 text-sm leading-6" style={{ color: colors.textSecondary }}>
                        {description}
                    </AppText>
                    {errorMessage && (
                        <View className="mb-4 rounded-xl border px-3 py-2" style={{ borderColor: `${colors.error}40`, backgroundColor: `${colors.error}10` }}>
                            <AppText className="text-sm" style={{ color: colors.error }}>
                                {errorMessage}
                            </AppText>
                        </View>
                    )}

                    {step === 1 && (
                        <View>
                            <AppText className="mb-3 text-sm font-semibold" style={{ color: colors.textPrimary }}>
                                Select Document
                            </AppText>
                            <View className="mb-5 flex-row">
                                <Pressable
                                    onPress={() => setIdType('national_id')}
                                    className="mr-3 flex-1 rounded-xl border px-4 py-3"
                                    style={{
                                        borderColor: idType === 'national_id' ? colors.accent : colors.border,
                                        backgroundColor: idType === 'national_id' ? `${colors.accent}14` : colors.background,
                                    }}
                                >
                                    <AppText className="text-center font-semibold" style={{ color: colors.textPrimary }}>
                                        National ID
                                    </AppText>
                                </Pressable>
                                <Pressable
                                    onPress={() => setIdType('passport')}
                                    className="flex-1 rounded-xl border px-4 py-3"
                                    style={{
                                        borderColor: idType === 'passport' ? colors.accent : colors.border,
                                        backgroundColor: idType === 'passport' ? `${colors.accent}14` : colors.background,
                                    }}
                                >
                                    <AppText className="text-center font-semibold" style={{ color: colors.textPrimary }}>
                                        Passport
                                    </AppText>
                                </Pressable>
                            </View>

                            <View className="gap-3">
                                <AppButton
                                    title={`Take ${idType === 'passport' ? 'Passport' : 'National ID'} Front`}
                                    icon="camera-outline"
                                    fullWidth
                                    loading={isLoading}
                                    onClick={handleTakeIdPhoto}
                                />
                                <AppButton
                                    title={`Upload ${idType === 'passport' ? 'Passport' : 'National ID'} Front`}
                                    variant="outline"
                                    icon="images-outline"
                                    fullWidth
                                    loading={isLoading}
                                    onClick={handleUploadIdFront}
                                />
                            </View>
                            {idFrontFileName && (
                                <AppText className="mt-3 text-xs" style={{ color: colors.textSecondary }}>
                                    Uploaded: {idFrontFileName}
                                </AppText>
                            )}
                        </View>
                    )}

                    {step === 2 && (
                        <View>
                            {idFrontFileName && (
                                <AppText className="mb-3 text-xs" style={{ color: colors.textSecondary }}>
                                    ID front captured: {idFrontFileName}
                                </AppText>
                            )}
                            <AppButton
                                title="Take Face Selfie"
                                icon="camera"
                                fullWidth
                                loading={isLoading}
                                onClick={handleTakeSelfie}
                            />
                        </View>
                    )}

                    {step === 3 && (
                        <View>
                            {selfieFileName && (
                                <AppText className="mb-3 text-xs" style={{ color: colors.textSecondary }}>
                                    Selfie captured: {selfieFileName}
                                </AppText>
                            )}
                            <AppButton
                                title="Return to Profile"
                                icon="checkmark-circle"
                                fullWidth
                                onClick={() => router.replace('/(tabs)/profile')}
                            />
                        </View>
                    )}
                </View>
            </View>
        </Screen>
    );
};

export default VerificationScreen;
