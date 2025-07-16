const axios = require('axios');

const LOG_API_URL = 'http://20.244.56.144/evaluation-service/logs';

const VALID_STACKS = ['backend', 'frontend'];
const VALID_LEVELS = ['debug', 'info', 'warn', 'error', 'fatal'];
const VALID_PACKAGES = [
  // Backend-only
  'cache', 'controller', 'cron_job', 'db', 'domain', 'handler', 'repository', 'route', 'service',
  // Frontend-only
  'component', 'hook', 'page', 'state', 'style',
  // Shared
  'auth', 'config', 'middleware', 'utils'
];

async function Log(stack, level, pkg, message) {
  // Input validation
  if (!VALID_STACKS.includes(stack)) {
    console.error(`[Log Error] Invalid stack: ${stack}`);
    return;
  }
  if (!VALID_LEVELS.includes(level)) {
    console.error(`[Log Error] Invalid level: ${level}`);
    return;
  }
  if (!VALID_PACKAGES.includes(pkg)) {
    console.error(`[Log Error] Invalid package: ${pkg}`);
    return;
  }

  try {
    const response = await axios.post(LOG_API_URL, {
      stack,
      level,
      package: pkg,
      message
    });

    console.log(`[Log] ${level.toUpperCase()} - ${pkg} - ${message}`);
    return response.data;
  } catch (err) {
    console.error(`[Log API Error] Failed to send log: ${err.message}`);
  }
}

module.exports = Log;
