// models/News.js

const mongoose = require('mongoose');

const NewsSchema = new mongoose.Schema({
    title: { type: String, required: true },
    link: { type: String, required: true, unique: true },
    source: { type: String, required: true },
    sourceId: { type: String, required: true },
    category: { type: String, default: "Miscellaneous" },   // 🆕 ADD THIS
    pubDate: { type: Date, default: Date.now },
    contentSnippet: { type: String },
    imageUrl: { type: String, default: null },
}, { timestamps: true });

module.exports = mongoose.model('News', NewsSchema);
