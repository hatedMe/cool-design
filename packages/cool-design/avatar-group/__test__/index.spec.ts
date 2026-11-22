import { mount } from '@vue/test-utils';
import { expect, test, vi } from 'vitest';
import { Fragment, createCommentVNode, defineComponent, h, nextTick, onMounted, onUnmounted, ref, shallowRef } from 'vue';
import { AvatarGroup } from '../..';
import Avatar from '../../avatar';

test('空字符串尺寸使用默认修饰类，并可覆盖组尺寸', async () => {
  const group = mount(AvatarGroup, {
    props: { size: '', collapseAvatars: true },
    slots: {
      default: () => [h(Avatar, { key: 'explicit', size: '' }, () => '甲'), h(Avatar, { key: 'inherited' }, () => '乙')]
    }
  });
  const [explicit, count] = group.findAll('.i-avatar');
  expect(explicit.classes()).toContain('i-avatar--default');
  expect(count.classes()).toContain('i-avatar--default');
  expect(explicit.classes()).not.toContain('i-avatar--');
  await group.setProps({ size: 'large', collapseAvatars: false });
  expect(explicit.classes()).toContain('i-avatar--default');
  expect(group.findAll('.i-avatar')[1].classes()).toContain('i-avatar--large');
  group.unmount();
});

test('保留嵌套 Fragment 的原始文本和数字，忽略空白和注释', () => {
  const group = mount(AvatarGroup, {
    slots: {
      default: () => [
        h(Fragment, { key: 'outer' }, [' ', '片段', h(Fragment, { key: 'inner' }, [
          0, createCommentVNode('占位'), h(Avatar, { key: 'a' }, () => '甲')
        ])]),
        h(Avatar, { key: 'b' }, () => '乙')
      ]
    }
  });
  expect(group.element.textContent).toBe('片段0甲乙');
  group.unmount();
});

test('NaN 阈值不会折叠任何头像', () => {
  const group = mount(AvatarGroup, {
    props: { collapseAvatars: true, maxCollapseAvatars: Number.NaN },
    slots: { default: () => ['甲', '乙'].map((label) => h(Avatar, { key: label }, () => label)) }
  });
  expect(group.findAll('.i-avatar').map((avatar) => avatar.text())).toEqual(['甲', '乙']);
  group.unmount();
});

test('头像组响应式继承尺寸与形状，子项显式值优先', async () => {
  const group = mount(AvatarGroup, {
    props: { size: 64, shape: 'square' },
    slots: {
      default: () => [
        h(Avatar, { key: 'inherited' }, () => '甲'),
        h(Avatar, { key: 'explicit', size: 'default', shape: 'circle' }, () => '乙')
      ]
    }
  });
  const [first, second] = group.findAll('.i-avatar');
  expect(first.attributes('style')).toContain('width: 64px');
  expect(first.classes()).toContain('i-avatar--square');
  expect(second.classes()).toContain('i-avatar--default');
  expect(second.classes()).toContain('i-avatar--circle');

  await group.setProps({ size: 'large', shape: 'circle' });
  expect(first.classes()).toEqual(expect.arrayContaining(['i-avatar--large', 'i-avatar--circle']));
  expect(first.element.style.width).toBe('');
  await group.setProps({ size: undefined, shape: undefined });
  expect(first.classes()).toEqual(expect.arrayContaining(['i-avatar--default', 'i-avatar--circle']));
  group.unmount();
});

test('展开多层 Fragment，同时保留局部重名键的实例、ref 和图片错误状态', async () => {
  const image = shallowRef<InstanceType<typeof Avatar> | null>(null);
  const second = shallowRef<InstanceType<typeof Avatar> | null>(null);
  const error = vi.fn();
  const reverse = ref(false);
  const group = mount(defineComponent({
    setup: () => () => h(AvatarGroup, null, () => {
      const left = h(Fragment, { key: 'left' }, [
        createCommentVNode(),
        h(Fragment, { key: 'inner' }, [
          h(Avatar, { key: 'same', id: 'left', ref: image, src: '/broken.png', onError: error },
            { fallback: () => '回退' })
        ])
      ]);
      const right = h(Fragment, { key: 'right' }, [
        h(Avatar, { key: 'same', id: 'right', ref: second }, () => '右')
      ]);
      return reverse.value ? [right, left] : [left, right];
    })
  }));

  expect(group.findAll('.i-avatar').map((node) => node.attributes('id'))).toEqual(['left', 'right']);
  const leftInstance = image.value;
  const rightInstance = second.value;
  const original = group.get('#left').element;
  const event = new Event('error');
  group.get('img').element.dispatchEvent(event);
  await nextTick();
  reverse.value = true;
  await nextTick();

  expect(group.findAll('.i-avatar').map((node) => node.attributes('id'))).toEqual(['right', 'left']);
  expect(image.value).toBe(leftInstance);
  expect(second.value).toBe(rightInstance);
  expect(group.get('#left').element).toBe(original);
  expect(group.get('#left').text()).toBe('回退');
  expect(error.mock.calls).toEqual([[event]]);
  group.unmount();
  expect(image.value).toBeNull();
  expect(second.value).toBeNull();
});

