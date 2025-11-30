const Parser = require('rss-parser');
const News = require('../models/News');

// RSS feed URLs
const RSS_URLS = {
    ET: "https://economictimes.indiatimes.com/rssfeeds/1715249553.cms",
    HINDU: "https://news.google.com/rss/search?q=site:thehindu.com&hl=en-IN&gl=IN&ceid=IN:en",
    HT: "https://www.livemint.com/rss/news",
    TOI: "https://timesofindia.indiatimes.com/rssfeedstopstories.cms",
    AU: "https://news.google.com/rss/search?q=amar+ujala&hl=en-IN&gl=IN&ceid=IN:en",
   DJ: "https://news.google.com/rss/search?q=site:jagran.com&hl=en-IN&gl=IN&ceid=IN:en" 

};

// Categories
const AVAILABLE_CATEGORIES = [
    'Business', 'Politics', 'Sports', 'Technology',
    'Science', 'World', 'India', 'Miscellaneous'
];

/******************************************
 * CATEGORY CLASSIFIER (Local keyword-based)
 ******************************************/
const getCategoryWithoutAI = (title) => {
    const lower = title.toLowerCase();

    if (lower.includes('stock') || lower.includes('market') || lower.includes('business') || lower.includes('finance'))
        return 'Business';
    if (lower.includes('politic') || lower.includes('election') || lower.includes('government'))
        return 'Politics';
    if (lower.includes('cricket') || lower.includes('sport') || lower.includes('football'))
        return 'Sports';
    if (lower.includes('tech') || lower.includes('software') || lower.includes('ai') || lower.includes('gadget'))
        return 'Technology';
    if (lower.includes('science') || lower.includes('space') || lower.includes('research'))
        return 'Science';
    if (lower.includes('world') || lower.includes('global') || lower.includes('international'))
        return 'World';
    if (lower.includes('india') || lower.includes('delhi') || lower.includes('mumbai') || lower.includes('indian'))
        return 'India';

    return 'Miscellaneous';
};

/******************************************
 * IMAGE EXTRACTOR (MOST IMPORTANT PART)
 ******************************************/
function extractImage(item) {
    try {
        // 1 — enclosure image
        if (item.enclosure?.url) return item.enclosure.url;

        // 2 — media:content
        if (item["media:content"]?.url) return item["media:content"].url;

        // 3 — media:thumbnail
        if (item["media:thumbnail"]?.url) return item["media:thumbnail"].url;

        // 4 — media:group > media:content
        if (item["media:group"]?.["media:content"]?.url)
            return item["media:group"]["media:content"].url;

        // 5 — image inside content:encoded HTML
        if (item["content:encoded"]) {
            const match = item["content:encoded"].match(/<img.*?src="(.*?)"/i);
            if (match) return match[1];
        }

        // 6 — image inside description HTML
        if (item.description) {
            const match = item.description.match(/<img.*?src="(.*?)"/i);
            if (match) return match[1];
        }

        return null;
    } catch {
        return null;
    }
}

/******************************************
 * MAIN FUNCTION — Fetch + Save News
 ******************************************/
const fetchAndSaveNews = async () => {
    console.log(" Starting News Fetching Job...");

    // Parser with fixes for broken XML feeds
    const parser = new Parser({
        xml2jsOptions: { explicitArray: false, trim: true, strict: false },
        customFields: {
            item: [
                'title',
                'link',
                'pubDate',
                'contentSnippet',
                'enclosure',
                'creator',
                'category',
                'description',        
                'content:encoded',    
                'media:content',
                'media:thumbnail',
                'media:group'
            ]
        }
    });

    for (const [sourceId, url] of Object.entries(RSS_URLS)) {
        let feed;
        try {
            feed = await parser.parseURL(url);
        } catch (err) {
            console.error(` Error parsing feed (${sourceId}):`, err.message);
            continue; 
        }

        try {
            const items = feed.items || [];

            for (const item of items) {
                if (!item.link || !item.title) continue;

                const category = getCategoryWithoutAI(item.title);
                const imageUrl = extractImage(item);

                await News.updateOne(
                    { link: item.link },
                    {
                        $set: {
                            category: category,
                            imageUrl: imageUrl || null
                        },
                        $setOnInsert: {
                            sourceId,
                            title: item.title,
                            link: item.link,
                            pubDate: item.pubDate ? new Date(item.pubDate) : new Date(),
                            contentSnippet: item.contentSnippet || 'No summary available.',
                            source: item.creator || feed.title
                        }
                    },
                    { upsert: true }
                );

                console.log(`Saved: ${item.title.substring(0, 50)}... | Category: ${category}`);
            }

        } catch (err) {
            console.error(` Error processing items for (${sourceId}):`, err.message);
        }
    }

    console.log(" News Fetching Job Finished.");
};

module.exports = fetchAndSaveNews;
