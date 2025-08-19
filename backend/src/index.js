const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());



// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Test route
app.get('/test', (req, res) => {
  res.json({ message: 'Test route working!' });
});

// API Routes
app.use('/api/promotions', require('./routes/promotions'));
app.use('/api/tokens', require('./routes/tokens'));
app.use('/api/wallet', require('./routes/wallet'));

// Payment page route (only for /pay)
app.use('/pay', require('./routes/payment'));

// Serve frontend build in production
if (process.env.NODE_ENV === 'production') {
  // Serve static files from Next.js build
  app.use(express.static(path.join(__dirname, '../../frontend/.next')));
  app.use(express.static(path.join(__dirname, '../../frontend/public')));
  
  // Serve Next.js app for root and other non-API routes
  app.get('/', (req, res) => {
    // Try to serve the frontend
    const indexPath = path.join(__dirname, '../../frontend/.next/server/pages/index.html');
    if (require('fs').existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      // Fallback to basic HTML if frontend build doesn't exist
      res.send(`
        <html>
          <head><title>MemeCoin Promoter</title></head>
          <body>
            <h1>MemeCoin Promoter API</h1>
            <p>Backend is running. Frontend build in progress...</p>
            <p><a href="/api/promotions">API Endpoints</a></p>
          </body>
        </html>
      `);
    }
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: err.message 
  });
});

// 404 handler
app.use('/*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📱 API available at http://localhost:${PORT}`);
});
// Railway deployment trigger
