import app from './app.js';
import { config } from './config/config.js';
import { connectDB } from './config/database.js';

const PORT = config.port;

// Connect to MongoDB then start server
const startServer = async () => {
  try {
    // Connect to database
    await connectDB();
    
    // Start Express server
    app.listen(PORT, () => {
      console.log(`\n🚀 Server running on http://localhost:${PORT}`);
      console.log(`📝 Environment: ${config.nodeEnv}`);
      console.log(`🔐 Access Token Expiry: ${config.jwt.accessTokenExpiry}`);
      console.log(`📚 API Documentation: http://localhost:${PORT}/api-docs`);
      console.log(`📄 Swagger JSON: http://localhost:${PORT}/api-docs.json\n`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
