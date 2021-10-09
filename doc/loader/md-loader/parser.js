const MarkdownIt = require('markdown-it');
const markdownItAnchor = require('markdown-it-anchor');
const hljs = require('highlight.js');
const { slugify } = require('transliteration');

const highlight = (str, lang) => {
    if (lang && hljs.getLanguage(lang)) {
        return hljs.highlight(str, { language: lang, ignoreIllegals: true }).value;
    }
    return '';
};

const parser = new MarkdownIt({
    html: true,
    highlight,
}).use(markdownItAnchor, {
    level: 2,
    slugify,
});

module.exports = parser;
