import { expect, test } from 'vitest';
import { ref } from 'vue';
import { useModelToggle } from '../use-model-toggle';

test('非受控模式支持 show、hide、toggle', () => {
  const indicator = ref(false);
  const toggle = useModelToggle({ indicator });
  toggle.show();
  expect(indicator.value).toBe(true);
  toggle.toggle();
  expect(indicator.value).toBe(false);
});

test('disabled 时不改变状态', () => {
  const indicator = ref(false);
  const toggle = useModelToggle({ indicator, disabled: ref(true) });
  toggle.show();
  expect(indicator.value).toBe(false);
});

test('受控模式通过 onUpdate 通知外部', () => {
  const indicator = ref(false);
  const updates: boolean[] = [];
  const toggle = useModelToggle({ indicator, modelValue: ref(false), onUpdate: (value) => updates.push(value) });
  toggle.show();
  expect(updates).toEqual([true]);
  expect(indicator.value).toBe(false);
});
