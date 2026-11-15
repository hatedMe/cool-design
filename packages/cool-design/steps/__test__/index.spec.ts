import { h } from 'vue';
import { mount } from '@vue/test-utils';
import { describe, expect, test } from 'vitest';
import Steps from '../index';
import Step from '../step';

describe('Steps', () => {
  test('items 模式根据 active 计算状态', () => {
    const wrapper = mount(Steps, {
      props: { active: 1, items: [{ title: '一' }, { title: '二' }, { title: '三' }] }
    });
    const items = wrapper.findAll('.i-steps__item');
    expect(items[0].classes()).toContain('is-finish');
    expect(items[1].classes()).toContain('is-process');
    expect(items[2].classes()).toContain('is-wait');
    expect(items[1].attributes('aria-current')).toBe('step');
  });

  test('显式 status 覆盖自动状态', () => {
    const wrapper = mount(Steps, {
      props: { active: 0, items: [{ title: '一', status: 'error' }, { title: '二' }] }
    });
    expect(wrapper.findAll('.i-steps__item')[0].classes()).toContain('is-error');
  });

  test('点击触发 change', async () => {
    const wrapper = mount(Steps, {
      props: { active: 0, items: [{ title: '一' }, { title: '二' }] }
    });
    await wrapper.findAll('.i-steps__item')[1].trigger('click');
    expect(wrapper.emitted('change')?.[0]).toEqual([1]);
  });

  test('插槽 Step 支持标题与描述插槽', () => {
    const wrapper = mount(Steps, {
      props: { active: 0 },
      slots: {
        default: () => [
          h(Step, { title: '步骤一', description: '描述一' }),
          h(Step, { title: '步骤二' }, { title: () => '自定义标题', description: () => '自定义描述' })
        ]
      }
    });
    expect(wrapper.text()).toContain('步骤一');
    expect(wrapper.text()).toContain('自定义标题');
    expect(wrapper.text()).toContain('自定义描述');
  });

  test('垂直与简单模式类名', () => {
    const vertical = mount(Steps, {
      props: { active: 0, direction: 'vertical', items: [{ title: '一' }] }
    });
    expect(vertical.find('.i-steps').classes()).toContain('is-vertical');
    const simple = mount(Steps, {
      props: { active: 0, simple: true, items: [{ title: '一', description: '应隐藏' }] }
    });
    expect(simple.find('.i-steps').classes()).toContain('is-simple');
    expect(simple.text()).not.toContain('应隐藏');
  });
});
