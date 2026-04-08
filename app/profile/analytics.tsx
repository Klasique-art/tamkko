import { FlashList } from '@shopify/flash-list';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Animated, Pressable, ScrollView, View, useWindowDimensions } from 'react-native';
import Svg, { Circle, Polyline } from 'react-native-svg';

import AppText from '@/components/ui/AppText';
import Screen from '@/components/ui/Screen';
import { useColors } from '@/config/colors';
import { AnalyticsPeriod, CreatorAnalyticsPoint, CreatorAnalyticsSnapshot } from '@/types/analytics.types';
import { creatorAnalyticsService } from '@/lib/services/creatorAnalyticsService';

const PERIODS: AnalyticsPeriod[] = ['7d', '30d', '90d'];

const formatCompact = (value: number) =>
    new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 }).format(value);

const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en-GH', { style: 'currency', currency: 'GHS', maximumFractionDigits: 2 }).format(value);

function getLinePoints(points: CreatorAnalyticsPoint[], width: number, height: number) {
    if (points.length === 0) return '';
    const maxViews = Math.max(...points.map((item) => item.views), 1);
    const stepX = points.length > 1 ? width / (points.length - 1) : width;

    return points
        .map((item, index) => {
            const x = index * stepX;
            const normalized = item.views / maxViews;
            const y = height - normalized * height;
            return `${x},${y}`;
        })
        .join(' ');
}

function StatCard({
    label,
    value,
    hint,
    delay,
    colors,
}: {
    label: string;
    value: string;
    hint: string;
    delay: number;
    colors: ReturnType<typeof useColors>;
}) {
    const opacity = React.useRef(new Animated.Value(0)).current;
    const translateY = React.useRef(new Animated.Value(8)).current;

    React.useEffect(() => {
        Animated.parallel([
            Animated.timing(opacity, { toValue: 1, duration: 280, delay, useNativeDriver: true }),
            Animated.timing(translateY, { toValue: 0, duration: 280, delay, useNativeDriver: true }),
        ]).start();
    }, [delay, opacity, translateY]);

    return (
        <Animated.View
            className="mb-2 w-[49%] rounded-2xl border p-3"
            style={{
                borderColor: colors.border,
                backgroundColor: colors.backgroundAlt,
                opacity,
                transform: [{ translateY }],
            }}
            accessible
            accessibilityRole="summary"
            accessibilityLabel={`${label}: ${value}. ${hint}`}
        >
            <AppText className="text-[11px] uppercase" color={colors.textSecondary}>
                {label}
            </AppText>
            <AppText className="mt-1 text-lg font-extrabold" color={colors.textPrimary}>
                {value}
            </AppText>
            <AppText className="mt-1 text-[11px]" color={colors.textSecondary}>
                {hint}
            </AppText>
        </Animated.View>
    );
}

