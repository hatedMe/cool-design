import { flushPromises, mount } from '@vue/test-utils';
import { defineComponent, h, ref, shallowRef } from 'vue';
import { afterEach, expect, test, vi } from 'vitest';
import Tooltip, { type TooltipInstance } from '..';

afterEach(() => {
  document.body.innerHTML = '';
});

test('普通单个组件触发器保留用户 ref，并定位到实际组件根节点', async () => {
  const Anchor = defineComponent({ render: () => h('button', '组件按钮') });
  const userRef = shallowRef<InstanceType<typeof Anchor>>();
  const tooltip = shallowRef<TooltipInstance>();
  const key = ref(0);
  const Wrapper = defineComponent(() => () => h(Tooltip, {
    ref: tooltip, visible: true, content: '说明'
  }, { default: () => h(Anchor, { key: key.value, ref: userRef }) }));
  const wrapper = mount(Wrapper, { attachTo: document.body });

  try {
    await flushPromises();
    const instance = tooltip.value?.popperRef.popperInstanceRef;
    expect(userRef.value?.$el).toBe(wrapper.get('button').element);
    expect(instance?.state.elements.reference).toBe(wrapper.get('button').element);
    key.value++;
    await flushPromises();
    expect(userRef.value?.$el).toBe(wrapper.get('button').element);
    expect(tooltip.value?.popperRef.popperInstanceRef).not.toBe(instance);
    expect(tooltip.value?.popperRef.triggerRef).toBe(userRef.value?.$el);
  } finally {
    wrapper.unmount();
  }
});

test('触发组件独立切换根节点时刷新定位引用', async () => {
  const alternate = ref(false);
  const Anchor = defineComponent({ render: () => h(alternate.value ? 'a' : 'button', '组件按钮') });
  const userRef = shallowRef<InstanceType<typeof Anchor>>();
  const tooltip = shallowRef<TooltipInstance>();
  const Wrapper = defineComponent(() => () => h(Tooltip, {
    ref: tooltip, visible: true, content: '说明'
  }, { default: () => h(Anchor, { ref: userRef }) }));
  const wrapper = mount(Wrapper, { attachTo: document.body });

  try {
    await flushPromises();
    const instance = tooltip.value?.popperRef.popperInstanceRef;
    const anchor = userRef.value;
    alternate.value = true;
    await flushPromises();
    expect(userRef.value).toBe(anchor);
    expect(tooltip.value?.popperRef.popperInstanceRef).not.toBe(instance);
    expect(tooltip.value?.popperRef.popperInstanceRef?.state.elements.reference).toBe(wrapper.get('a').element);
  } finally {
    wrapper.unmount();
  }
});

test('自定义 code 切换双向模型且严格受控时忽略本地触发', async () => {
  const visible = ref(false);
  const updates = vi.fn((value: boolean) => { visible.value = value; });
  const Controlled = defineComponent(() => () => h(Tooltip, {
    content: '说明', visible: visible.value, 'onUpdate:visible': updates,
    trigger: 'click', triggerKeys: ['KeyT'], hideAfter: 0, teleported: false
  }, { default: () => h('button', '帮助') }));
  const twoWay = mount(Controlled);
  const oneWay = mount(Tooltip, {
    props: { content: '说明', visible: false, trigger: 'click', teleported: false },
    slots: { default: () => h('button', '帮助') }
  });
  try {
    await twoWay.get('button').trigger('keydown', { code: 'Enter' });
    expect(updates).not.toHaveBeenCalled();
    await twoWay.get('button').trigger('keydown', { code: 'KeyT' });
    expect(updates).toHaveBeenLastCalledWith(true);
    expect(twoWay.get('[role=tooltip]').text()).toBe('说明');
    await twoWay.get('button').trigger('keydown', { code: 'KeyT' });
    expect(updates).toHaveBeenLastCalledWith(false);
    await oneWay.get('button').trigger('click');
    expect(oneWay.emitted('update:visible')).toBeUndefined();
  } finally {
    twoWay.unmount();
    oneWay.unmount();
  }
});

