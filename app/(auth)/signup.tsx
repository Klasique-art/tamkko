import { Redirect } from 'expo-router';

export default function LegacySignupRedirect() {
    return <Redirect href="/(auth)/register" />;
}
