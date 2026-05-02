
const isProduction = !__DEV__;

const DEFAULT_API_URL = 'http://10.233.113.23:5000/api/v1';
const ENV_API_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

const DEV_API_URL = ENV_API_URL || DEFAULT_API_URL;
const PROD_API_URL = ENV_API_URL || DEFAULT_API_URL;

export const API_BASE_URL = isProduction ? PROD_API_URL : DEV_API_URL;
export const USE_MOCK_DATA = true;
