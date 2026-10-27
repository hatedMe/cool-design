import { expect, test } from 'vitest';
import { useOrderedChildren } from '../use-ordered-children';
test('注册子节点并维护顺序', () => {
  const ordered = useOrderedChildren();
  const first = ordered.register({ name: 'first' });
  ordered.register({ name: 'second' });
  expect(ordered.children.value).toHaveLength(2);
  expect(first.uid).toBeGreaterThan(0);
});
