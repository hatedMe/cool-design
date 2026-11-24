import { flushPromises, mount } from '@vue/test-utils';
import { Teleport, createStaticVNode, h, nextTick, ref } from 'vue';
import { expect, test } from 'vitest';
import { idKey } from '../../../hooks/use-id';
import Collapse, { CollapseItem } from '../../collapse';
import ConfigProvider from '../../config-provider';
import Drawer from '../../drawer';
import Dialog, { type DialogHeaderScope } from '..';

test('同一应用按最近命名空间分配浮层和折叠项 ID，显式根与插槽 ID 优先', async () => {
  const namespace = ref('acme');
  const dialogId = ref('acme-id-23-7-dialog-title');
  const itemId = ref('acme-id-23-9-collapse-header');
  const slotCalls: string[] = [];
  const titleNode = (name: string) => ({ titleId }: DialogHeaderScope) => {
    slotCalls.push(name);
    return h('strong', { id: titleId }, titleId);
  };
  const seed = { prefix: 23, current: 7 };
  const wrapper = mount({
    render: () => h(ConfigProvider, { namespace: namespace.value }, () => [
      h(Dialog, { id: dialogId.value, modelValue: true }, {
        header: titleNode('dialog-header'),
        default: () => {
          slotCalls.push('dialog-body');
          return h('span', { id: 'acme-id-23-7-dialog-body' }, '显式正文 ID');
        }
      }),
      h(Drawer, { modelValue: true }, {
        header: titleNode('drawer-header'),
        default: () => {
          slotCalls.push('drawer-body');
          return h('span', { id: 'acme-id-23-8-drawer-title' }, '显式插槽 ID');
        }
      }),
      h(Collapse, null, () => h(CollapseItem, { id: itemId.value, title: '折叠项' }, () =>
        h('span', { id: 'acme-id-23-9-collapse-panel' }, '显式面板内容 ID')
      ))
    ])
  }, { attachTo: document.body, global: { provide: { [idKey]: seed } } });

  const linkedChild = (source: Element, attribute: string, target: Element) => {
    const id = source.getAttribute(attribute)!;
    expect(document.getElementById(id)).toBe(target);
    expect(document.querySelectorAll(`[id="${id}"]`)).toHaveLength(1);
    return target;
  };

  try {
    await flushPromises();
    const dialog = document.getElementById(dialogId.value)!;
    const drawer = document.querySelector('aside[role="dialog"]')!;
    const item = document.getElementById(itemId.value)!;
    const header = item.querySelector('button')!;
    const dialogTitle = linkedChild(dialog, 'aria-labelledby', dialog.querySelector('strong')!);
    const dialogBody = linkedChild(dialog, 'aria-describedby', dialog.querySelector('div.acme-dialog__body')!);
    const drawerTitle = linkedChild(drawer, 'aria-labelledby', drawer.querySelector('strong')!);
    const panel = linkedChild(header, 'aria-controls', item.querySelector('[role="region"]')!);
    linkedChild(panel, 'aria-labelledby', header);
    expect(dialogTitle.id).toMatch(/^acme-id-23-7-dialog-title-/);
    expect(dialogBody.id).toMatch(/^acme-id-23-7-dialog-body-/);
    expect(drawerTitle.id).toMatch(/^acme-id-23-8-drawer-title-/);
    expect(dialogTitle.textContent).toBe(dialogTitle.id);
    expect(drawerTitle.textContent).toBe(drawerTitle.id);
    expect(slotCalls).toEqual(['dialog-body', 'dialog-header', 'drawer-body', 'drawer-header']);
    expect(header.id).toMatch(/^acme-id-23-9-collapse-header-/);
    expect(panel.id).toMatch(/^acme-id-23-9-collapse-panel-/);
    expect(seed.current).toBe(10);

    dialogId.value = 'dialog-caller';
    itemId.value = 'item-caller';
    await nextTick();
    expect(document.getElementById('dialog-caller')).toBe(dialog);
    expect(document.getElementById('item-caller')).toBe(item);
    expect(dialogTitle.id).toBe('acme-id-23-7-dialog-title');
    expect(header.id).toBe('acme-id-23-9-collapse-header');

    namespace.value = 'updated';
    await nextTick();
    linkedChild(dialog, 'aria-labelledby', dialogTitle);
    linkedChild(dialog, 'aria-describedby', dialogBody);
    linkedChild(drawer, 'aria-labelledby', drawerTitle);
    expect(document.getElementById(header.getAttribute('aria-controls')!)).toBe(panel);
    expect(document.getElementById(panel.getAttribute('aria-labelledby')!)).toBe(header);
    expect([dialogTitle, dialogBody, drawerTitle, header, panel].every((node) => node.id.startsWith('updated-id-23-'))).toBe(true);
    expect(seed.current).toBe(10);
  } finally {
    wrapper.unmount();
  }
});

