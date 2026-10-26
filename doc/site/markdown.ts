import MarkdownIt from "markdown-it";
import { highlightCode } from "./highlight";

const markdown = new MarkdownIt({ html: false, linkify: false, typographer: false, highlight: highlightCode });
export function renderMarkdown(source: string): string {
    return markdown.render(source);
}
