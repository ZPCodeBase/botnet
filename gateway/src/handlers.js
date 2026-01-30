/**
 * Telegram Bot API Method Handlers
 * Implements all supported API methods
 */

const {
  successResponse,
  errorResponse,
  generateBotInfo,
  generateMessage,
  generatePhotoMessage,
  generateMediaMessage,
  generateWebhookInfo,
  generateUpdates,
  generateFileInfo,
  generateCommands
} = require('./responses');

// Store webhook URL (in-memory, resets on restart)
let currentWebhookUrl = '';
let storedCommands = [];

/**
 * Handler registry
 * Maps API method names to handler functions
 */
const handlers = {
  // Authentication Methods
  getMe: (token, params) => {
    return successResponse(generateBotInfo(token));
  },

  logOut: (token, params) => {
    return successResponse(true);
  },

  close: (token, params) => {
    return successResponse(true);
  },

  // Update Methods
  getUpdates: (token, params) => {
    // Return empty updates array (no pending messages)
    return successResponse(generateUpdates());
  },

  setWebhook: (token, params) => {
    currentWebhookUrl = params.url || '';
    return successResponse(true);
  },

  deleteWebhook: (token, params) => {
    currentWebhookUrl = '';
    return successResponse(true);
  },

  getWebhookInfo: (token, params) => {
    return successResponse(generateWebhookInfo(currentWebhookUrl));
  },

  // Message Methods
  sendMessage: (token, params) => {
    const chatId = params.chat_id;
    const text = params.text || '';

    if (!chatId) {
      return errorResponse(400, 'Bad Request: chat_id is required');
    }

    const message = generateMessage(token, chatId, text);

    // Add optional fields if present
    if (params.reply_to_message_id) {
      message.reply_to_message = { message_id: parseInt(params.reply_to_message_id, 10) };
    }

    return successResponse(message);
  },

  sendPhoto: (token, params) => {
    const chatId = params.chat_id;
    if (!chatId) {
      return errorResponse(400, 'Bad Request: chat_id is required');
    }
    return successResponse(generatePhotoMessage(token, chatId, params.caption));
  },

  sendVideo: (token, params) => {
    const chatId = params.chat_id;
    if (!chatId) {
      return errorResponse(400, 'Bad Request: chat_id is required');
    }
    return successResponse(generateMediaMessage(token, chatId, 'video', params.caption));
  },

  sendAudio: (token, params) => {
    const chatId = params.chat_id;
    if (!chatId) {
      return errorResponse(400, 'Bad Request: chat_id is required');
    }
    return successResponse(generateMediaMessage(token, chatId, 'audio', params.caption));
  },

  sendVoice: (token, params) => {
    const chatId = params.chat_id;
    if (!chatId) {
      return errorResponse(400, 'Bad Request: chat_id is required');
    }
    return successResponse(generateMediaMessage(token, chatId, 'voice', params.caption));
  },

  sendDocument: (token, params) => {
    const chatId = params.chat_id;
    if (!chatId) {
      return errorResponse(400, 'Bad Request: chat_id is required');
    }
    return successResponse(generateMediaMessage(token, chatId, 'document', params.caption));
  },

  sendSticker: (token, params) => {
    const chatId = params.chat_id;
    if (!chatId) {
      return errorResponse(400, 'Bad Request: chat_id is required');
    }
    const message = generateMediaMessage(token, chatId, 'sticker', null);
    message.sticker.is_animated = false;
    message.sticker.is_video = false;
    message.sticker.type = 'regular';
    return successResponse(message);
  },

  sendAnimation: (token, params) => {
    const chatId = params.chat_id;
    if (!chatId) {
      return errorResponse(400, 'Bad Request: chat_id is required');
    }
    return successResponse(generateMediaMessage(token, chatId, 'animation', params.caption));
  },

  sendLocation: (token, params) => {
    const chatId = params.chat_id;
    if (!chatId) {
      return errorResponse(400, 'Bad Request: chat_id is required');
    }
    const message = generateMessage(token, chatId, null);
    delete message.text;
    message.location = {
      latitude: parseFloat(params.latitude) || 0,
      longitude: parseFloat(params.longitude) || 0
    };
    return successResponse(message);
  },

  sendContact: (token, params) => {
    const chatId = params.chat_id;
    if (!chatId) {
      return errorResponse(400, 'Bad Request: chat_id is required');
    }
    const message = generateMessage(token, chatId, null);
    delete message.text;
    message.contact = {
      phone_number: params.phone_number || '',
      first_name: params.first_name || ''
    };
    return successResponse(message);
  },

  // Message Operations
  editMessageText: (token, params) => {
    const chatId = params.chat_id;
    const messageId = params.message_id;
    const text = params.text || '';

    if (!chatId || !messageId) {
      return errorResponse(400, 'Bad Request: chat_id and message_id are required');
    }

    const message = generateMessage(token, chatId, text);
    message.message_id = parseInt(messageId, 10);
    message.edit_date = Math.floor(Date.now() / 1000);

    return successResponse(message);
  },

  deleteMessage: (token, params) => {
    const chatId = params.chat_id;
    const messageId = params.message_id;

    if (!chatId || !messageId) {
      return errorResponse(400, 'Bad Request: chat_id and message_id are required');
    }

    return successResponse(true);
  },

  setMessageReaction: (token, params) => {
    const chatId = params.chat_id;
    const messageId = params.message_id;

    if (!chatId || !messageId) {
      return errorResponse(400, 'Bad Request: chat_id and message_id are required');
    }

    return successResponse(true);
  },

  // Callback Query
  answerCallbackQuery: (token, params) => {
    const callbackQueryId = params.callback_query_id;

    if (!callbackQueryId) {
      return errorResponse(400, 'Bad Request: callback_query_id is required');
    }

    return successResponse(true);
  },

  // Bot Commands
  setMyCommands: (token, params) => {
    storedCommands = params.commands || [];
    return successResponse(true);
  },

  getMyCommands: (token, params) => {
    return successResponse(storedCommands.length > 0 ? storedCommands : generateCommands());
  },

  deleteMyCommands: (token, params) => {
    storedCommands = [];
    return successResponse(true);
  },

  // File Operations
  getFile: (token, params) => {
    const fileId = params.file_id;

    if (!fileId) {
      return errorResponse(400, 'Bad Request: file_id is required');
    }

    return successResponse(generateFileInfo(fileId));
  },

  // Chat Actions
  sendChatAction: (token, params) => {
    const chatId = params.chat_id;
    const action = params.action;

    if (!chatId || !action) {
      return errorResponse(400, 'Bad Request: chat_id and action are required');
    }

    return successResponse(true);
  },

  // Chat Info
  getChat: (token, params) => {
    const chatId = params.chat_id;
    if (!chatId) {
      return errorResponse(400, 'Bad Request: chat_id is required');
    }
    return successResponse({
      id: parseInt(chatId, 10),
      type: chatId < 0 ? 'group' : 'private',
      title: chatId < 0 ? 'Group Chat' : undefined,
      first_name: chatId > 0 ? 'User' : undefined
    });
  },

  getChatMember: (token, params) => {
    const chatId = params.chat_id;
    const userId = params.user_id;
    if (!chatId || !userId) {
      return errorResponse(400, 'Bad Request: chat_id and user_id are required');
    }
    return successResponse({
      user: {
        id: parseInt(userId, 10),
        is_bot: false,
        first_name: 'User'
      },
      status: 'member'
    });
  },

  getChatMemberCount: (token, params) => {
    return successResponse(1);
  },

  // Inline Mode
  answerInlineQuery: (token, params) => {
    return successResponse(true);
  }
};

/**
 * Get handler for API method
 */
function getHandler(method) {
  return handlers[method] || null;
}

/**
 * List all supported methods
 */
function getSupportedMethods() {
  return Object.keys(handlers);
}

module.exports = {
  getHandler,
  getSupportedMethods,
  handlers
};
