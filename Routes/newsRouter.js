const express = require('express');
const router = express.Router();

const {
    getNewsBySource,
    searchNews
} = require('../controllers/newsController');

// Base route: /api/news/:sourceId?category=X
router.get('/:sourceId', getNewsBySource);

// Search route: /api/news/search?query=X
router.get('/search', searchNews);

module.exports = router;
