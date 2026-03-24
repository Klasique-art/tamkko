# Threshold Game API Contract (Distribution Phase Upgrade)

## Scope
This contract defines backend endpoints for the new flow where, after the pool reaches `$1,000,000`, users play a guessing game for increased chance in the next distribution.

Base URL prefix used below: `/api/v1`

---

## 1) Cycle State (drives progress bar vs game UI)

### `GET /distribution/cycle/current`
Used by app home/dashboard to decide what to render.

Response `200`
```json
{
  "cycle_id": "cyc_2026_02",
  "period_label": "February 2026",
  "threshold_amount": 1000000,
  "total_pool": 1005420,
  "total_participants": 50271,
  "distribution_state": "threshold_met_game_open",
  "game": {
    "exists": true,
    "game_id": "game_01JABCXYZ",
    "status": "open",
    "starts_at": "2026-02-16T12:00:00Z",
    "ends_at": "2026-02-18T12:00:00Z",
    "has_user_submitted": false
  }
}
```

Allowed `distribution_state` values:
- `collecting`
- `threshold_met_game_pending`
- `threshold_met_game_open`
- `threshold_met_game_closed`
- `distribution_processing`
- `distribution_completed`

---

## 2) Member: Fetch Active Game

### `GET /distribution-games/active?cycle_id={cycle_id}`
Returns game details (without correct answer).

Response `200`
```json
{
  "game_id": "game_01JABCXYZ",
  "cycle_id": "cyc_2026_02",
  "title": "Guess The Ball Position",
  "prompt_text": "Two players are heading. What is the position of the ball?",
  "image_url": "https://cdn.example.com/games/game_01JABCXYZ/image.jpg",
  "status": "open",
  "starts_at": "2026-02-16T12:00:00Z",
  "ends_at": "2026-02-18T12:00:00Z",
  "options": [
    { "option_id": "opt_a", "label": "A", "text": "Top right" },
    { "option_id": "opt_b", "label": "B", "text": "Bottom left" },
    { "option_id": "opt_c", "label": "C", "text": "Top left" },
    { "option_id": "opt_d", "label": "D", "text": "Bottom right" }
  ],
  "submission": {
    "has_submitted": false,
    "selected_option_id": null,
    "submitted_at": null
  }
}
```

Response `404` when no active game exists for the cycle.

---

## 3) Member: Submit Answer

### `POST /distribution-games/{game_id}/submissions`
One submission per member, immutable after confirmation.

Request body
```json
{
  "selected_option_id": "opt_c",
  "client_submitted_at": "2026-02-16T12:32:11Z"
}
```

Response `201`
```json
{
  "submission_id": "sub_01JABD123",
  "game_id": "game_01JABCXYZ",
  "member_id": "mem_01J777AAA",
  "selected_option_id": "opt_c",
  "submitted_at": "2026-02-16T12:32:12Z",
  "locked": true
}
```

Error cases:
- `400` invalid option id
- `403` member not eligible for cycle
- `409` already submitted
- `422` game not open

---

## 4) Member: Submission Status (optional but recommended)

### `GET /distribution-games/{game_id}/my-submission`
Response `200`
```json
{
  "has_submitted": true,
  "selected_option_id": "opt_c",
  "submitted_at": "2026-02-16T12:32:12Z",
  "locked": true
}
```

---

## 5) Admin: Create Game

### `POST /admin/distribution-games`
Creates game draft for a cycle. Multipart upload for image.

Content type: `multipart/form-data`

Form fields:
- `cycle_id` (string, required)
- `title` (string, required, max 120)
- `prompt_text` (string, required, max 500)
- `starts_at` (ISO datetime, required)
- `ends_at` (ISO datetime, required, must be after `starts_at`)
- `correct_option_id` (string, required, must match one option id)
- `options` (JSON string array, required, min 2, max 6)
- `image` (file, required: jpg/png/webp)

`options` JSON example:
```json
[
  { "option_id": "opt_a", "label": "A", "text": "Top right" },
  { "option_id": "opt_b", "label": "B", "text": "Bottom left" },
  { "option_id": "opt_c", "label": "C", "text": "Top left" },
  { "option_id": "opt_d", "label": "D", "text": "Bottom right" }
]
```

Response `201`
```json
{
  "game_id": "game_01JABCXYZ",
  "cycle_id": "cyc_2026_02",
  "status": "draft",
  "image_url": "https://cdn.example.com/games/game_01JABCXYZ/image.jpg",
  "created_at": "2026-02-16T11:10:00Z"
}
```

---

## 6) Admin: Update Draft Game

### `PATCH /admin/distribution-games/{game_id}`
Updates any editable draft fields (`title`, `prompt_text`, `options`, `correct_option_id`, `starts_at`, `ends_at`, `image`).

