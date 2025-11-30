const Parser = require('rss-parser');

const parser = new Parser({
    xml2jsOptions: { explicitArray: false, trim: true, strict: false },
    customFields: {
        item: [
            'title', 'link', 'pubDate', 'contentSnippet', 'enclosure',
            'creator', 'category', 'description', 'content:encoded',
            'media:content', 'media:thumbnail', 'media:group'
        ]
    }
});

module.exports = parser;
