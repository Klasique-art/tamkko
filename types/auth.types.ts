export type SignupRequest = {
    email: string;
    phone: string;
    username: string;
    fullName: string;
    password: string;
    confirm_password: string;
    agree_terms: boolean;
};

export type SignupResponse = Record<string, unknown>;

export type LoginRequest = {
    emailOrUsername: string;
    password: string;
};

export type LoginResponse = {
    refresh: string;
    access: string;
};

export type LoginCredentials = LoginRequest;
export type SignupData = SignupRequest;

export type VerifySignupCodeRequest = {
    email: string;
    code: string;
};

export type VerifySignupCodeResponse = Record<string, unknown>;

export type ResendVerificationCodeRequest = {
    email: string;
};

export type ResendVerificationCodeResponse = Record<string, unknown>;

export type GoogleLoginRequest = {
    id_token: string;
    device_info: {
        device_id: string;
        device_name: string;
        platform: 'android' | 'ios' | 'web' | string;
        app_version: string;
    };
};
