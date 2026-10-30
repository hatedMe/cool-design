import { expect, test } from 'vitest';
import { useComposition } from '../use-composition';

test('跟踪输入法组合状态', () => {
  const composition = useComposition();
  expect(composition.isComposing.value).toBe(false);
  composition.handleCompositionStart();
  expect(composition.isComposing.value).toBe(true);
  composition.handleCompositionEnd();
  expect(composition.isComposing.value).toBe(false);
});
