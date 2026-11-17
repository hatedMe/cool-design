import { mount } from '@vue/test-utils';
import { describe, expect, test, vi } from 'vitest';
import Menu from '..';

const useRouter = () => {
  const push = vi.fn();
  const replace = vi.fn();
  return { push, replace, instance: { push, replace } };
};

describe('Menu router 集成', () => {
  test('router=true 时点击菜单项导航到 route，缺省回退 index', async () => {
    const router = useRouter();
    const wrapper = mount(Menu, {
      props: {
        router: true,
        items: [
          { index: 'home', label: '首页', route: '/home' },
          { index: 'about', label: '关于' }
        ]
      },
      global: { config: { globalProperties: { $router: router.instance } } }
    });
    const buttons = wrapper.findAll('button.i-menu-item__button');
    await buttons[0].trigger('click');
    expect(router.push).toHaveBeenCalledWith('/home');
    await buttons[1].trigger('click');
    expect(router.push).toHaveBeenCalledWith('about');
  });

  test('router=false 不导航', async () => {
    const router = useRouter();
    const wrapper = mount(Menu, {
      props: { items: [{ index: 'home', label: '首页', route: '/home' }] },
      global: { config: { globalProperties: { $router: router.instance } } }
    });
    await wrapper.find('button.i-menu-item__button').trigger('click');
    expect(router.push).not.toHaveBeenCalled();
    expect(wrapper.emitted('select')).toHaveLength(1);
  });

  test('无路由实例时仅触发 select 事件', async () => {
    const wrapper = mount(Menu, {
      props: { router: true, items: [{ index: 'home', label: '首页' }] }
    });
    await wrapper.find('button.i-menu-item__button').trigger('click');
    expect(wrapper.emitted('select')).toHaveLength(1);
  });
});
