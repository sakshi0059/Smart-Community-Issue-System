const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/smart-community')
  .then(() => console.log('Connected to MongoDB'))
  .catch((error) => console.error('MongoDB connection error:', error));

// Middleware
app.use(express.json());

app.use(cors({
  origin: "http://localhost:5173", // change after frontend deploy
  credentials: true
}));

// Routes
app.get('/', (req, res) => {
  res.send('Welcome to Jagruk');
});

app.use('/api', require('./routes/issue'));
app.use('/api', require('./routes/logs'));
app.use('/api', require('./routes/upload'));
app.use('/api', require('./routes/officer'));

// Start server
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});