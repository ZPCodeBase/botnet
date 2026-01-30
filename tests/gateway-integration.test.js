/**
 * Gateway Integration Tests
 * Tests the Telegram API Gateway for protocol compatibility
 *
 * Run with: node tests/gateway-integration.test.js
 * Requires: Gateway running on http://localhost:8081
 */

const GATEWAY_BASE = process.env.GATEWAY_BASE || 'http://localhost:8081';
const TEST_TOKEN = '123456789:ABCdefGHIjklMNOpqrsTUVwxyz';

// Test counters
let passed = 0;
let failed = 0;

/**
 * Simple test runner
 */
async function test(name, fn) {
  process.stdout.write(`  ${name}... `);
  try {
    await fn();
    console.log('\x1b[32m PASS\x1b[0m');
    passed++;
  } catch (error) {
    console.log('\x1b[31m FAIL\x1b[0m');
    console.log(`    Error: ${error.message}`);
    failed++;
  }
}

/**
 * Assert helper
 */
function assert(condition, message) {
  if (!condition) {
    throw new Error(message || 'Assertion failed');
  }
}

/**
 * Make API request
 */
async function apiRequest(method, params = {}, httpMethod = 'POST') {
  const url = `${GATEWAY_BASE}/bot${TEST_TOKEN}/${method}`;
  const options = {
    method: httpMethod,
    headers: { 'Content-Type': 'application/json' },
  };
  if (httpMethod === 'POST' && Object.keys(params).length > 0) {
    options.body = JSON.stringify(params);
  }
  const response = await fetch(url);
  return response.json();
}

/**
 * Test Suite: Connection
 */
async function testConnection() {
  console.log('\n\x1b[36m=== Connection Tests ===\x1b[0m');

  await test('Health endpoint responds', async () => {
    const res = await fetch(`${GATEWAY_BASE}/health`);
    const data = await res.json();
    assert(data.status === 'ok', 'Health status should be ok');
  });

  await test('Root endpoint returns API info', async () => {
    const res = await fetch(`${GATEWAY_BASE}/`);
    const data = await res.json();
    assert(data.name === 'Telegram Bot API Gateway', 'Name should match');
    assert(Array.isArray(data.supported_methods), 'Should list supported methods');
  });

  await test('Invalid token returns 401', async () => {
    const res = await fetch(`${GATEWAY_BASE}/botinvalidtoken/getMe`);
    const data = await res.json();
    assert(data.ok === false, 'Should return ok: false');
    assert(data.error_code === 401, 'Should return 401');
  });
}

/**
 * Test Suite: Authentication Methods
 */
async function testAuthentication() {
  console.log('\n\x1b[36m=== Authentication Tests ===\x1b[0m');

  await test('getMe returns bot info', async () => {
    const res = await fetch(`${GATEWAY_BASE}/bot${TEST_TOKEN}/getMe`);
    const data = await res.json();
    assert(data.ok === true, 'Should return ok: true');
    assert(data.result.is_bot === true, 'Should be a bot');
    assert(typeof data.result.id === 'number', 'Should have bot ID');
    assert(typeof data.result.username === 'string', 'Should have username');
  });

  await test('logOut returns success', async () => {
    const res = await fetch(`${GATEWAY_BASE}/bot${TEST_TOKEN}/logOut`, { method: 'POST' });
    const data = await res.json();
    assert(data.ok === true, 'Should return ok: true');
    assert(data.result === true, 'Result should be true');
  });
}

/**
 * Test Suite: Update Methods
 */
