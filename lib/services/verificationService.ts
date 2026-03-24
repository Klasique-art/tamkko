import {
    StartVerificationRequest,
    StartVerificationResponse,
    UploadIdFrontRequest,
    UploadSelfieRequest,
    VerificationStatusResponse,
} from '@/types/verification.types';
import client from '@/lib/client';

const USE_MOCK_VERIFICATION_API = true;

const toFilePart = (asset: { uri: string; fileName: string; mimeType: string }) => ({
    uri: asset.uri,
    name: asset.fileName,
    type: asset.mimeType,
});

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const verificationService = {
    async startVerification(payload: StartVerificationRequest): Promise<StartVerificationResponse> {
        if (USE_MOCK_VERIFICATION_API) {
            await wait(650);
            return {
                verification_id: `kyc_${Date.now()}`,
                kyc_status: 'pending',
            };
        }

        const response = await client.post('/kyc/verification/start', payload);
        return response.data;
    },

    async uploadIdFront(payload: UploadIdFrontRequest): Promise<VerificationStatusResponse> {
        if (USE_MOCK_VERIFICATION_API) {
            await wait(850);
            return {
                verification_id: payload.verification_id,
                kyc_status: 'pending',
                kyc_verified_at: null,
            };
        }

        const formData = new FormData();
        formData.append('verification_id', payload.verification_id);
        formData.append('document_type', payload.document_type);
        formData.append('id_front_image', toFilePart(payload.id_front_image) as any);

        const response = await client.post('/kyc/verification/id-front', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data;
    },

    async uploadSelfie(payload: UploadSelfieRequest): Promise<VerificationStatusResponse> {
        if (USE_MOCK_VERIFICATION_API) {
            await wait(850);
            return {
                verification_id: payload.verification_id,
                kyc_status: 'verified',
                kyc_verified_at: new Date().toISOString(),
            };
        }

        const formData = new FormData();
        formData.append('verification_id', payload.verification_id);
        formData.append('selfie_image', toFilePart(payload.selfie_image) as any);

        const response = await client.post('/kyc/verification/selfie', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data;
    },
};

