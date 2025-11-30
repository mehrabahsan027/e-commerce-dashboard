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
  : ['http://localhost:5173'];

console.log('CORS allowed origins:', allowedOrigins);

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log('Blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Explicitly handle OPTIONS for all routes
app.options('*', cors());

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', process.env.CLIENT_URL);
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

app.use('/api/dashboard', dashboardRoutes);

app.get('/', (req, res) => {
  res.send('Hello World!')
})


// Start server
async function startServer() {
  await connectDB();
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}

startServer().catch(console.error);