test.each([
  ['Dialog', Dialog, 'div.i-dialog__mask'],
  ['Drawer', Drawer, 'div.i-drawer__mask']
] as const)('%s 按同次更新后的目标和回退配置搬移原遮罩', async (_, Component, selector) => {
  const source = document.createElement('main');
  const previous = document.createElement('div');
  previous.id = 'previous-host';
  document.body.append(source, previous);
  const settings = ref({ appendTo: '#previous-host', appendToBody: true });
  const wrapper = mount({
    render: () => h(Component, { modelValue: true, ...settings.value })
  }, { attachTo: source, global: { stubs: { transition: false } } });

  try {
    await flushPromises();
    const mask = document.querySelector(selector)!;
    expect(mask.parentElement).toBe(previous);
    settings.value = { appendTo: 'body', appendToBody: false };
    await nextTick();
    expect(source.contains(mask)).toBe(true);
    settings.value = { appendTo: 'body', appendToBody: true };
    await nextTick();
    expect(mask.parentElement).toBe(document.body);
    expect(document.querySelectorAll(selector)).toHaveLength(1);
  } finally {
    wrapper.unmount();
    source.remove();
    previous.remove();
  }
});

test.each([
  ['静态标题', 'header', () => createStaticVNode('<span ID=i-id-12-0-collapse-header>标题</span>', 1)],
  ['含字符引用的静态标题', 'header', () => createStaticVNode('<span id="i-id-12-0-collapse-hea&#x64;er">标题</span>', 1)],
  ['Teleport 正文', 'panel', () => h(Teleport, { to: 'body' }, [h('div', { id: 'i-id-12-0-collapse-panel' }, '正文')])]
] as const)('%s 的显式 ID 优先于折叠项生成 ID', (_, part, slot) => {
  const explicit = `i-id-12-0-collapse-${part}`;
  const seed = { prefix: 12, current: 0 };
  let calls = 0;
  const wrapper = mount(Collapse, {
    attachTo: document.body,
    global: { provide: { [idKey]: seed } },
    slots: { default: () => h(CollapseItem, {}, { [part === 'header' ? 'title' : 'default']: () => {
      calls++;
      return slot();
    } }) }
  });

  try {
    const header = wrapper.get('button').element;
    const panel = wrapper.get('[role="region"]').element;
    const ownedNode = part === 'header' ? header : panel;
    const explicitNode = document.getElementById(explicit);
    expect(explicitNode).not.toBe(ownedNode);
    expect(explicitNode?.parentElement).toBe(part === 'header' ? header.querySelector('span') : document.body);
    expect(document.querySelectorAll(`[id="${explicit}"]`)).toHaveLength(1);
    expect(document.getElementById(header.getAttribute('aria-controls')!)).toBe(panel);
    expect(document.getElementById(panel.getAttribute('aria-labelledby')!)).toBe(header);
    expect(seed.current).toBe(1);
    expect(calls).toBe(1);
  } finally {
    wrapper.unmount();
  }
});
