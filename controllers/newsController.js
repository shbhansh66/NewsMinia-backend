const News = require('../models/News');

// =======================
// GET NEWS BY SOURCE + CATEGORY
// =======================
exports.getNewsBySource = async (req, res) => {
    const { sourceId } = req.params;
    const { category } = req.query;

    const query = { sourceId: sourceId.toUpperCase() };

    if (category && category !== "All") {
        query.category = { $regex: category, $options: "i" };
    }

    try {
        const news = await News.find(query)
            .sort({ pubDate: -1 })
            .limit(50);

        res.json(news);
    } catch (err) {
        console.error("Error fetching news:", err);
        res.status(500).json({ message: err.message });
    }
};

// =======================
// SEARCH NEWS
// =======================
exports.searchNews = async (req, res) => {
    const { query: searchQuery } = req.query;

    if (!searchQuery || searchQuery.length < 3) {
        return res.json([]);
    }

    try {
        const news = await News.find({
            $or: [
                { title: { $regex: searchQuery, $options: "i" } },
                { contentSnippet: { $regex: searchQuery, $options: "i" } }
            ]
        })
        .sort({ pubDate: -1 })
        .limit(100);

        res.json(news);

    } catch (err) {
        console.error("Error searching news:", err);
        res.status(500).json({ message: err.message });
    }
};
