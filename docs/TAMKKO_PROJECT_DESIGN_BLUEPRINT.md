# TAMKKO Mobile App Design Blueprint (Phase 1)

## 1. Purpose
This document defines the product design, screen architecture, code organization, and engineering standards for TAMKKO Phase 1 MVP, based on all API docs in `docs/` and aligned with the coding style used in `THEFOURTHBOOK`.

It is intended to be the implementation baseline for a professional, government-grade delivery: secure, accessible, responsive, performant, and maintainable.

## 2. Inputs Reviewed
- `docs/Tamkko_Phase1_Authentication_UserManagement.docx`
- `docs/Tamkko_Phase1_VideoFeed_Upload.docx`
- `docs/Tamkko_Phase1_Tipping_Wallet.docx`
- `docs/Tamkko_Phase1_Referral_Leaderboard.docx`
- `docs/Tamkko_Phase1_Notifications.docx`
- `docs/Tamkko_Phase1_VIP_Community_Rooms.docx`

## 3. Product Modules (Phase 1)
1. Authentication & User Management
2. Video Feed & Upload
3. Tipping, Subscriptions, Wallet & Withdrawals
4. Referral & Leaderboard
5. Notifications (push + in-app)
6. VIP Community Rooms (REST + Socket.IO)

## 4. UX Principles (Government-Contract Standard)
1. Clarity first: predictable layouts, explicit labels, no ambiguous actions.
2. Accessibility by default: WCAG 2.2 AA baseline for all user journeys.
3. Trust signals everywhere: transaction statuses, timestamps, audit trails, confirmations.
4. Performance under stress: smooth feed/chat interactions on low-end devices.
5. Strong error recovery: every failure state gives a clear next step.
6. Security-transparent UX: explain why OTP/2FA/session checks are required.

## 5. Navigation Blueprint

### 5.1 Top-level Route Groups
- `(public)` onboarding, welcome, legal
- `(auth)` register/login/otp/password/2FA/reactivation
- `(tabs)` authenticated app shell
- `(modals)` payment status, report abuse, share, confirmation dialogs
- `(admin-web)` optional separate web/admin app (recommended split repo/app)

### 5.2 Primary Mobile Tabs
1. Home (feed + quick modules)
2. Discover (search, hashtags, creators, trending)
3. Create (upload + draft manager)
4. Community (VIP rooms + joined rooms)
5. Wallet (tips, balance, withdrawals, referral earnings)
6. Inbox (notifications center)
7. Profile (public profile + settings)

## 6. Complete Screen Inventory

### 6.1 Onboarding & Public
1. Splash / App boot
2. Onboarding carousel
3. Welcome chooser (Login / Register)
4. Terms & Privacy

### 6.2 Authentication & Account Recovery
1. Register (email, phone, username, country, password, referral code optional)
2. Username availability checker (inline component)
3. Verify email OTP
4. Verify phone OTP
5. Login with phone + password
6. Login with email/username + password
7. Google OAuth sign-in completion
8. 2FA challenge (TOTP or backup code)
9. Request password reset
10. Verify reset OTP
11. Set new password
12. Reactivate deactivated account

### 6.3 Core Feed & Video
1. Home For You feed (vertical video stream)
2. Following feed
3. Trending feed
4. Video detail (single video deep-link)
5. Creator profile public view
6. Creator videos list
7. Upload start (request upload URL)
8. Upload progress/processing tracker
9. Upload metadata form (title, caption, hashtags, visibility)
10. Edit video details
11. Comments list
12. Comment thread/replies
13. Saved/bookmarked videos
14. Share sheet / generated share link

### 6.4 Search & Discovery
1. Search landing (suggestions)
2. User search results
3. Video search results
4. Trending hashtags
5. Hashtag detail videos

### 6.5 Tipping, Subscriptions, Wallet
1. Tip initiation modal/sheet
2. Tip payment pending status polling
3. Tip success/failure receipt
4. Sent tips history
5. Tips on video (creator analytics view)
6. Subscribe to creator flow
7. Subscription payment status polling
8. Active subscriptions list
9. Wallet summary (balance/pending/available)
10. Wallet transaction history
11. Earnings by video breakdown
12. Mobile money account setup/edit
13. Withdrawal initiation
14. Withdrawal status detail
15. Withdrawal history

