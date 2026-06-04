import { Response } from 'express';

// ─── Standardized API response helpers ────────────────────────────────────────

export const sendSuccess = (
  res: Response,
  data: unknown,
  message = 'Success',
  statusCode = 200
) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

export const sendError = (
  res: Response,
  message: string,
  statusCode = 400,
  errors?: unknown
) => {
  return res.status(statusCode).json({
    success: false,
    message,
    errors: errors || null,
  });
};

export const sendCreated = (res: Response, data: unknown, message = 'Created successfully') => {
  return sendSuccess(res, data, message, 201);
};

export const sendUnauthorized = (res: Response, message = 'Unauthorized') => {
  return sendError(res, message, 401);
};

export const sendNotFound = (res: Response, message = 'Not found') => {
  return sendError(res, message, 404);
};

export const sendServerError = (res: Response, message = 'Internal server error') => {
  return sendError(res, message, 500);
};
