import pool from '../../config/db';
import {
  Issue,
  IssueWithReporter,
  CreateIssueBody,
  UpdateIssueBody,
  Reporter,
  UserRole,
} from '../../types';

type QueryParam = string | number;

//Private Helpers
const fetchReporter = async (reporterId: number): Promise<Reporter | null> => {
  const result = await pool.query<Reporter>(
    'SELECT id, name, role FROM users WHERE id = $1',
    [reporterId],
  );
  return result.rows[0] ?? null;
};

const attachReporters = async (issues: Issue[]): Promise<IssueWithReporter[]> => {
  if (issues.length === 0) return [];

// Collect unique reporter ids
  const reporterIds = [...new Set(issues.map((i) => i.reporter_id))];
  const placeholders = reporterIds.map((_, idx) => `$${idx + 1}`).join(', ');

  const result = await pool.query<Reporter>(
    `SELECT id, name, role FROM users WHERE id IN (${placeholders})`,
    reporterIds,
  );
// Build a map
  const reporterMap = new Map<number, Reporter>(
    result.rows.map((r: any) => [r.id, r]),
  );

//replace reporter_id with reporter object
  return issues.map(({ reporter_id, ...rest }) => ({
    ...rest,
    reporter: reporterMap.get(reporter_id) ?? {
      id:   reporter_id,
      name: 'Unknown',
      role: 'contributor' as UserRole,
    },
  }));
};
//issues
export const createIssue = async (
  body: CreateIssueBody,
  reporterId: number,
): Promise<Issue> => {
//check reporter exist
  const userCheck = await pool.query<{ id: number }>(
    'SELECT id FROM users WHERE id = $1',
    [reporterId],
  );
  if (userCheck.rows.length === 0) {
    throw { status: 404, message: 'Reporter user not found' };
  }

  const result = await pool.query<Issue>(
    `INSERT INTO issues (title, description, type, reporter_id)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [body.title, body.description, body.type, reporterId],
  );

  return result.rows[0];
};

export const getAllIssues = async (
  sort: string = 'newest',
  type?: string,
  status?: string,
): Promise<IssueWithReporter[]> => {
  const values: QueryParam[] = [];
  const conditions: string[] = [];

  if (type) {
    values.push(type);
    conditions.push(`type = $${values.length}`);
  }
  if (status) {
    values.push(status);
    conditions.push(`status = $${values.length}`);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  const order = sort === 'oldest' ? 'ASC' : 'DESC';

  const result = await pool.query<Issue>(
    `SELECT * FROM issues ${whereClause} ORDER BY created_at ${order}`,
    values,
  );

  return attachReporters(result.rows);
};
export const getIssueById = async (id: number): Promise<IssueWithReporter> => {
  const result = await pool.query<Issue>(
    'SELECT * FROM issues WHERE id = $1',
    [id],
  );
  if (result.rows.length === 0) {
    throw { status: 404, message: 'Issue not found' };
  }

  const issue = result.rows[0];
  const reporter = await fetchReporter(issue.reporter_id);

  const { reporter_id, ...rest } = issue;
  return {
    ...rest,
    reporter: reporter ?? {
      id:   reporter_id,
      name: 'Unknown',
      role: 'contributor' as UserRole,
    },
  };
};

export const updateIssue = async (
  id: number,
  body: UpdateIssueBody,
  userId: number,
  userRole: UserRole,
): Promise<Issue> => {
  // Fetch the issue first
  const issueResult = await pool.query<Issue>(
    'SELECT * FROM issues WHERE id = $1',
    [id],
  );
  if (issueResult.rows.length === 0) {
    throw { status: 404, message: 'Issue not found' };
  }

  const issue = issueResult.rows[0];

// Permission rules
  if (userRole === 'contributor') {
    if (issue.reporter_id !== userId) {
      throw { status: 403, message: 'You can only update your own issues' };
    }
    if (issue.status !== 'open') {
      throw { status: 409, message: 'Contributors can only update open issues' };
    }
  }

// Build dynamic SET
  const updates: string[] = [];
  const values: QueryParam[] = [];

  if (body.title !== undefined) {
    values.push(body.title);
    updates.push(`title = $${values.length}`);
  }
  if (body.description !== undefined) {
    values.push(body.description);
    updates.push(`description = $${values.length}`);
  }
  if (body.type !== undefined) {
    values.push(body.type);
    updates.push(`type = $${values.length}`);
  }
  if (body.status !== undefined && userRole === 'maintainer') {
    values.push(body.status);
    updates.push(`status = $${values.length}`);
  }

  if (updates.length === 0) {
    throw { status: 400, message: 'No valid fields provided to update' };
  }
  updates.push('updated_at = NOW()');

  values.push(id);

  const result = await pool.query<Issue>(
    `UPDATE issues SET ${updates.join(', ')} WHERE id = $${values.length} RETURNING *`,
    values,
  );

  return result.rows[0];
};

export const deleteIssue = async (id: number): Promise<void> => {
  const result = await pool.query<{ id: number }>(
    'DELETE FROM issues WHERE id = $1 RETURNING id',
    [id],
  );
  if (result.rows.length === 0) {
    throw { status: 404, message: 'Issue not found' };
  }
};