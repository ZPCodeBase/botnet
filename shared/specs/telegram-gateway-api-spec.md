# Telegram API Gateway Specification

> Version: 1.0.0
> Date: 2026-01-30
> Author: Product Role

## 1. Overview

This document specifies the requirements for a Telegram Bot API compatible Gateway service. The gateway must be fully compatible with Telegram Bot API authentication, protocol, and functional logic.

## 2. Functional Requirements

### 2.1 Core Features

| ID | Feature | Priority | Description |
|----|---------|----------|-------------|
| F-001 | Token Authentication | P0 | Parse and validate bot token from URL path |
| F-002 | API Method Routing | P0 | Route all Telegram Bot API methods |
| F-003 | Request Logging | P0 | Log all incoming requests to local file |
| F-004 | Success Response | P0 | Return success status for all requests |

### 2.2 API Endpoints

Base URL pattern: `http://localhost:{port}/bot{token}/{method}`

#### Authentication Methods

| Method | HTTP | Parameters | Description |
|--------|------|------------|-------------|
| getMe | GET | None | Returns bot information |
| logOut | POST | None | Log out from cloud Bot API server |

#### Update Methods

| Method | HTTP | Parameters | Description |
|--------|------|------------|-------------|
| getUpdates | GET/POST | offset, limit, timeout, allowed_updates | Long polling for updates |
| setWebhook | POST | url, secret_token, max_connections, allowed_updates | Set webhook URL |
| deleteWebhook | POST | drop_pending_updates | Remove webhook |
| getWebhookInfo | GET | None | Get webhook status |

#### Message Methods

| Method | HTTP | Parameters | Description |
|--------|------|------------|-------------|
| sendMessage | POST | chat_id, text, parse_mode, reply_markup, etc. | Send text message |
| sendPhoto | POST | chat_id, photo, caption, etc. | Send photo |
| sendVideo | POST | chat_id, video, caption, etc. | Send video |
| sendAudio | POST | chat_id, audio, caption, etc. | Send audio |
| sendVoice | POST | chat_id, voice, caption, etc. | Send voice message |
| sendDocument | POST | chat_id, document, caption, etc. | Send document |
| sendSticker | POST | chat_id, sticker | Send sticker |
| sendAnimation | POST | chat_id, animation, caption, etc. | Send animation |

#### Message Operations

| Method | HTTP | Parameters | Description |
|--------|------|------------|-------------|
| editMessageText | POST | chat_id, message_id, text, etc. | Edit message text |
| deleteMessage | POST | chat_id, message_id | Delete message |
| setMessageReaction | POST | chat_id, message_id, reaction | Set reaction |
| answerCallbackQuery | POST | callback_query_id, text, etc. | Answer callback |

#### Bot Commands

| Method | HTTP | Parameters | Description |
|--------|------|------------|-------------|
| setMyCommands | POST | commands, scope, language_code | Set bot commands |
| getMyCommands | GET | scope, language_code | Get bot commands |
| deleteMyCommands | POST | scope, language_code | Delete bot commands |

#### File Operations

| Method | HTTP | Parameters | Description |
|--------|------|------------|-------------|
| getFile | GET | file_id | Get file info for download |

### 2.3 File Download Endpoint

URL pattern: `http://localhost:{port}/file/bot{token}/{file_path}`

## 3. Protocol Specification

### 3.1 Authentication

- Token format: `{bot_id}:{secret_key}`
- Token location: URL path after `/bot` prefix
- Example: `/bot123456789:ABCdefGHIjklMNOpqrsTUVwxyz/getMe`

### 3.2 Request Format

- Content-Type: `application/json` or `multipart/form-data`
- Methods: GET or POST (both accepted for most endpoints)

### 3.3 Response Format

All responses must follow Telegram API response format:

```json
{
  "ok": true,
  "result": { ... }
}
```

Error response:

```json
{
  "ok": false,
  "error_code": 400,
  "description": "Bad Request: ..."
}
```

### 3.4 Success Response Examples

#### getMe Response

```json
{
  "ok": true,
  "result": {
    "id": 123456789,
    "is_bot": true,
    "first_name": "Gateway Bot",
    "username": "gateway_bot",
    "can_join_groups": true,
    "can_read_all_group_messages": false,
    "supports_inline_queries": false
  }
}
```

#### sendMessage Response

```json
{
  "ok": true,
  "result": {
    "message_id": 1,
    "from": {
      "id": 123456789,
      "is_bot": true,
      "first_name": "Gateway Bot",
      "username": "gateway_bot"
    },
    "chat": {
      "id": 987654321,
      "first_name": "User",
      "type": "private"
    },
    "date": 1706601600,
    "text": "Hello, World!"
  }
}
```

## 4. Logging Requirements

### 4.1 Request Log Format

Each request must be logged with:

- Timestamp (ISO 8601)
- HTTP Method
- Full URL path
- Bot token (masked)
- Request body (JSON)
- Response status

### 4.2 Log File Location

- Directory: `./logs/`
- Filename pattern: `requests-{YYYY-MM-DD}.jsonl`
- Format: JSON Lines (one JSON object per line)

### 4.3 Log Entry Schema

```json
{
  "timestamp": "2026-01-30T12:00:00.000Z",
  "method": "POST",
  "path": "/bot***:ABC.../sendMessage",
  "token_masked": "123...xyz",
  "body": { "chat_id": 123, "text": "Hello" },
  "response_status": 200
}
```

## 5. Non-Functional Requirements

### 5.1 Performance

- No performance requirements (development/testing only)
- No concurrency requirements

### 5.2 Compatibility

- Must be 100% protocol compatible with Telegram Bot API
- Must support all standard grammY client requests

## 6. Out of Scope (Phase 1)

- Actual message delivery
- Webhook mode (receiving updates)
- File upload/download processing
- Rate limiting
- Database persistence

## 7. Acceptance Criteria

1. Gateway starts and listens on configurable port
2. Accepts requests matching Telegram Bot API URL pattern
3. Returns valid success responses for all methods
4. Logs all requests to local file
5. Can be used as drop-in replacement for `api.telegram.org`
