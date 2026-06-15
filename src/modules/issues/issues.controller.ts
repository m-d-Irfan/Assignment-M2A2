import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import {
  createIssue,
  getAllIssues,
  getIssueById,
  updateIssue,
  deleteIssue,
} from './issues.service';
import { sendSuccess, sendError } from '../../utils/response';
import { CreateIssueBody, UpdateIssueBody } from '../../types';

const handleError = (err: unknown, res: Response, next: NextFunction): void => {
  const error = err as { status?: number; message?: string };
  if (error.status) {
    sendError(res, error.status, error.message ?? 'An error occurred');
  } else {
    next(err as Error);
  }
};

//POST
export const create = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const body = req.body as CreateIssueBody;

    if (!body.title?.trim() || !body.description?.trim() || !body.type) {
      sendError(res, StatusCodes.BAD_REQUEST, 'title, description, and type are required');
      return;
    }
    if (body.title.length > 150) {
      sendError(res, StatusCodes.BAD_REQUEST, 'title must be at most 150 characters');
      return;
    }
    if (body.description.length < 20) {
      sendError(res, StatusCodes.BAD_REQUEST, 'description must be at least 20 characters');
      return;
    }
    if (!['bug', 'feature_request'].includes(body.type)) {
      sendError(res, StatusCodes.BAD_REQUEST, 'type must be bug or feature_request');
      return;
    }

    // reporter_id comes from the JWT — never from request body
    const issue = await createIssue(body, req.user!.id);
    sendSuccess(res, StatusCodes.CREATED, 'Issue created successfully', issue);
  } catch (err) {
    handleError(err, res, next);
  }
};

//GET
export const getAll = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { sort, type, status } = req.query as {
      sort?: string;
      type?: string;
      status?: string;
    };

    if (sort && !['newest', 'oldest'].includes(sort)) {
      sendError(res, StatusCodes.BAD_REQUEST, 'sort must be newest or oldest');
      return;
    }
    if (type && !['bug', 'feature_request'].includes(type)) {
      sendError(res, StatusCodes.BAD_REQUEST, 'type must be bug or feature_request');
      return;
    }
    if (status && !['open', 'in_progress', 'resolved'].includes(status)) {
      sendError(res, StatusCodes.BAD_REQUEST, 'status must be open, in_progress, or resolved');
      return;
    }

    const issues = await getAllIssues(sort, type, status);
    sendSuccess(res, StatusCodes.OK, 'Issues retrieved successfully', issues);
  } catch (err) {
    handleError(err, res, next);
  }
};

//GET
export const getOne = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const id = parseInt(req.params.id as string, 10);
    if (isNaN(id)) {
      sendError(res, StatusCodes.BAD_REQUEST, 'Issue ID must be a valid number');
      return;
    }

    const issue = await getIssueById(id);
    sendSuccess(res, StatusCodes.OK, 'Issue retrieved successfully', issue);
  } catch (err) {
    handleError(err, res, next);
  }
};

//PATCH
export const update = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const id = parseInt(req.params.id as string, 10);
    if (isNaN(id)) {
      sendError(res, StatusCodes.BAD_REQUEST, 'Issue ID must be a valid number');
      return;
    }

    const body = req.body as UpdateIssueBody;

    if (body.title !== undefined && body.title.length > 150) {
      sendError(res, StatusCodes.BAD_REQUEST, 'title must be at most 150 characters');
      return;
    }
    if (body.description !== undefined && body.description.length < 20) {
      sendError(res, StatusCodes.BAD_REQUEST, 'description must be at least 20 characters');
      return;
    }
    if (body.type !== undefined && !['bug', 'feature_request'].includes(body.type)) {
      sendError(res, StatusCodes.BAD_REQUEST, 'type must be bug or feature_request');
      return;
    }
    if (
      body.status !== undefined &&
      !['open', 'in_progress', 'resolved'].includes(body.status)
    ) {
      sendError(res, StatusCodes.BAD_REQUEST, 'status must be open, in_progress, or resolved');
      return;
    }

    const issue = await updateIssue(id, body, req.user!.id, req.user!.role);
    sendSuccess(res, StatusCodes.OK, 'Issue updated successfully', issue);
  } catch (err) {
    handleError(err, res, next);
  }
};

// DELETE
export const remove = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const id = parseInt(req.params.id as string, 10);
    if (isNaN(id)) {
      sendError(res, StatusCodes.BAD_REQUEST, 'Issue ID must be a valid number');
      return;
    }

    await deleteIssue(id);
    sendSuccess(res, StatusCodes.OK, 'Issue deleted successfully');
  } catch (err) {
    handleError(err, res, next);
  }
};