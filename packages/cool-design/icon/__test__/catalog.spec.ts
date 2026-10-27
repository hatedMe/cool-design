import { mount, flushPromises } from '@vue/test-utils';
import { expect, test, vi } from 'vitest';
import Catalog from '../demo/catalog.vue';
test('图标可按名称与常见中文筛选，复制真实用法，失败时保留手动复制内容', async () => {
  const writeText = vi.fn().mockResolvedValue(undefined);
  const original = Object.getOwnPropertyDescriptor(navigator, 'clipboard');
  Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } });
  const w = mount(Catalog);
  try {
    await w.get('input[type="search"]').setValue('搜索');
    expect(w.findAll('.icon-catalog__item').map((item) => item.text())).toEqual(['icon-search']);
    await w.get('.icon-catalog__item').trigger('click');
    await flushPromises();
    expect(writeText).toHaveBeenCalledWith('<Icon type="icon-search" />');
    expect(w.get('output').text()).toContain('已复制');
    writeText.mockRejectedValue(new Error('denied'));
    await w.get('.icon-catalog__item').trigger('click');
    await flushPromises();
    expect(w.get('output').text()).toContain('手动复制');
    expect(w.get('code').text()).toBe('<Icon type="icon-search" />');
    for (const [query, name] of [
      ['编辑', 'icon-editor'],
      ['设置', 'icon-setup'],
      ['用户', 'icon-people']
    ]) {
      await w.get('input[type="search"]').setValue(query);
      expect(w.findAll('.icon-catalog__item').map((item) => item.text())).toEqual([name]);
    }
    await w.get('input[type="search"]').setValue('不存在的图标');
    expect(w.text()).toContain('没有匹配的图标');
  } finally {
    w.unmount();
    if (original) Object.defineProperty(navigator, 'clipboard', original);
    else Reflect.deleteProperty(navigator, 'clipboard');
  }
});
