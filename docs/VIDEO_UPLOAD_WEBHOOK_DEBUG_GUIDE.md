# Video Upload + Webhook Debug Guide (Frontend + Backend)

This guide ensures video posting follows the correct sequence and that backend logs (`mux-webhook`, `video-ready`) appear in real time.

## Why You Saw `UPLOAD_NOT_READY`

`POST /api/v1/videos/publish` returns `409 UPLOAD_NOT_READY` until backend status is `ready`.

If Mux webhooks do not reach backend, status stays `processing` forever.

Common local-dev cause:
- Frontend calls backend at private/local address like `http://10.x.x.x:5000`
- Mux (public cloud) cannot call private LAN URL
- No webhook events arrive -> no `mux-webhook` / `video-ready` logs

## Required End-to-End Flow (Frontend)

1. Call `POST /api/v1/videos/upload-url`
2. Upload bytes directly to returned `upload_url` (TUS client)
3. Poll `GET /api/v1/videos/:videoId/upload-status` every 1.5-2 seconds
4. Only call `POST /api/v1/videos/publish` after `status === "ready"` and `ready_to_stream === true`

Do not call publish immediately after upload completes on device.

## Polling Contract (Recommended)

- Interval: `1500ms` to `2000ms`
- Max wait: `90s`
- Stop conditions:
  - success: `status === "ready"`
  - fail: `status === "failed"` -> show `error_code` / `error_message`
  - timeout: ask user to retry/poll again

## Local Development: Make Webhook URL Public

Mux must reach a public HTTPS URL for:
- `POST /api/v1/videos/webhook/mux/`

Use a tunnel (example: `ngrok`):

```powershell
ngrok http 5000
```

If ngrok gives:
- `https://abc123.ngrok-free.app`

Set Mux webhook URL to:
- `https://abc123.ngrok-free.app/api/v1/videos/webhook/mux/`

Important:
- Keep trailing slash exactly as route is defined.
- Keep tunnel running while testing uploads.

## Verify Webhook Is Actually Firing

Run logs:

```powershell
docker compose logs -f api | Select-String -Pattern "mux-webhook|video-ready|video.upload.asset_created|video.asset.ready|video.asset.errored"
```

Expected during successful upload:
- one or more `mux-webhook` lines
- eventually one `video-ready` line

If none appear:
- webhook URL in Mux is wrong, not public, or tunnel is down
- signature secret mismatch (if verification enabled)

## Quick Backend Checks

1. Ensure route exists:
- `POST /api/v1/videos/webhook/mux/`

2. Ensure env secret matches Mux webhook signing secret:
- `MUX_WEBHOOK_SECRET`

3. Ensure backend is reachable from internet (not only LAN/private IP).

## Frontend Checklist

- Use backend base URL that frontend can reach.
- Upload to Mux `upload_url` directly, not through app server.
- Preserve `videoId`/`post_id` returned by upload init.
- Poll upload status before publish.
- On `UPLOAD_NOT_READY`, continue polling instead of hard fail.

## Optional Debug Endpoints During QA

- `GET /health` should return 200 from public tunnel URL.
- Hit tunnel URL manually to confirm it is online before upload tests.

## Expected Timeline

For short clips, typical order:
- upload init -> upload complete on client -> webhook `asset_created` -> webhook `asset.ready` -> status `ready` -> publish succeeds.

If sequence breaks between upload complete and `asset.ready`, webhook delivery is first thing to fix.

