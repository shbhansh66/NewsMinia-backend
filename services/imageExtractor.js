function extractImage(item) {
    try {
        if (item.enclosure?.url) return item.enclosure.url;
        if (item["media:content"]?.url) return item["media:content"].url;
        if (item["media:thumbnail"]?.url) return item["media:thumbnail"].url;

        if (item["media:group"]?.["media:content"]?.url)
            return item["media:group"]["media:content"].url;

        if (item["content:encoded"]) {
            const match = item["content:encoded"].match(/<img.*?src="(.*?)"/i);
            if (match) return match[1];
        }

        if (item.description) {
            const match = item.description.match(/<img.*?src="(.*?)"/i);
            if (match) return match[1];
        }

        return null;
    } catch {
        return null;
    }
}

module.exports = extractImage;
