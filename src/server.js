import app from './app.js';
import { config } from './config/config.js';
import { connectDB } from './config/database.js';

const PORT = config.port || 3000;

// Connect to MongoDB
let isConnected = false;

const ensureDbConnection = async () => {
  if (!isConnected) {
    await connectDB();
    isConnected = true;
  }
};

// Health check endpoint
app.get('/health-check', (req, res) => {
  res.json({ 
    success: true,
    message: 'Task Management API is running',
    environment: config.nodeEnv,
    timestamp: new Date().toISOString(),
    Database: isConnected ? 'Connected' : 'Disconnected'
  });
});

// For Vercel Serverless - connect DB on each request
app.use(async (req, res, next) => {
  await ensureDbConnection();
  next();
});

// Export for Vercel
export default app;

// For local development
if (process.env.NODE_ENV !== 'production') {
  const startServer = async () => {
    try {
      await connectDB();
      app.listen(PORT, () => {
        console.log(`\n🚀 Server running on http://localhost:${PORT}`);
        console.log(`📝 Environment: ${config.nodeEnv}`);
        console.log(`🔐 Access Token Expiry: ${config.jwt.accessTokenExpiry}`);
      });
    } catch (error) {
      console.error('Failed to start server:', error);
      process.exit(1);
    }
  };
  
  startServer();
}
