interface ServicePosition {
  container: HTMLElement;
  offset: number;
}

export function positionServices(entries: ServicePosition[], edge: 'top' | 'bottom', gap: number) {
  let previousEnd: number | undefined;
  for (const { container, offset } of entries) {
    const position = previousEnd === undefined ? offset : Math.max(previousEnd, offset);
    container.style[edge] = `${position}px`;
    previousEnd = position + container.offsetHeight + gap;
  }
}
