/**
 * Minimal browser logger exposing a winston-like API.
 * Centralizes leveled logs with timestamp and optional context.
 *
 * NOTE: In a Node environment we would use winston proper with transports.
 * Here we mirror the surface so future migration is trivial.
 */
const LEVELS = ['error', 'warn', 'info', 'debug'];

/**
 * format
 * Renders a single-line log message with ISO timestamp and message prefix.
 */
function format(prefix, payload) {
  const time = new Date().toISOString();
  const details = payload ? JSON.stringify(payload) : '';
  return `[${time}] ${prefix}${details ? ' ' + details : ''}`;
}

/**
 * createLogger
 * Allows namespaced loggers with consistent meta injection.
 */
export function createLogger(namespace) {
  const withNs = (level, message, meta) => {
    const base = namespace ? `${namespace}: ${message}` : message;
    switch (level) {
      case 'error':
        return console.error(format(`ERROR: ${base}`, meta));
      case 'warn':
        return console.warn(format(`WARN: ${base}`, meta));
      case 'info':
        return console.info(format(`INFO: ${base}`, meta));
      default:
        return console.debug(format(`DEBUG: ${base}`, meta));
    }
  };
  return {
    error: (message, meta) => withNs('error', message, meta),
    warn: (message, meta) => withNs('warn', message, meta),
    info: (message, meta) => withNs('info', message, meta),
    debug: (message, meta) => withNs('debug', message, meta),
    child: (childNs) => createLogger(namespace ? `${namespace}.${childNs}` : childNs),
  };
}

/**
 * Default app logger without namespace.
 */
export const logger = createLogger('app');

export default logger;

