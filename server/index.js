const express = require('express');
const compression = require('compression');
const cors = require('cors');
require('dotenv').config();
const { connectDB } = require('./config/db');
const dashboardRoutes = require('./routes/dashboard');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(compression());
app.use(express.urlencoded({ extended: true }));

// Resolve allowed origins from env
const allowedOrigins = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.split(',').map(origin => origin.trim())
  : ['http://localhost:5170'];
console.log('CORS allowed origins:', allowedOrigins);

app.use(cors({
  origin: allowedOrigins,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'E-commerce Dashboard API' });
});

app.use('/api/dashboard', dashboardRoutes);

// Start server
async function startServer() {
  await connectDB();
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}

startServer().catch(console.error);