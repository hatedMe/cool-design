import { describe, expect, it } from 'vitest';
import { h, type App, type Component } from 'vue';
import { flushPromises, mount } from '@vue/test-utils';
import { install } from '../../../packages/cool-design/index';
import { pages } from '../../../doc/site/catalog';
import DemoBlock from '../../../doc/site/DemoBlock.vue';
import { renderMarkdown } from '../../../doc/site/markdown';

describe('文档内容与组件覆盖', () => {
  it('每个公开注册的组件都有 API 文档和运行示例', () => {
    const names: string[] = [];
    install({
      // 函数型服务（$message 等）也走 use，仅登记组件名。
      use: (plugin: unknown) => {
        if (plugin && typeof plugin === 'object' && 'name' in plugin) names.push((plugin as { name: string }).name);
      },
      _context: null,
      config: { globalProperties: {} }
    } as unknown as App);
    for (const name of names) {
      const page = pages.find((item) => item.id === `components/${name.replace(/^i-/, '')}`);
      expect(page, name).toBeDefined();
      expect(page!.markdown, name).toContain('## API');
      expect(page!.demos.length, name).toBeGreaterThan(0);
    }
  });

  it.each(pages.filter((page) => page.demos.length))('$title 的示例可挂载', async (page) => {
    for (const demo of page.demos) {
      const name = `${page.id}/${demo.name}`;
      expect(demo.loadComponent, name).toBeTypeOf('function');
      expect(demo.loadSource, name).toBeTypeOf('function');
      const [component, source] = await Promise.all([demo.loadComponent(), demo.loadSource()]);
      const wrapper = mount(component);
      try {
        expect(wrapper.html(), name).not.toBe('');
        expect(source, name).toContain("from 'cool-design'");
        expect(source, name).not.toContain("from '../../index'");
      } finally {
        wrapper.unmount();
      }
    }
  });

  it('预览就绪后挂载真实组件，源码就绪前禁用复制', async () => {
    let resolvePreview!: (component: Component) => void;
    let resolveSource!: (source: string) => void;
    const preview = new Promise<Component>((resolve) => (resolvePreview = resolve));
    const source = new Promise<string>((resolve) => (resolveSource = resolve));
    const wrapper = mount(DemoBlock, {
      props: {
        id: 'demo-test',
        demo: {
          name: 'test',
          title: '异步示例',
          description: '',
          loadComponent: () => preview,
          loadSource: () => source
        }
      }
    });
    try {
      const copy = wrapper.get('button[data-action="copy"]');
      expect(wrapper.text()).toContain('正在加载示例');
      expect(copy.attributes()).toHaveProperty('disabled');

      resolvePreview(() => h('button', { class: 'test-preview' }, '示例已挂载'));
      await flushPromises();
      expect(wrapper.get('.test-preview').text()).toBe('示例已挂载');
      expect(copy.attributes()).toHaveProperty('disabled');

      resolveSource('<template><button>示例已挂载</button></template>');
      await flushPromises();
      expect(copy.attributes()).not.toHaveProperty('disabled');
      await wrapper.get('button[aria-controls="demo-test-source"]').trigger('click');
      expect(wrapper.get('.hljs-tag').exists()).toBe(true);
    } finally {
      wrapper.unmount();
    }
  });

  it('源码加载失败后局部重试，保留已挂载的预览', async () => {
    let sourceFailed = true;
    const wrapper = mount(DemoBlock, {
      props: {
        id: 'demo-test',
        demo: {
          name: 'test',
          title: '异步示例',
          description: '',
          loadComponent: async () => () => h('button', { class: 'test-preview' }, '示例已挂载'),
          loadSource: async () => {
            if (sourceFailed) throw new Error('请求失败');
            return '<template><button>示例已挂载</button></template>';
          }
        }
      }
    });
    try {
      await flushPromises();
      expect(wrapper.text()).toContain('源码加载失败');
      const preview = wrapper.get('.test-preview').element;
      expect(wrapper.get('button[data-action="copy"]').attributes()).toHaveProperty('disabled');
      sourceFailed = false;
      await wrapper.get('.demo-toolbar button[data-action="retry-source"]').trigger('click');
      await flushPromises();
      expect(wrapper.text()).not.toContain('源码加载失败');
      expect(wrapper.get('.test-preview').element).toBe(preview);
      expect(wrapper.get('button[data-action="copy"]').attributes()).not.toHaveProperty('disabled');
    } finally {
      wrapper.unmount();
    }
  });

  it('示例资源加载失败时提示重新加载当前页', async () => {
    const wrapper = mount(DemoBlock, {
      props: {
        id: 'demo-test',
        demo: {
          name: 'test',
          title: '异步示例',
          description: '',
          loadComponent: async () => {
            throw new Error('样式加载失败');
          },
          loadSource: async () => '<template><button>异步示例</button></template>'
        }
      }
    });
    try {
      await flushPromises();
      expect(wrapper.get('.demo-preview [role="alert"]').text()).toBe('示例加载失败。');
      expect(wrapper.get('.demo-preview button').text()).toBe('重新加载当前页');
      expect(wrapper.get('button[data-action="copy"]').attributes()).not.toHaveProperty('disabled');
    } finally {
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

  it('每个组件页面包含介绍、用法与规范表格，表格列数一致', () => {
    const componentPages = pages.filter((page) => page.id.startsWith('components/'));
    expect(componentPages.length).toBeGreaterThan(80);
    for (const page of componentPages) {
      const markdown = page.markdown;
      // 介绍：以一级标题开头并配有说明文字。
      expect(markdown.startsWith('# '), `${page.id} 缺少标题`).toBe(true);
      // 用法：使用说明标题或代码示例。
      const hasUsage = /## 用法|## 基础用法|## 快速上手|## 使用说明|```/.test(markdown);
      expect(hasUsage, `${page.id} 缺少用法说明`).toBe(true);
      // API：规范表格或明确声明无专属属性。
      const hasApiTable = /## API|### 属性|### Attributes/.test(markdown);
      const declaresNoProps = /无专用属性|没有专属属性/.test(markdown);
      expect(hasApiTable || declaresNoProps, `${page.id} 缺少 API 表格`).toBe(true);
      // 表格列数一致：表头、分隔行与数据行的未转义竖线数相同。
      const tables = markdown.match(/(?:^\|.*\|\s*$\n?)+/gm) ?? [];
      expect(tables.length, `${page.id} 未发现表格`).toBeGreaterThan(0);
      for (const table of tables) {
        const rows = table.trim().split('\n').filter(Boolean);
        const columnCount = (rows[0].match(/(?<!\\)\|/g) || []).length;
        expect(columnCount, `${page.id} 表格列数异常`).toBeGreaterThanOrEqual(2);
        rows.forEach((row, index) => {
          expect((row.match(/(?<!\\)\|/g) || []).length, `${page.id} 第 ${index + 1} 行列数不齐`).toBe(columnCount);
        });
      }
    }
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
