import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import routes from './routes/index.js';
import { errorHandler, notFound } from './middlewares/errorHandler.middleware.js';
import { config } from './config/config.js';

const app = express();

// Middleware
app.use(cors({
  origin: config.clientUrl,
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes
app.get('/', (req, res) => {
  res.json({ 
    message: 'Task Management API', 
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
    }
  });
});

app.use('/api', routes);

// Error handling
app.use(notFound);
app.use(errorHandler);

export default app;
