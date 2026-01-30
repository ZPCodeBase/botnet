/**
 * Request Logging Service
 * Logs all incoming requests to JSON Lines files
 */

const fs = require('fs');
const path = require('path');

const LOGS_DIR = path.join(__dirname, '..', 'logs');

// Ensure logs directory exists
if (!fs.existsSync(LOGS_DIR)) {
  fs.mkdirSync(LOGS_DIR, { recursive: true });
}

/**
 * Mask bot token for security
 * Shows first 3 and last 3 characters
 */
function maskToken(token) {
  if (!token || token.length < 10) return '***';
  return `${token.slice(0, 3)}...${token.slice(-3)}`;
}

/**
 * Get today's log filename
 */
function getLogFilename() {
  const date = new Date().toISOString().split('T')[0];
  return path.join(LOGS_DIR, `requests-${date}.jsonl`);
}

/**
 * Log a request to file
 */
async function logRequest(entry) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    method: entry.method,
    path: entry.path.replace(/\/bot[^/]+\//, '/bot***/'),
    api_method: entry.apiMethod,
    token_masked: maskToken(entry.token),
    body: entry.body || {},
    query: entry.query || {},
    response_status: entry.responseStatus,
    response_time_ms: entry.responseTime
  };

  const line = JSON.stringify(logEntry) + '\n';
  const filename = getLogFilename();

  return new Promise((resolve, reject) => {
    fs.appendFile(filename, line, (err) => {
      if (err) {
        console.error('Failed to write log:', err);
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

/**
 * Express middleware for request logging
 */
function loggingMiddleware(req, res, next) {
  const startTime = Date.now();

  // Store original end function
  const originalEnd = res.end;

  res.end = function(...args) {
    const responseTime = Date.now() - startTime;

    // Extract token and API method from path
    const pathMatch = req.path.match(/\/bot([^/]+)\/(.+)/);
    const token = pathMatch ? pathMatch[1] : null;
    const apiMethod = pathMatch ? pathMatch[2] : req.path;

    // Log asynchronously
    logRequest({
      method: req.method,
      path: req.path,
      apiMethod,
      token,
      body: req.body,
      query: req.query,
      responseStatus: res.statusCode,
      responseTime
    }).catch(err => console.error('Logging error:', err));

    // Call original end
    return originalEnd.apply(this, args);
  };

  next();
}

module.exports = {
  logRequest,
  loggingMiddleware,
  maskToken
};