async function testUpdates() {
  console.log('\n\x1b[36m=== Update Tests ===\x1b[0m');

  await test('getUpdates returns empty array', async () => {
    const res = await fetch(`${GATEWAY_BASE}/bot${TEST_TOKEN}/getUpdates`);
    const data = await res.json();
    assert(data.ok === true, 'Should return ok: true');
    assert(Array.isArray(data.result), 'Result should be array');
    assert(data.result.length === 0, 'Should be empty (no real updates)');
  });

  await test('setWebhook accepts URL', async () => {
    const res = await fetch(`${GATEWAY_BASE}/bot${TEST_TOKEN}/setWebhook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: 'https://example.com/webhook' })
    });
    const data = await res.json();
    assert(data.ok === true, 'Should return ok: true');
  });

  await test('getWebhookInfo returns webhook status', async () => {
    const res = await fetch(`${GATEWAY_BASE}/bot${TEST_TOKEN}/getWebhookInfo`);
    const data = await res.json();
    assert(data.ok === true, 'Should return ok: true');
    assert('url' in data.result, 'Should have url field');
    assert('pending_update_count' in data.result, 'Should have pending_update_count');
  });

  await test('deleteWebhook clears webhook', async () => {
    const res = await fetch(`${GATEWAY_BASE}/bot${TEST_TOKEN}/deleteWebhook`, { method: 'POST' });
    const data = await res.json();
    assert(data.ok === true, 'Should return ok: true');
  });
}

/**
 * Test Suite: Message Methods
 */
async function testMessages() {
  console.log('\n\x1b[36m=== Message Tests ===\x1b[0m');

  await test('sendMessage returns message object', async () => {
    const res = await fetch(`${GATEWAY_BASE}/bot${TEST_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: 12345, text: 'Hello, World!' })
    });
    const data = await res.json();
    assert(data.ok === true, 'Should return ok: true');
    assert(typeof data.result.message_id === 'number', 'Should have message_id');
    assert(data.result.text === 'Hello, World!', 'Text should match');
    assert(data.result.chat.id === 12345, 'Chat ID should match');
  });

  await test('sendMessage without chat_id fails', async () => {
    const res = await fetch(`${GATEWAY_BASE}/bot${TEST_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: 'Hello' })
    });
    const data = await res.json();
    assert(data.ok === false, 'Should return ok: false');
    assert(data.error_code === 400, 'Should return 400');
  });

  await test('sendPhoto returns photo message', async () => {
    const res = await fetch(`${GATEWAY_BASE}/bot${TEST_TOKEN}/sendPhoto`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: 12345, photo: 'https://example.com/photo.jpg', caption: 'Test photo' })
    });
    const data = await res.json();
    assert(data.ok === true, 'Should return ok: true');
    assert(Array.isArray(data.result.photo), 'Should have photo array');
    assert(data.result.caption === 'Test photo', 'Caption should match');
  });

  await test('sendDocument returns document message', async () => {
    const res = await fetch(`${GATEWAY_BASE}/bot${TEST_TOKEN}/sendDocument`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: 12345, document: 'file_id_123' })
    });
    const data = await res.json();
    assert(data.ok === true, 'Should return ok: true');
    assert('document' in data.result, 'Should have document field');
  });
}

/**
 * Test Suite: Message Operations
 */
async function testMessageOperations() {
  console.log('\n\x1b[36m=== Message Operations Tests ===\x1b[0m');

  await test('editMessageText returns edited message', async () => {
    const res = await fetch(`${GATEWAY_BASE}/bot${TEST_TOKEN}/editMessageText`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: 12345, message_id: 1, text: 'Edited text' })
    });
    const data = await res.json();
    assert(data.ok === true, 'Should return ok: true');
    assert(data.result.text === 'Edited text', 'Text should be edited');
    assert('edit_date' in data.result, 'Should have edit_date');
  });

  await test('deleteMessage returns success', async () => {
    const res = await fetch(`${GATEWAY_BASE}/bot${TEST_TOKEN}/deleteMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: 12345, message_id: 1 })
    });
    const data = await res.json();
    assert(data.ok === true, 'Should return ok: true');
    assert(data.result === true, 'Result should be true');
  });

  await test('answerCallbackQuery returns success', async () => {
    const res = await fetch(`${GATEWAY_BASE}/bot${TEST_TOKEN}/answerCallbackQuery`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ callback_query_id: 'test_callback_123' })
    });
    const data = await res.json();
    assert(data.ok === true, 'Should return ok: true');
  });
}

/**
 * Test Suite: Bot Commands
 */
async function testBotCommands() {
  console.log('\n\x1b[36m=== Bot Commands Tests ===\x1b[0m');

  await test('setMyCommands accepts commands', async () => {
    const res = await fetch(`${GATEWAY_BASE}/bot${TEST_TOKEN}/setMyCommands`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        commands: [
          { command: 'start', description: 'Start the bot' },
          { command: 'help', description: 'Get help' }
        ]
      })
    });
    const data = await res.json();
    assert(data.ok === true, 'Should return ok: true');
  });

  await test('getMyCommands returns commands', async () => {
    const res = await fetch(`${GATEWAY_BASE}/bot${TEST_TOKEN}/getMyCommands`);
    const data = await res.json();
    assert(data.ok === true, 'Should return ok: true');
    assert(Array.isArray(data.result), 'Result should be array');
  });
}

/**
 * Test Suite: Error Handling
 */
async function testErrorHandling() {
  console.log('\n\x1b[36m=== Error Handling Tests ===\x1b[0m');

  await test('Unknown method returns 404', async () => {
    const res = await fetch(`${GATEWAY_BASE}/bot${TEST_TOKEN}/unknownMethod`);
    const data = await res.json();
    assert(data.ok === false, 'Should return ok: false');
    assert(data.error_code === 404, 'Should return 404');
  });

  await test('Invalid JSON returns 400', async () => {
    const res = await fetch(`${GATEWAY_BASE}/bot${TEST_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: 'not valid json'
    });
    // Express should handle this with error
    assert(res.status === 400 || res.status === 500, 'Should return error status');
  });
}

/**
 * Main test runner
 */
async function runTests() {
  console.log('\x1b[1m\x1b[35m');
  console.log('╔════════════════════════════════════════════════════════╗');
  console.log('║       Telegram Gateway Integration Tests               ║');
  console.log('╚════════════════════════════════════════════════════════╝');
  console.log('\x1b[0m');
  console.log(`Gateway URL: ${GATEWAY_BASE}`);
  console.log(`Test Token: ${TEST_TOKEN.slice(0, 10)}...`);

  try {
    // Check if gateway is running
    const healthCheck = await fetch(`${GATEWAY_BASE}/health`).catch(() => null);
    if (!healthCheck || !healthCheck.ok) {
      console.error('\n\x1b[31mError: Gateway is not running!\x1b[0m');
      console.error(`Please start the gateway at ${GATEWAY_BASE}`);
      process.exit(1);
    }

    await testConnection();
    await testAuthentication();
    await testUpdates();
    await testMessages();
    await testMessageOperations();
    await testBotCommands();
    await testErrorHandling();

    // Summary
    console.log('\n\x1b[1m=== Test Summary ===\x1b[0m');
    console.log(`Total: ${passed + failed}`);
    console.log(`\x1b[32mPassed: ${passed}\x1b[0m`);
    if (failed > 0) {
      console.log(`\x1b[31mFailed: ${failed}\x1b[0m`);
      process.exit(1);
    } else {
      console.log('\n\x1b[32m\x1b[1mAll tests passed!\x1b[0m\n');
    }
  } catch (error) {
    console.error('\n\x1b[31mTest runner error:\x1b[0m', error);
    process.exit(1);
  }
}

// Run tests
runTests();
