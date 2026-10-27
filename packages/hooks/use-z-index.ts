let current = 2000;
export function useZIndex() {
  return { nextZIndex: () => ++current, currentZIndex: () => current };
}
