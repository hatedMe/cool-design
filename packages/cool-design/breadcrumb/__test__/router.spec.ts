import { mount } from '@vue/test-utils';
import { h } from 'vue';
import { describe, expect, test, vi } from 'vitest';
import Breadcrumb from '..';
import BreadcrumbItem from '../breadcrumb-item';

const useRouter = () => {
  const push = vi.fn();
  const replace = vi.fn();
  return { push, replace, instance: { push, replace } };
};

describe('Breadcrumb 路由集成', () => {
  test('存在路由实例时 to 点击走路由导航，replace 生效', async () => {
    const router = useRouter();
    const wrapper = mount(Breadcrumb, {
      slots: {
        default: () => [
          h(BreadcrumbItem, { to: '/home' }, { default: () => '首页' }),
          h(BreadcrumbItem, { to: '/detail', replace: true }, { default: () => '详情' })
        ]
      },
      global: { config: { globalProperties: { $router: router.instance } } }
    });
    const links = wrapper.findAll('a.i-breadcrumb__inner');
    await links[0].trigger('click');
    expect(router.push).toHaveBeenCalledWith('/home');
    expect(router.replace).not.toHaveBeenCalled();

    await links[1].trigger('click');
    expect(router.replace).toHaveBeenCalledWith('/detail');
  });

  test('无路由实例时保持原生链接行为', async () => {
    const wrapper = mount(Breadcrumb, {
      slots: { default: () => h(BreadcrumbItem, { to: '/home' }, { default: () => '首页' }) }
    });
    const link = wrapper.find('a.i-breadcrumb__inner');
    expect(link.attributes('href')).toBe('/home');
    const preventNativeNavigation = vi.fn((event: Event) => {
      expect(event.defaultPrevented).toBe(false);
      event.preventDefault();
    });
    wrapper.element.addEventListener('click', preventNativeNavigation, { once: true });
    await link.trigger('click');
    expect(preventNativeNavigation).toHaveBeenCalledOnce();
    expect(wrapper.findComponent(BreadcrumbItem).emitted('click')).toHaveLength(1);
  });
});
