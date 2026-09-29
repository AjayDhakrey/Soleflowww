export class AppError extends Error {
  public code?: string;
  public status?: number;
  public details?: any;

  constructor(message: string, code?: string, status?: number, details?: any) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

export function parseSupabaseError(error: any, fallbackMessage = 'An unexpected error occurred'): AppError {
  if (!error) return new AppError(fallbackMessage);

  if (typeof error === 'string') {
    return new AppError(error);
  }

  // Handle Postgres custom exceptions (e.g. from RPCs like P0001)
  const message = error.message || error.details || error.hint || fallbackMessage;
  const code = error.code || 'DB_ERROR';

  return new AppError(message, code, error.status, error);
}
