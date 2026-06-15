// domain
export type UserRole    = 'contributor' | 'maintainer';
export type IssueType   = 'bug' | 'feature_request';
export type IssueStatus = 'open' | 'in_progress' | 'resolved';

export interface User {
  id:         number;
  name:       string;
  email:      string;
  password:   string;
  role:       UserRole;
  created_at: Date;
  updated_at: Date;
}

export interface Issue {
  id:          number;
  title:       string;
  description: string;
  type:        IssueType;
  status:      IssueStatus;
  reporter_id: number;
  created_at:  Date;
  updated_at:  Date;
}
// response
export interface Reporter {
  id:   number;
  name: string;
  role: UserRole;
}
// get
export interface IssueWithReporter extends Omit<Issue, 'reporter_id'> {
  reporter: Reporter;
}
//Request
export interface SignupBody {
  name:     string;
  email:    string;
  password: string;
  role?:    UserRole;
}

export interface LoginBody {
  email:    string;
  password: string;
}

export interface CreateIssueBody {
  title:       string;
  description: string;
  type:        IssueType;
}

export interface UpdateIssueBody {
  title?:       string;
  description?: string;
  type?:        IssueType;
  status?:      IssueStatus;
}

//JWT Payload 
export interface JwtPayload {
  id:   number;
  name: string;
  role: UserRole;
}

//Request to carry req.user
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}