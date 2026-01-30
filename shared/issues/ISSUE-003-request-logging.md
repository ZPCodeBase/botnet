# ISSUE-003: Request Logging Service

**Status**: Closed
**Assignee**: Arch
**Priority**: P0
**Created**: 2026-01-30
**Updated**: 2026-01-30
**Closed**: 2026-01-30

## Description

Implement request logging service to save all incoming requests to local files.

## Acceptance Criteria

- [x] Logs directory auto-created if not exists
- [x] Each request logged as single JSON line
- [x] Token properly masked (show first 3 and last 3 chars)
- [x] Response time measured and logged
- [x] No request lost during concurrent access

## Resolution

Implemented in `botnet-arch/gateway/src/logger.js`:
- Express middleware for automatic logging
- Async file append for non-blocking writes
- Token masking: `123...xyz` format
- Daily log rotation: `requests-YYYY-MM-DD.jsonl`

## Log Entry Schema

```json
{
  "timestamp": "2026-01-30T12:00:00.000Z",
  "method": "POST",
  "path": "/bot***/sendMessage",
  "api_method": "sendMessage",
  "token_masked": "123...xyz",
  "body": { "chat_id": 123, "text": "Hello" },
  "query": {},
  "response_status": 200,
  "response_time_ms": 5
}
```

## Related

- Depends on: ISSUE-001 (Closed)
- Spec: `shared/specs/telegram-gateway-api-spec.md` Section 4
