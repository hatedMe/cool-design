import { mount } from '@vue/test-utils';
import { describe, expect, test } from 'vitest';
import { nextTick, watchEffect } from 'vue';
import Text from '..';

describe('test `Text` component', () => {
  test('语义色与尺寸生成对应类名', () => {
    const wrapper = mount(Text, {
      props: { type: 'primary', size: 'large' },
      slots: { default: () => '文本' }
    });
    expect(wrapper.classes()).toEqual(expect.arrayContaining(['i-text', 'i-text--primary', 'i-text--large']));
    expect(wrapper.text()).toBe('文本');
  });

  test('truncated 单行省略，line-clamp 多行省略', () => {
    const truncated = mount(Text, { props: { truncated: true }, slots: { default: () => '内容' } });
    expect(truncated.classes()).toContain('is-truncated');

    const clamped = mount(Text, { props: { lineClamp: 2 }, slots: { default: () => '内容' } });
    expect(clamped.classes()).toContain('is-line-clamp');
    expect(clamped.attributes('style')).toContain('-webkit-line-clamp: 2');
  });

  test('tag 自定义渲染标签', () => {
    const wrapper = mount(Text, { props: { tag: 'p' }, slots: { default: () => '段落' } });
    expect(wrapper.element.tagName).toBe('P');
  });

  test('根据真实溢出状态更新实例和自动标题，优先采用单行及显式标题', async () => {
    const wrapper = mount(Text, {
      props: { truncated: true, lineClamp: 2 },
      slots: { default: () => '完整内容' }
    });
    const states: boolean[] = [];
    const stop = watchEffect(() => states.push(wrapper.vm.isTruncated));
    const afterMeasure = async () => {
      await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
      await nextTick();
    };

    try {
      Object.defineProperties(wrapper.element, {
        offsetWidth: { value: 40 },
        scrollWidth: { value: 40, configurable: true },
        offsetHeight: { value: 20 },
        scrollHeight: { value: 60 }
      });
      await afterMeasure();
      expect(wrapper.attributes('title')).toBeUndefined();

      await wrapper.setProps({ truncated: false });
      await afterMeasure();
      expect(wrapper.attributes('title')).toBe('完整内容');

      await wrapper.setProps({ truncated: true, title: '' });
      Object.defineProperty(wrapper.element, 'scrollWidth', { value: 90 });
      await afterMeasure();
      expect(wrapper.attributes('title')).toBe('');
      expect(wrapper.vm.isTruncated).toBe(true);

      await wrapper.setProps({ truncated: false, lineClamp: undefined, title: undefined });
      await afterMeasure();
      expect(wrapper.attributes('title')).toBeUndefined();
      expect(states).toEqual([false, true, false]);
    } finally {
      stop();
      wrapper.unmount();
    }
  });
});
