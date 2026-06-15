import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { sendError } from '../utils/response';

// 404
export const notFound = (req: Request, res: Response): void => {
  sendError(res, StatusCodes.NOT_FOUND, `Route ${req.originalUrl} not found`);
};
// 500 — something crashed in a controller
export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  console.error('Unhandled error:', err.message);
  sendError(
    res,
    StatusCodes.INTERNAL_SERVER_ERROR,
    'Internal server error',
    err.message,
  );
};