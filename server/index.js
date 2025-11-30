const express = require('express');
const compression = require('compression');
const cors = require('cors');
const { connectDB } = require('./config/db');
const dashboardRoutes = require('./routes/dashboard');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(compression());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5170',
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