### 6.6 Referral & Leaderboard
1. My referral code + share link
2. Validate referral code (pre-registration)
3. Referral network list
4. Referral earnings summary
5. Referral earnings transactions
6. Leaderboard tabs (top referrers / fastest growing / campus leaders)
7. My leaderboard position
8. Campus ambassador application
9. Ambassador status
10. Ambassador invite stats

### 6.7 Notifications
1. Notification permission onboarding
2. In-app notification center (list)
3. Notification detail routing (deep-link target)
4. Notification preferences
5. Unread badge + mark-read interactions

### 6.8 VIP Community Rooms
1. Room list by creator
2. Room detail (description, fee, online count, join status)
3. Create room (creator)
4. Edit room settings (creator)
5. Entry fee payment flow
6. Entry payment status polling
7. Joined rooms list
8. Room chat screen (socket connection lifecycle)
9. Room members/presence panel
10. In-room reactions overlay
11. Message moderation actions (pin/delete/mute/kick)
12. In-room tipping sheet
13. Creator code generation/list
14. Creator code apply/validate
15. Creator code usage stats

### 6.9 Profile, Security & Sessions
1. My profile
2. Edit profile
3. Upload/change avatar
4. Followers list
5. Following list
6. Security overview
7. Change password
8. 2FA setup (QR + verify + backup codes)
9. Disable 2FA
10. Sessions list (active devices)
11. Revoke session
12. Revoke all other sessions
13. Deactivate/delete account

### 6.10 Admin (recommended as separate web app)
1. User management list/detail/actions
2. Video moderation queue + reports resolution
3. Room moderation queue + force close + report resolution
4. Referral admin + payout controls + reward rate
5. Notifications broadcast/targeted + delivery analytics
6. Payments/withdrawals review and overrides

## 7. API-to-Screen Mapping Rules
1. Every screen must map to explicit endpoint(s) and typed contracts.
2. Polling flows must use shared polling utilities with cancel-on-unmount.
3. Socket events (VIP chat) must flow through a dedicated room realtime service.
4. Deep-linkable screens must accept route params only via typed route helpers.

## 8. Recommended Project Structure (Aligned With THEFOURTHBOOK Style)

```text
app/
  (public)/
  (auth)/
  (tabs)/
  profile/
  wallet/
  rooms/
  notifications/
  search/
  video/
components/
  ui/
  form/
  feed/
  upload/
  wallet/
  rooms/
  profile/
  referral/
  notifications/
config/
context/
data/
  authValidation.ts
  profileValidation.ts
  walletValidation.ts
  roomValidation.ts
  uploadValidation.ts
lib/
  client.ts
  auth.ts
  authSync.ts
  services/
    authService.ts
    userService.ts
    videoService.ts
    commentService.ts
    walletService.ts
    tipService.ts
    subscriptionService.ts
    withdrawalService.ts
    referralService.ts
    leaderboardService.ts
    notificationService.ts
    roomService.ts
    roomRealtimeService.ts
    uploadService.ts
  utils/
    date.ts
    currency.ts
    phone.ts
    error.ts
    polling.ts
    permissions.ts
    pagination.ts
types/
  auth.types.ts
  user.types.ts
  video.types.ts
  wallet.types.ts
  tip.types.ts
  subscription.types.ts
  withdrawal.types.ts
  referral.types.ts
  leaderboard.types.ts
  notification.types.ts
  room.types.ts
  api.types.ts
```

