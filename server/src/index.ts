import app from './app';
import { connectDB } from './config/database';
import { initializeProcessingQueue } from './controllers/callsController';

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();

    // Initialize the processing queue for call analysis
    initializeProcessingQueue();

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
