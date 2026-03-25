export type SecurityOverview = {
    twoFactorEnabled: boolean;
    emailVerified: boolean;
    phoneVerified: boolean;
    activeSessionCount: number;
};

export type DeviceSession = {
    id: string;
    deviceName: string;
    location?: string;
    isCurrent: boolean;
    lastSeenAt: string;
};
