import { describe, expect, it } from 'vitest';
import type { App } from 'vue';
import { mount } from '@vue/test-utils';
import { install } from '../../../package/index';
import { pages } from '../../../doc/site/catalog';
import { renderMarkdown } from '../../../doc/site/markdown';

describe('文档内容与组件覆盖', () => {
  it('每个公开注册的组件都有 API 文档和运行示例', () => {
    const names: string[] = [];
    install({ use: (component: { name: string }) => names.push(component.name) } as unknown as App);
    for (const name of names) {
      const page = pages.find((item) => item.id === `components/${name.replace(/^i-/, '')}`);
      expect(page, name).toBeDefined();
      expect(page!.markdown, name).toContain('## API');
      expect(page!.demos.length, name).toBeGreaterThan(0);
    }
  });

  it.each(pages.filter((page) => page.demos.length))('$title 的示例可挂载', (page) => {
    for (const demo of page.demos) {
      const wrapper = mount(demo.component);
      expect(wrapper.html()).not.toBe('');
      expect(demo.source).toContain("from 'cool-design'");
      expect(demo.source).not.toContain("from '../../index'");
      wrapper.unmount();
    }
  });

  it('渲染标准表格和代码，转义原始 HTML 并拒绝脚本链接', () => {
    const html = renderMarkdown(
      '文本 <img src=x onerror=alert(1)>\n\n[危险链接](javascript:alert(1))\n\n```vue\n<Button />\n```\n\n| 参数 | 类型 |\n| --- | --- |\n| size | string |'
    );
    expect(html).not.toContain('<img');
    expect(html).not.toContain('href="javascript:');
    const container = document.createElement('div');
    container.innerHTML = html;
    expect(container.querySelector('code')?.textContent).toBe('<Button />\n');
    expect(html).toContain('<table>');
  });

  it('文档代码块按语言高亮，未知语言安全回退为纯文本', () => {
    const html = renderMarkdown(
      '```ts\nconst name: string = "示例";\n```\n\n```unknown\n<img onerror="alert(1)">\n```'
    );
    const container = document.createElement('div');
    container.innerHTML = html;
    expect(container.querySelector('.hljs-keyword')?.textContent).toBe('const');
    expect(container.querySelector('.hljs-string')?.textContent).toBe('"示例"');
    expect(container.querySelector('img')).toBeNull();
    expect(container.querySelector('.language-unknown')?.textContent).toBe('<img onerror="alert(1)">\n');
  });
});
