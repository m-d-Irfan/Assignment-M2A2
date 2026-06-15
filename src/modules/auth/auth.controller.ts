import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { registerUser, loginUser } from './auth.service';
import { sendSuccess, sendError } from '../../utils/response';
import { SignupBody, LoginBody } from '../../types';
// signup
export const signup = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const body = req.body as SignupBody;
    if (!body.name?.trim() || !body.email?.trim() || !body.password?.trim()) {
      sendError(res, StatusCodes.BAD_REQUEST, 'name, email, and password are required');
      return;
    }
    if (body.role && !['contributor', 'maintainer'].includes(body.role)) {
      sendError(res, StatusCodes.BAD_REQUEST, 'role must be contributor or maintainer');
      return;
    }
    const user = await registerUser(body);
    sendSuccess(res, StatusCodes.CREATED, 'User registered successfully', user);
  } catch (err: unknown) {
    const error = err as { status?: number; message?: string };
    if (error.status) {
      sendError(res, error.status, error.message ?? 'An error occurred');
    } else {
      next(err);
    }
  }
};

//login
export const login = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const body = req.body as LoginBody;

    if (!body.email?.trim() || !body.password?.trim()) {
      sendError(res, StatusCodes.BAD_REQUEST, 'email and password are required');
      return;
    }

    const result = await loginUser(body);
    sendSuccess(res, StatusCodes.OK, 'Login successful', result);
  } catch (err: unknown) {
    const error = err as { status?: number; message?: string };
    if (error.status) {
      sendError(res, error.status, error.message ?? 'An error occurred');
    } else {
      next(err);
    }
  }
};