test('无键 Fragment 的有键头像在独立节点、条件注释和有键 Fragment 前插后保留状态', async () => {
  const prepend = ref(false);
  const Counter = defineComponent({
    setup() {
      const clicks = ref(0);
      return () => h(Avatar, null, () => h('button', { onClick: () => clicks.value++ }, `甲 ${clicks.value}`));
    }
  });
  const group = mount(defineComponent({
    setup: () => () => h(AvatarGroup, null, () => [
      ...(prepend.value ? [
        h(Avatar, { key: 'prefix' }, () => '前项'),
        h(Fragment, { key: 'prefix-fragment' }, [h(Avatar, { key: 'a' }, () => '新组')]),
        createCommentVNode()
      ] : []),
      h(Fragment, null, [h(Counter, { key: 'a' })])
    ])
  }));
  const button = group.get('button');
  await button.trigger('click');
  prepend.value = true;
  await nextTick();
  expect(group.findAll('.i-avatar').map((node) => node.text())).toEqual(['前项', '新组', '甲 1']);
  expect(group.get('button').element).toBe(button.element);
  group.unmount();
});

test('仅在折叠时应用默认上限，并根据动态阈值更新计数', async () => {
  const group = mount(AvatarGroup, {
    slots: { default: () => ['甲', '乙', '丙'].map((label) => h(Avatar, { key: label }, () => label)) }
  });
  const labels = () => group.findAll('.i-avatar').map((avatar) => avatar.text());
  expect(labels()).toEqual(['甲', '乙', '丙']);
  await group.setProps({ collapseAvatars: true, collapseClass: ['count', { selected: true }], collapseStyle: 'color: red' });
  expect(labels()).toEqual(['甲', '+ 2']);
  expect(group.get('.count').classes()).toContain('selected');
  expect(group.get('.count').attributes('style')).toContain('color: red');
  expect(group.get('.count').attributes('tabindex')).toBeUndefined();
  await group.setProps({ maxCollapseAvatars: 0 });
  expect(labels()).toEqual(['+ 3']);
  await group.setProps({ maxCollapseAvatars: 2 });
  expect(labels()).toEqual(['甲', '乙', '+ 1']);
  await group.setProps({ maxCollapseAvatars: 3 });
  expect(labels()).toEqual(['甲', '乙', '丙']);
  group.unmount();
});

test('Tooltip 懒挂载隐藏头像，保留事件、ref 和动态继承，并在禁用或卸载时清理', async () => {
  const visibleMounted = vi.fn();
  const hiddenMounted = vi.fn();
  const hiddenUnmounted = vi.fn();
  const imageError = vi.fn();
  const hiddenRef = shallowRef<InstanceType<typeof Avatar> | null>(null);
  const Visible = defineComponent({
    setup() {
      onMounted(visibleMounted);
      return () => h(Avatar, null, () => '显');
    }
  });
  const Hidden = defineComponent({
    setup() {
      onMounted(hiddenMounted);
      onUnmounted(hiddenUnmounted);
      return () => h(Avatar, { ref: hiddenRef, src: '/missing.png', onError: imageError },
        { fallback: () => '隐' });
    }
  });
  const group = mount(AvatarGroup, {
    attachTo: document.body,
    global: { stubs: { transition: false } },
    props: { collapseAvatars: true, size: 56, shape: 'square', popperClass: 'hidden-avatars', popperStyle: { color: 'red' } },
    slots: {
      default: () => [h(Visible, { key: 'visible' }), h(Hidden, { key: 'hidden' }),
        h(Avatar, { key: 'explicit', size: 'small', shape: 'circle' }, () => '乙')]
    }
  });
  try {
    const count = () => group.get('.i-avatar:last-child');
    const panel = () => document.querySelector<HTMLElement>('.hidden-avatars');
    expect(count().text()).toBe('+ 2');
    expect(hiddenMounted).not.toHaveBeenCalled();
    expect(panel()).toBeNull();
    await group.setProps({ collapseAvatarsTooltip: true });
    expect(count().attributes('tabindex')).toBe('0');
    await count().trigger('keydown', { code: 'Enter' });
    await vi.waitFor(() => expect(panel()).not.toBeNull());
    const tooltip = panel()!;
    expect(tooltip.classList.contains('i-tooltip--light')).toBe(true);
    expect(tooltip.style.color).toBe('red');
    expect(tooltip.querySelector<HTMLElement>('.i-avatar--square')?.style.width).toBe('56px');
    expect(tooltip.querySelector('.i-avatar--small.i-avatar--circle')?.textContent).toBe('乙');
    expect(hiddenRef.value?.$el).toBe(tooltip.querySelector('.i-avatar'));
    const event = new Event('error');
    tooltip.querySelector('img')?.dispatchEvent(event);
    await group.setProps({ size: 'large', shape: 'circle' });
    expect(tooltip.querySelector('.i-avatar--large.i-avatar--circle')?.textContent).toBe('隐');
    expect(imageError.mock.calls).toEqual([[event]]);
    expect(visibleMounted).toHaveBeenCalledTimes(1);
    expect(hiddenMounted).toHaveBeenCalledTimes(1);
    await group.setProps({ collapseAvatarsTooltip: false });
    await vi.waitFor(() => expect(panel()).toBeNull());
    expect(hiddenRef.value).toBeNull();
    expect(hiddenUnmounted).toHaveBeenCalledTimes(1);
  } finally {
    group.unmount();
  }
  expect(document.querySelector('.hidden-avatars')).toBeNull();
});
