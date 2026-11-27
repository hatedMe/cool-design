import { mount } from '@vue/test-utils';
import { expect, test } from 'vitest';
import { h } from 'vue';
import Timeline, { TimelineItem } from '..';

test('渲染子组件、时间位置、类型颜色和空心节点', () => {
  const w = mount(Timeline, {
    slots: {
      default: () => [
        h(TimelineItem, { timestamp: '2026-01-01', type: 'success' }, () => '发布'),
        h(TimelineItem, { timestamp: '2026-02-01', placement: 'top', color: '#e6a23c', hollow: true }, () => '验证')
      ]
    }
  });
  const items = w.findAll('.i-timeline-item');
  expect(items).toHaveLength(2);
  expect(items[0].find('.i-timeline-item__timestamp').text()).toBe('2026-01-01');
  expect(items[0].find('.i-timeline-item__node--success').exists()).toBe(true);
  expect(items[1].find('.i-timeline-item__timestamp.is-top').exists()).toBe(true);
  expect(items[1].find('.i-timeline-item__node.is-hollow').exists()).toBe(true);
  expect((items[1].find('.i-timeline-item__node').element as HTMLElement).style.borderColor).toContain('e6a23c');
});

test('支持 reverse、mode、size、icon、center 和 dot 插槽', () => {
  const w = mount(Timeline, {
    props: { reverse: true, mode: 'alternate' },
    slots: {
      default: () => [
        h(TimelineItem, { timestamp: '第一', size: 'large' }, () => '一'),
        h(
          TimelineItem,
          { timestamp: '第二', center: true, hideTimestamp: true },
          { default: () => '二', dot: () => h('span', { class: 'custom-dot' }, '•') }
        )
      ]
    }
  });
  expect(w.classes()).toContain('i-timeline--alternate');
  const items = w.findAll('.i-timeline-item');
  expect(items).toHaveLength(2);
  // reverse 后首项为原第二项（隐藏时间戳，含自定义 dot）。
  expect(items[0].find('.custom-dot').exists()).toBe(true);
  expect(items[0].find('.i-timeline-item__timestamp').exists()).toBe(false);
  expect(items[0].classes()).toContain('is-center');
  expect(items[1].find('.i-timeline-item__node--large').exists()).toBe(true);
});

test('兼容 items 数据驱动并支持插槽自定义内容', () => {
  const w = mount(Timeline, {
    props: { items: [{ timestamp: '2026-01-01', type: 'primary' }, { timestamp: '2026-02-01' }] },
    slots: { default: ({ item }: { item: { timestamp?: string } }) => `内容-${item.timestamp}` }
  });
  expect(w.findAll('.i-timeline-item')).toHaveLength(2);
  expect(w.text()).toContain('内容-2026-01-01');
  const w2 = mount(Timeline, { props: { items: [{ timestamp: 'a' }, { timestamp: 'b' }], reverse: true } });
  expect(w2.findAll('.i-timeline-item__timestamp')[0].text()).toBe('b');
});
