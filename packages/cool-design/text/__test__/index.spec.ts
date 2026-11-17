import { mount } from '@vue/test-utils';
import { describe, expect, test } from 'vitest';
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
});
