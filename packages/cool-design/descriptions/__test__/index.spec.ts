import { mount } from '@vue/test-utils';
import { describe, expect, test } from 'vitest';
import { h } from 'vue';
import Descriptions, { DescriptionsItem } from '..';

describe('test `Descriptions` component', () => {
  test('子组件渲染标签与内容，支持标题和操作区', () => {
    const wrapper = mount(Descriptions, {
      props: { title: '用户', column: 2, border: true },
      slots: {
        extra: '编辑',
        default: [
          h(DescriptionsItem, { label: '姓名' }, () => '张三'),
          h(DescriptionsItem, { label: '状态' }, () => '正常')
        ]
      }
    });
    expect(wrapper.classes()).toContain('is-bordered');
    expect(wrapper.get('.i-descriptions__title').text()).toBe('用户');
    expect(wrapper.get('.i-descriptions__extra').text()).toBe('编辑');
    const labels = wrapper.findAll('.i-descriptions__label').map((node) => node.text());
    expect(labels).toEqual(['姓名', '状态']);
    expect(wrapper.text()).toContain('张三');
    expect(wrapper.findAll('tbody tr')).toHaveLength(1);
  });

  test('span 跨列收敛，最后一项补足剩余列', () => {
    const wrapper = mount(Descriptions, {
      props: { column: 3 },
      slots: {
        default: [
          h(DescriptionsItem, { label: 'A', span: 2 }, () => 'a'),
          h(DescriptionsItem, { label: 'B', span: 5 }, () => 'b')
        ]
      }
    });
    const rows = wrapper.findAll('tbody tr');
    expect(rows).toHaveLength(1);
    // A 占 2 列，B 收敛为剩余 1 列：内容单元格 colspan 为 3 和 1
    const cells = wrapper.findAll('.i-descriptions__content');
    expect(cells[0].attributes('colspan')).toBe('3');
    expect(cells[1].attributes('colspan')).toBeUndefined();
  });

  test('纵向排列与尺寸类名', () => {
    const wrapper = mount(Descriptions, {
      props: { direction: 'vertical', column: 2, size: 'small' },
      slots: {
        default: [
          h(DescriptionsItem, { label: '订单' }, () => '001'),
          h(DescriptionsItem, { label: '金额' }, () => '100')
        ]
      }
    });
    expect(wrapper.classes()).toContain('is-vertical');
    expect(wrapper.classes()).toContain('i-descriptions--small');
    expect(wrapper.findAll('tbody tr')).toHaveLength(2);
  });

  test('items 兼容属性与自定义标签插槽', () => {
    const wrapper = mount(Descriptions, {
      props: { items: [{ label: '姓名', content: '张三' }] },
      slots: { 'label-0': '自定义标签' }
    });
    expect(wrapper.get('.i-descriptions__label').text()).toBe('自定义标签');
    expect(wrapper.get('.i-descriptions__content').text()).toBe('张三');
    const withSlot = mount(Descriptions, {
      slots: {
        default: h(DescriptionsItem, { label: '忽略' }, { label: () => '槽标签', default: () => '值' })
      }
    });
    expect(withSlot.get('.i-descriptions__label').text()).toBe('槽标签');
  });
});
