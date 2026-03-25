import { Redirect } from 'expo-router';

export default function HiddenDashboardRedirect() {
    return <Redirect href="/(tabs)" />;
}