## 9. File Responsibility Rules (Separation of Concerns)
1. Route files in `app/` are orchestration-only: compose components, call hooks, handle navigation.
2. No raw axios calls inside route/components. API access only in `lib/services/*`.
3. Shared HTTP behavior only in `lib/client.ts` (auth headers, refresh, retries, logging).
4. `types/*.types.ts` contains all request/response/domain DTOs.
5. `data/*Validation.ts` contains form schemas and form-value types.
6. `components/ui/*` are generic and product-agnostic.
7. Feature components stay in feature folders (`components/rooms/*`, etc.).
8. Use barrel exports (`components/index.ts`) to keep imports clean.
9. Keep files focused: one primary responsibility, avoid “god files”.
10. Complex feature state belongs in dedicated hooks (example: `hooks/useRoomChat.ts`).

## 10. Accessibility Standards (Mandatory)
1. WCAG 2.2 AA contrast minimums (4.5:1 normal text, 3:1 large text/icons).
2. All touch targets >= 44x44 dp.
3. Screen-reader labels for every interactive element.
4. Logical focus order and focus return after modals.
5. Dynamic type support and text scaling without layout break.
6. Error messages announced via accessibility live regions.
7. Haptic/audio-only cues are never the only status indicator.
8. Captions/transcripts support strategy for video content.

## 11. Responsive & Adaptive Design Standards
1. Use flexible layouts (no hardcoded heights for major content blocks).
2. Safe area aware for top/bottom and gesture nav bars.
3. Handle small phones first, then tablets via adaptive columns.
4. Keyboard-safe forms (`KeyboardAvoidingView`, scroll + focus management).
5. Orientation policy documented per screen (feed portrait-first; admin web responsive grid).

## 12. Performance Standards
1. Feed and chat lists must use virtualized lists (`FlashList` where beneficial).
2. Memoize expensive item renderers and callbacks.
3. Debounce search input and cancel stale API requests.
4. Progressive image/video loading with placeholders/skeletons.
5. Preload next video item metadata.
6. Rate-limit UI-triggered actions to align with backend throttles.
7. Define budgets: cold start, interaction latency, dropped frames.
8. Add lightweight telemetry for API latency and screen render times.

## 13. Security & Compliance Standards
1. Tokens in secure storage only (`expo-secure-store`), never AsyncStorage.
2. PII minimization in logs; redact phone/email/tokens/payment references.
3. Session visibility and remote revoke flows are first-class UX.
4. Enforce re-auth/OTP for high-risk actions (withdrawals, account deletion).
5. Strict input validation client+server with consistent error contracts.
6. Provide immutable audit records for financial and moderation actions (backend requirement).
7. Harden deep links and route guards for authenticated areas.

## 14. Error Handling and UX Consistency
1. Standard error model in `types/api.types.ts`.
2. Central `error.ts` mapper to convert API payloads to user-safe messages.
3. Every async screen has loading, empty, error, retry states.
4. Payment and upload flows must support resume/retry after app backgrounding.
5. Use global toast/banner patterns only for non-blocking feedback.

## 15. Suggested Delivery Phases
1. Foundation: auth shell, theme, client, typed contracts, navigation scaffold.
2. Feed + upload + interactions.
3. Wallet/tips/subscriptions/withdrawals.
4. Notifications and deep linking.
5. Referral + leaderboard + ambassador.
6. VIP rooms + realtime moderation.
7. Hardening: accessibility audit, performance profiling, security QA, UAT.

## 16. Definition of Done (Per Screen)
1. Connected to typed service endpoint(s).
2. Includes loading/empty/error/success states.
3. Accessibility labels and screen-reader path verified.
4. Works on small and large phones with safe areas.
5. Unit tests for pure logic; integration test for critical path.
6. Analytics events added (view, success, failure where relevant).
7. No console noise or leaked sensitive data.

## 17. Immediate Next Implementation Files to Create
1. `types/*` for all six modules (auth, video, wallet, referral, notifications, rooms).
2. `lib/services/*` per domain endpoint group.
3. `data/*Validation.ts` for each user-input heavy flow.
4. `components/*` feature folders with small focused components.
5. `app/*` route stubs for all screens listed in Section 6.
6. `lib/utils/polling.ts` and `lib/utils/error.ts` shared foundations.

---
This blueprint should be treated as the source-of-truth for implementation planning, task breakdown, and code review standards.
