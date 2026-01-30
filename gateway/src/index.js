/**
 * Telegram Bot API Gateway
 * A compatible gateway service for Telegram Bot API
 */

const express = require('express');
const { loggingMiddleware } = require('./logger');
const { getHandler, getSupportedMethods } = require('./handlers');
const { errorResponse } = require('./responses');

const app = express();
const PORT = process.env.PORT || 8081;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(loggingMiddleware);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'Telegram Bot API Gateway',
    version: '1.0.0',
    supported_methods: getSupportedMethods()
  });
});

/**
 * Token validation middleware
 */
function validateToken(req, res, next) {
  const token = req.params.token;

  // Basic token format validation: {bot_id}:{secret}
  if (!token || !token.includes(':')) {
    return res.status(401).json(errorResponse(401, 'Unauthorized: Invalid bot token'));
  }

  // Store token for handlers
  req.botToken = token;
  next();
}

/**
 * Main API route handler
 * Matches /bot{token}/{method}
 */
app.all('/bot:token/:method', validateToken, (req, res) => {
  const method = req.params.method;
  const token = req.botToken;

  // Get handler for this method
  const handler = getHandler(method);

  if (!handler) {
    return res.status(404).json(
      errorResponse(404, `Not Found: method "${method}" not found`)
    );
  }

  try {
    // Merge query params and body
    const params = { ...req.query, ...req.body };

    // Execute handler
    const result = handler(token, params);

    // Set appropriate status code
    const statusCode = result.ok ? 200 : (result.error_code || 400);
    res.status(statusCode).json(result);
  } catch (error) {
    console.error(`Error handling ${method}:`, error);
    res.status(500).json(
      errorResponse(500, 'Internal Server Error')
    );
  }
});

/**
 * File download route
 * Matches /file/bot{token}/{file_path}
 * Using regex for Express 5 compatibility
 */
app.get(/^\/file\/bot([^/]+)\/(.+)$/, (req, res) => {
  const token = req.params[0];

  // Basic token format validation
  if (!token || !token.includes(':')) {
    return res.status(401).json(errorResponse(401, 'Unauthorized: Invalid bot token'));
  }

  // For now, return a placeholder response
  res.status(200).send('File content placeholder');
});

// 404 handler for unmatched routes
app.use((req, res) => {
  res.status(404).json(errorResponse(404, 'Not Found'));
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json(errorResponse(500, 'Internal Server Error'));
});

// Start server
app.listen(PORT, () => {
  console.log(`
  ╔════════════════════════════════════════════════════════╗
  ║         Telegram Bot API Gateway                       ║
  ╠════════════════════════════════════════════════════════╣
  ║  Status:    Running                                    ║
  ║  Port:      ${String(PORT).padEnd(42)}║
  ║  Base URL:  http://localhost:${String(PORT).padEnd(27)}║
  ╚════════════════════════════════════════════════════════╝

  API Usage:
    http://localhost:${PORT}/bot<TOKEN>/getMe
    http://localhost:${PORT}/bot<TOKEN>/sendMessage

  Health Check:
    http://localhost:${PORT}/health
  `);
});

module.exports = app;
