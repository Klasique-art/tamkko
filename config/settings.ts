
const isProduction = !__DEV__;

const DEV_API_URL = 'http://10.233.113.23:5000/api/v1';
const PROD_API_URL = 'http://10.233.113.23:5000/api/v1';

export const API_BASE_URL = isProduction ? PROD_API_URL : DEV_API_URL;
export const USE_MOCK_DATA = true;
