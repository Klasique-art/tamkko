export type VerificationDocumentType = 'national_id' | 'passport';

export interface VerificationMediaAsset {
    uri: string;
    fileName: string;
    mimeType: string;
}

export interface StartVerificationRequest {
    document_type: VerificationDocumentType;
}

export interface StartVerificationResponse {
    verification_id: string;
    kyc_status: 'pending' | 'verified' | 'rejected' | 'unverified';
}

export interface UploadIdFrontRequest {
    verification_id: string;
    document_type: VerificationDocumentType;
    id_front_image: VerificationMediaAsset;
}

export interface UploadSelfieRequest {
    verification_id: string;
    selfie_image: VerificationMediaAsset;
}

export interface VerificationStatusResponse {
    verification_id: string;
    kyc_status: 'pending' | 'verified' | 'rejected' | 'unverified';
    kyc_verified_at: string | null;
}