test('过渡合并用户钩子并原样传递触发事件，persistent 首次渲染即挂载', async () => {
  const calls: string[] = [];
  const wrapper = mount(Tooltip, {
    attachTo: document.body,
    props: {
      content: '说明', trigger: 'click', persistent: true, hideAfter: 0,
      transition: { css: false, onBeforeEnter: () => calls.push('用户进入'), onAfterLeave: () => calls.push('用户离开') },
      onBeforeShow: () => calls.push('组件进入'), onHide: () => calls.push('组件离开')
    },
    slots: { default: () => h('button', '帮助') },
    global: { stubs: { transition: false } }
  });
  try {
    const panel = document.querySelector<HTMLElement>('[role=tooltip]');
    expect(panel?.style.display).toBe('none');
    const open = new MouseEvent('click', { bubbles: true });
    const close = new MouseEvent('click', { bubbles: true });
    wrapper.get('button').element.dispatchEvent(open);
    await flushPromises();
    wrapper.get('button').element.dispatchEvent(close);
    await flushPromises();
    expect(document.querySelector('[role=tooltip]')).toBe(panel);
    expect(panel?.style.display).toBe('none');
    expect(calls).toEqual(['用户进入', '组件进入', '用户离开', '组件离开']);
    expect(wrapper.emitted('before-show')).toEqual([[open]]);
    expect(wrapper.emitted('show')).toEqual([[open]]);
    expect(wrapper.emitted('before-hide')).toEqual([[close]]);
    expect(wrapper.emitted('hide')).toEqual([[close]]);
  } finally {
    wrapper.unmount();
  }
});

test('Popper 运行依赖有序的修饰器，深配置和替换锚点释放 effect', async () => {
  const firstUpdate = vi.fn();
  const clean = vi.fn();
  const anchor = ref(document.createElement('button'));
  const value = ref('one');
  const modifiers = [
    { name: 'useValue', phase: 'write', enabled: true, requires: ['buildValue'], effect: () => clean,
      fn: ({ state }: { state: { modifiersData: Record<string, { value?: string }>; attributes: Record<string, Record<string, string>> } }) => {
        state.attributes.popper['data-custom'] = state.modifiersData.buildValue.value!;
      }
    },
    { name: 'buildValue', phase: 'write', enabled: true, options: { value: 'initial' },
      fn: ({ state, options }: { state: { modifiersData: Record<string, { value?: string }> }; options: { value?: string } }) => {
        state.modifiersData.buildValue.value = options.value;
      }
    },
    { name: 'buildValue', options: { value: 'one' } },
    { name: 'useValue', enabled: true }
  ];
  const popperOptions = ref({ placement: 'auto', strategy: 'fixed', onFirstUpdate: firstUpdate, modifiers });
  const tooltip = ref<InstanceType<typeof Tooltip>>();
  const Wrapper = defineComponent(() => () => h(Tooltip, {
    ref: tooltip, content: '定位', virtualTriggering: true, virtualRef: anchor.value, visible: true, popperOptions: popperOptions.value
  }));
  const wrapper = mount(Wrapper, { attachTo: document.body });
  let unmounted = false;
  try {
    await flushPromises();
    const panel = document.querySelector<HTMLElement>('[role=tooltip]')!;
    expect(panel.dataset.custom).toBe('one');
    expect(panel.style.position).toBe('fixed');
    expect(firstUpdate).toHaveBeenCalledTimes(1);
    const instance = tooltip.value?.popperRef.popperInstanceRef;
    expect(instance?.state.elements.reference).toBe(anchor.value);

    value.value = 'two';
    popperOptions.value.modifiers[2].options!.value = value.value;
    await flushPromises();
    expect(panel.dataset.custom).toBe('two');
    expect(clean).toHaveBeenCalledTimes(1);
    expect(tooltip.value?.popperRef.popperInstanceRef).toBe(instance);
    instance?.forceUpdate();
    await tooltip.value?.updatePopper();
    expect(firstUpdate).toHaveBeenCalledTimes(1);

    anchor.value = document.createElement('button');
    await flushPromises();
    expect(clean).toHaveBeenCalledTimes(2);
    expect(firstUpdate).toHaveBeenCalledTimes(2);
    expect(tooltip.value?.popperRef.popperInstanceRef?.state.elements.reference).toBe(anchor.value);
    expect(tooltip.value?.contentRef?.popperContentRef).toBe(panel);

    popperOptions.value.modifiers[3].enabled = false;
    await flushPromises();
    expect(panel.hasAttribute('data-custom')).toBe(false);
    expect(clean).toHaveBeenCalledTimes(3);

    wrapper.unmount();
    unmounted = true;
    expect(clean).toHaveBeenCalledTimes(3);
  } finally {
    if (!unmounted) wrapper.unmount();
  }
});
