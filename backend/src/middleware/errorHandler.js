import { logger } from '../lib/logger.js';

export function errorHandler(err, req, res, _next) {
  logger.error(
    {
      err: {
        message: err.message,
        stack: process.env.NODE_ENV !== 'production' ? err.stack : undefined,
        code: err.code,
      },
      url: req.originalUrl,
      method: req.method,
    },
    'Unhandled request error'
  );

  const status = err.status || err.statusCode || 500;
  const message =
    process.env.NODE_ENV === 'production' && status === 500
      ? 'An internal server error occurred'
      : err.message || 'Internal Server Error';

  res.status(status).json({
    error: message,
    code: err.code || 'INTERNAL_ERROR',
  });
}
