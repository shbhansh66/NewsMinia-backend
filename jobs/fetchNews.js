const News = require('../models/News');
const RSS_URLS = require('../services/rssUrls');
const parser = require('../services/rssParser');
const extractImage = require('../services/imageExtractor');
const getCategoryWithoutAI = require('../services/categoryClassifier');

const fetchAndSaveNews = async () => {
    console.log("Starting News Fetching Job...");

    for (const [sourceId, url] of Object.entries(RSS_URLS)) {
        let feed;

        try {
            feed = await parser.parseURL(url);
        } catch (err) {
            console.error(`Error parsing feed (${sourceId}):`, err.message);
            continue;
        }

        const items = feed.items || [];

        for (const item of items) {
            if (!item.link || !item.title) continue;

            const category = getCategoryWithoutAI(item.title);
            const imageUrl = extractImage(item);

            await News.updateOne(
                { link: item.link },
                {
                    $set: {
                        category,
                        imageUrl: imageUrl || null
                    },
                    $setOnInsert: {
                        sourceId,
                        title: item.title,
                        link: item.link,
                        pubDate: item.pubDate ? new Date(item.pubDate) : new Date(),
                        contentSnippet: item.contentSnippet || "No summary available.",
                        source: item.creator || feed.title
                    }
                },
                { upsert: true }
            );

            console.log(`💾 Saved: ${item.title.substring(0, 50)}...`);
        }
    }

    console.log(" News Fetching Job Finished.");
};

module.exports = fetchAndSaveNews;
