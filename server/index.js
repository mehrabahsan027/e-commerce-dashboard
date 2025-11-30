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

app.use(cors({
  origin:true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

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