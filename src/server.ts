import app from './app';
import pool from './config/db';

const PORT = process.env.PORT ?? 5000;

const startServer = async (): Promise<void> => {
  try {
    // Test DB connection before accepting any traffic
    await pool.query('SELECT 1');
    console.log('✅ Database connection verified');

    app.listen(PORT, () => {
      console.log(`🚀 DevPulse API running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();