export default function ProfileAnalyticsScreen() {
    const colors = useColors();
    const { width } = useWindowDimensions();
    const [period, setPeriod] = React.useState<AnalyticsPeriod>('30d');
    const [snapshot, setSnapshot] = React.useState<CreatorAnalyticsSnapshot | null>(null);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        let isMounted = true;
        setLoading(true);
        creatorAnalyticsService.getCreatorAnalytics(period).then((data) => {
            if (!isMounted) return;
            setSnapshot(data);
            setLoading(false);
        });
        return () => {
            isMounted = false;
        };
    }, [period]);

    const chartWidth = Math.max(160, width - 72);
    const chartHeight = 130;
    const linePoints = snapshot ? getLinePoints(snapshot.trend, chartWidth, chartHeight) : '';

    const tips = snapshot?.summary.tipsGhs ?? 0;
    const subs = snapshot?.summary.subscriptionsGhs ?? 0;
    const totalRevenue = Math.max(1, tips + subs);
    const radius = 48;
    const circumference = 2 * Math.PI * radius;
    const tipsRatio = tips / totalRevenue;
    const tipsArc = circumference * tipsRatio;
    const subsArc = circumference - tipsArc;

    return (
        <Screen title="Analytics" className="pt-2">
            <ScrollView contentContainerStyle={{ paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
                <LinearGradient
                    colors={[colors.primary, colors.primary50, colors.accent]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={{ borderRadius: 20, padding: 16 }}
                >
                    <AppText className="text-xl font-extrabold" color="#FFFFFF">
                        Creator Analytics
                    </AppText>
                    <AppText className="mt-1 text-xs" color="rgba(255,255,255,0.92)">
                        Views, watch-time trends, engagement, and revenue mix.
                    </AppText>
                    <View className="mt-3 flex-row">
                        {PERIODS.map((item) => {
                            const active = item === period;
                            return (
                                <Pressable
                                    key={item}
                                    onPress={() => setPeriod(item)}
                                    className="mr-2 rounded-full px-3 py-1.5"
                                    style={{
                                        backgroundColor: active ? 'rgba(255,255,255,0.24)' : 'rgba(255,255,255,0.13)',
                                        borderWidth: 1,
                                        borderColor: active ? 'rgba(255,255,255,0.45)' : 'rgba(255,255,255,0.2)',
                                    }}
                                    accessibilityRole="button"
                                    accessibilityState={{ selected: active }}
                                    accessibilityLabel={`Analytics period ${item}`}
                                >
                                    <AppText className="text-xs font-semibold" color="#FFFFFF">
                                        {item.toUpperCase()}
                                    </AppText>
                                </Pressable>
                            );
                        })}
                    </View>
                </LinearGradient>

                {loading || !snapshot ? (
                    <View
                        className="mt-4 rounded-2xl border p-4"
                        style={{ borderColor: colors.border, backgroundColor: colors.backgroundAlt }}
                    >
                        <AppText className="text-sm" color={colors.textSecondary}>
                            Loading analytics...
                        </AppText>
                    </View>
                ) : (
                    <>
                        <View className="mt-4 flex-row flex-wrap justify-between">
                            <StatCard
                                label="Total Views"
                                value={formatCompact(snapshot.summary.totalViews)}
                                hint="Across selected period"
                                delay={20}
                                colors={colors}
                            />
                            <StatCard
                                label="Avg Watch"
                                value={`${snapshot.summary.avgWatchSeconds.toFixed(1)}s`}
                                hint="Average watch-time"
                                delay={70}
                                colors={colors}
                            />
                            <StatCard
                                label="Engagement"
                                value={`${snapshot.summary.engagementRate.toFixed(1)}%`}
                                hint="Likes + comments + shares"
                                delay={120}
                                colors={colors}
                            />
                            <StatCard
                                label="Earnings"
                                value={formatCurrency(snapshot.summary.earningsGhs)}
                                hint={`${formatCompact(snapshot.summary.newFollowers)} new followers`}
                                delay={170}
                                colors={colors}
                            />
                        </View>

                        <View
                            className="mt-2 rounded-2xl border p-4"
                            style={{ borderColor: colors.border, backgroundColor: colors.backgroundAlt }}
                        >
                            <AppText className="text-sm font-bold" color={colors.textPrimary}>
                                Views Trend
                            </AppText>
                            <View className="mt-3">
                                <Svg width={chartWidth} height={chartHeight}>
                                    <Polyline
                                        points={linePoints}
                                        fill="none"
                                        stroke={colors.accent}
                                        strokeWidth={3}
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                </Svg>
                            </View>
                            <View className="mt-1 flex-row justify-between">
                                {snapshot.trend.map((item) => (
                                    <AppText key={item.label} className="text-[10px]" color={colors.textSecondary}>
                                        {item.label}
                                    </AppText>
                                ))}
                            </View>
                        </View>

                        <View
                            className="mt-3 rounded-2xl border p-4"
                            style={{ borderColor: colors.border, backgroundColor: colors.backgroundAlt }}
                        >
                            <AppText className="text-sm font-bold" color={colors.textPrimary}>
                                Revenue Mix
                            </AppText>
                            <View className="mt-3 flex-row items-center justify-between">
                                <View className="items-center justify-center">
                                    <Svg width={120} height={120}>
                                        <Circle
                                            cx={60}
                                            cy={60}
                                            r={radius}
                                            stroke="rgba(120,120,120,0.3)"
                                            strokeWidth={14}
                                            fill="none"
                                        />
                                        <Circle
                                            cx={60}
                                            cy={60}
                                            r={radius}
                                            stroke={colors.accent}
                                            strokeWidth={14}
                                            fill="none"
                                            strokeDasharray={`${tipsArc} ${circumference - tipsArc}`}
                                            strokeLinecap="round"
                                            rotation={-90}
                                            origin="60,60"
                                        />
                                        <Circle
                                            cx={60}
                                            cy={60}
                                            r={radius}
                                            stroke={colors.primary50}
                                            strokeWidth={14}
                                            fill="none"
                                            strokeDasharray={`${subsArc} ${circumference - subsArc}`}
                                            strokeLinecap="round"
                                            strokeDashoffset={-tipsArc}
                                            rotation={-90}
                                            origin="60,60"
                                        />
                                    </Svg>
                                    <AppText className="-mt-16 text-xs font-bold" color={colors.textPrimary}>
                                        {Math.round(tipsRatio * 100)}%
                                    </AppText>
                                    <AppText className="text-[10px]" color={colors.textSecondary}>
                                        Tips share
                                    </AppText>
                                </View>
                                <View className="flex-1 pl-4">
                                    <View className="mb-2 rounded-xl border p-3" style={{ borderColor: colors.border, backgroundColor: colors.background }}>
                                        <AppText className="text-[11px]" color={colors.textSecondary}>Tips</AppText>
                                        <AppText className="text-sm font-bold" color={colors.textPrimary}>
                                            {formatCurrency(snapshot.summary.tipsGhs)}
                                        </AppText>
                                    </View>
                                    <View className="rounded-xl border p-3" style={{ borderColor: colors.border, backgroundColor: colors.background }}>
                                        <AppText className="text-[11px]" color={colors.textSecondary}>Subscriptions</AppText>
                                        <AppText className="text-sm font-bold" color={colors.textPrimary}>
                                            {formatCurrency(snapshot.summary.subscriptionsGhs)}
                                        </AppText>
                                    </View>
                                </View>
                            </View>
                        </View>

                        <View
                            className="mt-3 rounded-2xl border p-4"
                            style={{ borderColor: colors.border, backgroundColor: colors.backgroundAlt }}
                        >
                            <AppText className="mb-2 text-sm font-bold" color={colors.textPrimary}>
                                Top Performing Videos
                            </AppText>
                            <FlashList
                                data={snapshot.topVideos}
                                keyExtractor={(item) => item.id}
                                scrollEnabled={false}
                                renderItem={({ item }) => {
                                    const widthPct = Math.min(100, Math.round((item.earningsGhs / snapshot.topVideos[0].earningsGhs) * 100));
                                    return (
                                        <View className="mb-3 rounded-xl border p-3" style={{ borderColor: colors.border, backgroundColor: colors.background }}>
                                            <View className="flex-row items-center justify-between">
                                                <AppText className="flex-1 text-sm font-semibold" color={colors.textPrimary} numberOfLines={1}>
                                                    {item.title}
                                                </AppText>
                                                <AppText className="ml-2 text-xs font-bold" color={colors.textPrimary}>
                                                    {formatCurrency(item.earningsGhs)}
                                                </AppText>
                                            </View>
                                            <View className="mt-2 h-2.5 w-full overflow-hidden rounded-full" style={{ backgroundColor: 'rgba(0,0,0,0.08)' }}>
                                                <View
                                                    style={{
                                                        width: `${widthPct}%`,
                                                        height: '100%',
                                                        backgroundColor: colors.accent,
                                                        borderRadius: 999,
                                                    }}
                                                />
                                            </View>
                                            <View className="mt-1 flex-row items-center justify-between">
                                                <AppText className="text-[11px]" color={colors.textSecondary}>
                                                    {formatCompact(item.views)} views
                                                </AppText>
                                                <AppText className="text-[11px]" color={colors.textSecondary}>
                                                    {item.engagementRate.toFixed(1)}% engagement
                                                </AppText>
                                            </View>
                                        </View>
                                    );
                                }}
                            />
                        </View>
                    </>
                )}
            </ScrollView>
        </Screen>
    );
}
