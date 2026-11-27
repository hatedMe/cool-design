import { createSSRApp, defineComponent, h, isReadonly, isRef, provide, ref } from 'vue';
import { renderToString } from 'vue/server-renderer';
import { expect, test } from 'vitest';
import Provider from '../../cool-design/config-provider/config-provider';
import { idKey, useId } from '../use-id';
import { namespaceKey } from '../use-namespace';

test('支持组件外的显式 ID 与独立后备 ID', () => {
  const override = ref('');
  const id = useId(override);
  expect(isReadonly(id)).toBe(true);
  expect(isRef(id)).toBe(true);
  const first = id.value;
  expect(first).toMatch(/^i-id-\d+-\d+$/);
  expect(useId().value).not.toBe(first);
  override.value = 'field-email';
  expect(id.value).toBe('field-email');
  override.value = '';
  expect(id.value).toBe(first);
});

const Field = defineComponent({
  setup() {
    const id = useId();
    return () => h('input', { id: id.value });
  }
});

test('并发 SSR 请求继承应用和最近父级的种子', async () => {
  const local = defineComponent({
    setup() {
      provide(idKey, { prefix: 8, current: 5 });
      return () => h(Provider, null, () => h(Field));
    }
  });
  async function render() {
    const app = createSSRApp(() => h(Provider, { namespace: 'acme' }, () => [h(Field), h(local), h(Field)]));
    const state = { prefix: 9, current: 3 };
    app.provide(idKey, state);
    const html = await renderToString(app);
    expect(state.current).toBe(5);
    return html;
  }
  const [a, b] = await Promise.all([render(), render()]);
  expect(a).toBe(b);
  for (const id of ['acme-id-9-3', 'acme-id-8-5', 'acme-id-9-4']) expect(a).toContain(`id="${id}"`);
});

test('同一应用的普通组件与兄弟 Provider 共用默认计数，独立请求重新开始', async () => {
  const render = () => renderToString(createSSRApp(() => h('main', [
    h(Field), h(Provider, null, () => h(Field)), h(Provider, null, () => h(Field))
  ])));
  const [a, b] = await Promise.all([render(), render()]);
  expect(a).toBe(b);
  for (const index of [0, 1, 2]) expect(a).toContain(`id="i-id-0-${index}"`);
});

test('SSR 渲染读取 setup 中最后设置的显式 ID', async () => {
  const app = createSSRApp({
    setup() {
      const explicit = ref('initial');
      const id = useId(explicit);
      expect(id.value).toBe('initial');
      explicit.value = 'field-email';
      return () => h('input', { id: id.value });
    }
  });
  expect(await renderToString(app)).toContain('id="field-email"');
});

test('SSR 首次读取后备 ID 后修改命名空间，渲染时沿用序号和当前命名空间', async () => {
  const namespace = ref('before');
  const state = { prefix: 0, current: 0 };
  const app = createSSRApp({
    setup() {
      const id = useId();
      expect(id.value).toBe('before-id-0-0');
      namespace.value = 'after';
      return () => h('input', { id: id.value, 'data-ns': namespace.value });
    }
  });
  app.provide(namespaceKey, namespace);
  app.provide(idKey, state);
  expect(await renderToString(app)).toBe('<input id="after-id-0-0" data-ns="after">');
  expect(state.current).toBe(1);
});
