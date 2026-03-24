import * as SecureStore from 'expo-secure-store';

export const AUTH_TOKEN_KEY = 'thefourthbook_auth_token';
export const REFRESH_TOKEN_KEY = 'thefourthbook_refresh_token';
export const AUTH_SESSION_ID_KEY = 'thefourthbook_auth_session_id';
export const PENDING_SIGNUP_EMAIL_KEY = 'thefourthbook_pending_signup_email';
export const PENDING_SIGNUP_PASSWORD_KEY = 'thefourthbook_pending_signup_password';

export const authStorage = {
    async getAccessToken(): Promise<string | null> {
        return SecureStore.getItemAsync(AUTH_TOKEN_KEY);
    },

    async getRefreshToken(): Promise<string | null> {
        return SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
    },

    async setTokens(access: string, refresh: string): Promise<void> {
        await Promise.all([
            SecureStore.setItemAsync(AUTH_TOKEN_KEY, access),
            SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refresh),
        ]);
    },

    async setAccessToken(access: string): Promise<void> {
        await SecureStore.setItemAsync(AUTH_TOKEN_KEY, access);
    },

    async clearTokens(): Promise<void> {
        await Promise.all([
            SecureStore.deleteItemAsync(AUTH_TOKEN_KEY),
            SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY),
            SecureStore.deleteItemAsync(AUTH_SESSION_ID_KEY),
        ]);
    },

    async setSessionId(sessionId: string): Promise<void> {
        await SecureStore.setItemAsync(AUTH_SESSION_ID_KEY, sessionId);
    },

    async getSessionId(): Promise<string | null> {
        return SecureStore.getItemAsync(AUTH_SESSION_ID_KEY);
    },

    async setPendingSignupCredentials(email: string, password: string): Promise<void> {
        await Promise.all([
            SecureStore.setItemAsync(PENDING_SIGNUP_EMAIL_KEY, email),
            SecureStore.setItemAsync(PENDING_SIGNUP_PASSWORD_KEY, password),
        ]);
    },

    async getPendingSignupCredentials(): Promise<{ email: string; password: string } | null> {
        const [email, password] = await Promise.all([
            SecureStore.getItemAsync(PENDING_SIGNUP_EMAIL_KEY),
            SecureStore.getItemAsync(PENDING_SIGNUP_PASSWORD_KEY),
        ]);

        if (!email || !password) return null;
        return { email, password };
    },

    async clearPendingSignupCredentials(): Promise<void> {
        await Promise.all([
            SecureStore.deleteItemAsync(PENDING_SIGNUP_EMAIL_KEY),
            SecureStore.deleteItemAsync(PENDING_SIGNUP_PASSWORD_KEY),
        ]);
    },
};
