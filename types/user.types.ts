export interface CurrentUser {
    _id?: string;
    user_id?: string;
    username?: string;
    email: string;
    phone: string;
    role?: string;
    isDeleted?: boolean;
    createdAt?: string;
    updatedAt?: string;
    lastLoginAt?: string;
    profile?: {
        displayName?: string;
        bio?: string;
        avatarUrl?: string;
        coverUrl?: string;
        isVerified?: boolean;
    };
    wallet?: {
        balance?: number;
        pendingBalance?: number;
        currency?: string;
    };
    referral?: {
        code?: string;
        referralCount?: number;
        referralEarnings?: number;
    };
    stats?: {
        followersCount?: number;
        followingCount?: number;
        videosCount?: number;
        totalTipsReceived?: number;
        totalViews?: number;
    };

    // Backward-compat fields still referenced in a few legacy UI screens.
    first_name?: string;
    last_name?: string;
    country?: string;
    date_of_birth?: string;
}
