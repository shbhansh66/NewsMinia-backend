// routes/newsRouter.js
const express = require('express');
const router = express.Router();
const News = require('../models/News');

// Base route: /api/news/:sourceId?category=X
router.get('/:sourceId', async (req, res) => {
    const { sourceId } = req.params;
    const { category } = req.query;

    // Base MongoDB query object for filtering news by source
    const query = { sourceId: sourceId.toUpperCase() };

    // If a valid category is provided (not 'All'), add category filter
    if (category && category !== 'All') {
        // Using regex with 'i' option for case-insensitive matching
        // This is the most robust way to match category strings
        query.category = { $regex: category, $options: 'i' };
    }

    try {
        // Fetch latest 50 news items sorted by publication date (newest first)
        const news = await News.find(query).sort({ pubDate: -1 }).limit(50);
        res.json(news);
    } catch (err) {
        console.error('Error fetching news by source:', err);
        res.status(500).json({ message: err.message });
    }
});

// Search route: /api/news/search?query=X
router.get('/search', async (req, res) => {
    const { query: searchQuery } = req.query;

    // Ignore short or empty search queries
    if (!searchQuery || searchQuery.length < 3) {
        return res.json([]);
    }

    try {
        // Search in both title and contentSnippet using case-insensitive regex
        const news = await News.find({
            $or: [
                { title: { $regex: searchQuery, $options: 'i' } },
                { contentSnippet: { $regex: searchQuery, $options: 'i' } }
            ]
        })
        .sort({ pubDate: -1 })
        .limit(100);

        res.json(news);

    } catch (err) {
        console.error('Error during search:', err);
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
