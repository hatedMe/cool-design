const MarkdownIt = require('markdown-it');
const mdContainer = require('markdown-it-container');
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
}).use(mdContainer, "demo", {
    validate: function (params) {
        return params.trim().match(/^demo\s+(.*)$/);
    },
    render: function (tokens, idx) {
        const m = tokens[idx].info.trim().match(/^demo\s*(.*)$/);
        if (tokens[idx].nesting === 1) {
            const description = m && m.length > 1 ? m[1] : '';
            const content = tokens[idx + 1].type === 'fence' ? tokens[idx + 1].content : '';
            return `<demo-block>
        ${description ? `<div>${parser.render(description)}</div>` : ''}
        <!--element-demo: ${content}:element-demo-->
        `;
        }
        return '</demo-block>';
    }
});

module.exports = parser;
