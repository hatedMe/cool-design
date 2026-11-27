let lockCount = 0;
let overflowBackup: { name: string; value: string; priority: string }[] = [];

export function lockScroll(): void {
  if (lockCount === 0) {
    const { style } = document.body;
    overflowBackup = Array.from(style)
      .filter((name) => name === 'overflow' || name === 'overflow-x' || name === 'overflow-y')
      .map((name) => ({ name, value: style.getPropertyValue(name), priority: style.getPropertyPriority(name) }));
    for (const { name } of overflowBackup) style.removeProperty(name);
    style.setProperty('overflow', 'hidden', overflowBackup.some(({ priority }) => priority) ? 'important' : '');
  }
  lockCount++;
}

export function unlockScroll(): void {
  if (lockCount === 0 || --lockCount > 0) return;
  const { style } = document.body;
  style.removeProperty('overflow');
  for (const { name, value, priority } of overflowBackup) style.setProperty(name, value, priority);
  overflowBackup = [];
}

const positionedTargets = new WeakMap<HTMLElement, { position: string; priority: string; count: number }>();

export function retainPosition(target: HTMLElement) {
  let entry = positionedTargets.get(target);
  if (!entry) {
    if (getComputedStyle(target).position !== 'static') return;
    const priority = target.style.getPropertyPriority('position');
    entry = { position: target.style.position, priority, count: 0 };
    positionedTargets.set(target, entry);
    target.style.setProperty('position', 'relative', priority);
  }
  const held = entry;
  held.count++;
  return () => {
    if (--held.count === 0) {
      target.style.setProperty('position', held.position, held.priority);
      positionedTargets.delete(target);
    }
  };
}
