import { useConfig } from '../cool-design/config-provider/context';

let offset = 0;
export function useZIndex() {
  const config = useConfig();
  const currentZIndex = () => config.value.zIndex + offset;
  const nextZIndex = () => {
    offset += 1;
    return currentZIndex();
  };
  return { nextZIndex, currentZIndex };
}
