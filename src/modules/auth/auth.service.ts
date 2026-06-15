import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import pool from '../../config/db';
import { User, SignupBody, LoginBody, JwtPayload } from '../../types';

const SALT_ROUNDS = 10; // spec requires 8–12

type UserPublic = Omit<User, 'password'>; // user shape without password field

//Register 
export const registerUser = async (body: SignupBody): Promise<UserPublic> => {
  const { name, email, password, role = 'contributor' } = body;
  // Check if email already exists
  const existing = await pool.query<{ id: number }>(
    'SELECT id FROM users WHERE email = $1',
    [email],
  );
  if (existing.rows.length > 0) {
    throw { status: 400, message: 'Email is already in use' };
  }
  // Hashing password
  const hashed = await bcrypt.hash(password, SALT_ROUNDS);
  //return created user (without password)
  const result = await pool.query<UserPublic>(
    `INSERT INTO users (name, email, password, role)
     VALUES ($1, $2, $3, $4)
     RETURNING id, name, email, role, created_at, updated_at`,
    [name, email, hashed, role],
  );

  return result.rows[0];
};

// Login
export const loginUser = async (
  body: LoginBody,
): Promise<{ token: string; user: UserPublic }> => {
  const { email, password } = body;
  // Find user by email
  const result = await pool.query<User>(
    'SELECT * FROM users WHERE email = $1',
    [email],
  );

  if (result.rows.length === 0) {
    throw { status: 401, message: 'Invalid email or password' };
  }

  const user = result.rows[0];
  // Compare password
  const passwordMatch = await bcrypt.compare(password, user.password);
  if (!passwordMatch) {
    throw { status: 401, message: 'Invalid email or password' };
  }
  // Create JWT
  const payload: JwtPayload = { id: user.id, name: user.name, role: user.role };
  const token = jwt.sign(payload, process.env.JWT_SECRET as string, {
    expiresIn: '7d',
  });
  // Remove password before returning
  const { password: _pw, ...userPublic } = user;

  return { token, user: userPublic };
};