import { DOMWrapper, mount } from '@vue/test-utils';
import { defineComponent, h, ref, type Component } from 'vue';
import { beforeEach, describe, expect, test } from 'vitest';
// 下拉面板默认传送到 document.body，测试中用文档级查询访问传送内容。
beforeEach(() => {
  document.body.innerHTML = '';
});
const doc = () => new DOMWrapper(document.body);
import Mention from '..';
import type { MentionOption } from '../mention';

const mountMention = (
  props: Record<string, unknown>,
  options: { slots?: Record<string, unknown>; initial?: string } = {}
) => {
  const text = ref(options.initial ?? '');
  const wrapper = mount(
    defineComponent({
      setup: () => () =>
        h(
          Mention as Component,
          { ...props, modelValue: text.value, 'onUpdate:modelValue': (value: string) => (text.value = value) },
          options.slots
        )
    }),
    { attachTo: document.body }
  );
  return { wrapper, text, mention: wrapper.findComponent(Mention) };
};

const options: MentionOption[] = [
  { value: 'Fuphoenixes', label: 'Fuphoenixes' },
  { value: 'kooriookami', label: 'kooriookami' },
  { value: 'Jeremy', label: 'Jeremy' }
];

describe('test `Mention` component', () => {
  test('触发符打开候选并按输入过滤，search 携带 pattern 与 prefix', async () => {
    const { wrapper, mention } = mountMention({ options });
    const input = wrapper.get('input');
    await input.setValue('@');
    expect(mention.emitted('search')).toEqual([['', '@']]);
    expect(doc().findAll('.i-mention__option')).toHaveLength(3);

    await input.setValue('@Je');
    expect(mention.emitted('search')!.at(-1)).toEqual(['Je', '@']);
    expect(doc().findAll('.i-mention__option')).toHaveLength(1);
  });

  test('选中候选插入内容并触发 select', async () => {
    const { wrapper, text, mention } = mountMention({ options });
    const input = wrapper.get('input');
    await input.setValue('hi @Je');
    await doc().find('.i-mention__option').trigger('mousedown');
    expect(mention.emitted('select')).toHaveLength(1);
    expect(text.value).toBe('hi @Jeremy ');
    expect(doc().find('.i-mention__dropdown').exists()).toBe(false);
  });

  test('键盘上下移动高亮，Enter 选中', async () => {
    const { wrapper, text } = mountMention({ options });
    const input = wrapper.get('input');
    await input.setValue('@');
    await input.trigger('keydown', { key: 'ArrowDown' });
    await input.trigger('keydown', { key: 'Enter' });
    expect(text.value).toBe('@Fuphoenixes ');
  });

  test('多触发符与 whole 整体删除', async () => {
    const { wrapper, text, mention } = mountMention({
      options: [{ value: '1.0' }, { value: '2.0' }],
      prefix: ['@', '#'],
      whole: true
    });
    const input = wrapper.get('input');
    await input.setValue('release #1.0');
    expect(mention.emitted('search')!.at(-1)).toEqual(['1.0', '#']);
    await input.trigger('keydown', { key: 'Backspace' });
    expect(mention.emitted('whole-remove')).toEqual([['1.0']]);
    expect(text.value).toBe('release ');
  });

  test('label 插槽与 textarea 形态', async () => {
    const { wrapper } = mountMention(
      { options: [{ value: 'a', label: 'A' }], type: 'textarea', rows: 4 },
      { slots: { label: ({ item }: { item: { value: string } }) => `自定义-${item.value}` } }
    );
    const textarea = wrapper.get('textarea');
    expect((textarea.element as HTMLTextAreaElement).rows).toBe(4);
    await textarea.setValue('@');
    expect(doc().find('.i-mention__option').text()).toBe('自定义-a');
  });

  test('filter-option=false 全量展示，禁用项不可选', async () => {
    const { wrapper, mention } = mountMention({
      options: [
        { value: 'a', label: 'A', disabled: true },
        { value: 'b', label: 'B' }
      ],
      filterOption: false
    });
    const input = wrapper.get('input');
    await input.setValue('@zzz');
    expect(doc().findAll('.i-mention__option')).toHaveLength(2);
    await doc().findAll('.i-mention__option')[0].trigger('mousedown');
    expect(mention.emitted('select')).toBeUndefined();
  });

  test('下拉传送到 body 并支持 effect 与浮层参数', async () => {
    const { wrapper } = mountMention({
      options,
      effect: 'dark',
      popperClass: 'mention-scope',
      popperOptions: { placement: 'bottom-start', offset: 8 }
    });
    await wrapper.get('input').setValue('@a');
    expect(wrapper.find('.i-mention__dropdown').exists()).toBe(false);
    const panel = doc().get('.mention-scope');
    expect(panel.classes()).toContain('i-mention__dropdown--dark');
    expect(panel.attributes('data-placement')).toBe('bottom-start');
  });

  test('showArrow 渲染朝向输入框的小箭头，默认不渲染', async () => {
    const { wrapper } = mountMention({ options, showArrow: true, offset: 8 });
    await wrapper.get('input').setValue('@');
    const panel = doc().get('.i-mention__dropdown');
    expect(panel.find('.i-mention__arrow').exists()).toBe(true);
    wrapper.unmount();

    const plain = mountMention({ options });
    await plain.wrapper.get('input').setValue('@');
    expect(doc().find('.i-mention__arrow').exists()).toBe(false);
  });

  test('IME 组合期间不触发搜索，组合结束后统一处理', async () => {
    const { wrapper, mention } = mountMention({ options });
    const input = wrapper.get('input');
    await input.setValue('@');
    expect(mention.emitted('search')).toHaveLength(1);
    await input.trigger('compositionstart');
    await input.setValue('@ni');
    // 拼音组合输入期间不触发 search。
    expect(mention.emitted('search')).toHaveLength(1);
    await input.trigger('compositionend');
    expect(mention.emitted('search')!.at(-1)).toEqual(['ni', '@']);
    expect(doc().findAll('.i-mention__option')).toHaveLength(1);
  });
});
