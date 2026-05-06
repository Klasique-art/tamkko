# Profile Workspace - Share Count in Posts Payload

## Request
Please include `shares_count` for each post returned in Profile Workspace post data.

## Why
- The client now reads share count directly from backend payload.
- A previous UI fallback was showing a mock minimum value (for example `12`) when backend share data was not present.
- Likes and comments already come from backend and should remain unchanged.

## Endpoints To Confirm
- `GET /videos/mine`
- `GET /videos/mine/:videoId`
- Any feed/post detail endpoint used by post playback where metrics are shown

## Expected Field
- `shares_count` (integer, defaults to `0` when no shares)

## Example Item Shape (partial)
```json
{
  "id": "post_123",
  "likes_count": 0,
  "comments_count": 0,
  "shares_count": 0
}
```
