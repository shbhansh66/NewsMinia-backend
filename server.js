// server.js

require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cron = require('node-cron');
const fetchAndSaveNews = require('./service/fetchNews.js');
const newsRouter = require('./Routes/newsRouter.js');

const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 5000;

// Database Connection
mongoose.connect(process.env.MONGO_URI, { 
 
  serverSelectionTimeoutMS: 30000 
})
  .then(() =>{ console.log("MongoDB Connected")
 fetchAndSaveNews();
  })
  .catch(err => console.log("DB Error:", err));
app.use(cors());
app.use(express.json());

// --- CRON JOB SETUP ---
// Har 15 minute mein news fetch karne ka task schedule karein
cron.schedule('*/15 * * * *', () => {
    fetchAndSaveNews();
});

app.use('/api/news', newsRouter);

// Server Start
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    
});