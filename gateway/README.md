# Telegram Bot API Gateway

A Node.js gateway service fully compatible with Telegram Bot API protocol.

## Features

- Full Telegram Bot API authentication compatibility
- All major API methods supported
- Request logging to JSON Lines files
- Drop-in replacement for `api.telegram.org`

## Quick Start

```bash
# Install dependencies
npm install

# Start the gateway
npm start

# Or with custom port
PORT=8082 npm start
```

## API Usage

Base URL: `http://localhost:8081`

### Example Requests

```bash
# Get bot info
curl http://localhost:8081/bot123456:ABC-DEF/getMe

# Send message
curl -X POST http://localhost:8081/bot123456:ABC-DEF/sendMessage \
  -H "Content-Type: application/json" \
  -d '{"chat_id": 123, "text": "Hello World"}'

# Health check
curl http://localhost:8081/health
```

## Using with grammY / moltbot

Set the environment variable to redirect API calls to the gateway:

```bash
export TELEGRAM_API_BASE="http://localhost:8081"
```

## Supported Methods

### Authentication
- getMe
- logOut
- close

### Updates
- getUpdates
- setWebhook
- deleteWebhook
- getWebhookInfo

### Messages
- sendMessage
- sendPhoto
- sendVideo
- sendAudio
- sendVoice
- sendDocument
- sendSticker
- sendAnimation
- sendLocation
- sendContact

### Operations
- editMessageText
- deleteMessage
- setMessageReaction
- answerCallbackQuery
- sendChatAction

### Bot Commands
- setMyCommands
- getMyCommands
- deleteMyCommands

### Files
- getFile

### Chat
- getChat
- getChatMember
- getChatMemberCount

## Logs

Request logs are saved to `./logs/requests-{YYYY-MM-DD}.jsonl`

Each line contains a JSON object with:
- timestamp
- method
- path (token masked)
- api_method
- body
- response_status
- response_time_ms

## Development

```bash
# Run with auto-reload
npm run dev
```

## Architecture

```
gateway/
├── src/
│   ├── index.js      # Express server and routing
│   ├── handlers.js   # API method handlers
│   ├── responses.js  # Response generators
│   └── logger.js     # Request logging service
├── logs/             # Request log files
└── package.json
```

## License

MIT
