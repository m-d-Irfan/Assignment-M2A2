import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes  from './modules/auth/auth.routes';
import issueRoutes from './modules/issues/issues.routes';
import { notFound, errorHandler } from './middlewares/error_handler';

dotenv.config();

const app = express();

//Core Middleware 
app.use(cors());  
app.use(express.json());   

//Health Check
app.get('/', (_req, res) => {
  res.json({ success: true, message: 'DevPulse API is running 🚀' });
});

// Routes
app.use('/api/auth',   authRoutes);  
app.use('/api/issues', issueRoutes);  

// Error Handlers
app.use(notFound);
app.use(errorHandler);

export default app;