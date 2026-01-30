/**
 * Telegram API Response Generator
 * Generates valid Telegram Bot API format responses
 */

// Counter for generating unique message IDs
let messageIdCounter = 1;
let updateIdCounter = 1;

/**
 * Create success response wrapper
 */
function successResponse(result) {
  return {
    ok: true,
    result
  };
}

/**
 * Create error response wrapper
 */
function errorResponse(code, description) {
  return {
    ok: false,
    error_code: code,
    description
  };
}

/**
 * Extract bot ID from token
 */
function getBotIdFromToken(token) {
  if (!token) return 123456789;
  const parts = token.split(':');
  return parseInt(parts[0], 10) || 123456789;
}

/**
 * Generate bot info for getMe
 */
function generateBotInfo(token) {
  const botId = getBotIdFromToken(token);
  return {
    id: botId,
    is_bot: true,
    first_name: 'Gateway Bot',
    username: 'gateway_bot',
    can_join_groups: true,
    can_read_all_group_messages: false,
    supports_inline_queries: false
  };
}

/**
 * Generate message object
 */
function generateMessage(token, chatId, text, options = {}) {
  const botInfo = generateBotInfo(token);
  const messageId = messageIdCounter++;

  return {
    message_id: messageId,
    from: {
      id: botInfo.id,
      is_bot: true,
      first_name: botInfo.first_name,
      username: botInfo.username
    },
    chat: {
      id: parseInt(chatId, 10) || 0,
      type: chatId < 0 ? 'group' : 'private',
      ...(chatId > 0 ? { first_name: 'User' } : { title: 'Group' })
    },
    date: Math.floor(Date.now() / 1000),
    text: text || '',
    ...options
  };
}

/**
 * Generate photo message
 */
function generatePhotoMessage(token, chatId, caption) {
  const msg = generateMessage(token, chatId, null);
  delete msg.text;
  msg.photo = [
    {
      file_id: 'AgACAgIAAxkBAAI' + Math.random().toString(36).substring(2, 15),
      file_unique_id: 'AQAD' + Math.random().toString(36).substring(2, 10),
      file_size: 1024,
      width: 100,
      height: 100
    }
  ];
  if (caption) msg.caption = caption;
  return msg;
}

/**
 * Generate document/video/audio message
 */
function generateMediaMessage(token, chatId, mediaType, caption) {
  const msg = generateMessage(token, chatId, null);
  delete msg.text;

  const fileId = 'BQACAgIAAxkBAAI' + Math.random().toString(36).substring(2, 15);
  const fileUniqueId = 'AgAD' + Math.random().toString(36).substring(2, 10);

  msg[mediaType] = {
    file_id: fileId,
    file_unique_id: fileUniqueId,
    file_size: 2048
  };

  if (caption) msg.caption = caption;
  return msg;
}

/**
 * Generate webhook info
 */
function generateWebhookInfo(url = '') {
  return {
    url: url,
    has_custom_certificate: false,
    pending_update_count: 0,
    max_connections: 40,
    ip_address: url ? '1.2.3.4' : undefined
  };
}

/**
 * Generate empty updates array
 */
function generateUpdates() {
  return [];
}

/**
 * Generate file info
 */
function generateFileInfo(fileId) {
  return {
    file_id: fileId,
    file_unique_id: 'AgAD' + Math.random().toString(36).substring(2, 10),
    file_size: 1024,
    file_path: 'documents/file_' + Math.random().toString(36).substring(2, 8) + '.pdf'
  };
}

/**
 * Generate commands array
 */
function generateCommands() {
  return [
    { command: 'start', description: 'Start the bot' },
    { command: 'help', description: 'Show help message' }
  ];
}

module.exports = {
  successResponse,
  errorResponse,
  generateBotInfo,
  generateMessage,
  generatePhotoMessage,
  generateMediaMessage,
  generateWebhookInfo,
  generateUpdates,
  generateFileInfo,
  generateCommands,
  getBotIdFromToken
};
