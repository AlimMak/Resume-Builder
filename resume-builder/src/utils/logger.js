/**
 * Minimal browser logger with a winston-like API for leveled logs.
 * Uses console under the hood and timestamps messages.
 */
const levels = ['error', 'warn', 'info', 'debug'];

function format(prefix, payload) {
  const time = new Date().toISOString();
  const details = payload ? JSON.stringify(payload) : '';
  return `[${time}] ${prefix}${details ? ' ' + details : ''}`;
}

export const logger = {
  error: (message, meta) => console.error(format(`ERROR: ${message}`, meta)),
  warn: (message, meta) => console.warn(format(`WARN: ${message}`, meta)),
  info: (message, meta) => console.info(format(`INFO: ${message}`, meta)),
  debug: (message, meta) => console.debug(format(`DEBUG: ${message}`, meta)),
};

export default logger;


