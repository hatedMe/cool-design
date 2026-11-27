import hljs from 'highlight.js/lib/core';
import bash from 'highlight.js/lib/languages/bash';
import css from 'highlight.js/lib/languages/css';
import javascript from 'highlight.js/lib/languages/javascript';
import json from 'highlight.js/lib/languages/json';
import plaintext from 'highlight.js/lib/languages/plaintext';
import typescript from 'highlight.js/lib/languages/typescript';
import xml from 'highlight.js/lib/languages/xml';

hljs.registerLanguage('bash', bash);
hljs.registerLanguage('css', css);
hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('json', json);
hljs.registerLanguage('plaintext', plaintext);
hljs.registerLanguage('typescript', typescript);
hljs.registerLanguage('xml', xml);
hljs.registerLanguage('vue', () => ({
  subLanguage: 'xml',
  contains: [
    {
      begin: /<script\b[^>]*>/,
      end: /<\/script>/,
      subLanguage: 'typescript',
      excludeBegin: true,
      excludeEnd: true
    },
    { begin: /<style\b[^>]*>/, end: /<\/style>/, subLanguage: 'css', excludeBegin: true, excludeEnd: true }
  ]
}));

export function highlightCode(source: string, language: string): string {
  return hljs.highlight(source, {
    language: hljs.getLanguage(language) ? language : 'plaintext',
    ignoreIllegals: true
  }).value;
}
