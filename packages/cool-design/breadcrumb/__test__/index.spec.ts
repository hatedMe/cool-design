import { h, nextTick } from 'vue';
import { mount } from '@vue/test-utils';
import { describe, expect, test } from 'vitest';
import Breadcrumb from '../index';
import BreadcrumbItem from '../breadcrumb-item';

describe('Breadcrumb', () => {
  test('items 模式渲染链接与末项', async () => {
    const wrapper = mount(Breadcrumb, {
      props: { items: [{ label: '首页', to: '#home' }, { label: '详情' }] }
    });
    await nextTick();
    const links = wrapper.findAll('a');
    expect(links).toHaveLength(1);
    expect(links[0].attributes('href')).toBe('#home');
    const items = wrapper.findAll('.i-breadcrumb__item');
    expect(items[1].classes()).toContain('is-last');
    expect(items[1].find('[aria-current="page"]').exists()).toBe(true);
    await links[0].trigger('click');
    expect(wrapper.emitted('click')?.[0]?.[0]).toMatchObject({ label: '首页' });
  });

  test('插槽模式支持分隔符属性与插槽', () => {
    const wrapper = mount(Breadcrumb, {
      props: { separator: '>' },
      slots: {
        default: () => [h(BreadcrumbItem, { to: '#a' }, () => 'A'), h(BreadcrumbItem, () => 'B')]
      }
    });
    expect(wrapper.findAll('.i-breadcrumb__separator')[0].text()).toBe('>');
    expect(wrapper.find('nav').attributes('aria-label')).toBe('面包屑');
  });

  test('separator 插槽覆盖属性', () => {
    const wrapper = mount(Breadcrumb, {
      props: { items: [{ label: 'A' }, { label: 'B' }] },
      slots: { separator: () => '|' }
    });
    expect(wrapper.find('.i-breadcrumb__separator').text()).toBe('|');
  });

  test('separatorIcon 与 BreadcrumbItem icon 经 Icon 渲染', () => {
    const itemsMode = mount(Breadcrumb, {
      props: { separatorIcon: 'icon-angle-right', items: [{ label: 'A' }, { label: 'B' }] }
    });
    const separator = itemsMode.find('.i-breadcrumb__separator');
    expect(separator.find('.i-icon').classes()).toContain('icon-angle-right');

    const slotMode = mount(Breadcrumb, {
      props: { separatorIcon: 'icon-angle-right' },
      slots: {
        default: () => [h(BreadcrumbItem, null, () => '首页'), h(BreadcrumbItem, { icon: 'icon-home' }, () => '列表')]
      }
    });
    const itemIcon = slotMode.find('.i-breadcrumb__item-icon');
    expect(itemIcon.exists()).toBe(true);
    expect(itemIcon.find('.i-icon').classes()).toContain('icon-home');
  });
});
