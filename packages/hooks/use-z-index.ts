import { useConfig } from '../cool-design/config-provider/context';

let offset = 0;
export function nextOverlayZIndex(base: number) {
  return base + ++offset;
}
export function useZIndex() {
  const config = useConfig();
  const currentZIndex = () => config.value.zIndex + offset;
  const nextZIndex = () => nextOverlayZIndex(config.value.zIndex);
  return { nextZIndex, currentZIndex };
}
