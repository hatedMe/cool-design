import { mount } from '@vue/test-utils';
import { describe, expect, test, vi } from 'vitest';
import { h, nextTick, ref } from 'vue';
import Skeleton, { SkeletonItem } from '..';
import ConfigProvider from '../../config-provider';

describe('test `Skeleton` component', () => {
  test('loading 切换骨架与真实内容', async () => {
    const wrapper = mount(Skeleton, {
      props: { loading: true, rows: 2 },
      slots: { default: '真实内容' }
    });
    expect(wrapper.get('[role="status"]').attributes('aria-label')).toBe('加载中');
    expect(wrapper.findAll('.i-skeleton-item--p')).toHaveLength(2);
    expect(wrapper.text()).not.toContain('真实内容');
    await wrapper.setProps({ loading: false });
    expect(wrapper.text()).toContain('真实内容');
    expect(wrapper.find('[role="status"]').exists()).toBe(false);
  });

  test('count 渲染多块骨架，avatar/title 生效', () => {
    const wrapper = mount(Skeleton, { props: { count: 2, avatar: true, title: true, rows: 1 } });
    expect(wrapper.findAll('.i-skeleton__block')).toHaveLength(2);
    expect(wrapper.findAll('.i-skeleton-item--circle')).toHaveLength(2);
    expect(wrapper.findAll('.i-skeleton-item--h3')).toHaveLength(2);
  });

  test('throttle 延迟展示骨架屏', async () => {
    vi.useFakeTimers();
    try {
      const wrapper = mount(Skeleton, { props: { loading: false, throttle: 500 }, slots: { default: '内容' } });
      expect(wrapper.text()).toContain('内容');
      await wrapper.setProps({ loading: true });
      expect(wrapper.text()).toContain('内容');
      vi.advanceTimersByTime(500);
      await wrapper.vm.$nextTick();
      expect(wrapper.find('[role="status"]').exists()).toBe(true);
      await wrapper.setProps({ loading: false });
      expect(wrapper.text()).toContain('内容');
    } finally {
      vi.useRealTimers();
    }
  });

  test('template 插槽与 SkeletonItem 变体', () => {
    const wrapper = mount(Skeleton, {
      props: { animated: true },
      slots: { template: '<div class="custom-tpl">自定义</div>' }
    });
    expect(wrapper.classes()).toContain('is-animated');
    expect(wrapper.get('.custom-tpl').text()).toBe('自定义');
    const item = mount(SkeletonItem, { props: { variant: 'circle' } });
    expect(item.classes()).toContain('i-skeleton-item--circle');
  });

  test('跨 ConfigProvider 的占位项跟随所属骨架屏，保留同一个插槽节点', async () => {
    const namespace = ref('acme');
    const animated = ref(true);
    const wrapper = mount({
      setup: () => () => h(Skeleton, { animated: animated.value }, {
        template: () => h(ConfigProvider, { namespace: namespace.value }, {
          default: () => h(SkeletonItem, { key: 'rect', variant: 'rect' })
        })
      })
    });
    try {
      const item = wrapper.get('.acme-skeleton-item--rect');
      expect(item.attributes('data-skeleton-cross-namespace')).toBe('true');
      expect(item.attributes('data-skeleton-animated')).toBe('true');
      namespace.value = '3d';
      animated.value = false;
      await nextTick();
      const updated = wrapper.get('[class~="3d-skeleton-item--rect"]');
      expect(updated.element).toBe(item.element);
      expect(updated.attributes('data-skeleton-animated')).toBe('false');
      namespace.value = 'i';
      await nextTick();
      expect(wrapper.get('.i-skeleton-item--rect').element).toBe(item.element);
      expect(item.attributes('data-skeleton-cross-namespace')).toBeUndefined();
    } finally {
      wrapper.unmount();
    }
  });
});
