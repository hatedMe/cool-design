import { expect, test } from 'vitest';
import { ref } from 'vue';
import { useFocusController } from '../use-focus-controller';
import { useLockscreen } from '../use-lockscreen';
import { useTeleport } from '../use-teleport';

test('focus controller tracks focus state', () => {
  const focus = useFocusController();
  focus.handleFocus();
  expect(focus.isFocused.value).toBe(true);
  focus.handleBlur();
  expect(focus.isFocused.value).toBe(false);
});

test('teleport defaults to body', () => expect(useTeleport().value).toBe('body'));

test('lockscreen toggles body overflow', () => {
  const state = ref(false);
  useLockscreen(state);
  state.value = true;
  expect(document.body.style.overflow).toBe('hidden');
});
