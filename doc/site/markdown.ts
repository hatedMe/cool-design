import MarkdownIt from 'markdown-it';
import { highlightCode } from './highlight';

const markdown = new MarkdownIt({ html: false, linkify: false, typographer: false, highlight: highlightCode });
markdown.renderer.rules.table_open = () => '<div class="docs-table-scroll"><table>\n';
markdown.renderer.rules.table_close = () => '</table></div>\n';
export function renderMarkdown(source: string): string {
  return markdown.render(source);
}
