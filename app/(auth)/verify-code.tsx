import { Redirect } from 'expo-router';

export default function LegacyVerifyCodeRedirect() {
    return <Redirect href="/(auth)/verify-email" />;
}