Response `200`
```json
{
  "game_id": "game_01JABCXYZ",
  "status": "draft",
  "updated_at": "2026-02-16T11:25:00Z"
}
```

Error:
- `409` if game already published/open/closed and field is no longer editable.

---

## 7) Admin: Publish/Open Game

### `POST /admin/distribution-games/{game_id}/publish`
Moves game from `draft` to `open` (or `scheduled`, depending on `starts_at`).

Response `200`
```json
{
  "game_id": "game_01JABCXYZ",
  "status": "open",
  "published_at": "2026-02-16T12:00:00Z"
}
```

---

## 8) Admin: Close Game Early (optional)

### `POST /admin/distribution-games/{game_id}/close`
Manually closes submissions.

Response `200`
```json
{
  "game_id": "game_01JABCXYZ",
  "status": "closed",
  "closed_at": "2026-02-18T09:20:00Z"
}
```

---

## 9) Admin: Game Analytics and Correct Count

### `GET /admin/distribution-games/{game_id}/summary`
Response `200`
```json
{
  "game_id": "game_01JABCXYZ",
  "cycle_id": "cyc_2026_02",
  "status": "closed",
  "total_submissions": 38122,
  "correct_submissions": 12471,
  "option_breakdown": [
    { "option_id": "opt_a", "count": 9200 },
    { "option_id": "opt_b", "count": 10342 },
    { "option_id": "opt_c", "count": 12471 },
    { "option_id": "opt_d", "count": 6109 }
  ]
}
```

---

## 10) Admin: Select 10 Bonus Members From Correct Answers

### `POST /admin/distribution-games/{game_id}/bonus-selection`
Runs one-time random selection of 10 users from correct responders.

Request body
```json
{
  "count": 10,
  "seed": "optional-audit-seed-2026-02",
  "note": "Post-game bonus chance selection before distribution"
}
```

Response `200`
```json
{
  "game_id": "game_01JABCXYZ",
  "cycle_id": "cyc_2026_02",
  "selected_count": 10,
  "selected_members": [
    { "member_id": "mem_01J1", "user_identifier": "TBK-19A2" },
    { "member_id": "mem_01J2", "user_identifier": "TBK-81QX" }
  ],
  "selection_run_id": "sel_01JABZ999",
  "selected_at": "2026-02-18T12:10:00Z"
}
```

Rules:
- Allowed only when game status is `closed`.
- Idempotency required (same game cannot produce multiple different runs unless explicitly reset by admin super-role).
- If correct submissions are below 10, return all correct responders and `selected_count` reflects actual count.

Error cases:
- `409` selection already executed
- `422` game not closed

---

## 11) Distribution Engine Input Endpoint (internal/admin read)

### `GET /admin/distribution/cycles/{cycle_id}/bonus-members`
Used by draw engine to apply higher chance for next distribution.

Response `200`
```json
{
  "cycle_id": "cyc_2026_02",
  "bonus_source": "threshold_game",
  "members": [
    { "member_id": "mem_01J1", "weight_multiplier": 2.0 },
    { "member_id": "mem_01J2", "weight_multiplier": 2.0 }
  ],
  "selection_run_id": "sel_01JABZ999"
}
```

Note: `weight_multiplier` must be agreed with business logic. Placeholder here is `2.0`.

---

## 12) Common Response Envelope (optional standardization)

If your API uses envelope wrappers, apply consistently:
```json
{
  "success": true,
  "message": "ok",
  "data": {}
}
```

Validation error example:
```json
{
  "success": false,
  "message": "validation_error",
  "errors": [
    { "field": "selected_option_id", "code": "invalid_option" }
  ]
}
```

---

## 13) Minimal DB Entities Needed (for backend planning)

- `distribution_games`
  - `game_id`, `cycle_id`, `title`, `prompt_text`, `image_url`, `status`, `starts_at`, `ends_at`, `correct_option_id`, `created_by`, timestamps
- `distribution_game_options`
  - `option_id`, `game_id`, `label`, `text`, `position`
- `distribution_game_submissions`
  - `submission_id`, `game_id`, `member_id`, `selected_option_id`, `is_correct`, `submitted_at`, unique(`game_id`,`member_id`)
- `distribution_game_bonus_selection_runs`
  - `selection_run_id`, `game_id`, `count_requested`, `count_selected`, `seed`, `executed_by`, `executed_at`
- `distribution_game_bonus_selected_members`
  - `selection_run_id`, `game_id`, `member_id`

---

## 14) Frontend Integration Mapping

- Progress bar replacement trigger:
  - `GET /distribution/cycle/current`
  - UI condition: `distribution_state === "threshold_met_game_open"`
- Game screen data:
  - `GET /distribution-games/active`
- Confirm answer action:
  - `POST /distribution-games/{game_id}/submissions`
- Post-submission lock state:
  - `GET /distribution-games/{game_id}/my-submission`

