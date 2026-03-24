import { CurrentUser } from "@/types/user.types";

export const mockCurrentUser: CurrentUser = {
    user_id: "usr_1234567890",
    email: "john.doe@example.com",
    phone: "+1234567890",
    first_name: "John",
    last_name: "Doe",
    country: "USA",
    date_of_birth: "1990-01-15",
    kyc_status: "unverified",
    kyc_verified_at: "2024-02-05T14:20:00Z",
    email_verified: true,
    phone_verified: true,
    account_status: "active",
    created_at: "2024-01-15T10:00:00Z",
    updated_at: "2024-02-09T10:30:00Z",
    referral_code: "JOHN1234",
    referred_by: null
};
